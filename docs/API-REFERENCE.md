# Stock Soko API Reference

## Base URL
```
http://localhost:5000
```

## Authentication

### POST /auth/register
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "phone": "+254700000000"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user_id": "uuid"
}
```

### POST /auth/login
Login and receive access token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "access_token": "jwt_token_here",
  "user": {
    "email": "user@example.com",
    "full_name": "John Doe"
  }
}
```

## Markets

### GET /markets
Get all available stocks with current prices.

**Response:**
```json
{
  "instruments": [
    {
      "symbol": "KCB",
      "name": "KCB Group",
      "last_price": 32.50,
      "change_pct": 2.5,
      "volume": 1500000,
      "market_cap": 120000000000
    }
  ],
  "count": 20
}
```

### GET /markets/stocks/{symbol}
Get detailed information for a specific stock.

**Response:**
```json
{
  "symbol": "KCB",
  "name": "KCB Group",
  "last_price": 32.50,
  "pe_ratio": 12.5,
  "roe": 18.5,
  "roa": 12.3,
  "profit_margin": 24.5,
  "sector": "Financial Services",
  "industry": "Banking"
}
```

### POST /markets/recommendation
Get AI-powered stock recommendation.

**Request:**
```json
{
  "symbol": "KCB"
}
```

**Response:**
```json
{
  "symbol": "KCB",
  "recommendation": "BUY"
}
```

## Trading

### POST /trades/order
Place a stock order.

**Request:**
```json
{
  "symbol": "KCB",
  "side": "buy",
  "quantity": 100,
  "order_type": "market"
}
```

**Response:**
```json
{
  "order_id": "ORD-12345",
  "status": "accepted",
  "message": "Order placed successfully"
}
```

## Ledger/Portfolio

### GET /ledger/balance
Get current wallet balance.

**Response:**
```json
{
  "available_balance": 50000.00,
  "total_balance": 50000.00
}
```

### GET /ledger/positions
Get current portfolio positions.

**Response:**
```json
{
  "positions": [
    {
      "symbol": "KCB",
      "quantity": 100,
      "avg_price": 30.00,
      "current_price": 32.50,
      "market_value": 3250.00,
      "unrealized_pl": 250.00
    }
  ]
}
```

## Payments

### POST /payments/deposit
Initiate M-Pesa deposit.

**Request:**
```json
{
  "amount": 5000.00,
  "phone": "+254700000000"
}
```

**Response:**
```json
{
  "transaction_id": "TXN-12345",
  "status": "pending",
  "message": "Check your phone for M-Pesa prompt"
}
```

### POST /payments/withdraw
Request withdrawal to M-Pesa.

**Request:**
```json
{
  "amount": 1000.00,
  "phone": "+254700000000"
}
```

## Watchlist

### GET /watchlist
Get user's watchlist.

**Response:**
```json
{
  "items": [
    {
      "symbol": "SCOM",
      "added_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

### POST /watchlist/add
Add stock to watchlist.

**Request:**
```json
{
  "symbol": "EQTY"
}
```

## News

### GET /news
Get latest market news.

**Query Parameters:**
- `category`: Filter by category (optional)
- `limit`: Number of articles (default: 20)

**Response:**
```json
{
  "articles": [
    {
      "id": "news-001",
      "title": "NSE 20 Hits New High",
      "description": "The NSE 20 index reached...",
      "category": "markets",
      "published_at": "2025-01-15T09:00:00Z",
      "source": "Business Daily"
    }
  ]
}
```

## AI Chat

### POST /ai/chat
Chat with AI assistant.

**Request:**
```json
{
  "message": "What stocks should I buy?",
  "conversation_id": "conv-123" // optional
}
```

**Response:**
```json
{
  "response": "Based on current market conditions...",
  "conversation_id": "conv-123"
}
```

## Broker Integration

### GET /broker/list
Get list of supported brokers.

**Response:**
```json
{
  "brokers": [
    {
      "id": "nse-direct",
      "name": "NSE Direct Trading",
      "fee_structure": "0.15% flat fee"
    }
  ]
}
```

### POST /broker/connect
Connect to a broker.

**Request:**
```json
{
  "broker_id": "nse-direct",
  "credentials": {}
}
```

## Error Responses

All endpoints may return:

**400 Bad Request:**
```json
{
  "detail": "Invalid request parameters"
}
```

**401 Unauthorized:**
```json
{
  "detail": "Not authenticated"
}
```

**404 Not Found:**
```json
{
  "detail": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "detail": "Internal server error"
}
```

## Rate Limiting

- 100 requests per minute per IP
- 1000 requests per hour per user

## Websocket Endpoints (Future)

Real-time price updates and notifications will be available via WebSocket connections.

---

*For interactive API documentation, visit: http://localhost:5000/docs*