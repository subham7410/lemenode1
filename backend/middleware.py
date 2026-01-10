"""
Middleware for request tracking, timing, and logging.
Provides structured logging compatible with Cloud Logging.
"""

import time
import uuid
import logging
from typing import Callable
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("middleware")


class RequestTrackingMiddleware(BaseHTTPMiddleware):
    """
    Adds request ID and timing to all requests.
    Logs in structured format for Cloud Logging.
    """
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Generate unique request ID
        request_id = str(uuid.uuid4())[:8]
        request.state.request_id = request_id
        
        # Record start time
        start_time = time.time()
        
        # Get client IP (handles Cloud Run proxy)
        client_ip = request.headers.get(
            "X-Forwarded-For", 
            request.client.host if request.client else "unknown"
        )
        if "," in client_ip:
            client_ip = client_ip.split(",")[0].strip()
        
        # Log request
        logger.info(
            f"[{request_id}] {request.method} {request.url.path} - Client: {client_ip}"
        )
        
        try:
            response = await call_next(request)
            
            # Calculate duration
            duration_ms = (time.time() - start_time) * 1000
            
            # Add headers
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Response-Time"] = f"{duration_ms:.0f}ms"
            
            # Log response
            log_level = logging.INFO if response.status_code < 400 else logging.WARNING
            logger.log(
                log_level,
                f"[{request_id}] {response.status_code} - {duration_ms:.0f}ms"
            )
            
            return response
            
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            logger.error(
                f"[{request_id}] ERROR - {duration_ms:.0f}ms - {str(e)}"
            )
            raise
