# Stock Soko - Complete Page & Functionality Reference

## 📱 App Structure & Navigation

### Main Tab Navigation
1. **Home** - Dashboard with portfolio overview
2. **Markets** - Browse and search all stocks
3. **Portfolio** - View holdings and performance
4. **Profile** - Settings and account management

---

## 🏠 HOME TAB

### **Home.tsx** - Main Dashboard
**Current Functionalities:**
- ✅ Portfolio value display with % change
- ✅ Welcome message with user name
- ✅ AI Recommendations (3 cards: Top Picks, Trending, Value)
- ✅ Quick Actions (Trade, Deposit, Learn)
- ✅ Pull-to-refresh for live data
- ✅ Floating AI assistant button

**Buttons & Actions:**
1. `Logo (SS)` - App branding
2. `Notification Bell` - Navigate to NotificationCenter
3. `Top Picks` - Navigate to AIAssistant
4. `Trending` - Navigate to Markets
5. `Value` - Navigate to Markets
6. `Trade` - Navigate to Markets
7. `Deposit` - Navigate to Wallet
8. `Learn` - Navigate to EducationalContent
9. `Floating AI Button` - Navigate to AIAssistant

---

## 📊 MARKETS TAB

### **Markets.tsx** - Stock Browser & Search
**Current Functionalities:**
- ✅ Compact market summary (Trend, Top Gainer, Top Loser, Total stocks)
- ✅ Search bar for stocks
- ✅ Filter buttons (All, Gainers ▲, Losers ▼)
- ✅ Stock list with real-time prices
- ✅ Watchlist toggle for each stock
- ✅ AI recommendation per stock
- ✅ Quick buy functionality
- ✅ Pull-to-refresh

**Buttons & Actions:**
1. `Watchlist` (header) - Navigate to Watchlist page
2. `Search Input` - Filter stocks by symbol/name
3. `All/Gainers/Losers` - Filter stock list
4. `Stock Card` - Click to view StockDetail
5. `Add to Watchlist (◇/◆)` - Toggle watchlist
6. `Get AI Rec` - Load AI recommendation
7. `Buy Now` - Quick purchase (opens order flow)

### **StockDetail.tsx** - OKX-Style Trading Interface
**Current Functionalities:**
- ✅ OKX-style price chart with 6 timeframes (15m, 1H, 4H, 1D, 1W, 1M)
- ✅ Large price display like crypto exchanges
- ✅ High/Low/Volume stats
- ✅ **AI Analysis Section** with:
  - Recommendation badge (BUY/SELL/HOLD)
  - Confidence percentage
  - Target price prediction
  - Time horizon
  - Key reasons (4 bullet points)
  - Technical signals (RSI, MACD, Moving Avg, Volume)
  - Fundamental factors (4 points)
  - Risk considerations (4 points)
- ✅ Key financial metrics (P/E, EPS, Market Cap, Dividend)
- ✅ Risk profile with beta, volatility, Sharpe ratio
- ✅ Company info and news
- ✅ **OKX-Style Trading Panel** with Buy/Sell buttons

**Buttons & Actions:**
1. `Back (←)` - Return to Markets
2. `Watchlist (◇/◆)` - Toggle watchlist
3. `Timeframe buttons` (15m-1M) - Change chart period
4. `Buy {SYMBOL}` - Execute buy order (green button)
5. `Sell {SYMBOL}` - Execute sell order (red button)

### **Watchlist.tsx** - Saved Stocks
**Current Functionalities:**
- ✅ List of saved stocks
- ✅ Real-time price updates
- ✅ Remove from watchlist
- ✅ Click to view details

---

## 💼 PORTFOLIO TAB

### **Portfolio.tsx** - Holdings Overview
**Current Functionalities:**
- ✅ Current holdings list (Stocks, Bonds)
- ✅ Profit/Loss summary with % badge
- ✅ Tax summary (taxable income, estimated tax)
- ✅ Performance tracking
- ✅ Pull-to-refresh

