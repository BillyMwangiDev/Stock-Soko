from typing import List

from decouple import config

APP_NAME: str = "Stock Soko API"
VERSION: str = "1.0.0"

# ===============================================
# APPLICATION SETTINGS (Load early for validation)
# ===============================================
ENVIRONMENT: str = config("ENVIRONMENT", default="development")
DEBUG: bool = config("DEBUG", default=True if ENVIRONMENT == "development" else False, cast=bool)

# Production environment validation
if ENVIRONMENT == "production" and DEBUG:
    raise ValueError("DEBUG must be False in production environment")

# ===============================================
# DATABASE CONFIGURATION
# ===============================================
DATABASE_URL: str = config(
    "DATABASE_URL",
    default="sqlite:///./stocksoko.db"
)

# ===============================================
# JWT AUTHENTICATION
# ===============================================
JWT_SECRET: str = config("JWT_SECRET", default="dev-secret-change-in-production")
if JWT_SECRET == "dev-secret-change-in-production" and ENVIRONMENT == "production":
    raise ValueError("JWT_SECRET must be set in production environment")
JWT_ALGORITHM: str = "HS256"
JWT_EXPIRATION_MINUTES: int = config("JWT_EXPIRATION_MINUTES", default=60, cast=int)

# ===============================================
# M-PESA DARAJA API
# ===============================================
MPESA_CONSUMER_KEY: str = config("MPESA_CONSUMER_KEY", default="")
MPESA_CONSUMER_SECRET: str = config("MPESA_CONSUMER_SECRET", default="")
MPESA_PASSKEY: str = config("MPESA_PASSKEY", default="")
MPESA_SHORTCODE: str = config("MPESA_SHORTCODE", default="174379")
MPESA_CALLBACK_URL: str = config("MPESA_CALLBACK_URL", default="https://stocksoko.example.com/api/v1/payments/callback")
MPESA_ENV: str = config("MPESA_ENV", default="sandbox")

# ===============================================
# MARKET DATA APIS
# ===============================================
# Twelve Data API
TWELVE_DATA_API_KEY: str = config("TWELVE_DATA_API_KEY", default="")
TWELVE_DATA_PLAN: str = config("TWELVE_DATA_PLAN", default="free")

# Alpha Vantage API
ALPHA_VANTAGE_API_KEY: str = config("ALPHA_VANTAGE_API_KEY", default="")

# Finnhub API
FINNHUB_API_KEY: str = config("FINNHUB_API_KEY", default="")

# MarketStack API
MARKETSTACK_API_KEY: str = config("MARKETSTACK_API_KEY", default="")

# NSE (Nairobi Securities Exchange) API
# Contact: dataservices@nse.co.ke | +254 202831000
NSE_API_KEY: str = config("NSE_API_KEY", default="")
NSE_API_SECRET: str = config("NSE_API_SECRET", default="")
NSE_API_BASE_URL: str = config("NSE_API_BASE_URL", default="https://api.nse.co.ke/v1")

# Market Data Provider Strategy (twelve_data, alpha_vantage, finnhub, marketstack, yfinance, nse, rotate)
MARKET_DATA_PROVIDER: str = config("MARKET_DATA_PROVIDER", default="rotate")

# ===============================================
# NEWS & RESEARCH APIS
# ===============================================
NEWS_API_KEY: str = config("NEWS_API_KEY", default="")
MARKETAUX_API_KEY: str = config("MARKETAUX_API_KEY", default="")

# ===============================================
# KYC & DOCUMENT STORAGE
# ===============================================
KYC_PROVIDER: str = config("KYC_PROVIDER", default="sandbox")
KYC_UPLOAD_DIR: str = config("KYC_UPLOAD_DIR", default="./uploads/kyc")
MAX_UPLOAD_SIZE_MB: int = config("MAX_UPLOAD_SIZE_MB", default=10, cast=int)

# AWS S3 (optional)
S3_BUCKET: str = config("S3_BUCKET", default="stocksoko-dev")
AWS_REGION: str = config("AWS_REGION", default="us-east-1")
AWS_ACCESS_KEY_ID: str = config("AWS_ACCESS_KEY_ID", default="")
AWS_SECRET_ACCESS_KEY: str = config("AWS_SECRET_ACCESS_KEY", default="")

