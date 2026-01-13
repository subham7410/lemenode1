"""
Scan history routes.
Handles scan retrieval and deletion.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
import logging

from auth.dependencies import get_current_user
from auth.models import CurrentUser
from db.scans import (
    get_user_scans,
    get_scan,
    get_scan_with_full_analysis,
    delete_scan,
    ScanRecord
)
from db.users import get_user
from db.tiers import get_history_days_limit

logger = logging.getLogger("routes.scans")

router = APIRouter(prefix="/scans", tags=["Scans"])


@router.get("")
async def list_scans(
    user: CurrentUser = Depends(get_current_user),
    limit: int = Query(default=30, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    """
    Get scan history for current user.
    
    Results are paginated and limited by user's subscription tier:
    - Free tier: Last 7 days only
    - Pro tier: Last 365 days
    - Unlimited: All history
    
    Returns newest scans first.
    """
    # Get user's tier to determine history limit
    profile = await get_user(user.uid)
    tier = profile.tier if profile else "free"
    history_days = get_history_days_limit(tier)
    
    # Apply tier-based history limit
    days_filter = history_days if history_days > 0 else None
    
    scans = await get_user_scans(
        user_id=user.uid,
        limit=limit,
        offset=offset,
        days=days_filter
    )
    
    return {
        "scans": [s.to_dict() for s in scans],
        "limit": limit,
        "offset": offset,
        "tier": tier,
        "history_days_available": history_days
    }


@router.get("/{scan_id}")
async def get_scan_details(
    scan_id: str,
    user: CurrentUser = Depends(get_current_user),
):
    """
    Get full details of a specific scan, including complete analysis.
    """
    scan = await get_scan_with_full_analysis(scan_id, user.uid)
    
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan not found"
        )
    
    return scan


@router.delete("/{scan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_scan_by_id(
    scan_id: str,
    user: CurrentUser = Depends(get_current_user),
):
    """
    Delete a specific scan.
    """
    deleted = await delete_scan(scan_id, user.uid)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan not found or already deleted"
        )
    
    return None
