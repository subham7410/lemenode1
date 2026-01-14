"""
Authentication routes.
Handles token verification and user creation/lookup.
"""

from fastapi import APIRouter, Depends, HTTPException, status
import logging

# Note: Firebase imports restored
from auth.firebase_admin import verify_firebase_token, is_firebase_configured
from auth.dependencies import get_current_user
from auth.models import (
    CurrentUser,
    TokenVerifyRequest,
    TokenVerifyResponse,
    UserProfile
)
from db.users import get_or_create_user

logger = logging.getLogger("routes.auth")

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/verify", response_model=TokenVerifyResponse)
async def verify_token(request: TokenVerifyRequest):
    """
    Verify ID token and get/create user profile.
    Uses Google's tokeninfo endpoint for verification.
    
    Returns:
        - valid: Whether the token is valid
        - user: User profile data
        - is_new_user: Whether this is a new user (first login)
        - error_reason: Detailed error if validation failed
    """
    import requests
    
    logger = logging.getLogger("routes.auth")
    
    try:
        # Log token info for debugging (first 50 chars only for security)
        token_preview = request.id_token[:50] if len(request.id_token) > 50 else request.id_token
        logger.info(f"Verifying token (length={len(request.id_token)}, preview={token_preview}...)")
        
        # Verify token with Google's tokeninfo endpoint
        response = requests.get(
            f"https://oauth2.googleapis.com/tokeninfo?id_token={request.id_token}",
            timeout=10
        )
        
        if response.status_code != 200:
            error_msg = f"Google tokeninfo failed: status={response.status_code}, response={response.text[:300]}"
            logger.warning(error_msg)
            return TokenVerifyResponse(valid=False, user=None, is_new_user=False, error_reason=error_msg)
        
        idinfo = response.json()
        logger.info(f"Token verified for user: {idinfo.get('email')}")
        
        # Check issuer
        if idinfo.get('iss') not in ['accounts.google.com', 'https://accounts.google.com']:
            error_msg = f"Invalid issuer: {idinfo.get('iss')}"
            logger.warning(error_msg)
            return TokenVerifyResponse(valid=False, user=None, is_new_user=False, error_reason=error_msg)
        
        # Get or create user in Firestore
        # Extract user info from the Google token response
        user_profile, is_new = await get_or_create_user(
            uid=idinfo.get('sub'),  # Google's user ID
            email=idinfo.get('email'),
            display_name=idinfo.get('name'),
            photo_url=idinfo.get('picture')
        )
        
        return TokenVerifyResponse(
            valid=True,
            user=user_profile,
            is_new_user=is_new
        )
        
    except requests.RequestException as e:
        error_msg = f"Token verification request failed: {str(e)}"
        logger.warning(error_msg)
        return TokenVerifyResponse(valid=False, user=None, is_new_user=False, error_reason=error_msg)
    except Exception as e:
        error_msg = f"Token verification failed: {str(e)}"
        logger.warning(error_msg)
        return TokenVerifyResponse(valid=False, user=None, is_new_user=False, error_reason=error_msg)


@router.get("/me", response_model=UserProfile)
async def get_me(user: CurrentUser = Depends(get_current_user)):
    """Get current user profile."""
    from db.users import get_user
    user_profile = await get_user(user.uid)
    if not user_profile:
        raise HTTPException(status_code=404, detail="User not found")
    return user_profile


@router.get("/status")
async def auth_status():
    """
    Check authentication system status.
    Useful for debugging and health checks.
    """
    return {
        "firebase_configured": is_firebase_configured(),
        "auth_enabled": True
    }

