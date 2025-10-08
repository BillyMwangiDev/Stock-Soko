from fastapi import FastAPI, Request
from fastapi.responses import PlainTextResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from .config import APP_NAME
from .routers import health, markets, trades, payments, kyc
from .routers import watchlist, ledger, cds, auth, news, ai_chat, settings, dashboard, charts, alerts
from .utils.middleware import RequestIdMiddleware, RateLimitMiddleware
from .utils.error_handlers import (
    StockSokoException,
    stocksoko_exception_handler,
    validation_exception_handler,
    http_exception_handler,
    general_exception_handler
)
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
import logging

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

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8081",
        "http://localhost:19006",
        "exp://localhost:8081",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register exception handlers
app.add_exception_handler(StockSokoException, stocksoko_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Metrics
REQUEST_COUNT = Counter("http_requests_total", "Total HTTP requests", ["method", "path", "status"])
REQUEST_LATENCY = Histogram("http_request_duration_seconds", "Request latency", ["method", "path"]) 


@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
	method = request.method
	path = request.url.path
	with REQUEST_LATENCY.labels(method=method, path=path).time():
		response = await call_next(request)
	REQUEST_COUNT.labels(method=method, path=path, status=str(response.status_code)).inc()
	return response

app.add_middleware(RequestIdMiddleware)
app.add_middleware(RateLimitMiddleware)


@app.get("/metrics")
async def metrics():
	return PlainTextResponse(generate_latest(), media_type=CONTENT_TYPE_LATEST)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(markets.router)
app.include_router(trades.router)
app.include_router(payments.router)
app.include_router(kyc.router)
app.include_router(watchlist.router)
app.include_router(ledger.router)
app.include_router(cds.router)
app.include_router(news.router)
app.include_router(ai_chat.router)
app.include_router(settings.router)
app.include_router(charts.router)
app.include_router(alerts.router)
