import os
from decouple import config

APP_NAME = "Stock Soko API"
VERSION = "1.0.0"

# Database configuration
# Use SQLite for development, PostgreSQL for staging/production
DATABASE_URL = config(
    "DATABASE_URL",
    default="sqlite:///./stocksoko.db"  # Dev default
    # Production example: "postgresql://user:pass@localhost:5432/stocksoko"
)

# Redis configuration
REDIS_URL = config("REDIS_URL", default="redis://localhost:6379/0")

# JWT configuration
JWT_SECRET = config("JWT_SECRET", default="dev-secret-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_MINUTES = 60

# M-Pesa Daraja configuration
MPESA_CONSUMER_KEY = config("MPESA_CONSUMER_KEY", default="")
MPESA_CONSUMER_SECRET = config("MPESA_CONSUMER_SECRET", default="")
MPESA_PASSKEY = config("MPESA_PASSKEY", default="")
MPESA_SHORTCODE = config("MPESA_SHORTCODE", default="174379")
MPESA_CALLBACK_URL = config("MPESA_CALLBACK_URL", default="https://stocksoko.example.com/api/v1/payments/callback")
MPESA_ENV = config("MPESA_ENV", default="sandbox")  # sandbox or production

# External services
KYC_PROVIDER = config("KYC_PROVIDER", default="sandbox")  # sandbox, smile_id, trulioo
NEWS_API_KEY = config("NEWS_API_KEY", default="")

# Storage
S3_BUCKET = config("S3_BUCKET", default="stocksoko-dev")
AWS_REGION = config("AWS_REGION", default="us-east-1")

# Monitoring
SENTRY_DSN = config("SENTRY_DSN", default="")
PROMETHEUS_ENABLED = config("PROMETHEUS_ENABLED", default=True, cast=bool)

# Environment
ENVIRONMENT = config("ENVIRONMENT", default="development")  # development, staging, production
DEBUG = config("DEBUG", default=True, cast=bool)
