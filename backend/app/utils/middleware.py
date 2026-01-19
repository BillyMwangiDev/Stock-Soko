"""
Security and Rate Limiting Middleware
Implements comprehensive request throttling and security measures
"""

import time
from collections import defaultdict
from typing import Callable, Dict

from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from ..config import RATE_LIMIT_PER_MINUTE


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Enhanced rate limiting middleware with per-IP and per-endpoint tracking
    Implements sliding window algorithm for accurate rate limiting
    """

    def __init__(self, app, requests_per_minute: int = RATE_LIMIT_PER_MINUTE):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests_per_hour = requests_per_minute * 60

        # Sliding window tracking
        self.request_times: Dict[str, list] = defaultdict(list)

        # Enhanced rate limits for sensitive endpoints
        self.endpoint_limits = {
            "/api/v1/auth/login": 10,  # 10 per minute
            "/api/v1/auth/register": 5,  # 5 per minute
            "/api/v1/auth/reset-password": 3,  # 3 per minute
            "/api/v1/payments/": 20,  # 20 per minute
            "/api/v1/trades": 30,  # 30 per minute
        }

        # Cleanup interval (seconds)
        self.last_cleanup = time.time()
        self.cleanup_interval = 300  # 5 minutes

    def _cleanup_old_requests(self, current_time: float) -> None:
        """Remove request records older than 1 hour"""
        if current_time - self.last_cleanup < self.cleanup_interval:
            return

        cutoff_time = current_time - 3600
        for key in list(self.request_times.keys()):
            self.request_times[key] = [
                t for t in self.request_times[key] if t > cutoff_time
            ]
            if not self.request_times[key]:
                del self.request_times[key]

        self.last_cleanup = current_time

    def _get_client_identifier(self, request: Request) -> str:
        """Get unique client identifier from IP and user agent"""
        # Use X-Forwarded-For if behind proxy
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()
        else:
            client_ip = request.client.host if request.client else "unknown"

        # Include user agent for additional fingerprinting
        user_agent = request.headers.get("User-Agent", "unknown")[:50]
        return f"{client_ip}:{user_agent}"

    def _get_endpoint_limit(self, path: str) -> int:
        """Get rate limit for specific endpoint"""
        # Check exact match first
        if path in self.endpoint_limits:
            return self.endpoint_limits[path]

        # Check prefix match for dynamic routes
        for endpoint_prefix, limit in self.endpoint_limits.items():
            if path.startswith(endpoint_prefix):
                return limit

        # Default limit
        return self.requests_per_minute

    def _is_rate_limited(
        self, client_id: str, current_time: float, limit: int
    ) -> tuple[bool, int, int]:
        """
        Check if client is rate limited
        Returns: (is_limited, remaining, retry_after)
        """
        # Get request times for this client
        times = self.request_times[client_id]

        # Remove requests older than 1 minute
        cutoff_time = current_time - 60
        recent_requests = [t for t in times if t > cutoff_time]
        self.request_times[client_id] = recent_requests

        # Check if limit exceeded
        requests_count = len(recent_requests)
        if requests_count >= limit:
            # Calculate retry after based on oldest request
            if recent_requests:
                oldest_request = min(recent_requests)
                retry_after = int(60 - (current_time - oldest_request))
            else:
                retry_after = 60
            return True, 0, retry_after

        # Not limited
        remaining = limit - requests_count
        return False, remaining, 0

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process request with rate limiting"""
        current_time = time.time()

        # Skip rate limiting for health checks and metrics
        if request.url.path in [
            "/api/v1/health",
            "/metrics",
            "/docs",
            "/redoc",
            "/openapi.json",
        ]:
            return await call_next(request)

        # Periodic cleanup
        self._cleanup_old_requests(current_time)

        # Get client identifier
        client_id = self._get_client_identifier(request)

        # Get endpoint-specific limit
        endpoint_limit = self._get_endpoint_limit(request.url.path)

        # Check rate limit
        is_limited, remaining, retry_after = self._is_rate_limited(
            client_id, current_time, endpoint_limit
        )

        if is_limited:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": "rate_limit_exceeded",
                    "message": f"Rate limit exceeded. Maximum {endpoint_limit} requests per minute.",
                    "retry_after": retry_after,
                    "limit": endpoint_limit,
                    "remaining": 0,
                },
                headers={
                    "X-RateLimit-Limit": str(endpoint_limit),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(int(current_time + retry_after)),
                    "Retry-After": str(retry_after),
                },
            )

        # Record this request
        self.request_times[client_id].append(current_time)

        # Process request
        response = await call_next(request)

        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(endpoint_limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining - 1)
        response.headers["X-RateLimit-Reset"] = str(int(current_time + 60))

        return response


class RequestIdMiddleware(BaseHTTPMiddleware):
    """Add unique request ID to each request for tracing"""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Add request ID to headers"""
        import uuid

        # Generate or use existing request ID
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))

        # Add to request state
        request.state.request_id = request_id

        # Process request
        response = await call_next(request)

        # Add to response headers
        response.headers["X-Request-ID"] = request_id

        return response
