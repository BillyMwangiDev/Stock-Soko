# Stock Soko - Mock Data Guide

**Last Updated**: October 9, 2025

## Overview

This document describes all mock data available in the application for testing and development purposes.

---

## Location

All mock data is centralized in: `frontend/src/mocks/`

### Files Structure

```
frontend/src/mocks/
 index.ts              # Central export file
 notifications.ts      # Notification mock data
 alerts.ts             # Price alert mock data
 news.ts               # News article mock data
 transactions.ts       # Transaction history mock data
 stocks.ts             # Stock market mock data
```

---

## Mock Data Types

### 1. Notifications (`notifications.ts`)

**Type**: `Notification`

**Fields**:
- `id`: Unique identifier
- `type`: 'trade' | 'news' | 'account'
- `title`: Notification title
- `message`: Notification message
- `timestamp`: Human-readable timestamp
- `read`: Boolean read status
- `ticker?`: Optional stock symbol
- `actionLabel?`: Optional action button text
- `priority?`: 'high' | 'medium' | 'low'

**Sample Data**: 8 notifications including:
- Order executions
- Price alerts
- Market updates
- M-Pesa confirmations
- KYC verifications
- Stop loss triggers

**Usage**:
```typescript
import { mockNotifications, Notification, NotificationType } from '../mocks';
```

---

### 2. Price Alerts (`alerts.ts`)

**Type**: `PriceAlert`

**Fields**:
- `id`: Unique identifier
- `symbol`: Stock symbol
- `targetPrice`: Alert trigger price
- `currentPrice`: Current stock price
- `condition`: 'above' | 'below'
- `active`: Boolean active status
- `createdAt`: Creation date

**Sample Data**: 4 price alerts for SCOM, KCB, EQTY, EABL

**Usage**:
```typescript
import { mockAlerts, PriceAlert } from '../mocks';
```

---

### 3. News Articles (`news.ts`)

**Type**: `NewsArticle`

**Fields**:
- `id`: Unique identifier
- `title`: Article headline
- `summary`: Brief article summary
- `source`: News source name
- `url?`: Optional article URL
- `publishedAt`: Publication timestamp
- `imageUrl?`: Optional image URL
- `category`: 'market' | 'company' | 'economy' | 'technology'
- `relatedStocks?`: Array of related stock symbols

**Sample Data**: 8 news articles covering:
- Market updates
- Company earnings
- Economic indicators
- Technology announcements

**Usage**:
```typescript
import { mockNews, NewsArticle } from '../mocks';
```

---

### 4. Transactions (`transactions.ts`)

**Type**: `Transaction`

**Fields**:
- `id`: Unique identifier
- `type`: 'deposit' | 'withdrawal' | 'buy' | 'sell' | 'dividend' | 'fee'
- `amount`: Transaction amount (negative for debits)
- `currency`: Currency code (KES)
- `description`: Transaction description
- `timestamp`: Transaction timestamp
- `status`: 'completed' | 'pending' | 'failed'
- `reference?`: Optional reference number
- `symbol?`: Optional stock symbol
- `quantity?`: Optional share quantity
- `price?`: Optional price per share

**Sample Data**: 10 transactions including:
- M-Pesa deposits and withdrawals
- Stock buy and sell orders
- Dividend payments
- Transaction fees

**Usage**:
```typescript
import { mockTransactions, Transaction } from '../mocks';
```

---

### 5. Stocks (`stocks.ts`)

**Type**: `Stock`

**Fields**:
- `symbol`: Stock ticker symbol
- `name`: Company name
- `price`: Current price
- `change`: Price change
- `changePercent`: Percentage change
- `volume`: Trading volume
- `marketCap`: Market capitalization
- `pe?`: P/E ratio
- `eps?`: Earnings per share
- `dividendYield?`: Dividend yield percentage
- `high52Week?`: 52-week high
- `low52Week?`: 52-week low
- `sector`: Industry sector

**Sample Data**: 10 NSE stocks:
1. SCOM - Safaricom PLC
2. KCB - KCB Group PLC
3. EQTY - Equity Group Holdings
4. EABL - East African Breweries
5. COOP - Co-operative Bank
6. BAT - British American Tobacco Kenya
7. ABSA - Absa Bank Kenya
8. SCBK - Standard Chartered Bank Kenya
9. BAMB - Bamburi Cement Limited
10. NCBA - NCBA Group PLC

**Usage**:
```typescript
import { mockStocks, Stock } from '../mocks';
```

---

## Importing Mock Data

### Single Import
```typescript
import { mockNotifications } from '../mocks/notifications';
```

### Multiple Imports
```typescript
import { mockNotifications, mockNews, mockTransactions } from '../mocks';
```

### Type Imports
```typescript
import type { Notification, NewsArticle, Transaction } from '../mocks';
```

---

## Using Mock Data in Screens

### Example: NotificationCenter

```typescript
import { mockNotifications, Notification } from '../mocks';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    setNotifications(mockNotifications);
  }, []);

  // Use notifications state...
}
```

### Example: News Screen

```typescript
import { mockNews, NewsArticle } from '../mocks';

export default function News() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);

  useEffect(() => {
    setArticles(mockNews);
  }, []);

  // Use articles state...
}
```

---

## Backend Mock Endpoints

Some mock data is also available from backend endpoints:

### Notifications
- `GET /notifications/unread-count` - Returns unread notification count
- `GET /notifications` - Returns notification list (requires auth)

### Markets
- `GET /markets` - Returns stock list with real-time data
- `GET /markets/stocks/{symbol}` - Returns detailed stock information

### News
- `GET /news` - Returns news articles

### Transactions
- `GET /ledger/transactions` - Returns transaction history (requires auth)

---

## Extending Mock Data

To add more mock data:

1. **Edit existing files** in `frontend/src/mocks/`
2. **Follow the type definitions** for consistency
3. **Update this guide** if adding new types
4. **Re-export** in `index.ts` if creating new files

### Example: Adding a New Notification

```typescript
// In frontend/src/mocks/notifications.ts
export const mockNotifications: Notification[] = [
  // ... existing notifications
  {
    id: '9',
    type: 'account',
    title: 'New Feature Available',
    message: 'Fractional shares trading is now available!',
    timestamp: '1h ago',
    read: false,
    actionLabel: 'Try It Now',
    priority: 'medium',
  },
];
```

---

## Testing with Mock Data

Mock data is ideal for:
- UI development and testing
- Offline mode testing
- Demo presentations
- E2E test scenarios
- Load testing frontend performance

**Note**: Replace mock data with real API calls before production deployment.

---

## Related Files

- **Frontend Components**: `frontend/src/components/`
- **Frontend Screens**: `frontend/src/screens/`
- **Backend Services**: `backend/app/services/`
- **Backend Routers**: `backend/app/routers/`

---

## Future Enhancements

Planned mock data additions:
- [ ] Portfolio holdings
- [ ] Educational content modules
- [ ] Chat messages
- [ ] Tax reports
- [ ] Dividend history
- [ ] Broker accounts
- [ ] Payment methods

---

**For questions or issues, refer to the main README.md or contact the development team.**