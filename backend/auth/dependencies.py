"""
FastAPI dependencies for authentication.
Provides reusable dependencies for protecting routes.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import logging

from .firebase_admin import verify_firebase_token
from .models import CurrentUser

logger = logging.getLogger("auth")

# Security scheme for Swagger docs
security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> CurrentUser:
    """
    Dependency that validates Firebase or Google ID token and returns current user.
    
    Tries Firebase token first, then falls back to Google OAuth token.
    This supports both Firebase Auth and native Google Sign-In.
    
    Usage:
        @app.get("/protected")
        async def protected_route(user: CurrentUser = Depends(get_current_user)):
            return {"uid": user.uid}
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    
    # Try Firebase token first
    try:
        decoded = verify_firebase_token(token)
        
        return CurrentUser(
            uid=decoded["uid"],
            email=decoded.get("email"),
            email_verified=decoded.get("email_verified", False),
            name=decoded.get("name"),
            picture=decoded.get("picture"),
        )
    except Exception as firebase_error:
        logger.debug(f"Firebase token validation failed, trying Google token: {firebase_error}")
    
    # Fall back to Google OAuth token
    try:
        from .firebase_admin import verify_google_token
        decoded = verify_google_token(token)
        
        return CurrentUser(
            uid=decoded["uid"],
            email=decoded.get("email"),
            email_verified=decoded.get("email_verified", False),
            name=decoded.get("name"),
            picture=decoded.get("picture"),
        )
    except Exception as google_error:
        logger.warning(f"Both token validations failed. Firebase: {firebase_error}, Google: {google_error}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[CurrentUser]:
    """
    Dependency that optionally validates Firebase token.
    Returns None if no token provided, user if valid token.
    
    Useful for routes that work for both authenticated and anonymous users.
    """
    if credentials is None:
        return None
    
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None


async def require_admin(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    """
    Dependency that requires admin role.
    
    Note: Implement admin check based on your needs:
    - Custom claim in Firebase token
    - Lookup in Firestore
    - Hardcoded admin UIDs list
    """
    # For now, check if user has admin custom claim
    # You can set this via Firebase Admin SDK: auth.set_custom_user_claims(uid, {'admin': True})
    if not getattr(user, 'is_admin', False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return user
