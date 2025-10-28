"""
Unit Tests for Validators
"""
import pytest
from app.utils.validators import (
    validate_email,
    validate_phone,
    validate_password,
    validate_symbol,
    validate_trade_amount,
    validate_quantity
)
from app.exceptions import ValidationException, WeakPasswordException


class TestEmailValidator:
    """Test email validation"""
    
    def test_valid_email(self):
        """Test valid email addresses"""
        assert validate_email("user@example.com") == "user@example.com"
        assert validate_email("Test@Example.COM") == "test@example.com"  # Should lowercase
    
    def test_invalid_email(self):
        """Test invalid email addresses"""
        with pytest.raises(ValidationException):
            validate_email("invalid")
        with pytest.raises(ValidationException):
            validate_email("@example.com")
        with pytest.raises(ValidationException):
            validate_email("user@")


class TestPhoneValidator:
    """Test phone validation"""
    
    def test_valid_phone(self):
        """Test valid phone numbers"""
        assert validate_phone("+254712345678") == "+254712345678"
        assert validate_phone("+1234567890") == "+1234567890"
    
    def test_invalid_phone(self):
        """Test invalid phone numbers"""
        with pytest.raises(ValidationException):
            validate_phone("invalid")
        with pytest.raises(ValidationException):
            validate_phone("abc123")


class TestPasswordValidator:
    """Test password validation"""
    
    def test_valid_password(self):
        """Test valid passwords"""
        assert validate_password("Test123!@#") == "Test123!@#"
        assert validate_password("MyP@ssw0rd") == "MyP@ssw0rd"
    
    def test_password_too_short(self):
        """Test password length requirement"""
        with pytest.raises(WeakPasswordException) as exc_info:
            validate_password("Test1!")
        assert "at least 8 characters" in str(exc_info.value.message)
    
    def test_password_no_uppercase(self):
        """Test password uppercase requirement"""
        with pytest.raises(WeakPasswordException) as exc_info:
            validate_password("test123!@#")
        assert "uppercase" in str(exc_info.value.message)
    
    def test_password_no_lowercase(self):
        """Test password lowercase requirement"""
        with pytest.raises(WeakPasswordException) as exc_info:
            validate_password("TEST123!@#")
        assert "lowercase" in str(exc_info.value.message)
    
    def test_password_no_digit(self):
        """Test password digit requirement"""
        with pytest.raises(WeakPasswordException) as exc_info:
            validate_password("TestTest!@#")
        assert "digit" in str(exc_info.value.message)
    
    def test_password_no_special_char(self):
        """Test password special character requirement"""
        with pytest.raises(WeakPasswordException) as exc_info:
            validate_password("TestTest123")
        assert "special character" in str(exc_info.value.message)


class TestSymbolValidator:
    """Test stock symbol validation"""
    
    def test_valid_symbol(self):
        """Test valid stock symbols"""
        assert validate_symbol("AAPL") == "AAPL"
        assert validate_symbol("scom") == "SCOM"  # Should uppercase
        assert validate_symbol("EQTY") == "EQTY"
    
    def test_invalid_symbol(self):
        """Test invalid stock symbols"""
        with pytest.raises(ValidationException):
            validate_symbol("invalid!")
        with pytest.raises(ValidationException):
            validate_symbol("123")
        with pytest.raises(ValidationException):
            validate_symbol("a" * 11)  # Too long


class TestTradeAmountValidator:
    """Test trade amount validation"""
    
    def test_valid_amount(self):
        """Test valid trade amounts"""
        assert validate_trade_amount(1000.0) == 1000.0
        assert validate_trade_amount(50000.0) == 50000.0
    
    def test_amount_too_small(self):
        """Test minimum amount requirement"""
        with pytest.raises(ValidationException):
            validate_trade_amount(50.0)
    
    def test_amount_too_large(self):
        """Test maximum amount requirement"""
        with pytest.raises(ValidationException):
            validate_trade_amount(20000000.0)


class TestQuantityValidator:
    """Test trade quantity validation"""
    
    def test_valid_quantity(self):
        """Test valid quantities"""
        assert validate_quantity(10) == 10
        assert validate_quantity(100) == 100
    
    def test_quantity_zero(self):
        """Test zero quantity"""
        with pytest.raises(ValidationException):
            validate_quantity(0)
    
    def test_quantity_negative(self):
        """Test negative quantity"""
        with pytest.raises(ValidationException):
            validate_quantity(-10)
    
    def test_quantity_too_large(self):
        """Test maximum quantity"""
        with pytest.raises(ValidationException):
            validate_quantity(2000000)

