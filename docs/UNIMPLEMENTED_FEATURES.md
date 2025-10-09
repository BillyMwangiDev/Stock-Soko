# Unimplemented Features & Buttons

Complete inventory of features that are either:
-  **Not Implemented** - Shows alert or does nothing
-  **Partially Implemented** - UI works but uses mock data
-  **Mock Data Only** - Functional UI but no real backend integration

Last Updated: 2025-10-09

---

## Settings Screen

### Account Section

| Feature | Status | Current Behavior | Implementation Needed |
|---------|--------|------------------|----------------------|
| **Edit Profile** Button |  Not Implemented | Navigates to EditProfile screen | Full profile editing with API integration |
| **Payment Methods** |  Partially Implemented | Shows M-Pesa and Card options | Real payment gateway integration |
| **Change Broker** |  Working | Opens broker selection, connects to NSE Direct | OAuth for 3rd party brokers |
| **KYC Status** |  Info Only | Shows "Verified" status | Document upload and verification workflow |

### Security Section

| Feature | Status | Current Behavior | Implementation Needed |
|---------|--------|------------------|----------------------|
| **Change Password** |  Working | Full change password flow with API | None (working) |
| **Biometric Authentication** |  UI Only | Toggle works, shows alert | Actual biometric integration (Face ID/Fingerprint) |
| **Two-Factor Authentication** |  Partially Implemented | Shows setup screen | Real OTP generation and verification |

### Preferences Section

| Feature | Status | Current Behavior | Implementation Needed |
|---------|--------|------------------|----------------------|
| **Push Notifications** |  UI Only | Toggle saves preference | Register device token, send notifications |
| **Dark Mode** |  UI Only | Toggle saves, shows "future update" alert | Implement theme switching throughout app |
| **Language** |  Partial | English/Swahili available, others "Coming Soon" | Add French, Arabic, Portuguese translations |

### Support & Legal

| Feature | Status | Current Behavior | Implementation Needed |
|---------|--------|------------------|----------------------|
| **Help & Support** |  Working | Opens FAQ and contact options | None (working) |
| **Privacy Policy** |  Not Implemented | Does nothing | Create and display privacy policy |
| **Terms of Service** |  Not Implemented | Does nothing | Create and display terms |
| **About** |  Info Only | Shows version and description | None needed (informational only) |
| **Delete Account** |  Partial | Shows confirmation screen | Backend account deletion API |

---

## Profile Screen

| Feature | Status | Current Behavior | Implementation Needed |
|---------|--------|------------------|----------------------|
| **Edit Profile** Photo |  Not Implemented | Shows placeholder avatar | Image picker, upload to server |
| **Notification Center** |  Mock Data | Shows sample notifications | Real notification backend |
| **Price Alerts** |  Mock Data | Shows 2 sample alerts | Real-time price monitoring system |
| **Educational Content** |  Working | Shows lessons by level | Add quiz system, progress tracking |
| **Fractional Shares** |  Mock Data | Shows sample fractional holdings | Fractional trading API |
| **Customer Support Live Chat** |  Coming Soon | Shows "Chat Coming Soon" placeholder | WebSocket real-time chat |

---

## Trading & Orders

| Feature | Status | Current Behavior | Implementation Needed |
|---------|--------|------------------|----------------------|
| **Advanced Order Types** |  Partial UI | Shows Stop, Stop-Limit, Trailing-Stop options | Backend support for advanced orders |
| **Order Book** |  Mock Data | Shows sample bids/asks on StockDetail | Real-time order book from NSE |
| **Trade Execution** |  Working | Places orders via API | None (working) |
| **Order History** |  Mock Data | Shows sample trade history | Link to actual user trade history |
| **Bracket Orders** |  Not Implemented | Not available | Take-profit + stop-loss combined orders |

---

## Portfolio & Holdings

| Feature | Status | Current Behavior | Implementation Needed |
|---------|--------|------------------|----------------------|
| **Portfolio Overview** |  Working | Real P/L calculation from API | None (working) |
| **Holdings Detail** |  Working | Shows per-stock analysis | None (working) |
| **Trade History** |  Mock Data | Shows sample trades | Connect to real trade database |
| **Tax Reports** |  Mock Data | Shows sample CGT calculations | Real tax calculation with user trades |
| **Performance Charts** |  Partial | Shows portfolio chart | Historical performance tracking |
| **Dividend Tracker** |  Mock Data | Shows sample dividend history | Real dividend payment tracking |
| **Export Reports** |  Not Implemented | PDF/Excel buttons do nothing | Generate downloadable reports |