**Buttons & Actions:**
1. `Back (←)` - Return to previous screen
2. `Holding Card` - Navigate to HoldingDetail
3. `Refresh` - Pull to refresh data

### **HoldingDetail.tsx** - Individual Position
**Current Functionalities:**
- ✅ Detailed position view
- ✅ Performance metrics
- ✅ Trade history

---

## 👤 PROFILE TAB

### **Profile.tsx** - Account Hub
**Current Functionalities:**
- ✅ User information display
- ✅ Navigation to sub-pages
- ✅ Account settings

**Sub-Pages:**
1. **Wallet.tsx** - Deposit/Withdraw funds
2. **AIAssistant.tsx** - Chat with AI advisor
3. **EducationalContent.tsx** - Learning resources
4. **NotificationCenter.tsx** - Alerts and messages
5. **CustomerSupport.tsx** - Help & support
6. **Settings.tsx** - App preferences
7. **AccountSetup.tsx** - Account configuration
8. **KYCUpload.tsx** - Identity verification
9. **RiskProfile.tsx** - Risk assessment

---

## 🔐 AUTHENTICATION SCREENS

### **Login.tsx**
- ✅ Email/password login
- ✅ Remember me checkbox
- ✅ Link to Register
- ✅ Link to ForgotPassword

### **Register.tsx**
- ✅ Create new account
- ✅ Email verification required

### **ForgotPassword.tsx**
- ✅ Password reset flow

### **OTPVerification.tsx**
- ✅ 2FA code entry

---

## 🛠️ UTILITY SCREENS

### **Onboarding.tsx**
- ✅ First-time user walkthrough
- ✅ Feature highlights

### **Splash.tsx**
- ✅ App loading screen

### **FeatureWalkthrough.tsx**
- ✅ Interactive feature tour

---

## 📝 TRADING FLOW SCREENS

### **TradeOrder.tsx** - Order Entry
**Current Functionalities:**
- ✅ Order type selection (Market/Limit)
- ✅ Quantity input
- ✅ Price input (for limit orders)
- ✅ Order preview

**Buttons & Actions:**
1. `Market/Limit` - Toggle order type
2. `Quantity +/-` - Adjust shares
3. `Preview Order` - Navigate to ReviewOrder
4. `Cancel` - Return to previous screen

### **ReviewOrder.tsx** - Order Confirmation
**Current Functionalities:**
- ✅ Order summary display
- ✅ Cost breakdown
- ✅ Fees calculation
- ✅ Final confirmation

**Buttons & Actions:**
1. `Confirm & Place Order` - Execute trade
2. `Cancel` - Return to TradeOrder
3. `Edit` - Return to modify order

### **OrderStatus.tsx** - Execution Tracking
**Current Functionalities:**
- ✅ Order status display
- ✅ Execution details
- ✅ Order history

---

## 💰 WALLET & PAYMENTS

### **Wallet.tsx** - Money Management
**Current Functionalities:**
- ✅ Balance display
- ✅ M-Pesa deposit
- ✅ Withdrawal requests
- ✅ Transaction history

**Buttons & Actions:**
1. `Deposit via M-Pesa` - Initiate deposit
2. `Withdraw Funds` - Request withdrawal
3. `Transaction Item` - View details

---

## 🤖 AI FEATURES

### **AIAssistant.tsx** - Trading Advisor
**Current Functionalities:**
- ✅ Chat interface with AI
- ✅ Stock analysis requests
- ✅ Market insights
- ✅ Educational responses

**Buttons & Actions:**
1. `Send Message` - Submit query
2. `Suggested Question` - Quick ask
3. `Clear Chat` - Reset conversation

---

## 📚 EDUCATIONAL CONTENT

### **EducationalContent.tsx**
**Current Functionalities:**
- ✅ Learning modules
- ✅ Trading tutorials
- ✅ Market concepts

