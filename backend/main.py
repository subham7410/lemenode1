from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
import io
import json
import logging
import time

from config import settings
from cache import analysis_cache
from middleware import RequestTrackingMiddleware
from ai.gemini_analysis import analyze_skin_with_gemini

# Structured logging for Cloud Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("main")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    docs_url="/docs" if settings.DEBUG else None,  # Disable docs in production
    redoc_url=None
)

# Middleware stack (order matters - last added runs first)
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(RequestTrackingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Simple in-memory rate limiter (no external dependencies)
rate_limit_store: dict = {}


def check_rate_limit(client_ip: str) -> bool:
    """Check if client has exceeded rate limit. Returns True if allowed."""
    now = time.time()
    window = settings.RATE_LIMIT_WINDOW
    limit = settings.RATE_LIMIT_REQUESTS
    
    # Clean old entries
    rate_limit_store[client_ip] = [
        t for t in rate_limit_store.get(client_ip, [])
        if now - t < window
    ]
    
    # Check limit
    if len(rate_limit_store.get(client_ip, [])) >= limit:
        return False
    
    # Record this request
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
    return {
        "status": "running",
        "version": settings.VERSION,
        "cache_stats": analysis_cache.stats()
    }


@app.post("/analyze")
async def analyze(
    request: Request,
    image: UploadFile = File(...),
    user: str = Form(...)
):
    client_ip = get_client_ip(request)
    
    # Rate limiting
    if not check_rate_limit(client_ip):
        logger.warning(f"Rate limit exceeded for {client_ip}")
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Max {settings.RATE_LIMIT_REQUESTS} requests per minute."
        )
    
    if not image:
        raise HTTPException(status_code=400, detail="Image required")

    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty image")

    # Validate image
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
        return cached_result

    try:
        analysis = analyze_skin_with_gemini(
            image_bytes=image_bytes,
            user=user_data
        )

        # Ensure required frontend fields
        analysis["status"] = "success"
        analysis.setdefault("score", 70)

        analysis["image_info"] = {
            "width": img.width,
            "height": img.height,
            "format": img.format
        }

        # Cache the result
        analysis_cache.set(image_bytes, user_data, analysis)

        return analysis

    except Exception as e:
        logger.error(f"Gemini failed: {e}")

        # SAFE fallback (frontend NEVER breaks)
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
    return {
        "status": "healthy",
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "cache_stats": analysis_cache.stats()
    }


@app.get("/cache/stats")
def cache_stats():
    """Get cache statistics (useful for monitoring)."""
    return analysis_cache.stats()


@app.post("/cache/clear")
def cache_clear():
    """Clear the cache (admin endpoint)."""
    analysis_cache.clear()
    return {"status": "cleared"}
