"""
Custom Exception Classes
Provides specific, meaningful exceptions for different error scenarios
"""

from typing import Any, Dict, Optional


class StockSokoException(Exception):
    """Base exception for all Stock Soko custom exceptions"""

    def __init__(
        self,
        message: str,
        status_code: int = 500,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


# User & Authentication Exceptions
class UserNotFoundException(StockSokoException):
    """Raised when a user is not found"""

    def __init__(self, message: str = "User not found"):
        super().__init__(message, status_code=404)


class UserAlreadyExistsException(StockSokoException):
    """Raised when attempting to create a user that already exists"""

    def __init__(self, message: str = "User already exists"):
        super().__init__(message, status_code=409)


class InvalidCredentialsException(StockSokoException):
    """Raised when login credentials are invalid"""

    def __init__(self, message: str = "Invalid email or password"):
        super().__init__(message, status_code=401)


class InvalidTokenException(StockSokoException):
    """Raised when JWT token is invalid or expired"""

    def __init__(self, message: str = "Invalid or expired token"):
        super().__init__(message, status_code=401)


class TwoFactorRequiredException(StockSokoException):
    """Raised when 2FA is required but not provided"""

    def __init__(self, message: str = "Two-factor authentication required"):
        super().__init__(message, status_code=403)


class Invalid2FACodeException(StockSokoException):
    """Raised when 2FA code is invalid"""

    def __init__(self, message: str = "Invalid two-factor authentication code"):
        super().__init__(message, status_code=401)


# Market Data Exceptions
class MarketDataException(StockSokoException):
    """Base exception for market data errors"""

    def __init__(self, message: str = "Market data error", status_code: int = 500):
        super().__init__(message, status_code)


class SymbolNotFoundException(MarketDataException):
    """Raised when a stock symbol is not found"""

    def __init__(self, symbol: str):
        super().__init__(f"Stock symbol '{symbol}' not found", status_code=404)
        self.details = {"symbol": symbol}


class MarketDataProviderException(MarketDataException):
    """Raised when all market data providers fail"""

    def __init__(self, message: str = "All market data providers unavailable"):
        super().__init__(message, status_code=503)


class RateLimitExceededException(MarketDataException):
    """Raised when API rate limit is exceeded"""

    def __init__(self, provider: str = "API", reset_time: Optional[int] = None):
        message = f"Rate limit exceeded for {provider}"
        if reset_time:
            message += f". Resets in {reset_time} seconds"
        super().__init__(message, status_code=429)
        self.details = {"provider": provider, "reset_time": reset_time}


# Trading Exceptions
class TradingException(StockSokoException):
    """Base exception for trading errors"""

    def __init__(self, message: str = "Trading error", status_code: int = 400):
        super().__init__(message, status_code)


class InsufficientFundsException(TradingException):
    """Raised when user has insufficient funds"""

    def __init__(self, required: float, available: float):
        super().__init__(
            f"Insufficient funds. Required: {required}, Available: {available}",
            status_code=400,
        )
        self.details = {"required": required, "available": available}


class InvalidOrderException(TradingException):
    """Raised when order parameters are invalid"""

    def __init__(self, message: str = "Invalid order parameters"):
        super().__init__(message, status_code=400)


class OrderNotFoundException(TradingException):
    """Raised when an order is not found"""

    def __init__(self, order_id: str):
        super().__init__(f"Order '{order_id}' not found", status_code=404)
        self.details = {"order_id": order_id}


class OrderCancellationException(TradingException):
    """Raised when order cannot be cancelled"""

    def __init__(self, message: str = "Order cannot be cancelled"):
        super().__init__(message, status_code=400)


# Cache Exceptions
class CacheException(StockSokoException):
    """Base exception for cache errors"""

    def __init__(self, message: str = "Cache error", status_code: int = 500):
        super().__init__(message, status_code)


class CacheConnectionException(CacheException):
    """Raised when cache connection fails"""

    def __init__(self, message: str = "Failed to connect to cache"):
        super().__init__(message, status_code=503)


class CacheSerializationException(CacheException):
    """Raised when cache serialization/deserialization fails"""

    def __init__(self, key: str, error: str):
        super().__init__(f"Cache serialization error for key '{key}': {error}")
        self.details = {"key": key, "error": error}


# Payment Exceptions
class PaymentException(StockSokoException):
    """Base exception for payment errors"""

    def __init__(self, message: str = "Payment error", status_code: int = 400):
        super().__init__(message, status_code)


class PaymentProcessingException(PaymentException):
    """Raised when payment processing fails"""

    def __init__(self, message: str = "Payment processing failed"):
        super().__init__(message, status_code=402)


class InvalidAmountException(PaymentException):
    """Raised when payment amount is invalid"""

    def __init__(self, amount: float, reason: str = "Invalid amount"):
        super().__init__(f"{reason}: {amount}", status_code=400)
        self.details = {"amount": amount}


# Validation Exceptions
class ValidationException(StockSokoException):
    """Raised when input validation fails"""

    def __init__(self, field: str, message: str):
        super().__init__(f"Validation error for '{field}': {message}", status_code=422)
        self.details = {"field": field}


class InvalidEmailException(ValidationException):
    """Raised when email format is invalid"""

    def __init__(self, email: str):
        super().__init__("email", f"Invalid email format: {email}")


class InvalidPhoneException(ValidationException):
    """Raised when phone number format is invalid"""

    def __init__(self, phone: str):
        super().__init__("phone", f"Invalid phone number format: {phone}")


class WeakPasswordException(ValidationException):
    """Raised when password doesn't meet strength requirements"""

    def __init__(self, message: str = "Password does not meet strength requirements"):
        super().__init__("password", message)


# Notification Exceptions
class NotificationException(StockSokoException):
    """Base exception for notification errors"""

    def __init__(self, message: str = "Notification error", status_code: int = 500):
        super().__init__(message, status_code)


class NotificationSendException(NotificationException):
    """Raised when notification sending fails"""

    def __init__(self, message: str = "Failed to send notification"):
        super().__init__(message, status_code=500)


# External Service Exceptions
class ExternalServiceException(StockSokoException):
    """Base exception for external service errors"""

    def __init__(self, service: str, message: str = "External service error"):
        super().__init__(f"{service}: {message}", status_code=503)
        self.details = {"service": service}


class BrokerAPIException(ExternalServiceException):
    """Raised when broker API fails"""

    def __init__(self, message: str = "Broker API error"):
        super().__init__("Broker API", message)


class CDSCAPIException(ExternalServiceException):
    """Raised when CDSC API fails"""

    def __init__(self, message: str = "CDSC API error"):
        super().__init__("CDSC API", message)


class MpesaAPIException(ExternalServiceException):
    """Raised when M-Pesa API fails"""

    def __init__(self, message: str = "M-Pesa API error"):
        super().__init__("M-Pesa API", message)
