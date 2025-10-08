# Stock Soko - Developer Quick Start Guide

**Last Updated**: October 8, 2025
**Status**: Production Ready

## Quick Start (5 Minutes)

### Prerequisites

```bash
Python 3.11+
Node.js 18+
Git
```

### 1. Clone and Setup

```bash
# Clone repository
git clone <repository-url>
cd STOCK\ SOKO

# Backend setup
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Frontend setup
cd frontend
npm install
cd ..
```

### 2. Start Servers

**Terminal 1 - Backend:**
```bash
cd "STOCK SOKO"
.venv\Scripts\activate
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd "STOCK SOKO\frontend"
npm start
# Press 'w' for web browser
```

### 3. Verify

```bash
# Check backend health
curl http://localhost:8000/health
# Expected: {"message":"ok"}

# Access API docs
# Open: http://localhost:8000/docs
```

## Project Structure

```
STOCK SOKO/
├── backend/
│   ├── app/
│   │   ├── routers/       # 15 API endpoint modules
│   │   ├── services/      # Business logic
│   │   ├── schemas/       # Pydantic models
│   │   ├── utils/         # JWT, logging, middleware
│   │   ├── ai/            # Recommendation engine
│   │   ├── config.py      # Environment config
│   │   └── main.py        # FastAPI app
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── api/           # API client
│   │   ├── components/    # Reusable components
│   │   ├── navigation/    # Navigation stacks
│   │   ├── screens/       # Screen components
│   │   ├── store/         # State management
│   │   └── theme/         # Design tokens
│   ├── App.tsx            # Root component
│   └── package.json
│
├── tests/                 # Backend tests
├── docs/                  # Documentation
├── tasks/                 # PRD & planning
├── requirements.txt
├── docker-compose.yml
└── README.md
```

## Common Commands

### Backend

```bash
# Start dev server
uvicorn backend.app.main:app --reload --port 8000

# Run tests
pytest

# Run specific test
pytest tests/test_auth.py -v

# Check code quality
flake8 backend/
black backend/ --check

# Format code
black backend/

# Install new package
pip install package-name
pip freeze > requirements.txt
```

### Frontend

```bash
# Start dev server
npm start

# Start web only
npm run web

# Type check
npx tsc --noEmit

# Install new package
npm install package-name

# Clear cache
npx expo start -c
```

## API Endpoints

### Authentication

```
POST   /auth/register       # Create account
POST   /auth/login          # Login
POST   /auth/verify-otp     # Verify OTP
GET    /auth/me             # Get current user
```

### Markets

```
GET    /markets             # List all stocks
GET    /markets/{symbol}    # Get stock details
GET    /markets/movers      # Top gainers/losers
```

### Trading

```
POST   /trades              # Place order
GET    /trades              # Order history
GET    /trades/{id}         # Order details
```

### Portfolio

```
GET    /ledger/positions    # Get positions
GET    /ledger/balance      # Get balance
GET    /dashboard           # Dashboard summary
```

### Payments

```
POST   /payments/deposit    # M-Pesa deposit
POST   /payments/withdraw   # Withdrawal request
GET    /payments/history    # Transaction history
```

### Other

```
GET    /watchlist           # User watchlist
POST   /watchlist           # Add to watchlist
GET    /news                # Financial news
POST   /ai/chat             # AI assistant
GET    /alerts              # Price alerts
```

**Full Documentation**: http://localhost:8000/docs

## Frontend Component Usage

### Button

```tsx
import { Button } from '../components';

<Button 
  onPress={() => {}}
  variant="primary"  // primary | secondary | outline
  size="medium"      // small | medium | large
>
  Click Me
</Button>
```

### Card

```tsx
import { Card } from '../components';

<Card style={{ padding: 16 }}>
  <Text>Card Content</Text>
</Card>
```

### Input

```tsx
import { Input } from '../components';

<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  placeholder="Enter email"
  keyboardType="email-address"
/>
```

### Loading State

```tsx
import { LoadingState } from '../components';

{loading && <LoadingState message="Loading stocks..." />}
```

### Empty State

```tsx
import { EmptyState } from '../components';

<EmptyState
  title="No stocks found"
  message="Try adjusting your search"
/>
```

## Theme Usage

