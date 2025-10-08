# Stock Soko - Testing Guide

**Last Updated**: October 8, 2025
**Status**: Ready for Testing

## Quick Start

### Prerequisites
- Both servers running (Backend on 8000, Frontend on 8081)
- Web browser or Expo Go app

### Access URLs
- **Frontend Web**: http://localhost:8081
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

---

## Sample Test Users

### Valid Test Users (Should Pass Registration)

#### Test User 1
```
Email: john.doe@example.com
Password: Test1234
Full Name: John Doe
Phone: 0708374149
```
Expected: Phone normalizes to `254708374149`

#### Test User 2
```
Email: jane.smith@test.com
Password: Secure2024
Full Name: Jane Smith
Phone: 0712345678
```
Expected: Phone normalizes to `254712345678`

#### Test User 3
```
Email: trader@stocksoko.com
Password: Trading123
Full Name: Test Trader
Phone: 254701234567
```
Expected: Phone already in correct format

#### Test User 4
```
Email: investor@gmail.com
Password: Invest2024
Full Name: Sample Investor
Phone: +254722334455
```
Expected: Phone normalizes to `254722334455`

---

## Security Feature Testing

### 1. Password Strength Validation

All passwords must have:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit

**Test Cases:**

| Password | Expected Result | Reason |
|----------|----------------|---------|
| `weak` | REJECT | No uppercase, no digits |
| `WEAK` | REJECT | No lowercase, no digits |
| `Weak` | REJECT | Less than 8 characters, no digits |
| `test123` | REJECT | No uppercase letter |
| `TEST123` | REJECT | No lowercase letter |
| `TestTest` | REJECT | No digits |
| `Test1234` | ACCEPT | Valid password |
| `Secure2024` | ACCEPT | Valid password |

### 2. Email Validation

**Valid Emails:**
- `user@example.com` ✅
- `test.user@company.co.ke` ✅
- `trader123@gmail.com` ✅

**Invalid Emails (Should Reject):**
- `notanemail` - No @ symbol
- `test@` - Incomplete domain
- `@test.com` - No local part
- `test test.com` - Invalid format
- `test@domain` - No TLD

### 3. Phone Number Validation & Normalization

All Kenyan phone numbers are normalized to format: `254XXXXXXXXX`

**Valid Formats (All normalize correctly):**

| Input | Normalized Output |
|-------|------------------|
| `0708374149` | `254708374149` |
| `254708374149` | `254708374149` |
| `+254708374149` | `254708374149` |
| `0712345678` | `254712345678` |

**Invalid Formats (Should Reject):**
- `123` - Too short
- `abc123` - Contains letters
- `0700` - Too short
- `1234567890` - Not Kenyan format

---

## Testing Workflows

### Workflow 1: User Registration

1. Open http://localhost:8081
2. Navigate to Register/Sign Up screen
3. **Test with weak password first:**
   - Email: `test@example.com`
   - Password: `weak`
   - Expected: Error "Password must contain at least one uppercase letter"
4. **Try another weak password:**
   - Password: `Test`
   - Expected: Error "Password must be at least 8 characters"
5. **Register successfully:**
   - Email: `john.doe@example.com`
   - Password: `Test1234`
   - Full Name: `John Doe`
   - Phone: `0708374149`
   - Expected: Registration successful

### Workflow 2: User Login

1. After registration, go to Login screen
2. Enter credentials:
   - Email: `john.doe@example.com`
   - Password: `Test1234`
3. Expected: Login successful, redirected to main app
4. **Test invalid credentials:**
   - Email: `wrong@email.com`
   - Password: `Wrong123`
   - Expected: Error "Invalid credentials"

### Workflow 3: OTP Verification

1. Request OTP with phone number: `0708374149`
2. Expected: 
   - Success message shown
   - OTP code NOT visible in response (security fix)
   - Check backend terminal logs to see OTP (development only)
3. Enter OTP code
4. Expected: Verification successful

