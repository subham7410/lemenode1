"""
Pydantic models for authentication.
"""

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class CurrentUser(BaseModel):
    """Represents the currently authenticated user from Firebase token."""
    uid: str
    email: Optional[str] = None
    email_verified: bool = False
    name: Optional[str] = None
    picture: Optional[str] = None
    is_admin: bool = False


class UserProfile(BaseModel):
    """User profile stored in Firestore."""
    uid: str
    email: Optional[str] = None
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    
    # App-specific profile data
    age: Optional[int] = None
    gender: Optional[str] = None
    ethnicity: Optional[str] = None
    height: Optional[int] = None  # cm
    weight: Optional[int] = None  # kg
    diet: Optional[str] = None  # "veg" | "non-veg"
    
    # Subscription tier
    tier: str = "free"  # "free" | "pro" | "unlimited"
    
    # Usage tracking
    scans_today: int = 0
    last_scan_date: Optional[str] = None  # ISO date string
    
    # Timestamps
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class UserProfileUpdate(BaseModel):
    """Request model for updating user profile."""
    display_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    ethnicity: Optional[str] = None
    height: Optional[int] = None
    weight: Optional[int] = None
    diet: Optional[str] = None


class TokenVerifyRequest(BaseModel):
    """Request model for verifying Firebase token."""
    id_token: str


class TokenVerifyResponse(BaseModel):
    """Response model for token verification."""
    valid: bool
    user: Optional[UserProfile] = None
    is_new_user: bool = False
    error_reason: Optional[str] = None  # Debug field to explain why validation failed