### **News.tsx**
**Current Functionalities:**
- ✅ Market news feed
- ✅ Stock-specific news
- ✅ Analysis articles

---

## ⚙️ SETTINGS & SUPPORT

### **Settings.tsx**
**Current Functionalities:**
- ✅ Notification preferences
- ✅ Display settings
- ✅ Security options
- ✅ Language selection

### **CustomerSupport.tsx**
**Current Functionalities:**
- ✅ Contact methods (Phone, Email, Chat)
- ✅ FAQ section
- ✅ Submit ticket

**Buttons & Actions:**
1. `Call Support` - Initiate phone call
2. `Email Support` - Open email client
3. `Live Chat` - Start chat session

### **NotificationCenter.tsx**
**Current Functionalities:**
- ✅ Notification list
- ✅ Mark as read
- ✅ Filter by type

---

## 🎯 ONBOARDING & SETUP

### **ChooseBroker.tsx**
**Current Functionalities:**
- ✅ Broker selection
- ✅ Account linking

### **AccountSetup.tsx**
**Current Functionalities:**
- ✅ Personal information
- ✅ Bank details
- ✅ Tax information

### **KYCUpload.tsx**
**Current Functionalities:**
- ✅ Document upload
- ✅ Identity verification
- ✅ Photo capture

### **RiskProfile.tsx**
**Current Functionalities:**
- ✅ Risk assessment questionnaire
- ✅ Investment goals
- ✅ Profile recommendation

---

## 📦 FRACTIONAL SHARES

### **FractionalShares.tsx**
**Current Functionalities:**
- ✅ Fractional trading explanation
- ✅ Benefits overview
- ✅ How it works

---

## 🎨 RECENTLY ADDED FEATURES

### ✅ OKX-Style Enhancements (Latest)
1. **Buy/Sell on Chart** - Direct trading from StockDetail
2. **Detailed AI Analysis** - Complete breakdown with reasons
3. **Professional Trading UI** - Like crypto exchanges
4. **Mobile-Optimized** - All content fits on screen
5. **Compact Market Summary** - No horizontal scrolling
6. **Better Icons** - Clear, professional symbols

---

## 📋 SUMMARY OF ALL INTERACTIVE ELEMENTS

### Global Navigation
- Bottom Tab Bar (4 tabs)
- Floating AI Button (on most screens)
- Header Back Buttons
- Header Notification Bell

### Total Button Count: **~150+** across all screens
### Total Screens: **34**
### Main User Flows: **8**
  1. Authentication (Login → Register → OTP)
  2. Onboarding (Splash → Walkthrough → Setup)
  3. Trading (Markets → StockDetail → TradeOrder → ReviewOrder → OrderStatus)
  4. Portfolio Management (Portfolio → HoldingDetail)
  5. Money Management (Wallet → Deposit/Withdraw)
  6. AI Assistance (Home → AIAssistant)
  7. Education (EducationalContent → News)
  8. Support (Settings → CustomerSupport → NotificationCenter)

---

## 🚀 NEXT IMPLEMENTATION PRIORITIES

Based on your request, here's what should be implemented next:

### High Priority
1. **Order Book Display** - Like OKX depth chart
2. **Limit/Market Order Forms** - Detailed order entry on chart
3. **Real-time Order Updates** - Live order status
4. **Position Management** - Edit/close positions from chart
5. **Trading History** - Recent trades view on chart

### Medium Priority
6. **Portfolio Charts** - Performance visualization
7. **Advanced Chart Tools** - Drawing tools, indicators
8. **Price Alerts** - Set custom alerts
9. **Stock Comparison** - Compare multiple stocks
10. **Tax Reports** - Generate tax documents

### Future Enhancements
11. **Social Trading** - Follow other traders
12. **Backtesting** - Test strategies
13. **Options Trading** - If applicable
14. **Crypto Integration** - Expand to crypto assets

---

*Generated: October 2025*
*Version: SDK 54*
*Platform: React Native / Expo*

