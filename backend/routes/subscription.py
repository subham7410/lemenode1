"""
Subscription/tier routes.
Handles tier information and upgrades.
"""

from fastapi import APIRouter, Depends, HTTPException, status
import logging

from auth.dependencies import get_current_user
from auth.models import CurrentUser
from db.tiers import get_user_usage, upgrade_tier, TIER_LIMITS

logger = logging.getLogger("routes.subscription")

router = APIRouter(prefix="/subscription", tags=["Subscription"])


@router.get("")
async def get_subscription(user: CurrentUser = Depends(get_current_user)):
    """
    Get current user's subscription tier and usage.
    
    Returns:
        - tier: Current tier (free/pro/unlimited)
        - scans_today: Number of scans used today
        - scans_limit: Daily scan limit for tier
        - can_scan: Whether user can perform more scans today
        - history_days: How many days of history available
        - features: List of available features
    """
    return await get_user_usage(user.uid)


@router.get("/tiers")
async def list_tiers():
    """
    Get all available subscription tiers and their limits.
    
    Public endpoint - no auth required.
    """
    return {
        "tiers": TIER_LIMITS
    }


@router.post("/upgrade")
async def upgrade_subscription(
    tier: str,
    user: CurrentUser = Depends(get_current_user)
):
    """
    Upgrade user's subscription tier.
    
    NOTE: In production, this should integrate with a payment provider
    (Stripe, Google Play, Apple Pay) to verify payment before upgrading.
    
    For now, this is a simple tier assignment for testing.
    """
    if tier not in TIER_LIMITS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid tier. Must be one of: {list(TIER_LIMITS.keys())}"
        )
    
    # TODO: Add payment verification here
    # - Verify payment with Stripe/Google Play
    # - Log transaction
    # - Send confirmation email
    
    result = await upgrade_tier(user.uid, tier)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    logger.info(f"User {user.uid} upgraded to tier: {tier}")
    return result
