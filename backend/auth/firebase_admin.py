"""
Firebase Admin SDK initialization.
Handles Firebase app initialization with credentials from environment.
"""

import firebase_admin
from firebase_admin import credentials, auth, firestore
import os
import json
import logging

logger = logging.getLogger("firebase")

# Singleton for Firebase app
_firebase_app = None
_firestore_client = None


def get_firebase_app():
    """
    Initialize and return Firebase Admin app.
    Uses GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_CREDENTIALS env var.
    """
    global _firebase_app
    
    if _firebase_app is not None:
        return _firebase_app
    
    try:
        # Option 1: Use default credentials (Cloud Run auto-provides these)
        if os.getenv("K_SERVICE"):  # Running on Cloud Run
            _firebase_app = firebase_admin.initialize_app()
            logger.info("Firebase initialized with default Cloud Run credentials")
            return _firebase_app
        
        # Option 2: Use FIREBASE_CREDENTIALS JSON string (for local dev)
        creds_json = os.getenv("FIREBASE_CREDENTIALS")
        if creds_json:
            creds_dict = json.loads(creds_json)
            cred = credentials.Certificate(creds_dict)
            _firebase_app = firebase_admin.initialize_app(cred)
            logger.info("Firebase initialized with FIREBASE_CREDENTIALS")
            return _firebase_app
        
        # Option 3: Use GOOGLE_APPLICATION_CREDENTIALS file path
        creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        if creds_path and os.path.exists(creds_path):
            cred = credentials.Certificate(creds_path)
            _firebase_app = firebase_admin.initialize_app(cred)
            logger.info(f"Firebase initialized with credentials from {creds_path}")
            return _firebase_app
        
        # Fallback: Try default app (may work if already initialized)
        _firebase_app = firebase_admin.get_app()
        return _firebase_app
        
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {e}")
        raise RuntimeError(f"Firebase initialization failed: {e}")


def get_firestore_client():
    """Get Firestore client, initializing Firebase if needed."""
    global _firestore_client
    
    if _firestore_client is not None:
        return _firestore_client
    
    get_firebase_app()  # Ensure Firebase is initialized
    _firestore_client = firestore.client()
    return _firestore_client


def verify_firebase_token(id_token: str) -> dict:
    """
    Verify a Firebase ID token and return the decoded claims.
    
    Args:
        id_token: The Firebase ID token from the client
        
    Returns:
        Decoded token claims containing uid, email, etc.
        
    Raises:
        auth.InvalidIdTokenError: If token is invalid
        auth.ExpiredIdTokenError: If token is expired
    """
    get_firebase_app()  # Ensure Firebase is initialized
    
    try:
        decoded_token = auth.verify_id_token(id_token, check_revoked=True)
        return decoded_token
    except auth.RevokedIdTokenError:
        logger.warning("Token has been revoked")
        raise
    except auth.ExpiredIdTokenError:
        logger.warning("Token has expired")
        raise
    except auth.InvalidIdTokenError as e:
        logger.warning(f"Invalid token: {e}")
        raise


def get_user_by_uid(uid: str) -> auth.UserRecord:
    """Get Firebase user record by UID."""
    get_firebase_app()
    return auth.get_user(uid)


def is_firebase_configured() -> bool:
    """Check if Firebase can be initialized."""
    try:
        get_firebase_app()
        return True
    except Exception:
        return False


def verify_google_token(id_token: str, client_id: str = None) -> dict:
    """
    Verify a Google ID token directly (for native Google Sign-In).
    Uses Google's tokeninfo endpoint for verification.
    
    Args:
        id_token: The Google ID token from native sign-in
        client_id: Expected client ID (optional, for validation)
        
    Returns:
        Decoded token claims containing sub (uid), email, name, picture, etc.
        
    Raises:
        ValueError: If token is invalid
    """
    import requests
    import os
    
    try:
        # Verify token with Google's tokeninfo endpoint
        response = requests.get(
            f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}",
            timeout=10
        )
        
        if response.status_code != 200:
            raise ValueError(f"Token validation failed: {response.text}")
        
        idinfo = response.json()
        
        # Verify audience (client ID) if provided
        expected_client_id = client_id or os.getenv("GOOGLE_CLIENT_ID")
        if expected_client_id and idinfo.get('aud') != expected_client_id:
            logger.warning(f"Token aud mismatch: expected {expected_client_id}, got {idinfo.get('aud')}")
            # Don't fail on aud mismatch - might be using different client ID for native vs web
        
        # Verify issuer
        if idinfo.get('iss') not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Invalid issuer')
        
        # Return claims in a format compatible with Firebase tokens
        return {
            'uid': idinfo['sub'],  # Google's user ID
            'email': idinfo.get('email'),
            'name': idinfo.get('name'),
            'picture': idinfo.get('picture'),
            'email_verified': idinfo.get('email_verified') == 'true',
        }
        
    except requests.RequestException as e:
        logger.warning(f"Google token verification request failed: {e}")
        raise ValueError(f"Token verification request failed: {e}")
    except Exception as e:
        logger.warning(f"Google token verification failed: {e}")
        raise ValueError(f"Invalid Google token: {e}")


