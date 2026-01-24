"""
Food tracking API routes.
Endpoints for logging meals and getting daily summaries.
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from datetime import date, datetime
from typing import Optional
import hashlib
import logging

from PIL import Image
import io

from auth.dependencies import get_current_user
from auth.models import CurrentUser
from ai.food_analysis import analyze_food_with_gemini, generate_daily_summary_verdict
from db.food_logs import (
    log_food,
    get_food_logs,
    get_daily_summary,
    delete_food_log,
    get_food_history,
)
from db.users import get_user

logger = logging.getLogger("routes.food")

router = APIRouter(prefix="/food", tags=["food"])


def _hash_image(image_bytes: bytes) -> str:
    """Generate hash from image bytes."""
    return hashlib.sha256(image_bytes).hexdigest()[:16]


@router.post("/log")
async def log_food_entry(
    image: UploadFile = File(...),
    user: CurrentUser = Depends(get_current_user)
):
    """
    Log a food entry by uploading a photo.
    
    The AI analyzes the food and provides:
    - Food identification
    - Calorie and macro estimates
    - Health score (1-10)
    - Honest verdict and consequences
    """
    try:
        # Read and validate image
        image_bytes = await image.read()
        if not image_bytes:
            raise HTTPException(status_code=400, detail="Empty image")
        
        try:
            img = Image.open(io.BytesIO(image_bytes))
            img.verify()
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Get user context for personalized analysis
        user_profile = await get_user(user.uid)
        user_context = {}
        if user_profile:
            user_context = {
                "diet": user_profile.diet or "no restrictions",
                "age": user_profile.age,
                "goal": "skin health",  # Primary goal of the app
            }
        
        # Analyze food with AI
        logger.info(f"Analyzing food for user {user.uid}")
        analysis = analyze_food_with_gemini(image_bytes, user_context)
        
        # Save to database
        image_hash = _hash_image(image_bytes)
        food_log = await log_food(user.uid, analysis, image_hash)
        
        logger.info(f"Food logged: {analysis.get('food_name')} - {analysis.get('calories')} cal")
        
        return {
            "success": True,
            "log_id": food_log.id,
            "analysis": analysis,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Food log error for {user.uid}: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze food")


@router.get("/logs")
async def get_logs(
    date_str: Optional[str] = Query(None, description="Date in YYYY-MM-DD format"),
    limit: int = Query(50, ge=1, le=100),
    user: CurrentUser = Depends(get_current_user)
):
    """
    Get food logs for the user.
    
    Optional query parameters:
    - date: Filter by specific date (YYYY-MM-DD)
    - limit: Maximum number of logs to return
    """
    target_date = None
    if date_str:
        try:
            target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    logs = await get_food_logs(user.uid, target_date, limit)
    
    return {
        "logs": logs,
        "count": len(logs),
        "date": date_str,
    }


@router.get("/daily-summary")
async def get_daily_summary_endpoint(
    date_str: Optional[str] = Query(None, description="Date in YYYY-MM-DD format"),
    user: CurrentUser = Depends(get_current_user)
):
    """
    Get aggregated daily summary with AI verdict.
    
    Includes:
    - Total calories and macros
    - Average health score
    - Breakdown by category (healthy/moderate/unhealthy)
    - AI-generated verdict and consequences
    """
    target_date = None
    if date_str:
        try:
            target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    else:
        target_date = date.today()
    
    summary = await get_daily_summary(user.uid, target_date)
    
    # Generate AI verdict if there's data
    if summary.get("has_data") and summary.get("meals_logged", 0) > 0:
        try:
            # Get user context
            user_profile = await get_user(user.uid)
            user_context = {}
            if user_profile:
                user_context = {
                    "diet": user_profile.diet or "no restrictions",
                    "age": user_profile.age,
                    "goal": "skin health",
                }
            
            # Generate verdict
            verdict = generate_daily_summary_verdict(
                meals=summary.get("meals", []),
                total_calories=summary.get("totals", {}).get("calories", 0),
                avg_health_score=summary.get("health_score", 5),
                user_context=user_context
            )
            summary["verdict"] = verdict
        except Exception as e:
            logger.error(f"Failed to generate daily verdict: {e}")
            summary["verdict"] = {
                "overall_grade": "?",
                "verdict": "Unable to generate verdict",
            }
    
    # Remove full meal details from response (can be fetched separately)
    summary.pop("meals", None)
    
    return summary


@router.get("/history")
async def get_history(
    days: int = Query(7, ge=1, le=30),
    user: CurrentUser = Depends(get_current_user)
):
    """
    Get food history with daily summaries for the last N days.
    """
    history = await get_food_history(user.uid, days)
    
    return {
        "history": history,
        "days": days,
    }


@router.delete("/log/{log_id}")
async def delete_log(
    log_id: str,
    user: CurrentUser = Depends(get_current_user)
):
    """
    Delete a food log entry.
    """
    deleted = await delete_food_log(log_id, user.uid)
    
    if not deleted:
        raise HTTPException(status_code=404, detail="Food log not found")
    
    return {"success": True, "deleted": log_id}
