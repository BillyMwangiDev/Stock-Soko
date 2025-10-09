# Stock Soko - Testing Checklist

**Date:** October 9, 2025  
**Features to Test:** 15 major features  
**Status:** Servers Running ✅

---

## 🚀 **SERVERS STATUS**

✅ **Backend:** Running on http://localhost:5000  
✅ **Frontend:** Running on Expo (check terminal for QR code)

**Test Credentials:**
- Email: `john.doe@example.com`
- Password: `password123`

Alternative:
- Email: `jane.smith@example.com`
- Password: `password123`

---

## ✅ **TESTING CHECKLIST**

### **PHASE 1: AI & ALERTS** (4 features)

#### 1. Enhanced AI Recommendations ✅
**Location:** Home screen  
**What to test:**
- [ ] See 3 scrollable recommendation cards (swipe horizontally)
- [ ] Each card shows BUY/SELL/HOLD badge
- [ ] Confidence bar displays (75-95%)
- [ ] Risk level shows (Low/Medium/High)
- [ ] Current vs Target price displayed
- [ ] Tap card navigates to stock detail
- [ ] Pull-to-refresh updates recommendations

#### 2. AI Chat Suggestions ✅
**Location:** Profile → AI Assistant  
**What to test:**
- [ ] 8 suggested questions appear on first visit
- [ ] Tap suggestion fills input field
- [ ] Suggestions hide after first message
- [ ] AI responds to messages
- [ ] Conversation history maintained
- [ ] Loading indicator shows while AI thinking

#### 3. Smart Price Alerts ✅
**Location:** Profile → Price Alerts  
**What to test:**
- [ ] Active alerts count displays
- [ ] Create alert button opens modal
- [ ] Select stock from popular stocks
- [ ] Choose alert type (Above/Below/Change%)
- [ ] Enter target value
- [ ] Alert preview shows correctly
- [ ] Toggle alert on/off works
- [ ] Delete alert with confirmation
- [ ] Empty state shows when no alerts

#### 4. Enhanced Notification Center ✅
**Location:** Profile → Notifications  
**What to test:**
- [ ] Unread count badge in header
- [ ] Filter by category (All/Trade/Alert/News/Account)
- [ ] Priority badges visible (High/Medium/Low)
- [ ] Tap notification marks as read
- [ ] Action buttons navigate correctly
- [ ] Relative timestamps display
- [ ] Pull-to-refresh updates

---

### **PHASE 2: TRADING** (4 features)

#### 5. Order Book Display ✅
**Location:** Markets → Any Stock → Scroll down  
**What to test:**
- [ ] Order Book toggle button visible
- [ ] Spread percentage shows in badge
- [ ] Click to expand order book
- [ ] See 5 bid levels (green)
- [ ] See 5 ask levels (red)
- [ ] Current price indicator in middle
- [ ] Depth bars show volume
- [ ] Legend explains colors
- [ ] Collapse works

#### 6. Advanced Order Types ✅
**Location:** Markets → Stock → Buy/Sell button  
**What to test:**
- [ ] Market/Limit/Stop order type buttons
- [ ] Quantity input works
- [ ] Price input (for limit orders)
- [ ] Fractional shares toggle
- [ ] Available balance displays
- [ ] Total cost calculates correctly
- [ ] Fee calculation (0.2%)
- [ ] Review order button navigates

#### 7. Technical Indicators ✅
**Location:** Markets → Stock → Chart area  
**What to test:**
- [ ] Indicators toggle button below timeframes
- [ ] Click to expand indicators
- [ ] Select None/RSI/MACD/MA
- [ ] RSI shows value and status (Overbought/Oversold/Neutral)
- [ ] MACD shows bullish/bearish
- [ ] MA shows Golden Cross/Death Cross
- [ ] Values color-coded (green/yellow/red)
- [ ] Changes with timeframe selection

