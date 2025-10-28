"""
Application Constants
Centralized location for all magic numbers and constant values
"""

# Password & Authentication
BCRYPT_MAX_PASSWORD_LENGTH = 72  # Maximum password length for bcrypt
TOTP_SECRET_LENGTH = 32  # Length of TOTP secret
JWT_REFRESH_TOKEN_DAYS = 30  # Refresh token expiration in days

# Time Constants (in seconds)
SECONDS_PER_MINUTE = 60
SECONDS_PER_HOUR = 3600
SECONDS_PER_DAY = 86400
SECONDS_PER_WEEK = 604800
SECONDS_PER_MONTH = 2592000  # 30 days

# Cache TTL (Time To Live) in seconds
DEFAULT_CACHE_TTL = 300  # 5 minutes
SHORT_CACHE_TTL = 30  # 30 seconds
MEDIUM_CACHE_TTL = 600  # 10 minutes
LONG_CACHE_TTL = 3600  # 1 hour
PRICE_CACHE_TTL = 30  # 30 seconds for real-time prices
HISTORICAL_CACHE_TTL = 300  # 5 minutes for historical data
MARKET_DATA_CACHE_TTL = 60  # 1 minute for market data
NEWS_CACHE_TTL = 900  # 15 minutes for news

# API Rate Limits (daily)
TWELVE_DATA_DAILY_LIMIT = 800
ALPHA_VANTAGE_DAILY_LIMIT = 500
FINNHUB_DAILY_LIMIT = 100000  # Effectively unlimited daily
MARKETSTACK_DAILY_LIMIT = 1000
DEFAULT_DAILY_API_LIMIT = 1000

# API Rate Limits (per minute)
DEFAULT_RATE_LIMIT_PER_MINUTE = 100
AUTHENTICATED_RATE_LIMIT_PER_MINUTE = 200
ADMIN_RATE_LIMIT_PER_MINUTE = 500

# Pagination
DEFAULT_PAGE_SIZE = 50
MAX_PAGE_SIZE = 200
MIN_PAGE_SIZE = 1

# File Upload
MAX_FILE_SIZE_MB = 10
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10MB in bytes
ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif']
ALLOWED_DOCUMENT_EXTENSIONS = ['.pdf', '.doc', '.docx']

# Database
DEFAULT_QUERY_LIMIT = 100
MAX_QUERY_LIMIT = 1000

# Market Data
DEFAULT_HISTORICAL_DAYS = 365  # 1 year
MAX_HISTORICAL_DAYS = 1825  # 5 years
DEFAULT_CHART_POINTS = 100
SPARKLINE_POINTS = 15

# Trading
MIN_TRADE_AMOUNT = 100  # KES
MAX_TRADE_AMOUNT = 10000000  # KES 10M
DEFAULT_ORDER_EXPIRY_DAYS = 30

# Notification
MAX_NOTIFICATION_RETRY = 3
NOTIFICATION_RETRY_DELAY = 60  # seconds

# Session
SESSION_TIMEOUT_MINUTES = 60
MAX_SESSION_DURATION_DAYS = 7

# Risk Ratings
RISK_RATING_LOW_THRESHOLD = 30
RISK_RATING_MEDIUM_THRESHOLD = 50
RISK_RATING_HIGH_THRESHOLD = 70
RISK_RATING_VERY_HIGH_THRESHOLD = 85

# Technical Indicators
RSI_PERIOD = 14
RSI_OVERBOUGHT = 70
RSI_OVERSOLD = 30
MACD_FAST_PERIOD = 12
MACD_SLOW_PERIOD = 26
MACD_SIGNAL_PERIOD = 9

# AI Recommendations
MIN_CONFIDENCE_THRESHOLD = 60  # Minimum confidence for recommendations
HIGH_CONFIDENCE_THRESHOLD = 80  # High confidence threshold

# HTTP Status Codes (for clarity)
HTTP_200_OK = 200
HTTP_201_CREATED = 201
HTTP_400_BAD_REQUEST = 400
HTTP_401_UNAUTHORIZED = 401
HTTP_403_FORBIDDEN = 403
HTTP_404_NOT_FOUND = 404
HTTP_422_UNPROCESSABLE_ENTITY = 422
HTTP_500_INTERNAL_SERVER_ERROR = 500

# Regex Patterns
EMAIL_PATTERN = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
PHONE_PATTERN = r'^\+?[1-9]\d{1,14}$'  # E.164 format
SYMBOL_PATTERN = r'^[A-Z]{1,10}$'

# Error Messages
ERROR_USER_NOT_FOUND = "User not found"
ERROR_INVALID_CREDENTIALS = "Invalid email or password"
ERROR_SYMBOL_NOT_FOUND = "Stock symbol not found"
ERROR_INSUFFICIENT_FUNDS = "Insufficient funds for this transaction"
ERROR_INVALID_TOKEN = "Invalid or expired token"
ERROR_2FA_REQUIRED = "Two-factor authentication required"
ERROR_RATE_LIMIT_EXCEEDED = "Rate limit exceeded. Please try again later."

# Success Messages
SUCCESS_USER_CREATED = "User created successfully"
SUCCESS_ORDER_PLACED = "Order placed successfully"
SUCCESS_PAYMENT_PROCESSED = "Payment processed successfully"
SUCCESS_2FA_ENABLED = "Two-factor authentication enabled"

