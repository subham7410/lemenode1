"""
Food logs database operations using Firestore.
Handles CRUD operations for food tracking entries.
"""

from datetime import datetime, timedelta, date
from typing import Optional, List, Dict, Any
import logging

from google.cloud.firestore_v1 import FieldFilter, Query
from auth.firebase_admin import get_firestore_client

logger = logging.getLogger("db.food_logs")

# Collection name
FOOD_LOGS_COLLECTION = "food_logs"


class FoodLogRecord:
    """Represents a stored food log entry."""
    def __init__(
        self,
        id: str,
        user_id: str,
        logged_at: datetime,
        food_name: str,
        category: str,
        health_score: int,
        calories: int,
        macros: Dict[str, int],
        verdict: str,
        consequences: str,
        skin_impact: str,
        portion: str,
        better_alternative: str,
        nutrients: Optional[Dict] = None,
        image_hash: Optional[str] = None,
    ):
        self.id = id
        self.user_id = user_id
        self.logged_at = logged_at
        self.food_name = food_name
        self.category = category
        self.health_score = health_score
        self.calories = calories
        self.macros = macros
        self.verdict = verdict
        self.consequences = consequences
        self.skin_impact = skin_impact
        self.portion = portion
        self.better_alternative = better_alternative
        self.nutrients = nutrients or {}
        self.image_hash = image_hash
    
    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "logged_at": self.logged_at.isoformat() if self.logged_at else None,
            "food_name": self.food_name,
            "category": self.category,
            "health_score": self.health_score,
            "calories": self.calories,
            "macros": self.macros,
            "verdict": self.verdict,
            "consequences": self.consequences,
            "skin_impact": self.skin_impact,
            "portion": self.portion,
            "better_alternative": self.better_alternative,
        }


async def log_food(
    user_id: str,
    analysis: Dict[str, Any],
    image_hash: Optional[str] = None,
) -> FoodLogRecord:
    """
    Save a food log entry to Firestore.
    
    Args:
        user_id: Firebase user ID
        analysis: Full analysis result from Gemini
        image_hash: Hash of the image for deduplication
        
    Returns:
        Created FoodLogRecord
    """
    db = get_firestore_client()
    
    now = datetime.utcnow()
    log_data = {
        "user_id": user_id,
        "logged_at": now,
        "food_name": analysis.get("food_name", "Unknown"),
        "category": analysis.get("category", "moderate"),
        "health_score": analysis.get("health_score", 5),
        "calories": analysis.get("calories", 0),
        "macros": analysis.get("macros", {}),
        "verdict": analysis.get("verdict", ""),
        "consequences": analysis.get("consequences", ""),
        "skin_impact": analysis.get("skin_impact", ""),
        "portion": analysis.get("portion", ""),
        "better_alternative": analysis.get("better_alternative", ""),
        "nutrients": analysis.get("nutrients", {}),
        "meal_timing": analysis.get("meal_timing", ""),
        "portion_advice": analysis.get("portion_advice", ""),
        "image_hash": image_hash,
    }
    
    # Add to collection
    doc_ref = db.collection(FOOD_LOGS_COLLECTION).document()
    doc_ref.set(log_data)
    
    logger.info(f"Saved food log {doc_ref.id} for user {user_id}: {analysis.get('food_name')}")
    
    return FoodLogRecord(
        id=doc_ref.id,
        user_id=user_id,
        logged_at=now,
        food_name=log_data["food_name"],
        category=log_data["category"],
        health_score=log_data["health_score"],
        calories=log_data["calories"],
        macros=log_data["macros"],
        verdict=log_data["verdict"],
        consequences=log_data["consequences"],
        skin_impact=log_data["skin_impact"],
        portion=log_data["portion"],
        better_alternative=log_data["better_alternative"],
        nutrients=log_data["nutrients"],
        image_hash=image_hash,
    )


async def get_food_logs(
    user_id: str,
    target_date: Optional[date] = None,
    limit: int = 50,
) -> List[Dict]:
    """
    Get food logs for a user, optionally filtered by date.
    
    Args:
        user_id: Firebase user ID
        target_date: Specific date to filter (None for all)
        limit: Maximum number of logs to return
        
    Returns:
        List of food log dictionaries, newest first
    """
    db = get_firestore_client()
    
    query = db.collection(FOOD_LOGS_COLLECTION).where(
        filter=FieldFilter("user_id", "==", user_id)
    )
    
    # Filter by date if specified
    if target_date:
        start_of_day = datetime.combine(target_date, datetime.min.time())
        end_of_day = datetime.combine(target_date, datetime.max.time())
        
        query = query.where(
            filter=FieldFilter("logged_at", ">=", start_of_day)
        ).where(
            filter=FieldFilter("logged_at", "<=", end_of_day)
        )
    
    # Order by newest first
    query = query.order_by("logged_at", direction=Query.DESCENDING)
    query = query.limit(limit)
    
    # Execute query
    docs = query.stream()
    
    logs = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        # Convert datetime to string for JSON
        if data.get("logged_at"):
            data["logged_at"] = data["logged_at"].isoformat()
        logs.append(data)
    
    return logs


