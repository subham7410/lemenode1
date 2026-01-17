"""
User database operations using Firestore.
Handles CRUD operations for user profiles.
"""

from datetime import datetime, date
from typing import Optional
import logging

from google.cloud.firestore_v1 import FieldFilter
from auth.firebase_admin import get_firestore_client
from auth.models import UserProfile, UserProfileUpdate

logger = logging.getLogger("db.users")

# Collection name
USERS_COLLECTION = "users"


async def get_user(uid: str) -> Optional[UserProfile]:
    """
    Get user profile by UID.
    
    Args:
        uid: Firebase user ID
        
    Returns:
        UserProfile if found, None otherwise
    """
    db = get_firestore_client()
    doc = db.collection(USERS_COLLECTION).document(uid).get()
    
    if not doc.exists:
        return None
    
    data = doc.to_dict()
    data["uid"] = uid
    return UserProfile(**data)


async def create_user(
    uid: str,
    email: Optional[str] = None,
    display_name: Optional[str] = None,
    photo_url: Optional[str] = None
) -> UserProfile:
    """
    Create a new user profile.
    
    Args:
        uid: Firebase user ID
        email: User's email
        display_name: User's display name
        photo_url: User's photo URL
        
    Returns:
        Created UserProfile
    """
    db = get_firestore_client()
    
    now = datetime.utcnow()
    user_data = {
        "email": email,
        "display_name": display_name,
        "photo_url": photo_url,
        "tier": "free",
        "scans_today": 0,
        "last_scan_date": None,
        "created_at": now,
        "updated_at": now,
    }
    
    db.collection(USERS_COLLECTION).document(uid).set(user_data)
    logger.info(f"Created new user: {uid}")
    
    user_data["uid"] = uid
    return UserProfile(**user_data)


async def get_or_create_user(
    uid: str,
    email: Optional[str] = None,
    display_name: Optional[str] = None,
    photo_url: Optional[str] = None
) -> tuple[UserProfile, bool]:
    """
    Get existing user or create new one.
    
    Returns:
        Tuple of (UserProfile, is_new_user)
    """
    existing = await get_user(uid)
    if existing:
        return existing, False
    
    new_user = await create_user(uid, email, display_name, photo_url)
    return new_user, True


async def update_user(uid: str, updates: UserProfileUpdate) -> Optional[UserProfile]:
    """
    Update user profile.
    
    Args:
        uid: Firebase user ID
        updates: Fields to update
        
    Returns:
        Updated UserProfile if found, None otherwise
    """
    db = get_firestore_client()
    doc_ref = db.collection(USERS_COLLECTION).document(uid)
    
    # Check if user exists
    if not doc_ref.get().exists:
        return None
    
    # Build update dict, excluding None values
    update_data = updates.model_dump(exclude_unset=True, exclude_none=True)
    update_data["updated_at"] = datetime.utcnow()
    
    doc_ref.update(update_data)
    logger.info(f"Updated user: {uid}")
    
    return await get_user(uid)


async def delete_user(uid: str) -> bool:
    """
    Delete user profile (GDPR compliance).
    
    Args:
        uid: Firebase user ID
        
    Returns:
        True if deleted, False if not found
    """
    db = get_firestore_client()
    doc_ref = db.collection(USERS_COLLECTION).document(uid)
    
    if not doc_ref.get().exists:
        return False
    
    doc_ref.delete()
    logger.info(f"Deleted user: {uid}")
    return True


async def increment_scan_count(uid: str) -> int:
    """
    Increment user's daily scan count.
    Resets count if it's a new day.
    
    Returns:
        New scan count for today
    """
    db = get_firestore_client()
    doc_ref = db.collection(USERS_COLLECTION).document(uid)
    doc = doc_ref.get()
    
    if not doc.exists:
        return 0
    
    data = doc.to_dict()
    today = date.today().isoformat()
    last_scan_date = data.get("last_scan_date")
    
    if last_scan_date != today:
        # New day, reset count
        new_count = 1
    else:
        new_count = data.get("scans_today", 0) + 1
    
    doc_ref.update({
        "scans_today": new_count,
        "last_scan_date": today,
        "updated_at": datetime.utcnow()
    })
    
    return new_count


async def get_daily_scan_count(uid: str) -> int:
    """Get user's scan count for today."""
    user = await get_user(uid)
    if not user:
        return 0
    
    today = date.today().isoformat()
    if user.last_scan_date != today:
        return 0
    
    return user.scans_today


async def update_user_tier(uid: str, tier: str) -> Optional[UserProfile]:
    """
    Update user's subscription tier.
    
    Args:
        uid: Firebase user ID
        tier: New tier ("free", "pro", "unlimited")
        
    Returns:
        Updated UserProfile if found
    """
    if tier not in ["free", "pro", "unlimited"]:
        raise ValueError(f"Invalid tier: {tier}")
    
    db = get_firestore_client()
    doc_ref = db.collection(USERS_COLLECTION).document(uid)
    
    if not doc_ref.get().exists:
        return None
    
    doc_ref.update({
        "tier": tier,
        "updated_at": datetime.utcnow()
    })
    
    logger.info(f"Updated user {uid} tier to: {tier}")
    return await get_user(uid)


async def update_streak(uid: str) -> dict:
    """
    Update user's scan streak.
    
    Logic:
    - If already scanned today: no change
    - If scanned yesterday: continue streak (+1)
    - Otherwise: reset streak to 1
    
    Args:
        uid: Firebase user ID
        
    Returns:
        dict with current_streak, longest_streak, streak_extended (bool)
    """
    from datetime import timedelta
    
    db = get_firestore_client()
    doc_ref = db.collection(USERS_COLLECTION).document(uid)
    doc = doc_ref.get()
    
    if not doc.exists:
        return {"current_streak": 0, "longest_streak": 0, "streak_extended": False}
    
    data = doc.to_dict()
    today = date.today().isoformat()
    yesterday = (date.today() - timedelta(days=1)).isoformat()
    
    streak_last_scan = data.get("streak_last_scan_date")
    current_streak = data.get("current_streak", 0)
    longest_streak = data.get("longest_streak", 0)
    streak_extended = False
    
    if streak_last_scan == today:
        # Already scanned today, no change
        pass
    elif streak_last_scan == yesterday:
        # Scanned yesterday, continue streak
        current_streak += 1
        streak_extended = True
    else:
        # Streak broken or first scan
        current_streak = 1
        streak_extended = current_streak == 1 and streak_last_scan is None
    
    # Update longest streak if needed
    if current_streak > longest_streak:
        longest_streak = current_streak
    
    # Save to database
    doc_ref.update({
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "streak_last_scan_date": today,
        "updated_at": datetime.utcnow()
    })
    
    logger.info(f"Updated streak for {uid}: {current_streak} days (longest: {longest_streak})")
    
    return {
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "streak_extended": streak_extended
    }

