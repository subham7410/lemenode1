"""
Centralized configuration for the backend.
Uses Pydantic Settings for type-safe environment variable management.
"""

from functools import lru_cache
from typing import List, Dict
import os


class Settings:
    """Application settings loaded from environment variables."""
    
    # API Settings
    APP_NAME: str = "Skin Analysis API"
    VERSION: str = "4.0.0"  # Major version bump for auth
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # Gemini API
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = "models/gemini-2.0-flash"
    GEMINI_TIMEOUT: int = 30  # seconds
    GEMINI_MAX_RETRIES: int = 2
    
    # Image Processing
    MAX_IMAGE_SIZE: tuple = (1280, 1280)
    IMAGE_QUALITY: int = 70
    
    # Rate Limiting (for anonymous users)
    RATE_LIMIT_REQUESTS: int = int(os.getenv("RATE_LIMIT_REQUESTS", "5"))  # Reduced for anon
    RATE_LIMIT_WINDOW: int = 60  # seconds
    
    # Caching (in-memory)
    CACHE_MAX_SIZE: int = 100
    CACHE_TTL: int = 3600  # 1 hour
    
    # CORS - Restrict to known origins in production
    CORS_ORIGINS: List[str] = os.getenv(
        "CORS_ORIGINS", 
        "http://localhost:8081,http://localhost:19006,exp://localhost:8081"  # Dev defaults
    ).split(",")
    
    # Firebase Settings
    FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "")
    # For local dev: JSON string of service account credentials
    # For Cloud Run: Uses default credentials automatically
    FIREBASE_CREDENTIALS: str = os.getenv("FIREBASE_CREDENTIALS", "")
    
    # Tier-based rate limits
    TIER_LIMITS: Dict[str, dict] = {
        "free": {
            "scans_per_day": 3,
            "history_days": 7,
            "features": ["basic_scan", "recommendations"]
        },
        "pro": {
            "scans_per_day": 50,
            "history_days": 365,
            "features": ["basic_scan", "recommendations", "detailed_analysis", "export"]
        },
        "unlimited": {
            "scans_per_day": -1,  # No limit
            "history_days": -1,  # Forever
            "features": ["basic_scan", "recommendations", "detailed_analysis", "export", "priority_support"]
        }
    }
    
    # Cloud Run
    PORT: int = int(os.getenv("PORT", "8080"))


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()

