"""
Skin-Diet Correlation analysis module.
Analyzes relationships between food intake and skin health changes.
"""

from datetime import datetime, timedelta, date
from typing import List, Dict, Any, Optional
from collections import defaultdict
import logging

from google.cloud.firestore_v1 import FieldFilter, Query
from auth.firebase_admin import get_firestore_client

logger = logging.getLogger("db.correlations")

# Collection names
SCANS_COLLECTION = "scans"
FOOD_LOGS_COLLECTION = "food_logs"

# Configuration
CORRELATION_WINDOW_DAYS = 14  # Look back period
IMPACT_DELAY_HOURS = (24, 72)  # Diet impacts skin 24-72 hours later


async def get_skin_diet_correlations(
    user_id: str,
    days: int = CORRELATION_WINDOW_DAYS
) -> Dict[str, Any]:
    """
    Analyze correlations between food intake and skin health.
    
    Looks for patterns like:
    - High sugar days → skin score drops 24-48hrs later
    - Unhealthy food days → more visible issues
    - Healthy food streaks → improving scores
    
    Args:
        user_id: Firebase user ID
        days: Number of days to analyze
        
    Returns:
        Dictionary with correlation insights and statistics
    """
    db = get_firestore_client()
    
    # Date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Fetch data
    food_logs = await _get_food_logs_in_range(db, user_id, start_date, end_date)
    scans = await _get_scans_in_range(db, user_id, start_date, end_date)
    
    # Not enough data for meaningful correlations
    if len(food_logs) < 3 or len(scans) < 2:
        return {
            "has_data": False,
            "message": "Log more meals and scans to see diet-skin correlations",
            "correlations": [],
            "stats": {
                "food_logs_count": len(food_logs),
                "scans_count": len(scans),
                "days_analyzed": days
            }
        }
    
    # Analyze correlations
    correlations = []
    
    # 1. Category impact analysis
    category_impact = _analyze_category_impact(food_logs, scans)
    if category_impact:
        correlations.extend(category_impact)
    
    # 2. Sugar/unhealthy food spike analysis
    trigger_impacts = _analyze_trigger_foods(food_logs, scans)
    if trigger_impacts:
        correlations.extend(trigger_impacts)
    
    # 3. Healthy streak analysis
    streak_impact = _analyze_healthy_streaks(food_logs, scans)
    if streak_impact:
        correlations.append(streak_impact)
    
    # Sort by confidence/significance
    correlations.sort(key=lambda x: x.get("confidence", 0), reverse=True)
    
    return {
        "has_data": True,
        "correlations": correlations[:3],  # Top 3 insights
        "stats": {
            "food_logs_count": len(food_logs),
            "scans_count": len(scans),
            "days_analyzed": days,
            "avg_health_score": _calc_avg_health_score(food_logs),
            "avg_skin_score": _calc_avg_skin_score(scans)
        }
    }


async def _get_food_logs_in_range(
    db, 
    user_id: str, 
    start: datetime, 
    end: datetime
) -> List[Dict]:
    """Get food logs within date range."""
    query = db.collection(FOOD_LOGS_COLLECTION).where(
        filter=FieldFilter("user_id", "==", user_id)
    ).where(
        filter=FieldFilter("logged_at", ">=", start)
    ).where(
        filter=FieldFilter("logged_at", "<=", end)
    ).order_by("logged_at", direction=Query.ASCENDING)
    
    docs = query.stream()
    
    logs = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        logs.append(data)
    
    return logs


async def _get_scans_in_range(
    db, 
    user_id: str, 
    start: datetime, 
    end: datetime
) -> List[Dict]:
    """Get skin scans within date range."""
    query = db.collection(SCANS_COLLECTION).where(
        filter=FieldFilter("user_id", "==", user_id)
    ).where(
        filter=FieldFilter("created_at", ">=", start)
    ).where(
        filter=FieldFilter("created_at", "<=", end)
    ).order_by("created_at", direction=Query.ASCENDING)
    
    docs = query.stream()
    
    scans = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        scans.append(data)
    
    return scans


