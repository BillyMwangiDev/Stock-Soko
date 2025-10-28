"""
Unit Tests for Constants
"""
import pytest
from app.constants import (
    BCRYPT_MAX_PASSWORD_LENGTH,
    SECONDS_PER_DAY,
    DEFAULT_CACHE_TTL,
    TWELVE_DATA_DAILY_LIMIT,
    ALPHA_VANTAGE_DAILY_LIMIT
)


def test_bcrypt_max_password_length():
    """Test bcrypt password length constant"""
    assert BCRYPT_MAX_PASSWORD_LENGTH == 72


def test_time_constants():
    """Test time-related constants"""
    assert SECONDS_PER_DAY == 86400
    assert DEFAULT_CACHE_TTL == 300


def test_api_rate_limits():
    """Test API rate limit constants"""
    assert TWELVE_DATA_DAILY_LIMIT == 800
    assert ALPHA_VANTAGE_DAILY_LIMIT == 500
    assert TWELVE_DATA_DAILY_LIMIT < 1000
    assert ALPHA_VANTAGE_DAILY_LIMIT < 1000

