"""
Input Validators
Comprehensive validation utilities for API endpoints
"""

import re
from typing import Any, Optional

from pydantic import BaseModel, Field, validator

from ..constants import (
    BCRYPT_MAX_PASSWORD_LENGTH,
    EMAIL_PATTERN,
    MAX_TRADE_AMOUNT,
    MIN_TRADE_AMOUNT,
    PHONE_PATTERN,
    SYMBOL_PATTERN,
)
from ..exceptions import ValidationException, WeakPasswordException


# Email Validator
def validate_email(email: str) -> str:
    """Validate email format"""
    if not re.match(EMAIL_PATTERN, email):
        raise ValidationException("email", f"Invalid email format: {email}")
    return email.lower()


# Phone Validator
def validate_phone(phone: str) -> str:
    """Validate phone number format"""
    if not re.match(PHONE_PATTERN, phone):
        raise ValidationException("phone", f"Invalid phone number format: {phone}")
    return phone


# Password Validator
def validate_password(password: str) -> str:
    """
    Validate password strength:
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character
    """
    if len(password) < 8:
        raise WeakPasswordException("Password must be at least 8 characters long")

    if not re.search(r"[A-Z]", password):
        raise WeakPasswordException(
            "Password must contain at least one uppercase letter"
        )

    if not re.search(r"[a-z]", password):
        raise WeakPasswordException(
            "Password must contain at least one lowercase letter"
        )

    if not re.search(r"\d", password):
        raise WeakPasswordException("Password must contain at least one digit")

    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise WeakPasswordException(
            "Password must contain at least one special character"
        )

    if len(password.encode("utf-8")) > BCRYPT_MAX_PASSWORD_LENGTH:
        raise WeakPasswordException(
            f"Password too long (max {BCRYPT_MAX_PASSWORD_LENGTH} bytes)"
        )

    return password


# Symbol Validator
def validate_symbol(symbol: str) -> str:
    """Validate stock symbol format"""
    if not re.match(SYMBOL_PATTERN, symbol.upper()):
        raise ValidationException("symbol", f"Invalid symbol format: {symbol}")
    return symbol.upper()


# Amount Validator
def validate_trade_amount(amount: float) -> float:
    """Validate trade amount"""
    if amount < MIN_TRADE_AMOUNT:
        raise ValidationException(
            "amount", f"Amount must be at least {MIN_TRADE_AMOUNT}"
        )

    if amount > MAX_TRADE_AMOUNT:
        raise ValidationException("amount", f"Amount cannot exceed {MAX_TRADE_AMOUNT}")

    return amount


# Quantity Validator
def validate_quantity(quantity: int) -> int:
    """Validate trade quantity"""
    if quantity <= 0:
        raise ValidationException("quantity", "Quantity must be greater than 0")

    if quantity > 1000000:
        raise ValidationException("quantity", "Quantity cannot exceed 1,000,000")

    return quantity


# Pydantic Models for Request Validation
class RegisterRequest(BaseModel):
    """Registration request validator"""

    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=8, max_length=128)
    full_name: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)

    @validator("email")
    def validate_email_field(cls, v):
        return validate_email(v)

    @validator("password")
    def validate_password_field(cls, v):
        return validate_password(v)

    @validator("phone")
    def validate_phone_field(cls, v):
        if v:
            return validate_phone(v)
        return v


class LoginRequest(BaseModel):
    """Login request validator"""

    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=1, max_length=128)

    @validator("email")
    def validate_email_field(cls, v):
        return validate_email(v)


class TradeOrderRequest(BaseModel):
    """Trade order request validator"""

    symbol: str = Field(..., min_length=1, max_length=10)
    side: str = Field(..., pattern="^(buy|sell)$")
    quantity: int = Field(..., gt=0, le=1000000)
    order_type: str = Field(..., pattern="^(market|limit)$")
    price: Optional[float] = Field(None, gt=0)

    @validator("symbol")
    def validate_symbol_field(cls, v):
        return validate_symbol(v)

    @validator("quantity")
    def validate_quantity_field(cls, v):
        return validate_quantity(v)

    @validator("price")
    def validate_price_field(cls, v, values):
        if values.get("order_type") == "limit" and v is None:
            raise ValidationException("price", "Price is required for limit orders")
        return v


class PasswordChangeRequest(BaseModel):
    """Password change request validator"""

    current_password: str = Field(..., min_length=1, max_length=128)
    new_password: str = Field(..., min_length=8, max_length=128)

    @validator("new_password")
    def validate_new_password_field(cls, v):
        return validate_password(v)


class ProfileUpdateRequest(BaseModel):
    """Profile update request validator"""

    full_name: str = Field(..., min_length=1, max_length=255)
    phone: str = Field(..., min_length=5, max_length=20)
    date_of_birth: Optional[str] = Field(None, max_length=10)
    address: Optional[str] = Field(None, max_length=500)
    city: Optional[str] = Field(None, max_length=100)
    country: str = Field(default="Kenya", max_length=100)

    @validator("phone")
    def validate_phone_field(cls, v):
        return validate_phone(v)


class DepositRequest(BaseModel):
    """Deposit request validator"""

    amount: float = Field(..., gt=0)
    phone: str = Field(..., min_length=5, max_length=20)

    @validator("amount")
    def validate_amount_field(cls, v):
        return validate_trade_amount(v)

    @validator("phone")
    def validate_phone_field(cls, v):
        return validate_phone(v)


class WithdrawalRequest(BaseModel):
    """Withdrawal request validator"""

    amount: float = Field(..., gt=0)
    account_number: str = Field(..., min_length=1, max_length=50)
    bank_name: str = Field(..., min_length=1, max_length=100)

    @validator("amount")
    def validate_amount_field(cls, v):
        return validate_trade_amount(v)


class AlertCreateRequest(BaseModel):
    """Price alert create request validator"""

    symbol: str = Field(..., min_length=1, max_length=10)
    condition: str = Field(..., pattern="^(above|below)$")
    target_price: float = Field(..., gt=0)
    message: Optional[str] = Field(None, max_length=500)

    @validator("symbol")
    def validate_symbol_field(cls, v):
        return validate_symbol(v)
