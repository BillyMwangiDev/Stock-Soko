# Manual Server Start Instructions

## Backend Server

**Open a new Command Prompt or PowerShell window and run:**

```cmd
cd "C:\Users\USER\Desktop\PROJECTS\STOCK SOKO"
python -m uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 5000
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:5000
INFO:     Application startup complete
```

---

## Frontend Server

**Open ANOTHER Command Prompt or PowerShell window and run:**

```cmd
cd "C:\Users\USER\Desktop\PROJECTS\STOCK SOKO\frontend"
npx expo start --clear
```

**Expected output:**
```
Starting Metro Bundler
› Metro waiting on exp://...
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

---

## Testing

1. **Backend health check:**
   - Open browser: http://localhost:5000/health
   - Should see: `{"message":"ok"}`

2. **Frontend access:**
   - Scan QR code with Expo Go app on your phone
   - Or press `w` to open in web browser

3. **Login:**
   - Email: `demo@stocksoko.test`
   - Password: `Demo123!`

---

## If You Get Errors

**"Port already in use":**
```cmd
# Kill processes on specific port
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

**"Module not found":**
```cmd
# Backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

---

## Features to Test

Refer to `TESTING_GUIDE.md` for comprehensive testing checklist.

**Quick Test Checklist:**
- ✓ Markets page loads stocks
- ✓ Stock detail shows OKX-style chart
- ✓ Order execution flow works
- ✓ Portfolio shows real positions
- ✓ Wallet shows transactions
- ✓ AI chat responds
- ✓ News feed loads
- ✓ Watchlist auto-refreshes every 30s

---

**Both servers running?** You're ready to test! 🚀