### Workflow 4: Password Reset

1. Go to "Forgot Password"
2. Enter email: `john.doe@example.com`
3. Expected: "Password reset link sent" message
4. Note: In sandbox mode, reset token shown in response (development only)
5. Use reset token to set new password
6. New password must meet strength requirements

### Workflow 5: Markets & Trading

1. Login with test user
2. Navigate to Markets tab
3. Expected: List of NSE stocks displayed
4. Click on a stock (e.g., NSE:SCOM)
5. Expected: Stock details with price, change%, fundamentals
6. Test navigation between screens
7. Expected: Smooth navigation, no errors

---

## API Testing via Swagger UI

Open http://localhost:8000/docs

### Test Authentication Endpoints

**1. POST /auth/register**
```json
{
  "email": "test@example.com",
  "password": "Test1234",
  "full_name": "Test User"
}
```
Expected: 200 OK with user details

**2. POST /auth/login**
- Click "Try it out"
- Username: `john.doe@example.com`
- Password: `Test1234`
- Expected: Token returned

**3. GET /auth/me** (Protected)
- First login to get token
- Click "Authorize" button, paste token
- Try endpoint
- Expected: Current user info

### Test Public Endpoints

**1. GET /markets**
- No authentication needed
- Expected: List of NSE stocks

**2. POST /markets/quote**
```json
{
  "symbol": "NSE:SCOM"
}
```
Expected: Stock quote with price and sparkline

**3. GET /health**
- Expected: `{"message": "ok"}`

---

## Security Features Verification

### ✅ What to Verify

1. **No OTP Exposure**
   - Request OTP via `/auth/otp/request`
   - Verify response does NOT contain OTP code
   - OTP only in backend logs (dev) or SMS (prod)

2. **Secure Token Generation**
   - All tokens are cryptographically secure (not predictable)
   - Password reset tokens are long random strings

3. **Input Validation**
   - Invalid emails rejected
   - Weak passwords rejected
   - Invalid phone formats rejected

4. **CORS Restrictions**
   - Only allowed origins can access API
   - Check network tab in browser DevTools

5. **Security Headers**
   - Open browser DevTools > Network tab
   - Check response headers for:
     - `X-Content-Type-Options: nosniff`
     - `X-Frame-Options: DENY`
     - `Strict-Transport-Security`
     - `Content-Security-Policy`

6. **Request Tracking**
   - Every API response has `x-request-id` header
   - Useful for debugging

---

## Testing Checklist

### Frontend Tests

- [ ] Registration with weak password (should reject)
- [ ] Registration with strong password (should accept)
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (should reject)
- [ ] Phone number auto-formatting (0708... → 254708...)
- [ ] Email validation
- [ ] Navigate between all tabs
- [ ] View markets list
- [ ] View stock details
- [ ] Portfolio screen loads
- [ ] Profile screen loads
- [ ] Settings screen accessible
- [ ] Error boundary catches errors gracefully

### Backend Tests

- [ ] Health endpoint responds
- [ ] Markets endpoint returns data
- [ ] Registration validates password strength
- [ ] Login returns JWT token
- [ ] Protected endpoints require authentication
- [ ] OTP codes not exposed in responses
- [ ] Phone numbers normalized correctly
- [ ] Security headers present in responses
- [ ] Rate limiting works (try many requests quickly)
- [ ] Request IDs present in all responses

### Security Tests

- [ ] Cannot register with weak password
- [ ] Cannot use invalid email format
- [ ] Cannot use invalid phone format
- [ ] OTP codes not returned in API responses
- [ ] JWT tokens expire correctly
- [ ] Protected routes reject invalid tokens
- [ ] CORS only allows configured origins
- [ ] SQL injection attempts handled safely
- [ ] XSS attempts handled safely

---

## Common Issues & Solutions

### Issue: Frontend shows blank page
**Solution**: 
```bash
cd frontend
rm -rf node_modules
npm install
npx expo start --clear --web
```

