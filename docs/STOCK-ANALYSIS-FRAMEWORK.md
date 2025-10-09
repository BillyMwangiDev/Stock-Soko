# Stock Analysis Framework

## Overview

Comprehensive guide to stock analysis using fundamental, technical, and macro/sentiment methodologies.

## Quick Reference

### Fundamental Analysis Metrics

| Metric | Formula | Interpretation |
|--------|---------|----------------|
| **EPS** | `(Net Income - Preferred Dividends) / Shares Outstanding` | Higher is better. Rising trend = improving profitability |
| **P/E Ratio** | `Price per Share / EPS` | Lower may indicate value. Compare to sector average |
| **ROE** | `Net Income / Shareholders' Equity` | >15% excellent. Measures efficiency of equity use |
| **ROA** | `Net Income / Total Assets` | >10% strong. Efficiency of asset utilization |
| **Debt/Equity** | `Total Debt / Shareholders' Equity` | <0.5 = low risk. Compare to industry norms |
| **FCF** | `Operating Cash Flow - CapEx` | Positive essential. Cash available for growth/dividends |

### Valuation Ratios

| Ratio | Formula | Use Case |
|-------|---------|----------|
| **P/E** | `Price / EPS` | Universal valuation metric |
| **PEG** | `P/E / Growth Rate` | <1 potentially undervalued (growth-adjusted) |
| **P/B** | `Price / Book Value` | Best for financials and asset-heavy companies |
| **EV/EBITDA** | `Enterprise Value / EBITDA` | Capital-structure neutral comparison |

### Technical Indicators

| Indicator | Formula | Signal |
|-----------|---------|--------|
| **SMA** | `Σ Prices / n` | Trend direction. 50/200 day crossovers key |
| **RSI** | `100 - (100 / (1 + RS))` | <30 oversold (buy), >70 overbought (sell) |
| **MACD** | `EMA12 - EMA26` | Crossover above signal = bullish |
| **ATR** | `Avg(TrueRange, 14)` | Volatility measure for stop-loss sizing |

## Educational Path

### Beginner (Complexity Level 1)
1. Understanding stock prices and market mechanics
2. Reading financial statements basics
3. P/E ratio and simple valuation
4. Market vs limit orders

### Intermediate (Complexity Level 2)
1. ROE, ROA, margin analysis
2. Cash flow vs profit
3. Moving averages (SMA/EMA)
4. Position sizing and risk management

### Advanced (Complexity Level 3)
1. DCF valuation modeling
2. RSI, MACD, and momentum strategies
3. Portfolio optimization (Sharpe, Beta)
4. Composite scoring models

## Risk Management Formulas

### Position Sizing
```python
# Fixed Fractional (1-2% risk per trade)
Position Value = Portfolio Value × Risk Per Trade

# Stop-Based Shares
Shares = (Portfolio × Risk %) / (Entry Price - Stop Price)

# Kelly Criterion (use 1/4 Kelly to be conservative)
Kelly = Win Rate - ((1 - Win Rate) / (Avg Win / Avg Loss))
```

### Risk Metrics
```python
# Risk/Reward Ratio (target >= 2:1)
RR = (Target - Entry) / (Entry - Stop)

# Expectancy (must be positive)
Expectancy = (Win Rate × Avg Win) - (Loss Rate × Avg Loss)

# Sharpe Ratio (>1 good, >2 excellent)
Sharpe = (Portfolio Return - Risk Free Rate) / Std Deviation

# Maximum Drawdown
Max DD = max((Peak Value - Trough Value) / Peak Value)
```

## DCF Valuation

### Steps
1. Forecast Free Cash Flows for 5-10 years
2. Calculate WACC (discount rate)
3. Calculate Terminal Value
4. Discount all cash flows to present value

### Formulas
```python
# Free Cash Flow
FCF = Operating Cash Flow - Capital Expenditures

# Weighted Average Cost of Capital
WACC = (E/V) × Re + (D/V) × Rd × (1 - Tax Rate)

# Cost of Equity (CAPM)
Re = Risk Free Rate + Beta × (Market Return - Risk Free Rate)

# Terminal Value (Perpetuity Growth)
TV = FCF_n × (1 + g) / (WACC - g)

# Intrinsic Value
NPV = Σ(FCF_t / (1 + WACC)^t) + (TV / (1 + WACC)^n)
```

## Composite Scoring Model

### Weights
- Fundamentals: 40%
- Technicals: 40%
- Sentiment/Macro: 20%

### Decision Thresholds
- **BUY**: Score >= 70
- **HOLD**: 40 <= Score < 70
- **SELL**: Score < 40

### Sample Metrics
**Fundamental (40%)**
- P/E percentile (invert - lower is better)
- Revenue growth 3yr
- ROE 3yr average
- FCF margin

**Technical (40%)**
- Price vs 50-day MA
- RSI (optimal 40-60 range)
- MACD signal
- Volume accumulation (OBV trend)

**Sentiment (20%)**
- Analyst revisions
- Insider activity
- Market breadth

## Data Requirements

### Price Data
- **Frequency**: Daily/Intraday
- **Fields**: Open, High, Low, Close, Volume

### Fundamental Data
- **Frequency**: Quarterly/Annual
- **Fields**: Revenue, Net Income, EBITDA, Assets, Liabilities, Cash Flow

### Estimates
- **Frequency**: Daily/Weekly
- **Source**: Analyst EPS estimates and revisions

## Common Pitfalls

1. **Survivorship Bias**: Historical backtests excluding delisted stocks
2. **Look-Ahead Bias**: Using future data for past signals
3. **Overfitting**: Too many parameters, won't work in live trading
4. **Single Metric Reliance**: Always use multi-factor analysis
5. **Ignoring Macro**: Regime changes can invalidate relationships
6. **Data Quality**: Verify and adjust for accounting quirks

## Implementation Checklist

- [ ] Validate all input data
- [ ] Handle corporate actions (splits, dividends, M&A)
- [ ] Use rolling windows for adaptability
- [ ] Log all trade decisions with reasoning
- [ ] Backtest with realistic costs and slippage
- [ ] Out-of-sample testing required
- [ ] Monitor performance metrics continuously

## References

- Module: `backend/app/data/stock_analysis_research.py`
- Educational Content: `EDUCATIONAL_MODULES` dictionary
- Metric Definitions: `METRIC_DEFINITIONS` list
- Analysis Classes: `FundamentalMetrics`, `ValuationRatios`, `TechnicalIndicators`, `RiskManagement`, `DCFValuation`

## Quick Start

```python
from app.data.stock_analysis_research import (
    FundamentalMetrics,
    ValuationRatios,
    TechnicalIndicators,
    RiskManagement
)

# Calculate metrics
eps = FundamentalMetrics.eps(net_income=10000000, preferred_div=0, shares=1000000)
pe_ratio = ValuationRatios.pe_ratio(price=50, eps=eps)
rsi = TechnicalIndicators.rsi(prices=[45, 46, 48, 50, 49, 51], period=14)

# Position sizing
shares = RiskManagement.shares_from_stop(
    portfolio_value=100000,
    risk_per_trade=0.01,  # 1%
    entry_price=50,
    stop_price=47
)
```

---

*Last Updated: 2025-10-09*
*For questions or improvements, refer to the codebase documentation.*

