# Stock Soko - Quick Start Guide

## 🚀 Servers Are Running!

### ✅ Backend API
- **URL:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs (should be open in your browser)
- **Status:** 🟢 OPERATIONAL

### ✅ Frontend App  
- **URL:** http://localhost:8081
- **Status:** 🟢 RUNNING
- **Access:** Check the terminal window for QR code

---

## 🎯 Quick Actions

### 1. View API Documentation
The Swagger UI should now be open in your browser at:
**http://localhost:8000/docs**

Here you can:
- Browse all available endpoints
- Test API calls directly
- See request/response schemas

### 2. Test the API

**Get Health Status:**
```bash
python -c "import requests; print(requests.get('http://localhost:8000/api/v1/health').json())"
```

**Get All Stocks:**
```bash
python -c "import requests; r = requests.get('http://localhost:8000/api/v1/markets/stocks'); print(r.json())"
```

**Search for a Stock:**
```bash
python -c "import requests; r = requests.get('http://localhost:8000/api/v1/markets/search?q=SCOM'); print(r.json())"
```

### 3. Test the Mobile App

**Method 1: Expo Go (Recommended)**
1. Install "Expo Go" app on your phone (iOS/Android)
2. Look at the frontend terminal window for a QR code
3. Scan the QR code with your phone
4. The app will load automatically

**Method 2: Direct URL**
If the QR code doesn't work:
1. Find your computer's IP address:
   ```bash
   ipconfig
   ```
2. Create `frontend/.env.local` with:
   ```
   EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:8000
   ```
3. Restart the frontend server

### 4. Login to the App

Use these test credentials:
- **Email:** test@example.com
- **Password:** Test123!

---

## 📊 Available Endpoints

### Public Endpoints (No Auth Required)
- `GET /api/v1/health` - Health check
- `GET /api/v1/markets/stocks` - List all stocks
- `GET /api/v1/markets/search?q={symbol}` - Search stocks
- `GET /api/v1/news` - Get market news
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login

### Protected Endpoints (Auth Required)
- `GET /api/v1/watchlist` - Get watchlist
- `POST /api/v1/trades` - Place order
- `GET /api/v1/ledger/balance` - Get account balance
- `GET /api/v1/ledger/positions` - Get portfolio
- `POST /api/v1/alerts` - Create price alert
- `POST /api/v1/ai/chat` - Chat with AI
- `POST /api/v1/payments/mpesa/stk-push` - M-Pesa deposit

---

## 🧪 Test Scenarios

### Scenario 1: Get Stock Quote
```python
import requests

# Get all stocks
response = requests.get('http://localhost:8000/api/v1/markets/stocks')
stocks = response.json()['stocks']

# Find Safaricom
scom = [s for s in stocks if s['symbol'] == 'SCOM'][0]
print(f"Safaricom: {scom['name']}")
print(f"Price: KES {scom.get('current_price', 'N/A')}")
```

### Scenario 2: Search Stocks
```python
import requests

# Search for banks
response = requests.get('http://localhost:8000/api/v1/markets/search?query=bank')
results = response.json()
print(f"Found {len(results)} banks")
for stock in results:
    print(f"- {stock['symbol']}: {stock['name']}")
```

### Scenario 3: Login and Get Balance
```python
import requests

# Login
login_data = {
    "username": "test@example.com",
    "password": "Test123!"
}
response = requests.post('http://localhost:8000/api/v1/auth/login', data=login_data)
token = response.json()['access_token']

# Get balance
headers = {'Authorization': f'Bearer {token}'}
response = requests.get('http://localhost:8000/api/v1/ledger/balance', headers=headers)
print(response.json())
```

---

## 🎓 Sample Data Available

### Stocks (20 NSE Companies)
- SCOM - Safaricom PLC
- KCB - KCB Group PLC
- EQTY - Equity Group Holdings PLC
- ABSA - Absa Bank Kenya PLC
- SCBK - Standard Chartered Bank Kenya Limited
- And 15 more...

### Learning Paths (4 Tracks)
1. **Complete Beginner Track** - 8 modules
2. **Value Investing Mastery** - 12 modules  
3. **Technical Trading Specialist** - 9 modules
4. **Fundamental Analysis Pro** - 10 modules

### Test User
- Pre-configured account with sample portfolio
- Virtual cash balance for testing
- Sample trades and watchlist

---

## 🛑 Stop Servers

When you're done testing:

```bash
# Find process IDs
netstat -ano | findstr ":8000"
netstat -ano | findstr ":8081"

# Kill backend
taskkill /F /PID 47724

# Kill frontend
taskkill /F /PID 14812
```

Or simply close the terminal windows running the servers.

---

## 🔄 Restart Servers

**Option 1: Use startup script**
```bash
startup.bat
```

**Option 2: Manual start**
```bash
# Terminal 1: Backend
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Frontend
cd frontend
npx expo start
```

---

## 📱 Mobile App Features

Once you login to the mobile app, you can:

### Home Screen
- View portfolio summary
- See AI stock recommendations
- Quick actions (Trade, Deposit, Learn)
- Market movers
- News feed

### Markets Screen
- Browse all 20 NSE stocks
- Search and filter
- View detailed stock pages
- See technical indicators
- Add to watchlist

### Learning Center
- 24 comprehensive modules
- 4 connected learning paths
- Progress tracking
- Interactive lessons with quizzes

### Portfolio Screen
- Holdings with P&L
- Performance charts
- Transaction history
- Trade confirmations

### AI Assistant
- Ask trading questions
- Get stock analysis
- Investment education
- Market insights

---

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check if port is in use
netstat -ano | findstr ":8000"

# Kill the process
taskkill /F /PID <PID>

# Restart backend
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend can't connect
1. Check backend is running: http://localhost:8000/docs
2. Update frontend/.env.local with your IP
3. Make sure firewall allows connections
4. Restart Expo: `r` key in terminal or shake phone

### Database errors
```bash
# Reset database
python manage.py init-db

# Reseed data
python seed_database.py
```

---

## 📚 Documentation

- **API Docs:** http://localhost:8000/docs
- **Full README:** ./README.md
- **Server Status:** ./SERVER_STATUS.md

---

## ✅ Current Status

| Component | Status |
|-----------|--------|
| Backend | 🟢 Running on port 8000 |
| Frontend | 🟢 Running on port 8081 |
| Database | 🟢 20 stocks loaded |
| API Health | 🟢 All tests passing |

**You're all set! Start exploring the API at http://localhost:8000/docs** 🚀