#### 8. Trading History ✅
**Location:** Portfolio → Receipt icon (top right)  
**What to test:**
- [ ] Summary stats display (Total trades, P/L, Win rate)
- [ ] Filter by All/Buys/Sells
- [ ] Filter by stock symbol
- [ ] Each trade shows: Symbol, Side, Quantity, Price, P/L
- [ ] Status badges (executed/pending/cancelled)
- [ ] Color coding (green for buy, red for sell)
- [ ] Tap trade navigates to stock detail
- [ ] Pull-to-refresh works

---

### **PHASE 3: PORTFOLIO** (4 features)

#### 9. Portfolio Performance Charts ✅
**Location:** Portfolio screen (below summary card)  
**What to test:**
- [ ] Chart displays portfolio value over time
- [ ] Timeline selector works (1D/1W/1M/3M/1Y/ALL)
- [ ] Performance % and amount display
- [ ] "vs NSE" toggle button works
- [ ] Dual-line chart shows when comparing
- [ ] Legend appears in compare mode
- [ ] Color coded (green for gains, red for losses)

#### 10. Enhanced Tax Reports ✅
**Location:** Portfolio → "Full Report" link (in Tax Estimate section)  
**What to test:**
- [ ] Tax year selector (2023/2024/2025)
- [ ] Tax liability summary displays
- [ ] Capital gains tax (5%) calculated
- [ ] Dividend withholding tax shown
- [ ] Total tax liability correct
- [ ] Unrealized gains shown separately
- [ ] FIFO vs LIFO toggle works
- [ ] Tax savings calculator displays
- [ ] Taxable events list shows
- [ ] Export PDF/Excel buttons present

#### 11. Holdings Detail Enhancement ✅
**Location:** Portfolio → Tap any holding  
**What to test:**
- [ ] Position summary displays
- [ ] Trade history section shows
- [ ] All buy/sell transactions listed
- [ ] Color-coded badges (green/red)
- [ ] Dates, quantities, prices display
- [ ] Sell position button works

#### 12. Dividend Tracker ✅
**Location:** Portfolio → Tap holding → Scroll to Dividend History  
**What to test:**
- [ ] Total dividends summary highlighted
- [ ] Individual payment entries
- [ ] Date, shares, per-share amount
- [ ] Total dividend amount
- [ ] Empty state for non-dividend stocks

---

### **PHASE 4: ADVANCED** (2 features)

#### 13. Smart News Feed ✅
**Location:** News tab  
**What to test:**
- [ ] News articles load
- [ ] Category filter tabs work
- [ ] Sentiment badges show (Bullish/Bearish/Neutral)
- [ ] AI Summary section displays
- [ ] Impact stocks shown as chips
- [ ] Color-coded impact (green/red/gray)
- [ ] Pull-to-refresh updates

#### 14. Interactive Learning Center ✅
**Location:** Profile → Educational Content  
**What to test:**
- [ ] Overall progress bar displays
- [ ] Course completion stats (X/7 Completed)
- [ ] Skill level tabs (Beginner/Intermediate/Advanced)
- [ ] Tab switching works
- [ ] Completed courses show green checkmark
- [ ] In-progress courses show percentage
- [ ] Not started courses show play button
- [ ] Duration displays for each course
- [ ] Progress bars on in-progress courses

#### 15. Company Fundamentals & Analysis ✅
**Location:** Markets → Any Stock → Scroll down  
**What to test:**
- [ ] Company Profile section displays (Sector, Industry, Employees, Founded)
- [ ] Profitability Metrics show:
  - [ ] ROE with formula and rating
  - [ ] ROA with formula and rating
  - [ ] P/E ratio with valuation rating
  - [ ] Profit Margin
  - [ ] Revenue Growth YoY
- [ ] Color-coded ratings (green=good, yellow=average, red=poor)
- [ ] Market Analysis section:
  - [ ] Kenya market trend (Bullish/Bearish/Neutral)
  - [ ] Global market sentiment
  - [ ] NSE 20 index performance