---

## Wallet & Payments

| Feature | Status | Current Behavior | Implementation Needed |
|---------|--------|------------------|----------------------|
| **M-Pesa Deposit** |  Partial | Simulates STK push | Real M-Pesa API integration (Daraja API) |
| **M-Pesa Withdrawal** |  Partial | Simulates withdrawal | Real M-Pesa B2C API |
| **Transaction History** |  Mock Data | Shows sample transactions | Real transaction database |
| **Card Payments** |  Not Implemented | Shows "Coming Soon" | Payment gateway (Stripe/Paystack) |
| **Bank Transfer** |  Not Implemented | Not available | Bank integration or manual approval |

---

## Markets & Research

| Feature | Status | Current Behavior | Implementation Needed |
|---------|--------|------------------|----------------------|
| **Stock Search** |  Working | Searches 20 NSE stocks | None (working) |
| **Stock Detail** |  Working | Shows comprehensive analysis | None (working) |
| **Market News** |  Mock Data | Shows sample news articles | Real news API integration |
| **Watchlist** |  Working | Add/remove stocks | None (working) |
| **Screener** |  Not Implemented | Not available | Multi-criteria stock screener |
| **Compare Stocks** |  Not Implemented | Not available | Side-by-side comparison tool |

---

## AI Features

| Feature | Status | Current Behavior | Implementation Needed |
|---------|--------|------------------|----------------------|
| **AI Recommendations** |  Working | Generates 3 recommendations | None (working with analysis framework) |
| **AI Chat Assistant** |  Partial | Basic Q&A with OpenRouter | Enhance context awareness, conversation history |
| **AI Stock Analysis** |  Working | Comprehensive fundamental + technical | None (working) |
| **Sentiment Analysis** |  Partial | Basic sentiment on news | Advanced NLP sentiment analysis |
| **Portfolio Optimization** |  Not Implemented | Not available | AI-powered portfolio rebalancing suggestions |

---

## Authentication & Onboarding

| Feature | Status | Current Behavior | Implementation Needed |
|---------|--------|------------------|----------------------|
| **Email/Password Login** |  Working | Full JWT auth | None (working) |
| **Registration** |  Working | Creates user account | None (working) |
| **Email Verification** |  Partial | Shows OTP screen | Real email sending service |
| **Forgot Password** |  Partial | Shows reset screen | Email password reset flow |
| **Social Login** |  Not Implemented | Not available | Google/Apple OAuth |
| **Biometric Login** |  Not Implemented | Not available | Face ID/Fingerprint integration |

---

## Data & Backend

| Feature | Status | Current Behavior | Implementation Needed |
|---------|--------|------------------|----------------------|
| **Real-time Prices** |  Simulated | Prices update on refresh | WebSocket for live prices |
| **Historical Data** |  Generated | Mock sparkline data | Real OHLCV historical data |
| **NSE API Integration** |  Not Implemented | Using sample data | Connect to NSE data feed |
| **CDS Integration** |  Partial | Shows CDS number | Real CDS account linking |
| **Database Migrations** |  Not Implemented | Manual DB setup | Alembic migrations |

---

## Broker Integration

| Feature | Status | Current Behavior | Implementation Needed |
|---------|--------|------------------|----------------------|
| **NSE Direct** |  Working | Immediate connection | None (working) |
| **ABC Capital** |  OAuth Ready | Shows authorization flow | Complete OAuth callback |
| **Genghis Capital** |  OAuth Ready | Shows authorization flow | Complete OAuth callback |
| **Standard Investment** |  OAuth Ready | Shows authorization flow | Complete OAuth callback |
| **ICEA LION** |  OAuth Ready | Shows authorization flow | Complete OAuth callback |
| **Sterling Capital** |  OAuth Ready | Shows authorization flow | Complete OAuth callback |
| **Broker Sync** |  Not Implemented | Not available | Sync holdings from external broker |

---

## Educational Content