def _analyze_category_impact(
    food_logs: List[Dict], 
    scans: List[Dict]
) -> List[Dict]:
    """
    Analyze how food categories (healthy/moderate/unhealthy) 
    correlate with skin score changes.
    """
    correlations = []
    
    # Group food by day
    food_by_day = defaultdict(list)
    for log in food_logs:
        logged_at = log.get("logged_at")
        if logged_at:
            day = logged_at.date() if hasattr(logged_at, 'date') else datetime.fromisoformat(str(logged_at)[:10]).date()
            food_by_day[day].append(log)
    
    # Group scans by day
    scans_by_day = {}
    for scan in scans:
        created_at = scan.get("created_at")
        if created_at:
            day = created_at.date() if hasattr(created_at, 'date') else datetime.fromisoformat(str(created_at)[:10]).date()
            if day not in scans_by_day:
                scans_by_day[day] = []
            scans_by_day[day].append(scan.get("score", 0))
    
    # Analyze: days with mostly unhealthy food -> skin score 1-2 days later
    unhealthy_days = []
    healthy_days = []
    
    for day, logs in food_by_day.items():
        unhealthy_count = sum(1 for l in logs if l.get("category") == "unhealthy")
        healthy_count = sum(1 for l in logs if l.get("category") == "healthy")
        total = len(logs)
        
        if total > 0:
            if unhealthy_count / total >= 0.5:
                unhealthy_days.append(day)
            elif healthy_count / total >= 0.5:
                healthy_days.append(day)
    
    # Check skin scores 1-2 days after unhealthy days
    scores_after_unhealthy = []
    scores_after_healthy = []
    
    for day in unhealthy_days:
        for offset in [1, 2]:
            check_day = day + timedelta(days=offset)
            if check_day in scans_by_day:
                scores_after_unhealthy.extend(scans_by_day[check_day])
    
    for day in healthy_days:
        for offset in [1, 2]:
            check_day = day + timedelta(days=offset)
            if check_day in scans_by_day:
                scores_after_healthy.extend(scans_by_day[check_day])
    
    # Generate insights
    if len(scores_after_unhealthy) >= 2 and len(scores_after_healthy) >= 2:
        avg_unhealthy = sum(scores_after_unhealthy) / len(scores_after_unhealthy)
        avg_healthy = sum(scores_after_healthy) / len(scores_after_healthy)
        diff = avg_healthy - avg_unhealthy
        
        if diff > 3:  # Significant difference
            correlations.append({
                "type": "category_impact",
                "trigger": "Unhealthy Foods",
                "icon": "fast-food",
                "impact": f"-{int(diff)} points",
                "impact_value": -int(diff),
                "timeframe": "24-48 hours later",
                "description": f"Days with mostly unhealthy food are followed by skin scores that are ~{int(diff)} points lower.",
                "recommendation": "Try swapping one unhealthy meal per day for a healthier option.",
                "confidence": min(0.9, 0.5 + (len(scores_after_unhealthy) + len(scores_after_healthy)) * 0.05)
            })
    
    return correlations


def _analyze_trigger_foods(
    food_logs: List[Dict], 
    scans: List[Dict]
) -> List[Dict]:
    """
    Identify specific food triggers that correlate with skin issues.
    Looks at skin_impact field from food analysis.
    """
    correlations = []
    
    # Count negative skin impacts mentioned
    negative_impacts = defaultdict(int)
    
    for log in food_logs:
        skin_impact = log.get("skin_impact", "")
        if skin_impact and any(word in skin_impact.lower() for word in ["acne", "breakout", "inflammation", "oily", "pimple"]):
            food_name = log.get("food_name", "Unknown")
            category = log.get("category", "moderate")
            if category == "unhealthy":
                negative_impacts[food_name] += 1
    
    # Find most common triggers
    if negative_impacts:
        top_trigger = max(negative_impacts.items(), key=lambda x: x[1])
        if top_trigger[1] >= 2:  # At least 2 occurrences
            correlations.append({
                "type": "food_trigger",
                "trigger": top_trigger[0],
                "icon": "warning",
                "impact": f"Logged {top_trigger[1]}x",
                "impact_value": top_trigger[1],
                "timeframe": "potential skin trigger",
                "description": f"'{top_trigger[0]}' has been flagged as potentially problematic for your skin.",
                "recommendation": f"Consider reducing or eliminating {top_trigger[0]} for 1-2 weeks to see if your skin improves.",
                "confidence": min(0.8, 0.4 + top_trigger[1] * 0.1)
            })
    
    return correlations


def _analyze_healthy_streaks(
    food_logs: List[Dict], 
    scans: List[Dict]
) -> Optional[Dict]:
    """
    Detect healthy eating streaks and their positive impact on skin.
    """
    if not food_logs or not scans:
        return None
    
    # Find consecutive healthy days
    food_by_day = defaultdict(list)
    for log in food_logs:
        logged_at = log.get("logged_at")
        if logged_at:
            day = logged_at.date() if hasattr(logged_at, 'date') else datetime.fromisoformat(str(logged_at)[:10]).date()
            food_by_day[day].append(log)
    
    # Calculate daily health scores
    daily_health = {}
    for day, logs in food_by_day.items():
        avg_score = sum(l.get("health_score", 5) for l in logs) / len(logs)
        daily_health[day] = avg_score
    
    # Find best streak of high health scores (>= 7)
    if not daily_health:
        return None
    
    sorted_days = sorted(daily_health.keys())
    best_streak = 0
    current_streak = 0
    
    for i, day in enumerate(sorted_days):
        if daily_health[day] >= 7:
            current_streak += 1
            best_streak = max(best_streak, current_streak)
        else:
            current_streak = 0
    
    if best_streak >= 3:
        return {
            "type": "healthy_streak",
            "trigger": "Healthy Eating Streak",
            "icon": "leaf",
            "impact": f"{best_streak} days",
            "impact_value": best_streak,
            "timeframe": "consecutive healthy days",
            "description": f"You had a {best_streak}-day streak of healthy eating! Consistent good choices help your skin.",
            "recommendation": "Keep it up! Aim for longer streaks to see sustained skin improvements.",
            "confidence": 0.7
        }
    
    return None


def _calc_avg_health_score(food_logs: List[Dict]) -> float:
    """Calculate average food health score."""
    scores = [l.get("health_score", 5) for l in food_logs]
    return round(sum(scores) / len(scores), 1) if scores else 0


def _calc_avg_skin_score(scans: List[Dict]) -> float:
    """Calculate average skin score."""
    scores = [s.get("score", 0) for s in scans]
    return round(sum(scores) / len(scores), 1) if scores else 0
