"""
User profile routes.
Handles user CRUD operations.
"""

from fastapi import APIRouter, Depends, HTTPException, status
import logging

from auth.dependencies import get_current_user
from auth.models import CurrentUser, UserProfile, UserProfileUpdate
from db.users import get_user, update_user, delete_user
from db.scans import delete_all_user_scans

logger = logging.getLogger("routes.users")

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserProfile)
async def get_my_profile(user: CurrentUser = Depends(get_current_user)):
    """
    Get current user's profile.
    """
    profile = await get_user(user.uid)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    return profile


@router.patch("/me", response_model=UserProfile)
async def update_my_profile(
    updates: UserProfileUpdate,
    user: CurrentUser = Depends(get_current_user)
):
    """
    Update current user's profile.
    
    Only includes fields that are provided (partial update).
    """
    profile = await update_user(user.uid, updates)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    return profile


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_account(user: CurrentUser = Depends(get_current_user)):
    """
    Delete current user's account and all associated data.
    
    This is a permanent action for GDPR compliance.
    Deletes:
    - User profile
    - All scan history
    
    Note: Does NOT delete Firebase Auth account. That should be
    done client-side after this API call succeeds.
    """
    # Delete all user's scans first
    await delete_all_user_scans(user.uid)
    
    # Delete user profile
    deleted = await delete_user(user.uid)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    logger.info(f"Account deleted for user: {user.uid}")
    return None
