# Analytics Framework - No Duplicates Reference

## Content Organization (Zero Overlap)

### Module 1: General Stock Analysis
**File**: `backend/app/data/stock_analysis_research.py`

**What it contains:**
- `FundamentalMetrics` - ROE, ROA, EPS, margins, FCF (calculations only)
- `ValuationRatios` - P/E, PEG, P/B, EV/EBITDA (calculations only)
- `TechnicalIndicators` - SMA, EMA, RSI, MACD, ATR (calculations only)
- `DCFValuation` - WACC, Terminal Value, NPV (calculations only)
- `RiskManagement` - Sharpe, Kelly, position sizing (general trading)

**Use for**: Calculations, formulas, mathematical operations

---

### Module 2: Value Investing Specific
**File**: `backend/app/data/value_investing_lessons.py`

**What it contains (NO overlap with Module 1):**
- `margin_of_safety()` - Unique to value investing
- Economic moat analysis - Quality assessment
- Liquidity scoring - Value-specific concerns
- Market cycle timing - Contrarian approach
- Portfolio construction - Value-specific rules (10-20% cash, 8-15 stocks)
- Buy/sell discipline - Long-term holding approach
- NSE sector benchmarks - Kenya-specific

**Use for**: Value investing strategy, educational content, long-term approach

---

### Module 3: Educational Content (General)
**File**: `backend/app/data/educational_modules.py`

**What it contains:**
- Beginner lessons (L1 series) - Stock basics, P/E ratio, first trade
- Intermediate lessons (L2 series) - ROE/ROA, cash flow, MAs, risk
- Advanced lessons (L3 series) - DCF, RSI/MACD, portfolio theory
- Glossary - 14 key terms
- Common pitfalls
- 3 learning paths (Complete Beginner, Fundamental, Technical)

**Use for**: General education for all trading styles

---

### Module 4: Value Investing Education
**File**: `backend/app/data/value_investing_lessons.py`  
**Added to**: `educational_modules.py` as new learning path

**What it contains (NO overlap with Module 3):**
- Value-specific lessons (V1, V2, V3 series)
- Margin of safety education
- Moat identification
- Market cycle education
- Value portfolio construction
- NSE case studies

**Use for**: Value investing education specifically

---

## Metric Usage Map (Which Module Has What)

| Metric/Concept | Module 1 (Calc) | Module 2 (Value) | Module 3 (Edu) | Module 4 (Value Edu) |
|----------------|-----------------|------------------|----------------|----------------------|
| **ROE Formula** |  Calculation | - |  Explanation |  DuPont Deep Dive |
| **ROA Formula** |  Calculation | - |  Explanation | - |
| **P/E Ratio** |  Calculation | - |  Basic lesson |  Value screening |
| **Margin of Safety** | - |  Calculation | - |  Full lesson |
| **Economic Moat** | - |  Assessment | - |  Full lesson |
| **Liquidity Analysis** | - |  Full framework | - |  Practical guide |
| **RSI** |  Calculation | - |  Advanced lesson | - |
| **MACD** |  Calculation | - |  Advanced lesson | - |
| **DCF** |  Full model | - |  Advanced lesson |  Simplified version |
| **Position Sizing** |  General trading |  Value approach |  Risk lesson |  Portfolio rules |
| **Sharpe Ratio** |  Calculation | - |  Advanced lesson | - |
| **Market Cycles** | - |  Timing approach | - |  Full lesson |
| **Sector Analysis** | - |  Kenya-specific | - |  Cyclical vs Defensive |

---

## How to Use (No Duplicates)

### For Stock Analysis:
1. **Use Module 1** to calculate all metrics
2. **Use Module 2** to apply value investing screens
3. **Reference Modules 3 & 4** for interpretation

### For Education:
1. **Beginners** start with Module 3 (general lessons)
2. **Value investors** add Module 4 lessons
3. **Don't teach same concept twice** - reference earlier lessons