| Feature | Status | Current Behavior | Implementation Needed |
|---------|--------|------------------|----------------------|
| **Lessons** |  Working | 12 lessons across 3 levels | None (working) |
| **Progress Tracking** |  Not Implemented | Not available | Save user progress in database |
| **Quizzes** |  Data Ready | Quiz questions defined but not displayed | Build quiz UI and grading |
| **Certificates** |  Not Implemented | Not available | Generate completion certificates |
| **Learning Paths** |  Data Ready | Paths defined but not exposed | Build learning path UI |
| **Formula Calculators** |  Not Implemented | Not available | Interactive P/E, ROE, DCF calculators |

---

## Alerts & Notifications

| Feature | Status | Current Behavior | Implementation Needed |
|---------|--------|------------------|----------------------|
| **Price Alerts** |  Mock Data | Shows sample alerts | Real-time price monitoring |
| **Push Notifications** |  Not Implemented | Not available | Expo push notifications |
| **Email Alerts** |  Not Implemented | Not available | Email service integration |
| **SMS Alerts** |  Not Implemented | Not available | SMS gateway integration |
| **News Alerts** |  Not Implemented | Not available | News trigger system |

---

## Advanced Features (Future)

| Feature | Status | Implementation Needed |
|---------|--------|----------------------|
| **Options Trading** |  Not Implemented | If/when NSE offers derivatives |
| **Forex Trading** |  Not Implemented | Multi-currency accounts |
| **Crypto Integration** |  Not Implemented | Link to crypto exchanges |
| **Peer-to-Peer Trading** |  Not Implemented | P2P share transfer |
| **Robo-Advisor** |  Not Implemented | Automated portfolio management |
| **Margin Trading** |  Not Implemented | Leverage and margin accounts |
| **Short Selling** |  Not Implemented | If/when NSE allows |
| **API Access** |  Not Implemented | Programmatic trading API |

---

## Testing & Quality

| Feature | Status | Implementation Needed |
|---------|--------|----------------------|
| **Unit Tests** |  Partial | Only 11 backend tests | Expand to 80%+ coverage |
| **Integration Tests** |  Minimal | Basic E2E tests | Comprehensive integration suite |
| **UI Tests** |  Not Implemented | None | React Native Testing Library |
| **Load Testing** |  Not Implemented | None | Performance benchmarks |
| **Security Audit** |  Basic | Document exists | Professional security audit |

---

## Summary Statistics

- **Total Features Inventoried**: 85+
- ** Fully Working**: 15 (18%)
- ** Partially Implemented**: 32 (38%)
- ** Mock Data Only**: 18 (21%)
- ** Not Implemented**: 20 (23%)

---

## Priority Recommendations

### High Priority (Core Functionality)
1. **Real-time Price Updates** - WebSocket integration
2. **M-Pesa Integration** - Actual Daraja API
3. **NSE Data Feed** - Real stock data
4. **Order Book** - Live market depth
5. **Email Verification** - SendGrid/AWS SES

### Medium Priority (Enhanced Features)
1. **Push Notifications** - Expo push
2. **Trade History** - Real database
3. **Tax Reports** - Accurate CGT calculations
4. **Quiz System** - Interactive learning
5. **Progress Tracking** - User education progress

### Low Priority (Nice to Have)
1. **Dark Mode** - Theme switching
2. **Social Login** - OAuth providers
3. **Export Reports** - PDF/Excel generation
4. **Formula Calculators** - Interactive tools
5. **Certificates** - Learning completion

---

## Implementation Effort Estimates

### Quick Wins (1-2 days each)
- Push notifications setup
- Email sending service
- Dark mode theme
- Quiz UI
- Progress tracking database

### Medium Effort (3-7 days each)
- Real-time WebSocket prices
- M-Pesa Daraja API integration
- Tax report generation
- Formula calculators
- PDF export

### Large Effort (2-4 weeks each)
- NSE data feed integration
- Real order book system
- OAuth broker integration
- Biometric authentication
- Advanced order types backend

---

## Notes

- This list focuses on user-facing features
- Backend infrastructure tasks not included
- Estimates assume one developer
- Some features depend on external providers (NSE, M-Pesa)
- Regulatory compliance may affect timeline

---

**For detailed implementation plans, see:**
- `docs/DEVELOPER-QUICKSTART.md`
- `docs/API-REFERENCE.md`
- `docs/TESTING-GUIDE.md`