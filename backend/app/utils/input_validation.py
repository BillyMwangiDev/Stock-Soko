"""
Input Validation and Sanitization Utilities
Provides comprehensive validation for user inputs
"""
import re
from typing import Optional
from decimal import Decimal, InvalidOperation


class InputValidator:
    """Comprehensive input validation"""
    
    # Regex patterns for validation
    EMAIL_PATTERN = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    PHONE_PATTERN = re.compile(r'^\+?[1-9]\d{1,14}$')
    ALPHANUMERIC_PATTERN = re.compile(r'^[a-zA-Z0-9]+$')
    SYMBOL_PATTERN = re.compile(r'^[A-Z]{1,10}$')
    
    @staticmethod
    def sanitize_string(value: str, max_length: int = 255) -> str:
        """
        Sanitize string input by removing dangerous characters
        """
        if not isinstance(value, str):
            raise ValueError("Input must be a string")
        
        # Remove null bytes and control characters
        sanitized = ''.join(char for char in value if ord(char) >= 32 or char in '\n\r\t')
        
        # Trim whitespace
        sanitized = sanitized.strip()
        
        # Limit length
        if len(sanitized) > max_length:
            raise ValueError(f"Input exceeds maximum length of {max_length}")
        
        return sanitized
    
    @staticmethod
    def validate_email(email: str) -> str:
        """
        Validate and sanitize email address
        """
        email = InputValidator.sanitize_string(email, max_length=254)
        
        if not InputValidator.EMAIL_PATTERN.match(email):
            raise ValueError("Invalid email format")
        
        return email.lower()
    
    @staticmethod
    def validate_phone(phone: str) -> str:
        """
        Validate and sanitize phone number (E.164 format)
        """
        phone = InputValidator.sanitize_string(phone, max_length=15)
        phone = re.sub(r'[\s\-\(\)]', '', phone)
        
        if not InputValidator.PHONE_PATTERN.match(phone):
            raise ValueError("Invalid phone number format")
        
        return phone
    
    @staticmethod
    def validate_symbol(symbol: str) -> str:
        """
        Validate stock symbol
        """
        symbol = InputValidator.sanitize_string(symbol, max_length=10).upper()
        
        if not InputValidator.SYMBOL_PATTERN.match(symbol):
            raise ValueError("Invalid stock symbol format")
        
        return symbol
    
    @staticmethod
    def validate_positive_number(value: float, min_value: float = 0.0, 
                                 max_value: Optional[float] = None) -> float:
        """
        Validate positive numeric value
        """
        try:
            value = float(value)
        except (ValueError, TypeError):
            raise ValueError("Input must be a valid number")
        
        if value < min_value:
            raise ValueError(f"Value must be at least {min_value}")
        
        if max_value is not None and value > max_value:
            raise ValueError(f"Value cannot exceed {max_value}")
        
        return value
    
    @staticmethod
    def validate_integer(value: int, min_value: Optional[int] = None,
                        max_value: Optional[int] = None) -> int:
        """
        Validate integer value
        """
        try:
            value = int(value)
        except (ValueError, TypeError):
            raise ValueError("Input must be a valid integer")
        
        if min_value is not None and value < min_value:
            raise ValueError(f"Value must be at least {min_value}")
        
        if max_value is not None and value > max_value:
            raise ValueError(f"Value cannot exceed {max_value}")
        
        return value
    
    @staticmethod
    def validate_decimal(value: str, max_digits: int = 18, 
                        decimal_places: int = 2) -> Decimal:
        """
        Validate and convert to Decimal for financial calculations
        """
        try:
            decimal_value = Decimal(str(value))
        except (ValueError, InvalidOperation):
            raise ValueError("Invalid decimal format")
        
        # Check total digits
        if len(str(decimal_value).replace('.', '').replace('-', '')) > max_digits:
            raise ValueError(f"Number exceeds maximum of {max_digits} digits")
        
        # Check decimal places
        if decimal_value.as_tuple().exponent < -decimal_places:
            raise ValueError(f"Cannot have more than {decimal_places} decimal places")
        
        return decimal_value
    
    @staticmethod
    def validate_alphanumeric(value: str, min_length: int = 1, 
                             max_length: int = 255) -> str:
        """
        Validate alphanumeric string (no special characters)
        """
        value = InputValidator.sanitize_string(value, max_length=max_length)
        
        if len(value) < min_length:
            raise ValueError(f"Input must be at least {min_length} characters")
        
        if not InputValidator.ALPHANUMERIC_PATTERN.match(value):
            raise ValueError("Input must contain only letters and numbers")
        
        return value
    
    @staticmethod
    def validate_password_strength(password: str) -> bool:
        """
        Validate password strength
        Requirements:
        - At least 8 characters
        - At least one uppercase letter
        - At least one lowercase letter
        - At least one digit
        - At least one special character
        """
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters long")
        
        if not re.search(r'[A-Z]', password):
            raise ValueError("Password must contain at least one uppercase letter")
        
        if not re.search(r'[a-z]', password):
            raise ValueError("Password must contain at least one lowercase letter")
        
        if not re.search(r'\d', password):
            raise ValueError("Password must contain at least one digit")
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            raise ValueError("Password must contain at least one special character")
        
        return True
    
    @staticmethod
    def validate_enum(value: str, allowed_values: list) -> str:
        """
        Validate value is in allowed enum values
        """
        value = InputValidator.sanitize_string(value, max_length=50)
        
        if value not in allowed_values:
            raise ValueError(f"Value must be one of: {', '.join(allowed_values)}")
        
        return value