- [ ] Historical Performance charts:
  - [ ] Annual Revenue bars with growth %
  - [ ] Annual Profit bars with growth %
  - [ ] Dividend History bars
  - [ ] 4 years of data
- [ ] All existing AI analysis still works

---

## 🔍 **INTEGRATION TESTING**

### Navigation Flow Tests
- [ ] Home → Markets → Stock Detail → Trade Order → Review → Back
- [ ] Home → Portfolio → Holding Detail → View stock
- [ ] Home → Profile → AI Assistant → Chat
- [ ] Home → Profile → Price Alerts → Create alert
- [ ] Home → Profile → Notifications → View notification
- [ ] Portfolio → Trade History → View trade
- [ ] Portfolio → Tax Reports → Change year/method

### Data Flow Tests
- [ ] Login persists after app reload
- [ ] Portfolio data loads correctly
- [ ] Watchlist adds/removes stocks
- [ ] AI recommendations use real API data
- [ ] Order book generates realistic data
- [ ] Trade history filters work

### Error Handling
- [ ] Network error shows appropriate message
- [ ] Invalid form input shows validation
- [ ] Empty states display when no data
- [ ] Loading states show during data fetch
- [ ] 401 errors trigger logout

---

## 🎯 **CRITICAL PATHS**

### 1. Authentication Flow
```
Splash → Onboarding → Login → Home Dashboard
```

### 2. Trading Flow
```
Markets → Search Stock → View Detail → Analyze (indicators, fundamentals) 
→ Check Order Book → Place Buy Order → Review → Execute → View in Portfolio
```

### 3. Portfolio Management
```
Portfolio → View Performance Chart → Check Holdings → View Holding Detail 
→ Check Trade History → Review Dividends → View Tax Report
```

### 4. AI & Alerts
```
Home → AI Recommendations → Chat with AI → Set Price Alerts → Check Notifications
```

---

## 📱 **MOBILE-SPECIFIC TESTS**

- [ ] All text readable on mobile screen
- [ ] Buttons large enough to tap
- [ ] Scroll works smoothly
- [ ] Charts display correctly
- [ ] No horizontal overflow
- [ ] Bottom tab navigation accessible
- [ ] Modals display properly
- [ ] Forms usable on mobile keyboard

---

## 🐛 **KNOWN ISSUES TO VERIFY FIXED**

- [x] Duplicate getRelativeTime function - FIXED
- [x] Navigation to nested routes - FIXED  
- [x] Missing hapticFeedback.impact - FIXED
- [x] Emojis in code - FIXED (all removed)
- [x] Verbose comments - FIXED (all cleaned)

---

## 📊 **EXPECTED RESULTS**

**✅ All features should:**
- Load without errors
- Display data correctly
- Navigate smoothly
- Handle user input
- Show appropriate feedback
- Maintain UI consistency

**🚫 Should NOT see:**
- Linter errors
- Console errors (except expected network timeouts)
- UI glitches
- Navigation errors
- Crash/freeze

---

## 🎉 **SUCCESS CRITERIA**

**MVP Complete if:**
- ✅ All 15 features function
- ✅ Navigation works throughout
- ✅ No critical bugs
- ✅ UI looks professional
- ✅ Data displays correctly
- ✅ User can complete trading flow

---

## 📝 **NOTES**

**Mock Data:**
- Order book, trade history, tax reports use generated data
- Will be replaced with real API data when backend endpoints ready

**API Integrations Working:**
- ✅ Login/auth
- ✅ Markets data
- ✅ Portfolio positions
- ✅ Wallet balance
- ✅ AI recommendations
- ✅ News feed
- ✅ Watchlist

**Pending Backend APIs:**
- Alerts CRUD
- Notifications
- Order book real-time
- Historical portfolio data
- Tax calculations
- Trade history

---

**Start testing by scanning the QR code in your terminal with Expo Go!** 📱

Good luck! 🚀

