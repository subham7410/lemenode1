"""
In-memory LRU caching for analysis results.
Zero cost - runs entirely in container memory.
"""

import hashlib
import json
import time
import logging
from typing import Dict, Any, Optional
from collections import OrderedDict
from threading import Lock

from config import settings

logger = logging.getLogger("cache")


class AnalysisCache:
    """
    Thread-safe LRU cache for skin analysis results.
    Uses hash of user profile + image to identify unique requests.
    """
    
    def __init__(self, max_size: int = 100, ttl: int = 3600):
        self.max_size = max_size
        self.ttl = ttl  # Time-to-live in seconds
        self._cache: OrderedDict[str, Dict[str, Any]] = OrderedDict()
        self._lock = Lock()
        self._hits = 0
        self._misses = 0
    
    def _generate_key(self, image_bytes: bytes, user_data: Dict[str, Any]) -> str:
        """Generate unique cache key from image and user data."""
        # Hash image bytes (first 10KB + last 10KB for speed)
        image_sample = image_bytes[:10240] + image_bytes[-10240:]
        image_hash = hashlib.md5(image_sample).hexdigest()
        
        # Hash user profile
        user_str = json.dumps(user_data, sort_keys=True)
        user_hash = hashlib.md5(user_str.encode()).hexdigest()
        
        return f"{image_hash}_{user_hash}"
    
    def get(self, image_bytes: bytes, user_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Get cached analysis result if available and not expired."""
        key = self._generate_key(image_bytes, user_data)
        
        with self._lock:
            if key not in self._cache:
                self._misses += 1
                return None
            
            entry = self._cache[key]
            
            # Check if expired
            if time.time() - entry["timestamp"] > self.ttl:
                del self._cache[key]
                self._misses += 1
                logger.info(f"Cache expired for key {key[:16]}...")
                return None
            
            # Move to end (most recently used)
            self._cache.move_to_end(key)
            self._hits += 1
            logger.info(f"Cache HIT for key {key[:16]}... (hits: {self._hits})")
            return entry["data"]
    
    def set(self, image_bytes: bytes, user_data: Dict[str, Any], result: Dict[str, Any]) -> None:
        """Store analysis result in cache."""
        key = self._generate_key(image_bytes, user_data)
        
        with self._lock:
            # Remove oldest if at capacity
            while len(self._cache) >= self.max_size:
                oldest_key = next(iter(self._cache))
                del self._cache[oldest_key]
                logger.debug(f"Evicted oldest cache entry: {oldest_key[:16]}...")
            
            self._cache[key] = {
                "data": result,
                "timestamp": time.time()
            }
            logger.info(f"Cached result for key {key[:16]}... (size: {len(self._cache)})")
    
    def clear(self) -> None:
        """Clear all cache entries."""
        with self._lock:
            self._cache.clear()
            logger.info("Cache cleared")
    
    def stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        with self._lock:
            total = self._hits + self._misses
            hit_rate = (self._hits / total * 100) if total > 0 else 0
            return {
                "size": len(self._cache),
                "max_size": self.max_size,
                "hits": self._hits,
                "misses": self._misses,
                "hit_rate": f"{hit_rate:.1f}%",
                "ttl_seconds": self.ttl
            }


# Global cache instance
analysis_cache = AnalysisCache(
    max_size=settings.CACHE_MAX_SIZE,
    ttl=settings.CACHE_TTL
)