# ===============================================
# BROKER & CDSC INTEGRATION
# ===============================================
BROKER_API_KEY: str = config("BROKER_API_KEY", default="")
BROKER_API_SECRET: str = config("BROKER_API_SECRET", default="")
BROKER_API_URL: str = config("BROKER_API_URL", default="")

CDSC_API_KEY: str = config("CDSC_API_KEY", default="")
CDSC_API_URL: str = config("CDSC_API_URL", default="")
CDSC_ENABLED: bool = config("CDSC_ENABLED", default=False, cast=bool)

# ===============================================
# CACHING & PERFORMANCE
# ===============================================
REDIS_URL: str = config("REDIS_URL", default="redis://127.0.0.1:6379/0")
CACHE_TTL_SECONDS: int = config("CACHE_TTL_SECONDS", default=300, cast=int)
PRICE_CACHE_TTL: int = config("PRICE_CACHE_TTL", default=30, cast=int)
HISTORICAL_CACHE_TTL: int = config("HISTORICAL_CACHE_TTL", default=300, cast=int)

# ===============================================
# EMAIL SERVICE (Optional)
# ===============================================
SMTP_HOST: str = config("SMTP_HOST", default="")
SMTP_PORT: int = config("SMTP_PORT", default=587, cast=int)
SMTP_USER: str = config("SMTP_USER", default="")
***REMOVED***: str = config("***REMOVED***", default="")
SMTP_FROM_EMAIL: str = config("SMTP_FROM_EMAIL", default="noreply@stocksoko.com")

# ===============================================
# SECURITY & RATE LIMITING
# ===============================================
RATE_LIMIT_PER_MINUTE: int = config("RATE_LIMIT_PER_MINUTE", default=100, cast=int)
SESSION_TIMEOUT_MINUTES: int = config("SESSION_TIMEOUT_MINUTES", default=60, cast=int)

# 2FA Settings
TOTP_ISSUER: str = config("TOTP_ISSUER", default="Stock Soko")
TOTP_DIGITS: int = config("TOTP_DIGITS", default=6, cast=int)

# ===============================================
# OTHER APPLICATION SETTINGS
# ===============================================
PROMETHEUS_ENABLED: bool = config("PROMETHEUS_ENABLED", default=True, cast=bool)
LOG_LEVEL: str = config("LOG_LEVEL", default="INFO")

# ===============================================
# FEATURE FLAGS
# ===============================================
ENABLE_2FA: bool = config("ENABLE_2FA", default=True, cast=bool)
ENABLE_BIOMETRIC: bool = config("ENABLE_BIOMETRIC", default=True, cast=bool)
ENABLE_REAL_TIME_PRICES: bool = config("ENABLE_REAL_TIME_PRICES", default=True, cast=bool)
ENABLE_NOTIFICATIONS: bool = config("ENABLE_NOTIFICATIONS", default=False, cast=bool)

# User tier limits
FREE_TIER_DAILY_API_CALLS: int = config("FREE_TIER_DAILY_API_CALLS", default=800, cast=int)
PAID_TIER_DAILY_API_CALLS: str = config("PAID_TIER_DAILY_API_CALLS", default="unlimited")

# ===============================================
# PUSH NOTIFICATIONS
# ===============================================
FIREBASE_CREDENTIALS_PATH: str = config("FIREBASE_CREDENTIALS_PATH", default="")
FIREBASE_PROJECT_ID: str = config("FIREBASE_PROJECT_ID", default="")

# ===============================================
# BACKGROUND TASKS
# ===============================================
CELERY_BROKER_URL: str = config("CELERY_BROKER_URL", default=REDIS_URL)
CELERY_RESULT_BACKEND: str = config("CELERY_RESULT_BACKEND", default=REDIS_URL)

# ===============================================
# CORS CONFIGURATION
# ===============================================
ALLOWED_ORIGINS: List[str] = config(
    "ALLOWED_ORIGINS",
    default="http://localhost:3000,http://localhost:8081,http://localhost:8147,http://localhost:19006,http://127.0.0.1:8081,http://127.0.0.1:8000,http://192.168.10.25:8081,exp://192.168.10.25:8081,exp://localhost:8081,http://192.168.0.104:8081",
    cast=lambda v: [origin.strip() for origin in v.split(",")]
)