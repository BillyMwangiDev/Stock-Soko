# 🚀 How to Start Stock Soko Servers

## Quick Start

### Option 1: Double-Click Batch Files (Easiest)

1. **Start Backend**: Double-click `start-backend.bat`
2. **Start Frontend**: Double-click `start-frontend.bat`

Two command windows will open showing the server logs.

---

### Option 2: Manual Commands

Open **TWO separate terminal windows**:

#### Terminal 1 - Backend Server
```bash
cd C:\Users\USER\Desktop\PROJECTS\STOCK SOKO
python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8080
```

#### Terminal 2 - Frontend Server  
```bash
cd C:\Users\USER\Desktop\PROJECTS\STOCK SOKO\frontend
npx expo start
```

---

## 📊 Server Information

| Server | Port | URL | Purpose |
|--------|------|-----|---------|
| **Backend** | 8080 | http://localhost:8080 | FastAPI REST API |
| **Frontend** | 8081 | http://localhost:8081 | Expo Metro Bundler |

### Backend Endpoints

- **Health Check**: http://localhost:8080/health
- **API Docs (Swagger)**: http://localhost:8080/docs
- **API Docs (ReDoc)**: http://localhost:8080/redoc

### Frontend Access

- **Web Browser**: Press `w` in the Expo terminal
- **Android (Expo Go)**: Scan QR code with Expo Go app
- **iOS (Expo Go)**: Scan QR code with Camera app or Expo Go

---

## ⚠️ Troubleshooting

### Backend Won't Start - Port Permission Error

**Error**: `[WinError 10013] An attempt was made to access a socket in a way forbidden`

**Solution**: We're using `127.0.0.1` instead of `0.0.0.0` to avoid Windows permission issues.

If still fails, try different ports:
```bash
# Try port 8000
python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000

# Try port 3000  
python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 3000
```

Then update `frontend/app.config.js` line 15 to match the new port.

### Frontend Port Already In Use

**Error**: `Port 8081 is being used by another process`

**Solution 1**: Kill the process using the port:
```bash
netstat -ano | findstr ":8081"
taskkill /F /PID <PID_NUMBER>
```

**Solution 2**: Use a different port:
```bash
npx expo start --port 8147
```

### Module Not Found Errors

**Backend**:
```bash
pip install -r requirements.txt
```

**Frontend**:
```bash
cd frontend
npm install
```

---

## 🧪 Testing the Servers

### Test Backend
```bash
curl http://localhost:8080/health
```

Expected response:
```json
{"message":"ok"}
```

### Test Frontend

1. Open browser: http://localhost:8081
2. You should see the Expo DevTools interface
3. Scan QR code with Expo Go app on your phone

---

## 📱 Mobile Testing with Expo Go

### Setup

1. Install **Expo Go** from App Store (iOS) or Play Store (Android)
2. Make sure your computer and phone are on the **same WiFi network**

### Connect

#### iOS:
1. Open **Camera** app
2. Point at the QR code in terminal
3. Tap the notification to open in Expo Go

#### Android:
1. Open **Expo Go** app
2. Tap "Scan QR Code"
3. Point at the QR code in terminal

### Troubleshooting Mobile Connection

If Expo Go can't connect:

1. **Use Tunnel Mode**:
   ```bash
   npx expo start --tunnel
   ```

2. **Check Firewall**: Allow Node.js through Windows Firewall

3. **Use Same Network**: Ensure phone and PC are on same WiFi

---

## 🔄 Restarting Servers

### Stop Servers
- Press `Ctrl+C` in each terminal window
- Or close the command windows

### Clear Cache (if issues)

**Backend**: Delete `__pycache__` folders:
```bash
del /s /q backend\__pycache__
```

**Frontend**: Clear Expo cache:
```bash
cd frontend
npx expo start --clear
```

---

## ✅ All Systems Running Checklist

- [ ] Backend server running on port 8080
- [ ] Frontend server running on port 8081
- [ ] Backend health check returns `{"message":"ok"}`
- [ ] Expo DevTools accessible in browser
- [ ] QR code visible in terminal
- [ ] No error messages in either terminal

---

## 💡 Tips

- Keep both terminal windows open while developing
- Backend auto-reloads on code changes (thanks to `--reload`)
- Frontend auto-reloads on code changes via Metro bundler
- Check the terminal windows for error messages
- Use `Ctrl+C` to stop servers gracefully

---

**Questions?** Check `CONTRIBUTING.md` or open an issue on GitHub!

