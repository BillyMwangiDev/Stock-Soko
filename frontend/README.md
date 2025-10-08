# Stock Soko Frontend

A modern, feature-rich React Native application for stock trading in African markets, built with Expo.

## 🎨 Features

### Implemented Screens (14 Total)

1. **Splash** - App launch screen with branding
2. **Onboarding** - 3-slide introduction for new users
3. **Home/Dashboard** - Market overview with top movers
4. **Markets** - Search, filter, and trade stocks
5. **Stock Detail** - Detailed stock information with charts
6. **Trade Order** - Place market or limit orders
7. **Review Order** - Confirm order before submission
8. **Order Status** - View order execution status
9. **Portfolio** - Track holdings and performance
10. **News** - Market news with sentiment analysis
11. **Profile/Auth** - Login, register, and account management
12. **AI Assistant** - Chat interface for stock insights
13. **Settings** - Comprehensive app settings
14. **Wallet** - Deposit, withdrawal, and transaction history

### UI Components

- **Button** - Multi-variant with loading states
- **Card** - Flexible container component
- **Input** - Form input with validation
- **Badge** - Status and category labels
- **EmptyState** - Placeholder for empty content
- **LoadingState** - Loading indicators

### Theme System

- **Colors** - Grey aesthetic palette
- **Typography** - Consistent text styles
- **Spacing** - 8px grid system
- **Design Tokens** - Centralized styling

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm start

# Run on specific platform
npm run ios      # iOS Simulator
npm run android  # Android Emulator
npm run web      # Web browser
```

### Environment Variables

Create a `.env` file in the frontend directory:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
```

## 📱 Screen Navigation

Current structure uses bottom tabs:
- Home
- Markets
- Portfolio
- News
- Profile

Additional screens accessible through user actions:
- Stock Detail (from Markets)
- Trade Flow (from Stock Detail or Markets)
- AI Assistant (can be added to tabs)
- Settings (from Profile)
- Wallet (from Profile)

## 🎨 Design System

### Color Palette

```typescript
// Background
primary: '#0a0e14'
secondary: '#111827'
tertiary: '#1f2937'
elevated: '#374151'

// Text
primary: '#f9fafb'
secondary: '#e5e7eb'
tertiary: '#9ca3af'

// Accent
primary: '#10b981' (green)
success: '#10b981'
error: '#ef4444'
warning: '#f59e0b'
```

### Typography Scale

```typescript
xs: 12px
sm: 14px
base: 16px
lg: 18px
xl: 20px
2xl: 24px
3xl: 30px
4xl: 36px
```

## 🔧 Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── EmptyState.tsx
│   │   ├── LoadingState.tsx
│   │   └── index.ts
│   ├── screens/          # App screens
│   │   ├── Splash.tsx
│   │   ├── Onboarding.tsx
│   │   ├── Home.tsx
│   │   ├── Markets.tsx
│   │   ├── StockDetail.tsx
│   │   ├── TradeOrder.tsx
│   │   ├── ReviewOrder.tsx
│   │   ├── OrderStatus.tsx
│   │   ├── Portfolio.tsx
│   │   ├── News.tsx
│   │   ├── Profile.tsx
│   │   ├── AIAssistant.tsx
│   │   ├── Settings.tsx
│   │   ├── Wallet.tsx
│   │   └── index.ts
│   ├── theme/            # Design system
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── index.ts
│   ├── api/              # API client
│   │   └── client.ts
│   └── store/            # State management
│       └── auth.ts
├── App.tsx               # Root component
├── package.json
└── tsconfig.json
```

## 🔌 API Integration

The app integrates with the FastAPI backend:

- **Markets** - `/markets`, `/markets/recommendation`
- **Trading** - `/trades/orders`
- **Portfolio** - `/ledger/positions`, `/ledger/balance`
- **Watchlist** - `/watchlist`
- **Payments** - `/payments/mpesa/deposit`
- **Auth** - `/auth/register`, `/auth/login`

## 📱 Features by Screen

### Markets
- ✅ Search stocks by symbol/name
- ✅ Filter by gainers/losers
- ✅ Quick trade panel
- ✅ AI recommendations
- ✅ Add to watchlist

### Stock Detail
- ✅ Price chart (placeholder for Victory Native)
- ✅ Tabs: Overview, Fundamentals, News
- ✅ Buy/Sell buttons
- ✅ Watchlist toggle
- ✅ Set price alerts

### Trade Flow
- ✅ Market and limit orders
- ✅ Cost breakdown with fees
- ✅ Order review screen
- ✅ Order status tracking
- ✅ Success/failure handling

### Portfolio
- ✅ Total portfolio value
- ✅ Unrealized P/L
- ✅ Holdings with detailed stats
- ✅ Watchlist management
- ✅ Pull-to-refresh

### Wallet
- ✅ Balance overview
- ✅ M-Pesa deposits
- ✅ Withdrawal requests
- ✅ Transaction history
- ✅ Tab navigation

### AI Assistant
- ✅ Chat interface
- ✅ Suggested questions
- ✅ Message history
- ✅ Typing indicators

### Settings
- ✅ Profile management
- ✅ Security settings
- ✅ Preferences (notifications, theme)
- ✅ Support links
- ✅ Account actions

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Core screens
- ✅ UI components
- ✅ Theme system
- ✅ Basic API integration

### Phase 2 (Next)
- ⏳ Stack navigation setup
- ⏳ Victory Native charts
- ⏳ OTP verification
- ⏳ KYC upload

### Phase 3 (Future)
- ⏳ Real-time price updates
- ⏳ Push notifications
- ⏳ Dark/light mode toggle
- ⏳ Swahili language support

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

## 📚 Documentation

- [Component Library](src/components/README.md)
- [Implementation Status](../docs/IMPLEMENTATION-STATUS.md)
- [UI Improvements Summary](../docs/UI-IMPROVEMENTS-SUMMARY.md)

## 🤝 Contributing

1. Follow the established coding style
2. Use TypeScript for all new code
3. Follow the design system
4. Test on both iOS and Android
5. Update documentation

## 📄 License

Proprietary - Stock Soko Team

## 📧 Support

For support, email support@stocksoko.com

---

**Built with ❤️ using React Native & Expo**

