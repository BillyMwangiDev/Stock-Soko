# Stock Soko - Testing Guide

## Pre-Test Setup

### Servers Running
- Backend: Port 5000 (http://localhost:5000 or http://192.168.1.5:5000)
- Frontend: Port 8147 or auto-assigned (check Expo QR code)

### Test Credentials
- Email: `demo@stocksoko.test`
- Password: `Demo123!` (capital D)

---

## Test Checklist

### 1. Order Execution Flow
**Test Steps:**
1. Login with test credentials
2. Navigate to Markets tab
3. Tap any stock card to open StockDetail
4. Observe:
   - OKX-style chart with timeframes (15m, 1H, 4H, 1D, 1W, 1M)
   - High/Low/Volume stats
   - Order Book showing buy/sell orders
   - Trading Controls with Market/Limit selector
5. Tap "Buy [SYMBOL]" button
6. In TradeOrder modal:
   - Check current price displays
   - Enter quantity (try quick buttons: 10, 50, 100)
   - For limit orders, enter custom price
   - Verify total and fee calculation
   - Tap "Review Order"
7. In ReviewOrder screen:
   - Verify all order details
   - Tap "Confirm Order"
8. Check for success message

**Expected Results:**
- All prices load correctly
- Balance validation works (error if insufficient funds)
- Order submits to `/trades` API
- Success message shows

---

### 2. Portfolio Management
**Test Steps:**
1. Navigate to Portfolio tab
2. Observe:
   - Total Portfolio Value at top
   - Profit/Loss with percentage
   - Cash Balance and Invested amount
   - List of holdings (if any)
3. Pull down to refresh
4. Tap on a holding to see details
5. Check Tax Estimate section

**Expected Results:**
- Real data loads from `/ledger/positions`
- P/L calculations are accurate
- Color coding (green for profit, red for loss)
- CGT (5%) calculated correctly
- Empty state shows if no positions

---

### 3. Wallet & Payments
**Test Steps:**
1. Navigate to Profile tab
2. Tap "Wallet"
3. Check tabs: Overview, Deposit, Withdrawal, History
4. In **Deposit** tab:
   - Enter amount (e.g., 1000)
   - Enter phone number (format: 254XXXXXXXXX)
   - Tap "Initiate Deposit"
5. In **Withdrawal** tab:
   - Enter amount (less than available balance)
   - Tap "Withdraw"
   - Confirm in dialog
6. In **History** tab:
   - Check transaction list
   - Verify types: Deposit, Withdrawal, Trade

**Expected Results:**
- Balance displays correctly
- M-Pesa STK push notification (if backend configured)
- Withdrawal request submits
- Transaction history loads from API

---

### 4. AI Chat Assistant
**Test Steps:**
1. Navigate to Profile tab
2. Tap "AI Assistant"
3. Type test messages:
   - "What is Safaricom?"
   - "Should I buy SCOM stock?"
   - "Analyze the Kenyan market"
4. Observe responses
5. Check typing indicator during processing

**Expected Results:**
- Messages send to `/ai/chat` API
- Typing indicator shows while waiting
- AI responses display with proper formatting
- Conversation history maintained
- Error handling for failed requests

---

### 5. News Feed
**Test Steps:**
1. Navigate to News tab
2. Observe news articles loading
3. Tap category filters: All, Markets, Stocks, Economy, Tech
4. Pull down to refresh
5. Tap on a news article (if detail view implemented)

**Expected Results:**
- News loads from `/news` API
- Categories filter correctly
- Refresh updates content
- Loading state shows while fetching
- Fallback message if API unavailable

---

### 6. Real-time Watchlist
**Test Steps:**
1. From Markets, tap watchlist icon on a stock
2. Navigate to Watchlist (from Markets header or tab)
3. Observe:
   - Stocks in watchlist
   - Live prices
   - Change percentages with color coding
   - Last update timestamp
4. Wait 30 seconds and watch for auto-refresh
5. Tap a stock to view details
6. Tap X to remove from watchlist

**Expected Results:**
- Watchlist loads from `/watchlist` API
- Prices merge from `/markets` API
- Auto-refresh every 30 seconds (timestamp updates)
- Stock cards are touchable to navigate to detail
- Remove functionality works

---

## API Integration Tests

### Backend Endpoints Used
Check network tab or logs for these API calls:

**Trading:**
- `GET /ledger/balance` - User wallet balance
- `GET /markets/stocks/:symbol` - Stock price
- `POST /trades` - Execute order

**Portfolio:**
- `GET /ledger/positions` - User positions
- `GET /ledger/balance` - Cash balance

**Wallet:**
- `GET /ledger/transactions` - Transaction history
- `POST /payments/mpesa/deposit` - Initiate deposit
- `POST /payments/mpesa/withdraw` - Request withdrawal

**AI & Content:**
- `POST /ai/chat` - AI responses
- `GET /news` - News feed
- `GET /watchlist` - User watchlist
- `POST /watchlist` - Add to watchlist
- `DELETE /watchlist/:symbol` - Remove from watchlist

---

## UI/UX Validation

### Mobile Optimization
- All content fits on phone screen without horizontal scroll
- Touch targets are adequate (minimum 44x44 points)
- Text is readable without zooming
- Color coding is consistent (green=positive, red=negative)

### Visual Elements
- No emoji characters (only text symbols: ←, ✕, ◆, ⋮)
- SS logo in headers
- OKX-style charts with crypto timeframes
- Order book resembles trading platforms
- Compact layouts maximize screen space

### Performance
- Pages load within 2 seconds
- Refresh animations are smooth
- No lag when typing in inputs
- Auto-refresh doesn't disrupt user interaction

---

## Error Handling Tests

### Network Errors
1. Turn off backend server
2. Try to:
   - Load Markets
   - Load Portfolio
   - Send AI chat message
3. Expected: User-friendly error messages, no crashes

### Validation Errors
1. Try to place order with:
   - Empty quantity
   - Insufficient balance
   - Invalid price (for limit orders)
2. Expected: Clear error messages before API call

### Edge Cases
1. Empty states:
   - Portfolio with no positions
   - Watchlist with no stocks
   - News API unavailable
2. Expected: Helpful empty state messages

---

## Known Limitations

### Backend Dependencies
- `/trades` endpoint needs real order execution logic
- `/news` endpoint needs news provider integration
- `/ai/chat` endpoint needs AI service connection
- M-Pesa integration needs sandbox/production credentials

### Features Not Yet Implemented
- Profile management (avatar, user info)
- Settings customization
- Educational content
- Notifications center
- KYC document upload
- Multiple watchlists
- Price alerts

---

## Bug Reporting

If you find issues, note:
1. **What you did** (steps to reproduce)
2. **What happened** (actual result)
3. **What you expected** (expected result)
4. **Device & OS** (e.g., iPhone 12, iOS 16)
5. **Screenshots** (if applicable)

---

## Success Criteria

All 6 major features should:
- Load data from real APIs
- Display correctly on mobile
- Handle errors gracefully
- Provide user feedback (loading states, success messages)
- Navigate smoothly between screens
- Update data on refresh

---

**Testing Completed:** ___________  
**Tested By:** ___________  
**Issues Found:** ___________  
**Status:** PASS / FAIL


