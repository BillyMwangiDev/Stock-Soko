import time
import uuid
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from ..utils.logging import get_logger

logger = get_logger("middleware")


class RequestIdMiddleware(BaseHTTPMiddleware):
	async def dispatch(self, request: Request, call_next: Callable[[Request], Response]) -> Response:
		req_id = request.headers.get("x-request-id") or str(uuid.uuid4())
		request.state.request_id = req_id
		response = await call_next(request)
		response.headers["x-request-id"] = req_id
		return response


# Very basic in-memory rate limiter per IP (token bucket)
_BUCKETS: dict[str, dict[str, float]] = {}
RATE = 5.0  # tokens per second
BURST = 20.0  # bucket size


class RateLimitMiddleware(BaseHTTPMiddleware):
	async def dispatch(self, request: Request, call_next: Callable[[Request], Response]) -> Response:
		ip = request.client.host if request.client else "unknown"
		bucket = _BUCKETS.setdefault(ip, {"tokens": BURST, "ts": time.time()})
		now = time.time()
		delta = now - bucket["ts"]
		bucket["tokens"] = min(BURST, bucket["tokens"] + delta * RATE)
		bucket["ts"] = now
		if bucket["tokens"] < 1:
			return Response("Too Many Requests", status_code=429)
		bucket["tokens"] -= 1
		return await call_next(request)