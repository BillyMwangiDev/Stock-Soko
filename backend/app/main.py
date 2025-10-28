from typing import Callable
from fastapi import FastAPI, Request, Response, WebSocket
from fastapi.responses import PlainTextResponse, JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
import logging
import asyncio

from .config import APP_NAME, ALLOWED_ORIGINS
from .database import init_db
from .routers import (
    health, markets, trades, payments, kyc, watchlist, ledger,
    cds, auth, news, ai_chat, settings, dashboard, charts, alerts, profile, broker, notifications, fees, statements, wallet, dividends, tax_reports, leaderboard, achievements, portfolio_analytics
)
from .utils.middleware import RequestIdMiddleware, RateLimitMiddleware
from .utils.security_headers import SecurityHeadersMiddleware
from .utils.error_handlers import (
    StockSokoException,
    stocksoko_exception_handler,
    validation_exception_handler,
    http_exception_handler,
    general_exception_handler
)
from .websocket.price_stream import websocket_endpoint, start_heartbeat_task
from .services.cache_service import cache_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

app = FastAPI(
    title=APP_NAME,
    description="Intelligent Stock Trading Platform for African Markets",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

@app.on_event("startup")
async def on_startup() -> None:
    init_db()
    asyncio.create_task(start_heartbeat_task())
    logging.info("Application started, WebSocket heartbeat task initiated")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Request-ID"],
    expose_headers=["X-Request-ID"],
)

# Register exception handlers
app.add_exception_handler(StockSokoException, stocksoko_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

REQUEST_COUNT = Counter("http_requests_total", "Total HTTP requests", ["method", "path", "status"])
REQUEST_LATENCY = Histogram("http_request_duration_seconds", "Request latency", ["method", "path"]) 


@app.middleware("http")
async def metrics_middleware(request: Request, call_next: Callable) -> Response:
    method = request.method
    path = request.url.path
    with REQUEST_LATENCY.labels(method=method, path=path).time():
        response = await call_next(request)
    REQUEST_COUNT.labels(method=method, path=path, status=str(response.status_code)).inc()
    return response

app.add_middleware(RequestIdMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(SecurityHeadersMiddleware)


@app.get("/metrics")
async def metrics() -> PlainTextResponse:
    return PlainTextResponse(generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.get("/admin/cache-stats")
async def cache_stats():
    """Get cache statistics (admin only)"""
    return JSONResponse(content=cache_service.get_stats())


@app.websocket("/ws/prices/{client_id}")
async def websocket_prices(websocket: WebSocket, client_id: str):
    """WebSocket endpoint for real-time price updates"""
    await websocket_endpoint(websocket, client_id)

app.include_router(health.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1")
app.include_router(profile.router, prefix="/api/v1")
app.include_router(broker.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(markets.router, prefix="/api/v1")
app.include_router(trades.router, prefix="/api/v1")
app.include_router(payments.router, prefix="/api/v1")
app.include_router(wallet.router, prefix="/api/v1")
app.include_router(kyc.router, prefix="/api/v1")
app.include_router(watchlist.router, prefix="/api/v1")
app.include_router(ledger.router, prefix="/api/v1")
app.include_router(cds.router, prefix="/api/v1")
app.include_router(news.router, prefix="/api/v1")
app.include_router(ai_chat.router, prefix="/api/v1")
app.include_router(settings.router, prefix="/api/v1")
app.include_router(charts.router, prefix="/api/v1")
app.include_router(alerts.router, prefix="/api/v1")
app.include_router(dividends.router, prefix="/api/v1")
app.include_router(tax_reports.router, prefix="/api/v1")
app.include_router(leaderboard.router, prefix="/api/v1")
app.include_router(achievements.router, prefix="/api/v1")
app.include_router(portfolio_analytics.router, prefix="/api/v1")
app.include_router(notifications.router, prefix="/api/v1")
app.include_router(fees.router, prefix="/api/v1")
app.include_router(statements.router, prefix="/api/v1")