### For Frontend Display:
1. **StockDetail** screen uses Module 1 calculations
2. **AI Recommendations** use Module 1 + Module 2
3. **Educational Content** screen shows Module 3 + Module 4
4. **Each metric displayed once** in appropriate section

---

## StockDetail Screen Organization (No Duplicates)

### Current Problem:
- P/E shown 2 times
- ROE shown 2 times
- ROA shown 2 times
- Company Profile shown 2 times
- Market Cap shown 2 times

### Solution: Tab-Based Organization

**Tab 1: Overview**
- Company Profile (ONCE)
- Quick Stats: Market Cap, EPS, Div Yield (ONCE each)

**Tab 2: Fundamentals**
- Valuation: P/E, P/B, EV/EBITDA (ONCE each)
- Profitability: ROE, ROA, Margins (ONCE each)
- Historical: 4-year charts

**Tab 3: Risk & Technical**
- Risk: Beta, Volatility, Sharpe, Debt (ONCE each)
- Technical: RSI, MACD, MAs

**Tab 4: AI Analysis**
- Recommendation
- Reasoning & signals

**Result**: Each metric appears exactly ONCE

---

## Educational Content Organization (No Duplicates)

### General Trading Path (Module 3)
```
Beginner (L1) → Intermediate (L2) → Advanced (L3)
- 12 lessons total
- Covers all trading styles
- Foundation for everyone
```

### Value Investing Path (Module 4)
```
Value Basics (V1) → Value Analysis (V2) → Value Mastery (V3)
- 11 lessons total
- Builds on general foundation
- Specific to value investing
- 10-week structured program
```

### No Overlap:
- P/E Ratio **basics** in L1-003
- P/E Ratio **value screening** in V1-003
- Same concept, different application
- Cross-reference, don't duplicate

---

## API Endpoint Design (No Duplicates)

### Recommended Structure:

**General Lessons**:
```
GET /education/lessons?level=beginner
GET /education/lessons?level=intermediate
GET /education/lessons?level=advanced
```

**Value Investing Lessons**:
```
GET /education/value-investing?level=beginner
GET /education/value-investing?level=intermediate
GET /education/value-investing?level=advanced
```

**Stock Analysis**:
```
POST /markets/analyze/{symbol}
Returns:
{
  "fundamental_metrics": {...},  // Module 1
  "value_score": {...},          // Module 2
  "recommendation": {...}         // Combined
}
```

---

## Checklist: No Duplicates Verification

###  Metrics (Each appears once per context)
- [x] ROE: Calculation (M1), Basic edu (M3), DuPont analysis (M4)
- [x] ROA: Calculation (M1), Education (M3)
- [x] P/E: Calculation (M1), Basic edu (M3), Value screening (M4)
- [x] Margin of Safety: Calculation (M2), Education (M4)
- [x] Liquidity: General (M1), Value-specific (M2), Education (M4)

###  Concepts (Each taught once, referenced elsewhere)
- [x] Position Sizing: General (M1), Value approach (M2), Risk lesson (M3)
- [x] DCF: Full model (M1), Advanced lesson (M3), Simplified (M4)
- [x] Market Cycles: Value timing (M2), Behavioral lesson (M4)

###  Sector Analysis
- [x] General benchmarks: Module 1
- [x] Value-specific sector rotation: Module 2 & 4
- [x] NSE sector characteristics: Module 4 only

---

## Summary

**Result of Cleanup**:
-  Zero duplicate calculations across modules
-  Clear separation of concerns
-  Each concept taught once, referenced when needed
-  Modules work together without overlap
-  Easy to maintain and extend

**For Developers**:
- Import from correct module based on use case
- Don't duplicate logic - reuse functions
- Cross-reference in education, don't re-explain

**For Users**:
- Learn concepts once
- Apply across different strategies
- No confusion from contradictory information

---

*This document ensures our analytics and education remain clean, organized, and duplicate-free.*

