"""
Unit Tests for Custom Exceptions
"""

import pytest
from app.exceptions import (
    InsufficientFundsException,
    InvalidCredentialsException,
    StockSokoException,
    SymbolNotFoundException,
    UserAlreadyExistsException,
    UserNotFoundException,
    ValidationException,
    WeakPasswordException,
)


class TestBaseException:
    """Test base exception"""

    def test_base_exception(self):
        """Test base exception creation"""
        exc = StockSokoException("Test error", status_code=400)
        assert exc.message == "Test error"
        assert exc.status_code == 400
        assert exc.details == {}

    def test_base_exception_with_details(self):
        """Test base exception with details"""
        exc = StockSokoException(
            "Test error", status_code=400, details={"key": "value"}
        )
        assert exc.details == {"key": "value"}


class TestUserExceptions:
    """Test user-related exceptions"""

    def test_user_not_found(self):
        """Test user not found exception"""
        exc = UserNotFoundException()
        assert exc.status_code == 404
        assert "not found" in exc.message.lower()

    def test_user_already_exists(self):
        """Test user already exists exception"""
        exc = UserAlreadyExistsException()
        assert exc.status_code == 409
        assert "already exists" in exc.message.lower()

    def test_invalid_credentials(self):
        """Test invalid credentials exception"""
        exc = InvalidCredentialsException()
        assert exc.status_code == 401
        assert "invalid" in exc.message.lower()


class TestMarketDataExceptions:
    """Test market data exceptions"""

    def test_symbol_not_found(self):
        """Test symbol not found exception"""
        exc = SymbolNotFoundException("INVALID")
        assert exc.status_code == 404
        assert "INVALID" in exc.message
        assert exc.details["symbol"] == "INVALID"


class TestTradingExceptions:
    """Test trading exceptions"""

    def test_insufficient_funds(self):
        """Test insufficient funds exception"""
        exc = InsufficientFundsException(required=1000.0, available=500.0)
        assert exc.status_code == 400
        assert "insufficient" in exc.message.lower()
        assert exc.details["required"] == 1000.0
        assert exc.details["available"] == 500.0


class TestValidationExceptions:
    """Test validation exceptions"""

    def test_validation_exception(self):
        """Test validation exception"""
        exc = ValidationException("email", "Invalid format")
        assert exc.status_code == 422
        assert exc.details["field"] == "email"
        assert "Invalid format" in exc.message

    def test_weak_password_exception(self):
        """Test weak password exception"""
        exc = WeakPasswordException("Too short")
        assert exc.status_code == 422
        assert exc.details["field"] == "password"
        assert "Too short" in exc.message
