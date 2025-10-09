# Stock Soko Documentation

Welcome to the Stock Soko documentation hub. All project documentation is organized here for easy reference.

## Quick Links

### Getting Started
- [Developer Quickstart](DEVELOPER-QUICKSTART.md) - Set up your development environment
- [Contributing Guidelines](CONTRIBUTING.md) - How to contribute to the project

### Architecture & Design
- [Database Architecture](DATABASE-ARCHITECTURE.md) - Database schema and design decisions
- [Screen Inventory](SCREEN-INVENTORY.md) - Complete list of all app screens
- [ADRs (Architecture Decision Records)](ADRs/) - Key architectural decisions

### Features & Testing
- [Complete Feature List](COMPLETE-FEATURE-LIST.md) - All implemented features
- [Testing Guide](TESTING-GUIDE.md) - How to test the application
- [API Reference](API-REFERENCE.md) - Complete API documentation

### Stock Analysis
- [Stock Analysis Framework](STOCK-ANALYSIS-FRAMEWORK.md) - Comprehensive guide to fundamental, technical, and risk analysis

### Security
- [Security Audit Report](SECURITY-AUDIT-REPORT.md) - Security assessment and best practices

## Project Structure

```
STOCK SOKO/
 backend/          # FastAPI backend
    app/
       routers/  # API endpoints
       services/ # Business logic
       data/     # Sample data and analysis framework
       schemas/  # Pydantic models
    requirements.txt
 frontend/         # React Native (Expo) frontend
    src/
       screens/  # App screens
       components/ # Reusable components
       navigation/ # Navigation config
       api/      # API client
    package.json
 docs/            # Documentation (you are here)
 tests/           # Backend tests
 scripts/         # Utility scripts
```

## Technology Stack

### Backend
- **Framework**: FastAPI 0.104.1
- **Database**: SQLite (PostgreSQL ready)
- **Auth**: JWT with bcrypt
- **AI**: Custom recommendation engine
- **Testing**: pytest

### Frontend
- **Framework**: React Native (Expo SDK 52)
- **Navigation**: React Navigation 6
- **State**: React Context API
- **HTTP Client**: Axios
- **Charts**: react-native-chart-kit

## Key Features

1. **Stock Trading** - Buy/sell NSE-listed stocks
2. **AI Recommendations** - Machine learning-powered stock analysis
3. **M-Pesa Integration** - Deposit/withdraw via mobile money
4. **Real-time Portfolio** - Live P/L tracking
5. **Market News** - Curated financial news feed
6. **Educational Content** - Learn investing from beginner to advanced
7. **Price Alerts** - Custom notifications for price movements
8. **Tax Reports** - CGT calculations and tax summaries

## Development Workflow

1. **Start Backend**:
   ```bash
   ./start-backend.bat
   ```
   Runs on http://localhost:5000

2. **Start Frontend**:
   ```bash
   ./start-frontend.bat
   ```
   Expo DevTools opens automatically

3. **Run Tests**:
   ```bash
   cd backend
   pytest
   ```

## Sample Credentials

For testing purposes:
- **Email**: `test@example.com`
- **Password**: `Test123!`

## API Endpoints

Base URL: `http://localhost:5000`

- `/docs` - Interactive API documentation (Swagger UI)
- `/redoc` - Alternative API documentation (ReDoc)
- `/health` - Health check endpoint

See [API Reference](API-REFERENCE.md) for complete endpoint documentation.

## Educational Modules

Stock Soko includes comprehensive educational content organized by complexity:

**Beginner** - Stock basics, financial statements, P/E ratio
**Intermediate** - ROE/ROA analysis, cash flow, moving averages, risk management
**Advanced** - DCF modeling, technical indicators (RSI/MACD), portfolio theory

See [Stock Analysis Framework](STOCK-ANALYSIS-FRAMEWORK.md) for formulas and examples.

## Contributing

We welcome contributions! Please read [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

### Code Style
- **Backend**: PEP 8, type hints required
- **Frontend**: TypeScript strict mode, functional components with hooks
- **Commits**: Conventional commits (feat/fix/docs/etc)

## Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@stocksoko.com (placeholder)

## License

Proprietary - Stock Soko Ltd. All rights reserved.

---

*Documentation last updated: 2025-10-09*

