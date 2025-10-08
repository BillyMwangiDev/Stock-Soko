from typing import List
from decouple import config

APP_NAME: str = "Stock Soko API"
VERSION: str = "1.0.0"

DATABASE_URL: str = config(
    "DATABASE_URL",
    default="sqlite:///./stocksoko.db"
)

REDIS_URL: str = config("REDIS_URL", default="redis://localhost:6379/0")

JWT_SECRET: str = config("JWT_SECRET", default="dev-secret-change-in-production")
JWT_ALGORITHM: str = "HS256"
JWT_EXPIRATION_MINUTES: int = 60

MPESA_CONSUMER_KEY: str = config("MPESA_CONSUMER_KEY", default="")
MPESA_CONSUMER_SECRET: str = config("MPESA_CONSUMER_SECRET", default="")
MPESA_PASSKEY: str = config("MPESA_PASSKEY", default="")
MPESA_SHORTCODE: str = config("MPESA_SHORTCODE", default="174379")
MPESA_CALLBACK_URL: str = config("MPESA_CALLBACK_URL", default="https://stocksoko.example.com/api/v1/payments/callback")
MPESA_ENV: str = config("MPESA_ENV", default="sandbox")

KYC_PROVIDER: str = config("KYC_PROVIDER", default="sandbox")
NEWS_API_KEY: str = config("NEWS_API_KEY", default="")

S3_BUCKET: str = config("S3_BUCKET", default="stocksoko-dev")
AWS_REGION: str = config("AWS_REGION", default="us-east-1")

SENTRY_DSN: str = config("SENTRY_DSN", default="")
PROMETHEUS_ENABLED: bool = config("PROMETHEUS_ENABLED", default=True, cast=bool)

ENVIRONMENT: str = config("ENVIRONMENT", default="development")
DEBUG: bool = config("DEBUG", default=True, cast=bool)

ALLOWED_ORIGINS: List[str] = config(
    "ALLOWED_ORIGINS",
    default="http://localhost:3000,http://localhost:8081,http://localhost:8147,http://localhost:19006,http://127.0.0.1:8081,http://192.168.10.25:8081,exp://192.168.10.25:8081,exp://localhost:8081",
    cast=lambda v: [origin.strip() for origin in v.split(",")]
)