```tsx
import { colors, spacing, typography } from '../theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    padding: spacing.md,
  },
  text: {
    ...typography.body,
    color: colors.text.primary,
  },
});
```

### Color Tokens

```tsx
colors.primary.main       // Primary green
colors.status.error       // Error red
colors.status.success     // Success green
colors.text.primary       // Primary text
colors.text.secondary     // Secondary text
colors.background.primary // Dark background
```

### Spacing Scale

```tsx
spacing.xs   // 4px
spacing.sm   // 8px
spacing.md   // 16px
spacing.lg   // 24px
spacing.xl   // 32px
spacing.xxl  // 48px
```

## Authentication Flow

### Frontend

```tsx
import { login, getAccessToken } from '../store/auth';

// Login
const token = await login(email, password);

// Check auth status
const token = await getAccessToken();
if (token) {
  // User is authenticated
}
```

### Backend

```python
from backend.app.utils.jwt import get_current_user

@router.get("/protected")
async def protected_route(user: dict = Depends(get_current_user)):
    return {"user_email": user["email"]}
```

## Testing Examples

### Backend Test

```python
# tests/test_markets.py
def test_get_markets(client):
    response = client.get("/markets")
    assert response.status_code == 200
    assert "stocks" in response.json()
```

### Running Tests

```bash
# All tests
pytest

# With coverage
pytest --cov=backend

# Specific test file
pytest tests/test_auth.py -v

# Stop on first failure
pytest -x
```

## Debugging

### Backend Debugging

```python
# Add breakpoint
import pdb; pdb.set_trace()

# Or use logging
import logging
logger = logging.getLogger(__name__)
logger.info(f"Debug info: {variable}")
```

### Frontend Debugging

```tsx
// Console log
console.log('Debug:', data);

// React DevTools
// Install React Native Debugger or use browser DevTools

// Network debugging
// Check Metro bundler logs in terminal
```

### Common Issues

**Backend won't start:**
```bash
# Check if port is in use
netstat -ano | findstr :8000

# Kill process
taskkill /F /PID <PID>
```

**Frontend errors:**
```bash
# Clear cache
npx expo start -c

# Reinstall dependencies
rm -rf node_modules
npm install
```

**Import errors:**
```bash
# Backend
.venv\Scripts\activate
pip install -r requirements.txt

# Frontend
npm install
```

## Environment Variables

### Backend .env

```env
# Required for development
JWT_SECRET=dev-secret-change-in-production
DATABASE_URL=sqlite:///./stocksoko.db

# Optional (use defaults)
REDIS_URL=redis://localhost:6379/0
MPESA_ENV=sandbox
```

### Frontend .env

```env
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_ENVIRONMENT=development
```

## Mobile Testing

### Using Expo Go

```bash
# Start server
npm start

# Scan QR code with:
# - iOS: Camera app
# - Android: Expo Go app
```

### Using iOS Simulator

```bash
npm run ios
```

### Using Android Emulator

```bash
npm run android
```

## Deployment

### Backend (Production)

```bash
# Using Docker
docker-compose up -d

# Or direct
gunicorn backend.app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend (Production)

```bash
# Build for web
npm run web

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## Monitoring

### Health Check

```bash
curl http://localhost:8000/health
```

### Metrics

```bash
curl http://localhost:8000/metrics
```

### Logs

```bash
# Backend logs in console
# Frontend logs in Metro bundler
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: your feature description"

# Push to remote
git push origin feature/your-feature

# Create pull request on GitHub
```

### Commit Message Convention

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

## Tips and Tricks

1. **Fast Backend Reload**: --reload flag watches for file changes
2. **Frontend Hot Reload**: Save files to see instant updates
3. **API Testing**: Use http://localhost:8000/docs for interactive testing
4. **TypeScript**: Run npx tsc --noEmit to check types without building
5. **Code Formatting**: Use Black for Python, Prettier for TypeScript
6. **Keep Servers Running**: Use separate terminal windows for each server

## Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **React Navigation**: https://reactnavigation.org/
- **Expo Docs**: https://docs.expo.dev/
- **TypeScript**: https://www.typescriptlang.org/docs/

## Getting Help

1. Check API docs: http://localhost:8000/docs
2. Read error messages carefully
3. Check console/terminal logs
4. Review this guide
5. Check project documentation in /docs

---

**Happy Coding!**

*Stock Soko Development Team*