### Issue: Backend not responding
**Solution**:
```bash
cd "STOCK SOKO"
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn backend.app.main:app --reload --port 8000
```

### Issue: "Cannot find module" errors
**Solution**:
- Backend: Activate virtual environment first
- Frontend: Run `npm install` again

### Issue: Port already in use
**Solution**:
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Then restart server
```

### Issue: CORS errors in browser
**Solution**:
- Check `ALLOWED_ORIGINS` in backend/app/config.py
- Default allows localhost:8081, :3000, :19006

---

## Performance Testing

### Load Testing
```bash
# Install Apache Bench
# Test markets endpoint
ab -n 1000 -c 10 http://localhost:8000/markets

# Expected: Sub-100ms response times
```

### Response Time Benchmarks
- Health check: < 10ms
- Markets list: < 100ms
- Stock quote: < 100ms
- Registration: < 200ms
- Login: < 200ms

---

## Testing on Mobile (Expo Go)

### Prerequisites
1. Expo Go app installed on phone
2. Same Wi-Fi network as computer
3. Or use ngrok for remote testing

### Steps

**Option 1: Local Network**
```bash
cd frontend
npx expo start
# Scan QR code with Expo Go
```

**Option 2: Ngrok Tunnel**
```bash
# Terminal 1: Expose backend
ngrok http 8000
# Copy ngrok URL

# Terminal 2: Create frontend/.env
echo "EXPO_PUBLIC_API_BASE_URL=https://your-ngrok-url.ngrok.io" > .env

# Start frontend
npx expo start --tunnel
# Scan QR code
```

---

## Test Data

### Available Stocks (Mock Data)
- NSE:SCOM - Safaricom PLC
- NSE:KCB - KCB Group PLC
- NSE:EQTY - Equity Group Holdings
- NSE:EABL - East African Breweries
- NSE:BAT - British American Tobacco Kenya
- NSE:KEGN - Kenya Electricity Generating Company
- NSE:SCBK - Standard Chartered Bank Kenya
- NSE:COOP - Co-operative Bank of Kenya

### Test Transactions
All transactions are simulated (no real money)
- Min deposit: KES 100
- Max deposit: No limit (test mode)
- Min withdrawal: KES 100

---

## Reporting Issues

When reporting bugs, include:
1. **Steps to reproduce**
2. **Expected behavior**
3. **Actual behavior**
4. **Screenshots** (if applicable)
5. **Browser/Device** info
6. **Request ID** from response headers (if API issue)

Example:
```
Issue: Registration fails with valid password

Steps:
1. Open http://localhost:8081
2. Click Register
3. Enter email: test@test.com
4. Enter password: Test1234
5. Click Submit

Expected: Registration successful
Actual: Error "Password must be at least 8 characters"

Request ID: abc-123-def
Browser: Chrome 120.0
```

---

## Success Criteria

### Registration & Authentication
- ✅ Can register with valid credentials
- ✅ Weak passwords rejected
- ✅ Can login with registered credentials
- ✅ Invalid credentials rejected
- ✅ JWT token received on login
- ✅ Protected routes require authentication

### Data Display
- ✅ Markets list loads successfully
- ✅ Stock details show correct data
- ✅ Charts render properly
- ✅ Portfolio data displays

### Security
- ✅ No sensitive data in responses
- ✅ All validation rules enforced
- ✅ Security headers present
- ✅ Request tracking working

### Performance
- ✅ API responses < 200ms
- ✅ Frontend loads < 5 seconds
- ✅ No memory leaks
- ✅ Smooth navigation

---

## Additional Resources

- **Security Audit Report**: `docs/SECURITY-AUDIT-REPORT.md`
- **Developer Guide**: `docs/DEVELOPER-QUICKSTART.md`
- **Codebase Status**: `CODEBASE-STATUS.md`
- **API Documentation**: http://localhost:8000/docs (when running)

---

**Happy Testing! 🚀**

*For questions or issues, check the documentation or contact the development team.*

