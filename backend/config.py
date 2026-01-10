"""
Centralized configuration for the backend.
Uses Pydantic Settings for type-safe environment variable management.
"""

from functools import lru_cache
from typing import List
import os


class Settings:
    """Application settings loaded from environment variables."""
    
    # API Settings
    APP_NAME: str = "Skin Analysis API"
    VERSION: str = "3.2.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # Gemini API
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = "models/gemini-2.0-flash"
    GEMINI_TIMEOUT: int = 30  # seconds
    GEMINI_MAX_RETRIES: int = 2
    
    # Image Processing
    MAX_IMAGE_SIZE: tuple = (1280, 1280)  # Reduced for faster processing
    IMAGE_QUALITY: int = 70  # JPEG compression quality
    
    # Rate Limiting (free tier friendly)
    RATE_LIMIT_REQUESTS: int = int(os.getenv("RATE_LIMIT_REQUESTS", "10"))
    RATE_LIMIT_WINDOW: int = 60  # seconds
    
    # Caching (in-memory, zero cost)
    CACHE_MAX_SIZE: int = 100  # Maximum cached analyses
    CACHE_TTL: int = 3600  # 1 hour in seconds
    
    # CORS - restrict in production
    CORS_ORIGINS: List[str] = os.getenv(
        "CORS_ORIGINS", 
        "*"  # Override in production
    ).split(",")
    
    # Cloud Run
    PORT: int = int(os.getenv("PORT", "8080"))


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
