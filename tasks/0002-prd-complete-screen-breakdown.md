# Stock Soko App - Complete Screen & Feature Breakdown

## 🎨 Design System Overview
- **Theme**: Dark fintech aesthetic with OKX/Binance-inspired UI
- **Colors**: 
  - Deep Blue (#0B3D91)
  - Emerald Green (#16A34A) 
  - Gold Accent (#FBBF24)
  - Dark Charcoal BG (#0D1117)
- **Typography**: 
  - Poppins SemiBold (headlines)
  - Inter Regular (body)
  - Roboto Mono (numbers)
- **Components**: 
  - Glassmorphic cards
  - Rounded-pill buttons
  - 20px border radius
  - Gold shadow accents

---

## 📱 Screen-by-Screen Feature Breakdown

### 1. Splash Screen
- **Purpose**: Brand introduction & app loading
- **Features**:
  - Full-screen Nairobi skyline background at dusk
  - Centered animated Stock Soko logo with glow effect
  - Tagline: "Invest Smartly in Africa's Markets"
  - Auto-transitions to Onboarding after 2-3 seconds

---

### 2. Onboarding Screen (3 Slides)
- **Slide 1**: "Trade Kenyan Stocks Instantly"
  - Illustration: Investor with phone + Nairobi skyline
  - Text: Minimal brokerage fees
- **Slide 2**: "AI-Powered Research & Insights"
  - Illustration: AI robot analyzing stock charts
  - Text: Smart recommendations
- **Slide 3**: "Deposit & Withdraw via M-Pesa"
  - Illustration: Kenyan professional trading
  - Text: Seamless mobile money integration
- **Buttons**:
  - "Next" (pill button, emerald green)
  - "Skip" (subtle text button)
  - "Get Started" (final slide, deep blue filled button)

---

### 3. Risk Profile Screen
- **Purpose**: Assess investor risk tolerance
- **Features**:
  - Stepper layout with progress bar (5 questions)
  - Visual feedback
  - Questions cover: investment goals, time horizon, risk appetite, experience level, loss tolerance
  - Color scheme: Emerald on charcoal
- **Buttons**:
  - "Next" (after each question)
  - "Back" (to previous question)
  - "Complete Profile" (final step)

---

### 4. Broker Selection Screen
- **Purpose**: Choose NSE broker partner
- **Features**:
  - Card list of integrated brokers:
    - Faida Investment Bank
    - Dyer & Blair
    - Genghis Capital
  - Each card shows: Logo, fees, ratings, processing time
  - Filter/sort options
- **Buttons**:
  - "Select Broker →" (on each card)
  - "Compare Brokers" (top right)

---

### 5. Account Creation Screen
- **Purpose**: User registration
- **Features**:
  - Form inputs: Full Name, Email, Phone Number
  - M-Pesa number verification field
  - Illustration: Phone + ID card verification art
  - Terms & conditions checkbox
- **Buttons**:
  - "Verify Phone Number" (sends OTP)
  - "Continue" (after verification)
  - "Back" (to broker selection)

---

### 6. KYC Upload Screen
- **Purpose**: Document verification
- **Features**:
  - 3-step upload cards:
    1. National ID (front & back)
    2. Proof of Address
    3. Selfie verification
  - Progress bar showing completion
  - Camera/gallery picker
  - Document preview before upload
- **Buttons**:
  - "Take Photo" / "Choose from Gallery"
  - "Upload" (per document)
  - "Submit for Review" (final)

---

### 7. Wallet Setup Screen
- **Purpose**: Link M-Pesa wallet
- **Features**:
  - M-Pesa logo button (Safaricom branding)
  - Info text: "Securely connect via Safaricom"
  - Test payment popup (KES 1 verification)
  - Security badges
- **Buttons**:
  - "Link M-Pesa Wallet"
  - "Test Connection"
  - "Complete Setup"

---

### 8. Home Screen (Main Dashboard)
- **Header**: "Karibu, [UserName]" + notification bell icon
- **Cards**:
  1. Portfolio Summary Card:
     - Total value (KES)
     - Today's P&L (% and amount)
     - Quick stats: Holdings, Cash Balance
  2. AI Recommendations Card:
     - 2-3 stock suggestions with reasoning
     - "View All" link
  3. Quick Actions Card:
     - Trade button
     - Deposit button
     - Learn button
  4. Market Overview:
     - NSE 20 Index chart
     - Top gainers/losers ticker
- **Floating Button**: AI Assistant (bottom right, emerald glow)
- **Bottom Tabs**: Home | Markets | Portfolio | News | Profile

---

### 9. Markets Screen
- **Header**: Search bar + filter icon
- **Sections**:
  1. Market Overview:
     - NSE 20 Index card
     - Top Gainers (3 stocks)
     - Top Losers (3 stocks)
     - Sector performance chips
  2. Stock List:
     - Scrollable cards showing:
       - Ticker symbol
       - Company name
       - Current price (KES)
       - % change (color-coded)
       - Mini sparkline chart
- **Buttons**:
  - "Filter" (sector, price range, volume)
  - "Sort" (price, change %, volume)
  - Tap any stock → Stock Detail Screen

---

### 10. Stock Detail Screen
- **Header**: Stock name + ticker + watchlist star icon
- **Sections** (scrollable):
  1. Price Chart:
     - Interactive candlestick/line chart
     - Time range selector (1D, 1W, 1M, 3M, 1Y, All)
  2. Key Stats Card:
     - Open, High, Low, Close
     - Volume, Market Cap, P/E Ratio
  3. Fundamentals Card:
     - EPS, Dividend Yield, 52W High/Low
  4. News Feed Card:
     - Latest 3 news articles
     - "View All News" link
  5. About Company:
     - Brief description
     - Sector, Industry
- **Buttons**:
  - "Buy" (fixed bottom, emerald green)
  - "Sell" (if holding, red)
  - "Add to Watchlist" (star icon)
  - "Set Alert" (bell icon)

---

### 11. Trade Order Screen (Modal)
- **Purpose**: Place buy/sell order
- **Features**:
  - Stock name + current price header
  - Order type selector: Market / Limit / Stop Loss
  - Price input (for limit orders)
  - Quantity input (with fractional share toggle)
  - Slider for quick quantity selection
  - Bottom summary card:
    - Total cost
    - Brokerage fees
    - Available balance
    - Estimated total
- **Buttons**:
  - "Review Order" (emerald green)
  - "Cancel" (outline)

---

### 12. Review Order Screen
- **Purpose**: Confirm trade details
- **Features**:
  - Summary card showing:
    - Stock ticker + name
    - Order type
    - Quantity
    - Price
    - Total cost breakdown
    - Fees
  - Confirmation checkbox
- **Buttons**:
  - "Edit" (back to Trade Order)
  - "Confirm Order" (deep blue, requires PIN/biometric)

---

### 13. Order Status Screen
- **Purpose**: Trade confirmation
- **Features**:
  - Success animation (checkmark + confetti)
  - Order details summary
  - Estimated execution time
  - Order ID
- **Buttons**:
  - "Go to Portfolio"
  - "Back to Markets"
  - "View Order History"

---

### 14. Portfolio Screen
- **Header**: Total portfolio value + P&L
- **Sections**:
  1. Performance Graph:
     - Line chart (1W, 1M, 3M, 1Y, All)
  2. Current Holdings:
     - Card per stock showing:
       - Ticker + name
       - Quantity
       - Current value
       - P&L (% and amount)
       - Mini chart
  3. Cash Balance Card:
     - Available cash
     - "Deposit" / "Withdraw" buttons
  4. Tax Summary Card:
     - Capital gains
     - Dividend income
     - "Download Report" button
- **Buttons**:
  - "Add Funds" (top right)
  - Tap any holding → Holding Detail Screen

---

### 15. Holding Detail Screen
- **Purpose**: Deep dive into specific holding
- **Features**:
  - Stock header with current stats
  - Performance chart
  - Transaction timeline:
    - Buy/sell history
    - Dividend payments
    - Corporate actions
  - Average cost basis
  - Total return calculation
  - Dividend tracker
- **Buttons**:
  - "Buy More"
  - "Sell"
  - "Set Price Alert"
  - "View Stock Details"

---

### 16. AI Assistant Screen
- **Purpose**: Conversational stock research
- **Features**:
  - Chat bubble interface (dark glass theme)
  - AI avatar (emerald glow)
  - Suggested prompts:
    - "Analyze [stock ticker]"
    - "Explain this chart pattern"
    - "What should I buy today?"
    - "Explain P/E ratio"
  - Voice input option
  - Chat history
- **Buttons**:
  - "Send" (message)
  - "Voice Input" (microphone icon)
  - "Clear Chat"

---

### 17. News Screen
- **Header**: Category tabs (Markets | Company | Economy | Education)
- **Features**:
  - Scrollable news feed
  - Each card shows:
    - Headline
    - Summary (2 lines)
    - Source logo
    - Timestamp
    - Related stock tickers (if applicable)
  - Pull-to-refresh
- **Buttons**:
  - Tap card → Full article view
  - "Bookmark" icon
  - "Share" icon

---

### 18. Education Screen
- **Purpose**: Learning hub
- **Sections**:
  1. Trading Basics:
     - Video lessons
     - Articles
     - Quizzes
  2. NSE 101:
     - How NSE works
     - Understanding stock types
     - Reading financial statements
  3. Advanced AI Insights:
     - Technical analysis
     - Portfolio strategies
     - Risk management
- **Features**:
  - Lesson cards with thumbnails
  - Progress tracking
  - Completion badges
- **Buttons**:
  - "Start Lesson"
  - "Continue Learning"
  - "Take Quiz"

---

### 19. Fractional Trading Screen
- **Purpose**: Explain fractional shares
- **Features**:
  - Pie chart demo showing share division
  - Example calculation
  - Benefits list
  - Walkthrough animation
- **Buttons**:
  - "Try Fractional Trading"
  - "Learn More"
  - "Skip"

---

### 20. Customer Support Screen
- **Tabs**: Chat | FAQs | Contact
- **Chat Tab**:
  - Live chat interface
  - Bot + human handoff
- **FAQs Tab**:
  - Searchable accordion list
  - Categories: Trading, Payments, Account, Technical
- **Contact Tab**:
  - Phone number
  - Email
  - Social media links
  - Office hours
- **Buttons**:
  - "Start Chat"
  - "Call Support"
  - "Email Us"

---

### 21. Notification Center Screen
- **Purpose**: Alert management
- **Features**:
  - List of notifications with colored tags:
    - Trade (blue)
    - Price Alert (gold)
    - News (green)
    - System (gray)
  - Timestamp
  - Read/unread status
  - Swipe to clear
- **Buttons**:
  - "Mark All as Read"
  - "Clear All"
  - Tap notification → Relevant screen

---

### 22. Profile Screen
- **Header**: Avatar + name + email
- **Sections**:
  1. Account Info:
     - Phone number
     - Linked broker
     - KYC status badge
  2. Security:
     - 2FA status
     - Biometric login
     - Change PIN
  3. Preferences:
     - Theme (dark/light)
     - Language
     - Notifications
  4. Legal:
     - Terms & Conditions
     - Privacy Policy
- **Buttons**:
  - "Edit Profile"
  - "View KYC Documents"
  - "Linked Broker Details"
  - "Logout" (red, bottom)

---

### 23. Settings Screen
- **Options**:
  - Theme: Toggle (dark/light)
  - Notifications: Granular controls (trades, price alerts, news, promotions)
  - Language: Dropdown (English, Swahili)
  - 2FA: Enable/disable toggle
  - Biometric Login: Toggle
  - Currency Display: KES/USD toggle
  - Data Usage: Reduce data mode
- **Buttons**:
  - Neon-style toggles
  - "Save Changes"
  - "Reset to Default"

---

## 🎯 Key Interaction Principles
- ✅ Clear CTAs on every screen
- ✅ Major trade actions one tap away
- ✅ Local currency (KES) displayed everywhere
- ✅ Seamless M-Pesa integration (no redirects)
- ✅ Floating AI Assistant button (global access)
- ✅ Education nudges for beginners
- ✅ Smooth animations (fade, slide up, spring easing)
- ✅ Haptic feedback on button presses
- ✅ Pull-to-refresh on list screens
- ✅ Swipe gestures for quick actions

---

## 📋 Implementation Status
- [ ] Update design system colors to match specification
- [ ] Implement all 23 screens
- [ ] Add haptic feedback
- [ ] Add pull-to-refresh to all list screens
- [ ] Add swipe gestures
- [ ] Implement smooth animations
- [ ] Add floating AI Assistant button
- [ ] Integrate M-Pesa payment flows
- [ ] Add glassmorphic card styles
- [ ] Implement all interaction principles

