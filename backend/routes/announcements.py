"""
Announcements routes.
Provides developer news and app update notifications.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

router = APIRouter(prefix="/announcements", tags=["Announcements"])


class Announcement(BaseModel):
    """Announcement model."""
    id: str
    title: str
    message: str
    type: str  # "info", "update", "warning", "promo"
    action_label: Optional[str] = None
    action_url: Optional[str] = None
    expires_at: Optional[str] = None


class AnnouncementsResponse(BaseModel):
    """Response model for announcements list."""
    announcements: List[Announcement]


# In-memory announcements storage (can be upgraded to Firestore later)
# Developers can update this list to push announcements to users
ACTIVE_ANNOUNCEMENTS: List[Announcement] = [
    Announcement(
        id="v2.6.0-release",
        title="🎉 Version 2.6.0 is here!",
        message="New features: Improved Google Sign-In, news announcements, and bug fixes. Sign in to save your progress!",
        type="update",
        action_label="View Release Notes",
        action_url="https://github.com/lemenode/skinglow-ai/releases/tag/v2.6.0",
    ),
]


@router.get("", response_model=AnnouncementsResponse)
async def get_announcements():
    """
    Get all active announcements.
    Returns announcements that have not expired.
    """
    now = datetime.utcnow().isoformat()
    
    active = []
    for announcement in ACTIVE_ANNOUNCEMENTS:
        # Check if expired
        if announcement.expires_at and announcement.expires_at < now:
            continue
        active.append(announcement)
    
    return AnnouncementsResponse(announcements=active)


@router.get("/latest", response_model=Optional[Announcement])
async def get_latest_announcement():
    """
    Get the most recent active announcement.
    Useful for displaying a single banner.
    """
    now = datetime.utcnow().isoformat()
    
    for announcement in ACTIVE_ANNOUNCEMENTS:
        if announcement.expires_at and announcement.expires_at < now:
            continue
        return announcement
    
    return None
