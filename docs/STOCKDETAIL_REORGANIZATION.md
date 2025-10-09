# StockDetail Screen Reorganization Plan

## Current Issues
1. **P/E Ratio** appears 2 times (Key Metrics section + Profitability Metrics section)
2. **Market Cap** appears 2 times
3. **ROE** appears 2 times (different sections with different styling)
4. **ROA** appears 2 times
5. **Company Profile** appears 2 times
6. **Profitability Metrics** section duplicated

## Proposed Structure (Seamless & Categorical)

### 1. Header Section (Sticky)
- Back button, Stock name, Watchlist button

### 2. Price Overview
- Stock symbol & name
- Current price
- Today's change (%)
- Price sentiment indicator

### 3. Interactive Chart
- Price chart with technical indicators
- Timeframe selector (1D, 1W, 1M, 3M, 1Y)

### 4. Trading Section
- Order Book (collapsible)
- Quick Trade (Buy/Sell buttons with quantity input)

### 5. Analysis Tabs (Organize into tabs)
**Tab 1: Overview**
- Key Stats (P/E, EPS, Market Cap, Dividend Yield)
- Company Profile (Sector, Industry, Employees, Founded)

**Tab 2: Fundamentals**
- Profitability Metrics (ROE, ROA, Profit Margin, Revenue Growth)
- Valuation Ratios (P/E, P/B, EV/EBITDA)
- Historical Performance Charts (4-year revenue, profit, dividends)

**Tab 3: Risk & Technicals**
- Risk Profile (Beta, Volatility, Sharpe Ratio, Debt/Equity)
- Technical Indicators (RSI, MACD, Moving Averages)
- Market Analysis (Kenya/Global trends)

**Tab 4: AI Recommendation**
- AI analysis with confidence score
- Buy/Sell/Hold recommendation
- Key reasons & technical signals
- Fundamental factors & risk considerations

## Consolidation Rules

### Remove Duplicates:
1. Merge "Key Metrics" into Overview tab
2. Remove duplicate "Company Profile" - keep only in Overview
3. Consolidate all profitability metrics into one Fundamentals section
4. Remove duplicate ROE/ROA displays

### Organize by Category:
1. **Company Basics** → Overview tab
2. **Financial Performance** → Fundamentals tab
3. **Risk Assessment** → Risk tab
4. **AI Analysis** → AI tab

### Make It Seamless:
1. Use horizontal tabs instead of long scrolling
2. Swipeable sections
3. Cleaner spacing
4. Consistent metric format

## Implementation
- Create tab navigation component
- Reorganize existing JSX into tab panels
- Remove all duplicate entries
- Add smooth transitions

