# Stock Soko - NSE Trading Platform

**Production-ready mobile stock trading platform for the Nairobi Securities Exchange (NSE)**

[![Status](https://img.shields.io/badge/status-production--ready-green)]()
[![Python](https://img.shields.io/badge/python-3.13-blue)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.6-green)]()
[![React Native](https://img.shields.io/badge/React%20Native-0.76.3-blue)]()
[![Security](https://img.shields.io/badge/security-A+-brightgreen)]()

---

## What is Stock Soko?

Stock Soko is a comprehensive mobile trading platform that democratizes access to the Nairobi Securities Exchange (NSE) for retail investors in Kenya. The platform combines real-time market data, AI-powered recommendations, and integrated M-Pesa payments to provide a seamless stock trading experience on mobile devices.

### Core Purpose

- Enable Kenyan investors to trade NSE stocks directly from their mobile phones
- Provide educational resources to help beginners learn stock market investing
- Offer AI-driven insights and recommendations for informed trading decisions
- Integrate M-Pesa for seamless deposits and withdrawals
- Support real-time price tracking, portfolio management, and trade execution

---

## Key Features

### Trading & Market Data
- **Real-time Stock Quotes** - Live price updates for all NSE-listed stocks
- **Order Execution** - Place market and limit orders instantly
- **Portfolio Tracking** - Real-time portfolio valuation with profit/loss calculations
- **Watchlists** - Track your favorite stocks and set price alerts
- **Technical Indicators** - RSI, MACD, SMA, Bollinger Bands, and more
- **Interactive Charts** - Candlestick, line, and area charts with historical data
- **WebSocket Streaming** - Real-time price updates via WebSocket connections

### AI-Powered Features
- **AI Stock Recommendations** - Buy/sell/hold signals with confidence scores
- **Intelligent Chat Assistant** - Context-aware trading queries and market insights
- **Technical Analysis** - Automated pattern recognition and trend analysis
- **Risk Assessment** - Portfolio risk analysis and diversification suggestions

### Payment & Wallet
- **M-Pesa Integration** - Instant deposits and withdrawals via Daraja API
- **Virtual Wallet** - Track your trading balance and transaction history
- **Transaction History** - Detailed records of all deposits, withdrawals, and trades
- **Fee Calculator** - Transparent fee breakdown before trade execution

### Learning & Education
- **Comprehensive Learning Center** - 24 modules across 4 learning paths
  - Complete Beginner Track (8 modules)
  - Value Investing Mastery (12 modules)
  - Technical Trading Specialist (9 modules)
  - Fundamental Analysis Pro (10 modules)
- **Interactive Lessons** - Formulas, examples, key points, and quizzes
- **Progress Tracking** - Monitor your learning journey with achievements

### Security & Compliance
- **Bank-Grade Security** - JWT authentication with bcrypt password hashing
- **Two-Factor Authentication (2FA)** - TOTP-based additional security layer
- **Rate Limiting** - Comprehensive endpoint protection against abuse
- **KYC Management** - Document upload and verification system
- **Security Headers** - OWASP-compliant security headers on all requests
- **Automated Security Scanning** - CI/CD pipeline with vulnerability detection

### Additional Features
- **Price Alerts** - Push notifications when stocks reach target prices
- **Market News** - Real-time news aggregation from multiple sources
- **PDF Reports** - Generate portfolio statements and trade confirmations
- **CDSC Integration** - Link broker accounts for seamless trading
- **Dark Theme** - Optimized for low-light viewing
- **Offline Support** - View cached data without internet connection

---

## Technology Stack

### Backend Technologies

**Core Framework**
- **FastAPI 0.115.6** - Modern, high-performance Python web framework
- **Python 3.13** - Latest Python with enhanced performance
- **Uvicorn** - Lightning-fast ASGI server

**Database & ORM**
- **SQLAlchemy 2.0** - Powerful SQL toolkit and ORM
- **PostgreSQL** - Production database (SQLite for development)
- **Alembic** - Database migration management

**Authentication & Security**
- **JWT** - JSON Web Tokens for stateless authentication
- **bcrypt** - Industry-standard password hashing
- **PyOTP** - TOTP implementation for 2FA
- **python-jose** - Cryptographic signing and verification

**Background Processing**
- **Celery 5.4** - Distributed task queue
- **Redis 5.2** - In-memory data store for caching and message broker
- **Flower** - Real-time Celery monitoring

**Market Data APIs**
- **Twelve Data** - Financial market data and analytics
- **Alpha Vantage** - Stock market data and technical indicators
- **Finnhub** - Real-time stock market data
- **MarketStack** - Real-time and historical market data
- **yfinance** - Yahoo Finance data retrieval
- **Custom NSE Provider** - Direct NSE data integration

**Payment Integration**
- **M-Pesa Daraja API** - Mobile money integration for Kenya
- **pycryptodome** - Cryptographic operations for payment security

**Monitoring & Observability**
- **Prometheus** - Metrics collection and monitoring
- **Logging** - Structured application logging
- **Sentry Integration Ready** - Error tracking and performance monitoring

**Testing & Quality**
- **pytest** - Testing framework with fixtures
- **pytest-asyncio** - Async test support
- **pytest-cov** - Code coverage reporting
- **bandit** - Security linting for Python
- **flake8** - Code style enforcement
- **black** - Code formatting

### Frontend Technologies

**Core Framework**
- **React Native 0.76.3** - Cross-platform mobile development
- **Expo** - Development platform and toolchain
- **TypeScript** - Type-safe JavaScript for better reliability

**Navigation & UI**
- **React Navigation** - Routing and navigation for React Native
- **AsyncStorage** - Persistent local data storage
- **React Native Charts** - Beautiful, interactive data visualizations

**HTTP & State Management**
- **Axios** - Promise-based HTTP client
- **React Context API** - Global state management
- **React Hooks** - Modern state and lifecycle management

### DevOps & Infrastructure

**Version Control & CI/CD**
- **Git** - Version control
- **GitHub Actions** - Automated CI/CD pipelines
- **Pre-commit Hooks** - Automated code quality checks

**Security Scanning**
- **GitLeaks** - Secret detection in repositories
- **Trufflehog** - High-entropy string detection
- **pip-audit** - Python dependency vulnerability scanning
- **Safety** - Security vulnerability database
- **CodeQL** - Static application security testing (SAST)
- **Trivy** - Container security scanning

**Containerization**
- **Docker** - Container platform
- **Docker Compose** - Multi-container orchestration

**Cloud Services (Optional)**
- **AWS S3** - File storage for KYC documents
- **Firebase Cloud Messaging** - Push notifications
- **PostgreSQL Cloud** - Managed database hosting

### External Services Integration

**Market Data**
- Multiple provider fallback system for high availability
- Automatic rotation when rate limits are reached
- Caching layer to optimize API usage

**News Aggregation**
- **NewsAPI** - Global news aggregation
- **Marketaux** - Financial market news

**Document Management**
- **ReportLab** - PDF generation for statements
- **Pillow** - Image processing for KYC documents

---

## Quick Start

### Start the Application

```bash
startup.bat
```

This will:
1. Check and install dependencies
2. Initialize database with sample data
3. Start backend server (port 8000)
4. Start frontend app (port 8081)

### Access Points
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Frontend:** Scan QR code in Expo terminal
- **Test Login:** test@example.com / Test123!

---

## Table of Contents

- [Installation](#installation)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Security](#security)
- [Testing](#testing)
- [Deployment](#deployment)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

---

## Features (Detailed)

### Core Trading
- **Real-time stock quotes** - Multi-provider fallback (Twelve Data, Alpha Vantage, Finnhub, MarketStack)
- **Order execution** - Market and limit orders
- **Portfolio tracking** - Real-time valuations with P&L
- **AI recommendations** - Buy/sell/hold signals with confidence scores
- **Technical indicators** - RSI, MACD, SMA, Bollinger Bands

### Advanced Features
- **Price alerts** - Push notifications for price targets
- **M-Pesa integration** - Deposits/withdrawals via Daraja API
- **Market news** - Real-time news aggregation
- **AI chat assistant** - Trading queries with context-aware responses
- **PDF reports** - Portfolio statements and trade confirmations
- **2FA security** - TOTP authentication
- **WebSocket streaming** - Real-time price updates
- **KYC management** - Document upload and verification
- **Broker integration** - CDSC account linking

### Mobile App Features
- **Comprehensive learning center** - 24 modules across 4 connected learning paths
  - Complete Beginner Track (8 modules)
  - Value Investing Mastery (12 modules)
  - Technical Trading Specialist (9 modules)
  - Fundamental Analysis Pro (10 modules)
- **Interactive charts** - Candlestick, line, and area charts
- **Watchlists** - Track favorite stocks
- **Push notifications** - Price alerts and trade confirmations
- **Dark theme** - Optimized for low-light viewing
- **Offline support** - View cached data without connection

### Background Services
- **Celery workers** - Async task processing
- **Market data updates** - Scheduled every 30 seconds
- **Price monitoring** - Alert evaluation
- **Redis caching** - With in-memory fallback
- **Firebase notifications** - Push notification delivery

---

## 📦 Installation

### Prerequisites
- **Python 3.11+** (3.13 recommended)
- **Node.js 18+** 
- **npm or yarn**
- **Git**
- **Redis** (optional, has in-memory fallback)

### 1. Clone Repository
```bash
git clone <repository-url>
cd "STOCK SOKO"
```

### 2. Backend Setup
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python manage.py init-db
python manage.py seed-db
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cd ..
```

### 4. Environment Configuration
```bash
python create_env_files.py
```

Edit `.env` with your configuration (see [Configuration](#-configuration) section).

---

## Architecture

### Tech Stack

**Backend:**
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM with SQLite database
- **Pydantic** - Data validation
- **Celery** - Background task queue
- **Redis** - Caching and message broker
- **JWT** - Secure authentication

**Frontend:**
- **React Native (Expo)** - Cross-platform mobile
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Navigation system
- **Axios** - HTTP client
- **AsyncStorage** - Local data persistence

**External Services:**
- **Market Data:** Twelve Data, Alpha Vantage, Finnhub, MarketStack
- **News:** NewsAPI
- **Payments:** M-Pesa Daraja API
- **Notifications:** Firebase Cloud Messaging
- **CDSC:** API integration for broker accounts

### Project Structure

```
STOCK SOKO/
├── backend/
│   ├── app/
│   │   ├── routers/          # API endpoints (20 routers)
│   │   ├── services/         # Business logic (17 services)
│   │   ├── database/         # Models and DB config
│   │   ├── schemas/          # Pydantic models
│   │   ├── ai/               # AI recommendations
│   │   ├── data/             # Sample data and educational content
│   │   ├── tasks/            # Celery background tasks
│   │   ├── utils/            # Helper functions
│   │   └── main.py           # FastAPI application
│   ├── tests/                # Backend tests
│   └── migrations/           # Database migrations
├── frontend/
│   ├── src/
│   │   ├── screens/          # React Native screens (48 screens)
│   │   ├── components/       # Reusable components (12)
│   │   ├── navigation/       # Navigation config (9)
│   │   ├── services/         # API services (2)
│   │   ├── contexts/         # State management (2)
│   │   ├── mocks/            # Mock data (13)
│   │   ├── theme/            # Design system (4)
│   │   └── utils/            # Helper functions (2)
│   └── assets/               # Images, fonts, icons
├── tests/                    # Integration tests
├── docs/                     # Additional documentation
├── uploads/                  # User uploads (KYC, etc.)
├── startup.bat               # Quick start script
├── manage.py                 # Management CLI
├── requirements.txt          # Python dependencies
└── README.md                 # This file
```

### Data Flow

```
Mobile App (React Native)
    ↓
API Client (Axios)
    ↓
FastAPI Backend (Port 8000)
    ↓
Service Layer (Business Logic)
    ↓
Database (SQLite/PostgreSQL) + External APIs
    ↓
Background Tasks (Celery) → Redis Cache
```

---

## 📚 API Documentation

### Interactive Documentation

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### Core Endpoints

#### Authentication
```
POST   /api/v1/auth/register          Register new user
POST   /api/v1/auth/login             Login and get JWT
POST   /api/v1/auth/refresh           Refresh access token
POST   /api/v1/auth/logout            Logout user
POST   /api/v1/auth/2fa/setup         Setup TOTP 2FA
```

#### Markets
```
GET    /api/v1/markets/stocks         Get all stocks
POST   /api/v1/markets/quote          Get stock quote
GET    /api/v1/markets/search         Search stocks
GET    /api/v1/markets/chart          Get chart data
```

#### Trading
```
POST   /api/v1/trades                 Place order
GET    /api/v1/trades                 Get trade history
GET    /api/v1/trades/{id}           Get trade details
DELETE /api/v1/trades/{id}           Cancel order
```

#### Portfolio
```
GET    /api/v1/ledger/balance         Get account balance
GET    /api/v1/ledger/positions       Get holdings
GET    /api/v1/ledger/history         Get transaction history
GET    /api/v1/ledger/summary         Get portfolio summary
```

#### AI Features
```
POST   /api/v1/ai/chat                Chat with AI assistant
GET    /api/v1/ai/recommendations     Get stock recommendations
```

#### Payments
```
POST   /api/v1/payments/mpesa/stk-push   Initiate M-Pesa deposit
POST   /api/v1/payments/withdraw          Request withdrawal
GET    /api/v1/payments/history           Payment history
```

#### Alerts
```
POST   /api/v1/alerts                 Create price alert
GET    /api/v1/alerts                 Get user alerts
DELETE /api/v1/alerts/{id}           Delete alert
```

---

## Security

### Overview

Stock Soko implements enterprise-grade security measures following OWASP best practices. For comprehensive security information, see [SECURITY.md](./SECURITY.md).

### Core Security Features

#### Authentication & Authorization
- JWT-based authentication with secure token management
- Password hashing using bcrypt (cost factor 12)
- TOTP-based two-factor authentication (2FA)
- Session management with configurable timeout
- Password requirements: minimum 8 characters, mixed case, numbers, special characters

#### API Security
- Multi-layered rate limiting per IP and endpoint
- Enhanced rate limits for sensitive endpoints:
  - Login: 10 attempts per minute
  - Registration: 5 per minute
  - Password reset: 3 per minute
  - Payments: 20 per minute
  - Trading: 30 per minute
- Comprehensive security headers (CSP, HSTS, X-Frame-Options)
- CORS configuration with allowed origins whitelist
- Request size limits and input validation

#### Data Protection
- HTTPS enforcement in production
- SQL injection prevention via ORM parameter binding
- XSS protection through input sanitization
- Sensitive data encryption at rest
- Secure file upload validation
- No PII in application logs

### Production Security Configuration

#### Required Environment Variables

```env
# Critical: Change these before deployment
ENVIRONMENT=production
DEBUG=false
JWT_SECRET=<generate-64-character-random-string>
DATABASE_URL=postgresql://user:password@host:port/database

# Generate secure JWT secret:
# python -c "import secrets; print(secrets.token_urlsafe(64))"
```

#### Security Headers

Automatically applied to all responses:
- Content-Security-Policy (strict)
- Strict-Transport-Security (HSTS)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

#### Rate Limiting

Configure in `.env`:
```env
RATE_LIMIT_PER_MINUTE=100
RATE_LIMIT_PER_HOUR=5000
```

### Security Scanning & Monitoring

#### Automated Security Checks

CI/CD pipeline includes:
- Dependency vulnerability scanning (pip-audit, safety)
- Static code analysis (bandit, flake8)
- Secret detection (gitleaks, trufflehog)
- Container security scanning (trivy)
- SAST analysis (CodeQL)

#### Manual Security Audits

```bash
# Check for dependency vulnerabilities
pip-audit

# Security linting
bandit -r backend/

# Secret detection
gitleaks detect --source . --verbose

# Run all tests with coverage
pytest --cov=backend/app --cov-report=html
```

### Secrets Management

#### Critical: Never Commit Secrets

Protected secrets:
- `JWT_SECRET` - Token signing key
- `SMTP_PASSWORD` - Email service credentials
- `DATABASE_URL` - Production database connection
- `MPESA_CONSUMER_SECRET` - Payment API credentials
- `AWS_SECRET_ACCESS_KEY` - Cloud storage credentials
- All third-party API keys

#### Setup Process

1. Copy template:
   ```bash
   cp .env.example .env
   ```

2. Generate secure secrets:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(64))"
   ```

3. Fill in `.env` with actual values

4. Verify `.env` is gitignored:
   ```bash
   git status  # Should not show .env
   ```

#### Secret Rotation

Rotate secrets every 90 days minimum:
- Generate new secret
- Update production environment
- Deploy application
- Verify functionality
- Revoke old secret

### Security Best Practices

1. **Environment Configuration**
   - Use `.env.example` as template only
   - Never commit `.env` to version control
   - Use environment variables in production
   - Separate dev/staging/production configurations

2. **Authentication**
   - Enforce strong password requirements
   - Enable 2FA for admin accounts
   - Monitor failed login attempts
   - Implement account lockout after 10 failed attempts

3. **Database Security**
   - Use PostgreSQL in production (not SQLite)
   - Encrypt database backups
   - Implement connection pooling
   - Regular security patches

4. **API Security**
   - Validate all inputs with Pydantic
   - Sanitize error messages
   - Log security events
   - Monitor rate limit violations

5. **Dependency Management**
   - Run security scans before deployment
   - Update dependencies monthly
   - Review CVE disclosures
   - Use pinned versions

6. **Monitoring & Logging**
   - No sensitive data in logs
   - Anonymize IP addresses
   - Set up security alerts
   - Regular log analysis

### Incident Response

If you discover a security vulnerability:

1. **Do NOT** create a public GitHub issue
2. Email: security@stocksoko.com
3. Include: description, reproduction steps, impact
4. Response time: within 48 hours

### Pre-Deployment Checklist

- [ ] All secrets in environment variables
- [ ] No `.env` files in repository
- [ ] `.env.example` up to date
- [ ] `DEBUG=false` in production
- [ ] Strong `JWT_SECRET` (64+ characters)
- [ ] PostgreSQL database configured
- [ ] HTTPS enabled
- [ ] Security headers active
- [ ] Rate limiting configured
- [ ] CORS properly restricted
- [ ] Security scans passing
- [ ] Dependencies updated
- [ ] Backup system configured

### Additional Resources

- [SECURITY.md](./SECURITY.md) - Comprehensive security documentation
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [Python Security Best Practices](https://python.org/dev/security/)

---

## Testing

### Run All Tests
```bash
pytest
```

### Run with Coverage
```bash
pytest --cov=backend/app --cov-report=html
```

### Test Categories

**Backend Tests (60% coverage)**
- Authentication tests
- Trading tests
- Market data tests
- Ledger tests
- Watchlist tests
- Service layer tests (35% gap)
- Integration tests needed

**Frontend Tests**
- Currently 0% - needs implementation
- Recommended: Jest + React Testing Library

### Manual Testing

**Test User Credentials:**
```
Email: test@example.com
Password: Test123!
```

**Mock Data Available:**
- 20 NSE stocks (SCOM, KCB, EQTY, etc.)
- Sample trades and portfolio
- AI recommendations
- Market news

---

## Deployment

### Production Deployment Steps

#### 1. Database Setup (PostgreSQL)
```bash
# Create production database
createdb stocksoko_prod

# Update .env
DATABASE_URL=postgresql://user:pass@host/stocksoko_prod

# Run migrations
python manage.py init-db
```

#### 2. Backend Deployment

**Option A: Docker**
```bash
docker build -t stocksoko-backend .
docker run -p 8000:8000 --env-file .env stocksoko-backend
```

**Option B: Gunicorn + Nginx**
```bash
# Install Gunicorn
pip install gunicorn

# Run with Gunicorn
gunicorn backend.app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name api.stocksoko.com;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### 3. Frontend Deployment

**Build for Production:**
```bash
cd frontend
npx expo build:android
npx expo build:ios
```

**Or use EAS Build:**
```bash
eas build --platform android
eas build --platform ios
```

#### 4. Background Services

**Start Celery Worker:**
```bash
celery -A backend.app.tasks.celery_app worker --loglevel=info
```

**Start Celery Beat (scheduler):**
```bash
celery -A backend.app.tasks.celery_app beat --loglevel=info
```

**Monitor with Flower:**
```bash
celery -A backend.app.tasks.celery_app flower --port=5555
```

### Environment-Specific Configuration

**Development:**
```env
ENVIRONMENT=development
DEBUG=true
DATABASE_URL=sqlite:///./stocksoko.db
```

**Staging:**
```env
ENVIRONMENT=staging
DEBUG=false
DATABASE_URL=postgresql://user:pass@staging-host/db
```

**Production:**
```env
ENVIRONMENT=production
DEBUG=false
DATABASE_URL=postgresql://user:pass@prod-host/db
ENABLE_HTTPS=true
SECURE_COOKIES=true
```

---

## Configuration

### Environment Variables

#### Required
```env
# Application
ENVIRONMENT=development|staging|production
DEBUG=true|false
DATABASE_URL=sqlite:///./stocksoko.db

# Security (REQUIRED in production)
JWT_SECRET=<64-character-random-string>
JWT_EXPIRATION_MINUTES=60
```

#### Optional (Market Data)
```env
# Use at least one for real market data
TWELVE_DATA_API_KEY=your_key
ALPHA_VANTAGE_API_KEY=your_key
FINNHUB_API_KEY=your_key
MARKETSTACK_API_KEY=your_key
NEWS_API_KEY=your_key
```

#### Optional (M-Pesa)
```env
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_PASSKEY=your_passkey
MPESA_SHORTCODE=174379
MPESA_CALLBACK_URL=https://yourdomain.com/api/v1/payments/mpesa/callback
MPESA_ENV=sandbox|production
```

#### Optional (Redis & Celery)
```env
REDIS_URL=redis://127.0.0.1:6379/0
CELERY_BROKER_URL=redis://127.0.0.1:6379/0
CELERY_RESULT_BACKEND=redis://127.0.0.1:6379/0
```

#### Optional (Firebase)
```env
FIREBASE_CREDENTIALS_PATH=path/to/firebase-credentials.json
FIREBASE_PROJECT_ID=your-project-id
ENABLE_NOTIFICATIONS=true|false
```

#### Optional (Rate Limiting)
```env
RATE_LIMIT_PER_MINUTE=100
RATE_LIMIT_PER_HOUR=5000
```

#### Optional (CORS)
```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081,http://localhost:19006
```

### API Keys Setup

**Free Market Data APIs:**
1. **Twelve Data:** https://twelvedata.com (800 req/day free)
2. **Alpha Vantage:** https://www.alphavantage.co (500 req/day free)
3. **Finnhub:** https://finnhub.io (60 req/min free)
4. **MarketStack:** https://marketstack.com (1000 req/month free)
5. **NewsAPI:** https://newsapi.org (1000 req/day free)

**M-Pesa Sandbox:**
1. Register at: https://developer.safaricom.co.ke
2. Create app and get consumer key/secret
3. Get test credentials for sandbox

---

## Troubleshooting

### Common Issues

#### Backend won't start
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Kill process if needed
taskkill /F /PID <PID>

# Or use different port
uvicorn backend.app.main:app --port 8001
```

#### Database errors
```bash
# Reset database
python manage.py reset-db

# Reinitialize
python manage.py init-db
python manage.py seed-db
```

#### Frontend won't connect to backend

**On physical mobile device:**
```bash
# Find your computer's IP address
ipconfig | findstr IPv4

# Update frontend/.env.local with your IP:
# EXPO_PUBLIC_API_URL=http://192.168.X.X:8000

# Reload Expo app on your phone
```

**Check backend is running:**
```bash
# Test health endpoint
curl http://localhost:8000/api/v1/health

# Or open in browser
http://localhost:8000/docs
```

#### Redis connection errors
```bash
# System will fallback to in-memory cache
# To use Redis, ensure it's running:
redis-server

# Or disable Redis features:
REDIS_URL=
CELERY_BROKER_URL=
```

#### M-Pesa integration errors
```bash
# Check sandbox credentials
# Verify callback URL is accessible
# Check MPESA_ENV=sandbox for testing
# View logs at http://localhost:8000/docs
```

### Debug Mode

Enable detailed logging:
```env
DEBUG=true
LOG_LEVEL=DEBUG
```

View logs:
```bash
# Backend logs
python manage.py backend  # Watch terminal output

# Celery logs
celery -A backend.app.tasks.celery_app worker --loglevel=debug
```

---

## 📱 Mobile App Features

### Learning Center (NEW: Connected Learning Paths!)
- **24 comprehensive modules** across 4 structured learning paths
- **Connected paths:** Click any path to view only its relevant modules
- **4 Learning Paths:**
  - **Complete Beginner Track** - 8 beginner modules for new investors
  - **Value Investing Mastery** - 12 modules on Warren Buffett principles
  - **Technical Trading Specialist** - 9 modules for chart-based trading
  - **Fundamental Analysis Pro** - 10 modules on financial analysis
- **3-tab navigation:** Learning Paths, Modules (filterable), Progress
- **Smart filtering:** Search, level filter, and path-based filtering
- **Progress tracking:** Track completion with achievement badges
- **Interactive lessons:** Formulas, examples, key points, and quizzes
- **Categories:** Stock Basics, Valuation, Trading, Risk Management, Technical Analysis, and more

### Home Screen
- Portfolio overview with real-time values
- Quick actions (Trade, Deposit, Learn)
- AI stock recommendations
- Market movers
- News feed

### Markets Screen
- All NSE stocks with real-time data
- Search and filter functionality
- Sort by price, change, volume
- Detailed stock pages with charts
- Technical indicators

### Portfolio Screen
- Holdings with P&L
- Performance charts
- Transaction history
- Trade confirmations

### AI Assistant
- Context-aware chat interface
- Stock analysis and recommendations
- Investment education
- Market insights

---

## Contributing

### Code Style

**Python:**
```bash
# Format code
black backend/

# Sort imports
isort backend/

# Lint
flake8 backend/
```

**TypeScript:**
```bash
# Format code
npm run format

# Lint
npm run lint
```

### Commit Convention
```
feat: Add new feature
fix: Bug fix
docs: Documentation
style: Formatting
refactor: Code restructure
test: Add tests
chore: Maintenance
```

### Pull Request Process
1. Fork repository
2. Create feature branch
3. Make changes with tests
4. Run all tests
5. Submit PR with description

---

## 📄 License

Proprietary - All rights reserved

---

## 📞 Support

For issues, questions, or contributions:
- **Issues:** GitHub Issues
- **Email:** support@stocksoko.com
- **Documentation:** http://localhost:8000/docs

---

## 🎓 Credits

**Built with:**
- FastAPI for high-performance backend
- React Native for cross-platform mobile
- NSE market data providers
- OpenAI for AI features

**Sample data disclaimer:**
All mock market data is for demonstration purposes only. Not financial advice.

---

**Stock Soko** - Empowering the next generation of Kenyan investors 🇰🇪📈
