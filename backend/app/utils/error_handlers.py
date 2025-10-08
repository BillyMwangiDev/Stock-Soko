"""
Comprehensive Error Handlers and Custom Exceptions
"""
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging

logger = logging.getLogger(__name__)


class StockSokoException(Exception):
    """Base exception for Stock Soko"""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class InsufficientFundsError(StockSokoException):
    """Raised when user has insufficient funds"""
    def __init__(self, required: float, available: float):
        message = f"Insufficient funds. Required: KES {required:.2f}, Available: KES {available:.2f}"
        super().__init__(message, status_code=400)


class OrderExecutionError(StockSokoException):
    """Raised when order cannot be executed"""
    def __init__(self, reason: str):
        super().__init__(f"Order execution failed: {reason}", status_code=400)


class MarketClosedError(StockSokoException):
    """Raised when trying to trade while market is closed"""
    def __init__(self):
        super().__init__("Market is currently closed. Trading hours: Mon-Fri 9:00 AM - 3:00 PM EAT", status_code=400)


class StockNotFoundError(StockSokoException):
    """Raised when stock symbol is not found"""
    def __init__(self, symbol: str):
        super().__init__(f"Stock {symbol} not found", status_code=404)


async def stocksoko_exception_handler(request: Request, exc: StockSokoException):
    """Handle custom Stock Soko exceptions"""
    logger.error(f"StockSokoException: {exc.message} - Path: {request.url.path}")
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.message,
            "path": str(request.url.path),
            "timestamp": str(logger.root.handlers[0].formatter.formatTime(logging.makeLogRecord({}))) if logger.root.handlers else None
        }
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors with detailed messages"""
    logger.warning(f"Validation error on {request.url.path}: {exc.errors()}")
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation error",
            "errors": exc.errors(),
            "body": exc.body if hasattr(exc, 'body') else None
        }
    )


async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle HTTP exceptions"""
    logger.error(f"HTTP {exc.status_code} on {request.url.path}: {exc.detail}")
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "path": str(request.url.path)
        }
    )


async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions"""
    logger.exception(f"Unhandled exception on {request.url.path}: {str(exc)}")
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal server error. Please try again later.",
            "path": str(request.url.path)
        }
    )

