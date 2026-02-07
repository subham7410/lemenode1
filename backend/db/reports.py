"""
Weekly Report database operations using Firestore.
Aggregates scan data to generate weekly health reports.
"""

from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from collections import Counter
import logging

from google.cloud.firestore_v1 import FieldFilter, Query
from auth.firebase_admin import get_firestore_client
from db.correlations import get_skin_diet_correlations

logger = logging.getLogger("db.reports")

# Collection name
SCANS_COLLECTION = "scans"


async def get_weekly_report(user_id: str) -> Dict[str, Any]:
    """
    Generate a weekly health report for the user.
    
    Aggregates scan data from the last 7 days and compares
    with the previous week for trend analysis.
    
    Args:
        user_id: Firebase user ID
        
    Returns:
        Weekly report dictionary with summary, trends, and recommendations
    """
    db = get_firestore_client()
    
    # Date ranges
    now = datetime.utcnow()
    week_end = now.replace(hour=23, minute=59, second=59)
    week_start = (now - timedelta(days=6)).replace(hour=0, minute=0, second=0)
    prev_week_end = week_start - timedelta(seconds=1)
    prev_week_start = (week_start - timedelta(days=7))
    
    # Get current week scans
    current_week_scans = await _get_scans_in_range(db, user_id, week_start, week_end)
    
    # Get previous week scans for comparison
    prev_week_scans = await _get_scans_in_range(db, user_id, prev_week_start, prev_week_end)
    
    # Calculate summary stats
    summary = _calculate_summary(current_week_scans, prev_week_scans)
    
    # Get daily scores for chart
    daily_scores = _get_daily_scores(current_week_scans, week_start, week_end)
    
    # Aggregate issues
    top_issues = _aggregate_issues(current_week_scans)
    
    # Aggregate recommendations
    recommendations = _aggregate_recommendations(current_week_scans)
    
    # Generate insights
    insights = _generate_insights(summary, current_week_scans)
    
    # Get diet-skin correlations
    diet_correlations = await get_skin_diet_correlations(user_id, days=14)
    
    return {
        "period": {
            "start": week_start.date().isoformat(),
            "end": week_end.date().isoformat()
        },
        "summary": summary,
        "daily_scores": daily_scores,
        "top_issues": top_issues,
        "recommendations": recommendations,
        "insights": insights,
        "diet_correlations": diet_correlations,
        "generated_at": now.isoformat()
    }


async def _get_scans_in_range(
    db, 
    user_id: str, 
    start: datetime, 
    end: datetime
) -> List[Dict]:
    """Get all scans for a user within a date range."""
    query = db.collection(SCANS_COLLECTION).where(
        filter=FieldFilter("user_id", "==", user_id)
    ).where(
        filter=FieldFilter("created_at", ">=", start)
    ).where(
        filter=FieldFilter("created_at", "<=", end)
    ).order_by("created_at", direction=Query.DESCENDING)
    
    docs = query.stream()
    
    scans = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        scans.append(data)
    
    return scans


def _calculate_summary(current_scans: List[Dict], prev_scans: List[Dict]) -> Dict:
    """Calculate summary statistics for the report."""
    current_count = len(current_scans)
    prev_count = len(prev_scans)
    
    # Score calculations
    current_scores = [s.get("score", 0) for s in current_scans if s.get("score")]
    prev_scores = [s.get("score", 0) for s in prev_scans if s.get("score")]
    
    avg_score = round(sum(current_scores) / len(current_scores)) if current_scores else 0
    prev_avg = round(sum(prev_scores) / len(prev_scores)) if prev_scores else 0
    
    best_score = max(current_scores) if current_scores else 0
    
    return {
        "total_scans": current_count,
        "scans_change": current_count - prev_count,
        "avg_score": avg_score,
        "score_change": avg_score - prev_avg if prev_avg > 0 else 0,
        "best_score": best_score,
        "prev_week_scans": prev_count,
        "prev_week_avg": prev_avg
    }


def _get_daily_scores(scans: List[Dict], start: datetime, end: datetime) -> List[Dict]:
    """Get scores organized by day for charting."""
    # Group scans by date
    scores_by_date = {}
    
    for scan in scans:
        created = scan.get("created_at")
        if created:
            # Handle both datetime objects and strings
            if isinstance(created, str):
                date_str = created[:10]
            else:
                date_str = created.date().isoformat()
            
            score = scan.get("score", 0)
            if date_str not in scores_by_date:
                scores_by_date[date_str] = []
            scores_by_date[date_str].append(score)
    
    # Calculate average score per day
    daily_scores = []
    current = start.date()
    end_date = end.date()
    
    while current <= end_date:
        date_str = current.isoformat()
        if date_str in scores_by_date:
            avg = round(sum(scores_by_date[date_str]) / len(scores_by_date[date_str]))
            daily_scores.append({
                "date": date_str,
                "score": avg,
                "scan_count": len(scores_by_date[date_str])
            })
        current += timedelta(days=1)
    
    return daily_scores


def _aggregate_issues(scans: List[Dict]) -> List[Dict]:
    """Get top issues with frequency count."""
    all_issues = []
    
    for scan in scans:
        issues = scan.get("visible_issues", [])
        if issues:
            all_issues.extend(issues)
    
    # Count frequency
    issue_counts = Counter(all_issues)
    
    # Sort by frequency and take top 5
    top_issues = [
        {"issue": issue, "frequency": count}
        for issue, count in issue_counts.most_common(5)
    ]
    
    return top_issues


def _aggregate_recommendations(scans: List[Dict]) -> List[str]:
    """Get unique recommendations from recent scans."""
    all_recommendations = []
    
    for scan in scans:
        recs = scan.get("recommendations", [])
        if recs:
            all_recommendations.extend(recs)
    
    # Count and get most common
    rec_counts = Counter(all_recommendations)
    
    # Return top 5 unique recommendations
    return [rec for rec, _ in rec_counts.most_common(5)]


def _generate_insights(summary: Dict, scans: List[Dict]) -> Dict:
    """Generate insight message based on data."""
    score_change = summary.get("score_change", 0)
    total_scans = summary.get("total_scans", 0)
    scans_change = summary.get("scans_change", 0)
    
    # Determine trend
    if score_change > 3:
        trend = "improving"
        emoji = "🎉"
        message = f"Great progress! Your skin score improved by {score_change} points this week."
    elif score_change < -3:
        trend = "declining"
        emoji = "💪"
        message = f"Your score dropped by {abs(score_change)} points. Stay consistent with your routine!"
    else:
        trend = "stable"
        emoji = "✨"
        message = "Your skin health is stable. Keep up the good work!"
    
    # Add activity insight
    if total_scans == 0:
        activity_message = "No scans this week. Start tracking to see your progress!"
    elif scans_change > 0:
        activity_message = f"You scanned {scans_change} more times than last week!"
    elif scans_change < 0:
        activity_message = f"You scanned {abs(scans_change)} fewer times than last week."
    else:
        activity_message = "Same activity level as last week."
    
    return {
        "trend": trend,
        "emoji": emoji,
        "message": message,
        "activity_message": activity_message
    }