async def get_daily_summary(
    user_id: str,
    target_date: Optional[date] = None,
) -> Dict[str, Any]:
    """
    Get aggregated daily summary for a user.
    
    Args:
        user_id: Firebase user ID
        target_date: Date to summarize (defaults to today)
        
    Returns:
        Summary dictionary with totals, breakdown, and meals
    """
    if target_date is None:
        target_date = date.today()
    
    logs = await get_food_logs(user_id, target_date, limit=100)
    
    if not logs:
        return {
            "date": target_date.isoformat(),
            "totals": {
                "calories": 0,
                "protein": 0,
                "carbs": 0,
                "fat": 0,
                "fiber": 0,
                "sugar": 0,
            },
            "health_score": 0,
            "meals_logged": 0,
            "breakdown": {
                "healthy": 0,
                "moderate": 0,
                "unhealthy": 0,
            },
            "meals": [],
            "has_data": False,
        }
    
    # Calculate totals
    total_calories = sum(log.get("calories", 0) for log in logs)
    total_protein = sum(log.get("macros", {}).get("protein", 0) for log in logs)
    total_carbs = sum(log.get("macros", {}).get("carbs", 0) for log in logs)
    total_fat = sum(log.get("macros", {}).get("fat", 0) for log in logs)
    total_fiber = sum(log.get("macros", {}).get("fiber", 0) for log in logs)
    total_sugar = sum(log.get("macros", {}).get("sugar", 0) for log in logs)
    
    # Calculate average health score
    health_scores = [log.get("health_score", 5) for log in logs]
    avg_health_score = sum(health_scores) / len(health_scores) if health_scores else 0
    
    # Count by category
    breakdown = {"healthy": 0, "moderate": 0, "unhealthy": 0}
    for log in logs:
        category = log.get("category", "moderate")
        if category in breakdown:
            breakdown[category] += 1
    
    # Find best and worst choices
    sorted_logs = sorted(logs, key=lambda x: x.get("health_score", 5))
    worst_choice = sorted_logs[0] if sorted_logs else None
    best_choice = sorted_logs[-1] if sorted_logs else None
    
    return {
        "date": target_date.isoformat(),
        "totals": {
            "calories": total_calories,
            "protein": total_protein,
            "carbs": total_carbs,
            "fat": total_fat,
            "fiber": total_fiber,
            "sugar": total_sugar,
        },
        "health_score": round(avg_health_score, 1),
        "meals_logged": len(logs),
        "breakdown": breakdown,
        "best_choice": best_choice.get("food_name") if best_choice else None,
        "worst_choice": worst_choice.get("food_name") if worst_choice else None,
        "meals": logs,
        "has_data": True,
    }


async def delete_food_log(log_id: str, user_id: str) -> bool:
    """
    Delete a food log entry.
    
    Args:
        log_id: Food log document ID
        user_id: Firebase user ID (for authorization)
        
    Returns:
        True if deleted, False if not found or unauthorized
    """
    db = get_firestore_client()
    doc_ref = db.collection(FOOD_LOGS_COLLECTION).document(log_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        return False
    
    # Authorization check
    if doc.to_dict().get("user_id") != user_id:
        logger.warning(f"User {user_id} tried to delete food log {log_id}")
        return False
    
    doc_ref.delete()
    logger.info(f"Deleted food log {log_id} for user {user_id}")
    return True


async def get_food_history(
    user_id: str,
    days: int = 7,
) -> List[Dict]:
    """
    Get food history for the last N days with daily summaries.
    
    Args:
        user_id: Firebase user ID
        days: Number of days to look back
        
    Returns:
        List of daily summaries
    """
    summaries = []
    today = date.today()
    
    for i in range(days):
        target_date = today - timedelta(days=i)
        summary = await get_daily_summary(user_id, target_date)
        summaries.append(summary)
    
    return summaries


async def get_total_logs_count(user_id: str) -> int:
    """Get total number of food logs for a user."""
    db = get_firestore_client()
    
    docs = db.collection(FOOD_LOGS_COLLECTION).where(
        filter=FieldFilter("user_id", "==", user_id)
    ).stream()
    
    return sum(1 for _ in docs)
