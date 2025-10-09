# Stock Soko - Intelligent Stock Trading Platform

**Trade Kenyan stocks with AI-powered insights and M-Pesa integration**

[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)]()
[![Version](https://img.shields.io/badge/Version-1.0.0-blue)]()
[![License](https://img.shields.io/badge/License-Proprietary-red)]()

---

##  Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### Start Servers
```bash
# Backend
./start-backend.bat

# Frontend (new terminal)
./start-frontend.bat
```

**Backend**: http://localhost:5000  
**Frontend**: Opens automatically in Expo

### Test Credentials
- **Email**: `test@example.com`
- **Password**: `Test123!`

---

##  Key Features

###  Stock Trading
- Buy/sell NSE-listed stocks
- Real-time price tracking
- Market orders and limit orders
- Order book visualization

###  AI-Powered Analysis
- Stock recommendations with confidence scores
- Fundamental + Technical + Sentiment analysis
- Composite scoring system
- AI chat assistant

###  M-Pesa Integration
- Deposit funds via M-Pesa
- Withdraw to mobile money
- Transaction history
- Instant settlement

###  Portfolio Management
- Real-time P/L tracking
- Holdings analysis with metrics
- Performance charts
- Tax report generation (CGT)

###  Educational Content
- **23 comprehensive lessons**
- 4 learning paths (8-10 weeks each)
- Interactive lesson viewer
- Quizzes and progress tracking
- **Value Investing curriculum** (11 lessons)

###  Price Alerts
- Custom price notifications
- Multiple alert types
- Real-time monitoring

---

##  Documentation

**All documentation in [`docs/`](docs/) folder:**

### Getting Started
- [Developer Quickstart](docs/DEVELOPER-QUICKSTART.md)
- [API Reference](docs/API-REFERENCE.md)
- [Testing Guide](docs/TESTING-GUIDE.md)

### Educational Content
- [Stock Analysis Framework](docs/STOCK-ANALYSIS-FRAMEWORK.md)
- [Value Investing Guide](docs/VALUE-INVESTING-GUIDE.md)
- [Value Investing Implementation Checklist](docs/VALUE-INVESTING-IMPLEMENTATION-CHECKLIST.md)

### Architecture
- [Database Architecture](docs/DATABASE-ARCHITECTURE.md)
- [Screen Inventory](docs/SCREEN-INVENTORY.md)
- [Security Audit](docs/SECURITY-AUDIT-REPORT.md)

### Reference
- [Complete Feature List](docs/COMPLETE-FEATURE-LIST.md)
- [Unimplemented Features](docs/UNIMPLEMENTED_FEATURES.md)
- [Analytics Organization](docs/ANALYTICS-NO-DUPLICATES.md)

**See [docs/README.md](docs/README.md) for full documentation index**

---

##  Technology Stack

### Backend
- **Framework**: FastAPI 0.104.1
- **Database**: SQLite (PostgreSQL ready)
- **Auth**: JWT with bcrypt
- **AI**: Custom recommendation engine
- **Testing**: pytest

### Frontend
- **Framework**: React Native (Expo SDK 52)
- **Language**: TypeScript (strict mode)
- **Navigation**: React Navigation 7
- **State**: Context API
- **HTTP**: Axios
- **Charts**: react-native-chart-kit

---

##  Project Structure

```
STOCK SOKO/
 backend/              # FastAPI backend
    app/
       routers/      # 17 API endpoints
       services/     # Business logic
       data/         # Sample stocks & educational content
       schemas/      # Pydantic models
       utils/        # Utilities
    requirements.txt
 frontend/             # React Native (Expo)
    src/
       screens/      # 43 screens
       components/   # 12 components
       navigation/   # 9 navigators
       contexts/     # App context
       theme/        # Design system
    package.json
 docs/                 # All documentation (15 files)
 tests/                # Backend tests (11 files)
 scripts/              # Utility scripts
 tasks/                # Project management
```

---

##  Educational System

### Learning Paths Available

**1. Complete Beginner** (8 weeks)
- Stock basics → Financial statements → Valuation → First trade
- Moving averages → Risk management → DCF → Portfolio

**2. Value Investing for NSE** (10 weeks)
- Margin of safety → Intrinsic value → Business moats
- Liquidity analysis → ROE mastery → Sector timing
- Historical analysis → Market cycles → Portfolio building

**3. Fundamental Analysis** (6 weeks)
- Financial statements → Profitability metrics
- Cash flow → DCF modeling → Composite scoring

**4. Technical Trading** (5 weeks)
- Chart patterns → Moving averages
- RSI/MACD → Risk management → Backtesting

### Lesson Content
- **23 total lessons** (12 general + 11 value investing)
- Formulas with examples
- Practical NSE applications
- Quizzes for knowledge testing
- Progress tracking

---

##  Security

- JWT authentication
- Password hashing (bcrypt)
- 2FA support (TOTP)
- Rate limiting
- CORS configuration
- Input validation

---

##  Sample Data

**20 NSE Stocks** with comprehensive metrics:
- KCB, Equity, Co-op (Banking)
- Safaricom (Telecom)
- EABL, BAT (Consumer Goods)
- Bamburi (Manufacturing)
- And 13 more...

Each stock includes:
- Financial metrics (ROE, ROA, P/E, margins)
- Historical data (4-year revenue, profit, dividends)
- Market analysis (trends, sentiment)
- Risk metrics (beta, volatility, Sharpe)

---

##  Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v
```

**Coverage**: 11 test files covering auth, markets, trades, ledger, AI

### Frontend
```bash
cd frontend
npx expo start --clear
```

---

##  Contributing

Please read [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for:
- Development workflow
- Code style guidelines
- Commit conventions
- Pull request process

---

##  Status

### Implemented (Production Ready)
-  Authentication & Authorization
-  Stock trading (market orders)
-  Portfolio management
-  AI recommendations
-  Educational content (23 lessons)
-  Watchlist management
-  Broker selection

### Partially Implemented (Mock Data)
-  M-Pesa payments
-  Real-time prices
-  News feed
-  Tax reports

**See [docs/UNIMPLEMENTED_FEATURES.md](docs/UNIMPLEMENTED_FEATURES.md) for complete status**

---

##  License

Proprietary - Stock Soko Ltd. All rights reserved.

---

##  Support

- **Documentation**: [docs/](docs/)
- **API Docs**: http://localhost:5000/docs
- **Issues**: GitHub Issues
- **Email**: support@stocksoko.com

---

##  Recent Updates

**2025-10-09**: Comprehensive cleanup complete
- 30 files deleted (outdated docs)
- All documentation organized
- Educational content now functional
- Value investing framework 100% implemented
- Zero code duplicates
- All routes verified

---

**Built with  for Kenyan investors**
