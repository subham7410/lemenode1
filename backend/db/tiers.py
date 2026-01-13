"""
Tier/subscription management.
Handles tier limits and upgrade logic.
"""

from typing import Optional
from config import settings
from db.users import get_user, update_user_tier


# Tier definitions
TIER_LIMITS = {
    "free": {
        "scans_per_day": 3,
        "history_days": 7,  # Can view last 7 days of history
        "features": ["basic_scan", "recommendations"]
    },
    "pro": {
        "scans_per_day": 50,
        "history_days": 365,  # Full year
        "features": ["basic_scan", "recommendations", "detailed_analysis", "export"]
    },
    "unlimited": {
        "scans_per_day": -1,  # No limit
        "history_days": -1,  # Forever
        "features": ["basic_scan", "recommendations", "detailed_analysis", "export", "priority_support"]
    }
}


def get_tier_limits(tier: str) -> dict:
    """Get limits for a tier."""
    return TIER_LIMITS.get(tier, TIER_LIMITS["free"])


def can_scan(tier: str, scans_today: int) -> bool:
    """
    Check if user can perform a scan based on their tier.
    
    Args:
        tier: User's subscription tier
        scans_today: Number of scans already done today
        
    Returns:
        True if user can scan, False if limit reached
    """
    limits = get_tier_limits(tier)
    daily_limit = limits["scans_per_day"]
    
    if daily_limit == -1:  # Unlimited
        return True
    
    return scans_today < daily_limit


def get_history_days_limit(tier: str) -> int:
    """
    Get the number of days of history a user can access.
    
    Returns:
        Number of days, or -1 for unlimited
    """
    limits = get_tier_limits(tier)
    return limits["history_days"]


def has_feature(tier: str, feature: str) -> bool:
    """Check if tier has access to a specific feature."""
    limits = get_tier_limits(tier)
    return feature in limits.get("features", [])


async def get_user_usage(uid: str) -> dict:
    """
    Get user's current usage statistics.
    
    Returns:
        Dict with tier info and usage counts
    """
    user = await get_user(uid)
    if not user:
        return {
            "tier": "free",
            "scans_today": 0,
            "scans_limit": TIER_LIMITS["free"]["scans_per_day"],
            "can_scan": True
        }
    
    limits = get_tier_limits(user.tier)
    scans_limit = limits["scans_per_day"]
    
    return {
        "tier": user.tier,
        "scans_today": user.scans_today,
        "scans_limit": scans_limit,
        "can_scan": can_scan(user.tier, user.scans_today),
        "history_days": limits["history_days"],
        "features": limits["features"]
    }


async def upgrade_tier(uid: str, new_tier: str) -> Optional[dict]:
    """
    Upgrade user's tier.
    
    Note: This is for manual upgrades. In production, integrate with
    payment provider (Stripe, Google Play, etc.) to verify payment first.
    
    Args:
        uid: Firebase user ID
        new_tier: New tier to set
        
    Returns:
        Updated usage info, None if user not found
    """
    updated_user = await update_user_tier(uid, new_tier)
    if not updated_user:
        return None
    
    return await get_user_usage(uid)
