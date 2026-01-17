"""
SkinGlow AI Backend - Main Application

A FastAPI-based API for AI-powered skin analysis with:
- Firebase Authentication (Google OAuth)
- Firestore persistence (users, scans)
- Tier-based rate limiting
- Gemini AI integration
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
from typing import Optional
import io
import json
import logging
import time

from config import settings
from cache import analysis_cache
from middleware import RequestTrackingMiddleware
from ai.gemini_analysis import analyze_skin_with_gemini

# Auth and DB imports
from auth.dependencies import get_current_user, get_optional_user
from auth.models import CurrentUser
# Firebase import made lazy to avoid startup crashes
# from auth.firebase_admin import is_firebase_configured

# Routes
from routes.auth import router as auth_router
from routes.users import router as users_router
from routes.scans import router as scans_router
from routes.subscription import router as subscription_router
from routes.announcements import router as announcements_router
from routes.chat import router as chat_router

# DB operations
from db.users import get_user, increment_scan_count, get_or_create_user, update_streak
from db.scans import save_scan
from db.tiers import can_scan, get_user_usage

# Structured logging for Cloud Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("main")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url=None
)

# Middleware stack (order matters - last added runs first)
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(RequestTrackingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(scans_router)
app.include_router(subscription_router)
app.include_router(announcements_router)
app.include_router(chat_router)

# Legacy rate limiter (fallback for unauthenticated requests)
rate_limit_store: dict = {}


def check_rate_limit(client_ip: str) -> bool:
    """Check if client has exceeded rate limit. Returns True if allowed."""
    now = time.time()
    window = settings.RATE_LIMIT_WINDOW
    limit = settings.RATE_LIMIT_REQUESTS
    
    rate_limit_store[client_ip] = [
        t for t in rate_limit_store.get(client_ip, [])
        if now - t < window
    ]
    
    if len(rate_limit_store.get(client_ip, [])) >= limit:
        return False
    
    rate_limit_store.setdefault(client_ip, []).append(now)
    return True


def get_client_ip(request: Request) -> str:
    """Extract client IP from request, handling Cloud Run proxy."""
    forwarded = request.headers.get("X-Forwarded-For", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@app.get("/")
def root():
    # Lazy check for Firebase to avoid import issues
    try:
        from auth.firebase_admin import is_firebase_configured
        auth_enabled = is_firebase_configured()
    except:
        auth_enabled = False
    
    return {
        "status": "running",
        "version": settings.VERSION,
        "auth_enabled": auth_enabled,
        "cache_stats": analysis_cache.stats()
    }


@app.post("/analyze")
async def analyze(
    request: Request,
    image: UploadFile = File(...),
    user: str = Form(...),
    current_user: Optional[CurrentUser] = Depends(get_optional_user)
):
    """
    Analyze skin from uploaded image.
    
    Authentication is optional:
    - Authenticated users: Tier-based rate limits, scan saved to history
    - Anonymous users: IP-based rate limits, scan not saved
    """
    client_ip = get_client_ip(request)
    user_id = current_user.uid if current_user else None
    
    # Rate limiting based on auth status
    if user_id:
        # Authenticated user - check tier-based limits
        try:
            user_profile = await get_user(user_id)
            if user_profile:
                tier = user_profile.tier
                scans_today = user_profile.scans_today
                
                if not can_scan(tier, scans_today):
                    usage = await get_user_usage(user_id)
                    raise HTTPException(
                        status_code=429,
                        detail={
                            "message": f"Daily scan limit reached ({usage['scans_limit']} scans/day)",
                            "tier": tier,
                            "scans_today": scans_today,
                            "scans_limit": usage['scans_limit'],
                            "upgrade_available": tier == "free"
                        }
                    )
        except HTTPException:
            raise
        except Exception as e:
            logger.warning(f"Failed to check tier limits: {e}")
            # Continue with scan if tier check fails
    else:
        # Anonymous user - IP-based rate limiting
        if not check_rate_limit(client_ip):
            logger.warning(f"Rate limit exceeded for {client_ip}")
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Max {settings.RATE_LIMIT_REQUESTS} requests per minute. Sign in for more scans!"
            )
    
    # Validate image
    if not image:
        raise HTTPException(status_code=400, detail="Image required")

    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty image")

    try:
        img = Image.open(io.BytesIO(image_bytes))
        img.verify()
        img = Image.open(io.BytesIO(image_bytes))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    # Parse user JSON
    try:
        user_data = json.loads(user)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user data JSON")

    required_fields = ["age", "gender", "height", "weight", "diet"]
    missing = [f for f in required_fields if not user_data.get(f)]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing fields: {', '.join(missing)}"
        )

    # Check cache first
    cached_result = analysis_cache.get(image_bytes, user_data)
    if cached_result:
        cached_result["_cached"] = True
        cached_result["_cache_stats"] = analysis_cache.stats()
        
        # Still save to history if authenticated
        if user_id:
            try:
                await save_scan(user_id, cached_result, image_bytes)
                await increment_scan_count(user_id)
                streak_info = await update_streak(user_id)
                cached_result["streak"] = streak_info
            except Exception as e:
                logger.warning(f"Failed to save cached scan: {e}")
        
        return cached_result

    try:
        analysis = analyze_skin_with_gemini(
            image_bytes=image_bytes,
            user=user_data
        )

        analysis["status"] = "success"
        analysis.setdefault("score", 70)

        analysis["image_info"] = {
            "width": img.width,
            "height": img.height,
            "format": img.format
        }

        # Cache the result
        analysis_cache.set(image_bytes, user_data, analysis)
        
        # Save to history if authenticated
        if user_id:
            try:
                scan_record = await save_scan(user_id, analysis, image_bytes)
                await increment_scan_count(user_id)
                streak_info = await update_streak(user_id)
                analysis["_scan_id"] = scan_record.id
                analysis["streak"] = streak_info
            except Exception as e:
                logger.warning(f"Failed to save scan: {e}")

        return analysis

    except Exception as e:
        logger.error(f"Gemini failed: {e}")

        # SAFE fallback
        fallback = {
            "status": "fallback",
            "score": 65,
            "skin_type": "combination",
            "skin_tone": "medium",
            "overall_condition": "good",
            "visible_issues": ["Temporary analysis issue"],
            "positive_aspects": ["Image received correctly"],
            "recommendations": [
                "Use a gentle cleanser twice daily",
                "Apply SPF 30+ sunscreen every morning",
                "Keep skin moisturized"
            ],
            "food": {
                "eat_more": [
                    "Leafy greens",
                    "Fruits rich in vitamin C",
                    "Nuts and seeds",
                    "Plenty of water"
                ],
                "limit": [
                    "Sugar",
                    "Fried foods",
                    "Alcohol"
                ]
            },
            "health": {
                "daily_habits": [
                    "Wash face before bed",
                    "Change pillow covers weekly",
                    "Stay hydrated"
                ],
                "routine": [
                    "AM: Cleanse → Moisturize → Sunscreen",
                    "PM: Cleanse → Moisturize"
                ]
            },
            "style": {
                "clothing": [
                    "Breathable cotton fabrics",
                    "Light colors for heat reduction"
                ],
                "accessories": [
                    "UV-protection sunglasses",
                    "Wide-brim hat"
                ]
            },
            "error_note": str(e)
        }
        return fallback


@app.get("/health")
def health():
    # Lazy Firebase check
    try:
        from auth.firebase_admin import is_firebase_configured
        fb_configured = is_firebase_configured()
    except:
        fb_configured = False
    
    return {
        "status": "healthy",
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "firebase_configured": fb_configured,
        "cache_stats": analysis_cache.stats()
    }


@app.get("/cache/stats")
def cache_stats():
    """Get cache statistics (useful for monitoring)."""
    return analysis_cache.stats()


@app.post("/cache/clear")
async def cache_clear(user: CurrentUser = Depends(get_current_user)):
    """
    Clear the cache (admin endpoint).
    Now requires authentication.
    """
    # TODO: Add admin check here
    analysis_cache.clear()
    logger.info(f"Cache cleared by user: {user.uid}")
    return {"status": "cleared"}
