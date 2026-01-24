"""
Reports API routes.
Endpoints for generating and fetching health reports.
"""

from fastapi import APIRouter, Depends, HTTPException
from auth.dependencies import get_current_user
from auth.models import CurrentUser
from db.reports import get_weekly_report
import logging

logger = logging.getLogger("routes.reports")

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/weekly")
async def weekly_report(user: CurrentUser = Depends(get_current_user)):
    """
    Get weekly health report for the authenticated user.
    
    Returns aggregated data from the past 7 days including:
    - Summary statistics (scan count, avg score, trends)
    - Daily score breakdown for charts
    - Top detected issues
    - Personalized recommendations
    - Insight messages
    """
    try:
        report = await get_weekly_report(user.uid)
        logger.info(f"Generated weekly report for user {user.uid}")
        return report
    except Exception as e:
        logger.error(f"Error generating weekly report for {user.uid}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate weekly report"
        )
