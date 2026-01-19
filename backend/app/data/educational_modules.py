"""
Educational Content for Stock Trading
Organized by complexity level: Beginner -> Intermediate -> Advanced

This module provides structured learning paths with formulas, examples, and practical applications.
"""

from dataclasses import dataclass
from typing import Any, Dict, List


@dataclass
class Lesson:
    """Represents a single educational lesson."""

    id: str
    title: str
    description: str
    complexity_level: int  # 1=beginner, 2=intermediate, 3=advanced
    duration_minutes: int
    concepts: List[str]
    formulas: List[Dict[str, str]]
    practical_examples: List[str]
    quiz_questions: List[Dict[str, Any]]


BEGINNER_LESSONS = [
    {
        "id": "L1-001",
        "title": "Understanding Stock Prices",
        "description": "Learn what a stock is and how prices are determined by supply and demand.",
        "complexity_level": 1,
        "duration_minutes": 10,
        "concepts": [
            "What is a stock? Ownership in a company",
            "How stock prices move (supply and demand)",
            "Bid price vs Ask price (the spread)",
            "Market orders vs Limit orders",
        ],
        "formulas": [],
        "practical_examples": [
            "If you buy 100 shares of KCB at KES 32.50, you own 100/total_shares of the company.",
            "Bid KES 32.00, Ask KES 32.50 means you can sell at 32.00 or buy at 32.50.",
        ],
        "quiz": [
            {
                "question": "What does buying a stock mean?",
                "options": [
                    "Lending money to a company",
                    "Owning part of a company",
                    "Betting on price movement",
                    "Donating to business",
                ],
                "correct": 1,
            }
        ],
    },
    {
        "id": "L1-002",
        "title": "Reading Financial Statements - The Basics",
        "description": "Introduction to the three core financial statements every investor must understand.",
        "complexity_level": 1,
        "duration_minutes": 15,
        "concepts": [
            "Income Statement: Shows revenue and profit",
            "Balance Sheet: Shows assets, liabilities, equity",
            "Cash Flow Statement: Shows actual cash movement",
        ],
        "formulas": [
            {"name": "Net Income", "formula": "Revenue - All Expenses"},
            {
                "name": "Shareholders' Equity",
                "formula": "Total Assets - Total Liabilities",
            },
        ],
        "practical_examples": [
            "KCB Revenue KES 85B, Expenses KES 65B => Net Income KES 20B",
            "If Assets KES 800B, Liabilities KES 650B => Equity KES 150B",
        ],
        "key_line_items": {
            "income_statement": [
                "Revenue (Sales)",
                "Gross Profit",
                "Operating Income (EBIT)",
                "Net Income",
                "EPS",
            ],
            "balance_sheet": [
                "Current Assets",
                "Inventory",
                "PP&E",
                "Total Liabilities",
                "Shareholders' Equity",
            ],
            "cash_flow": [
                "Cash from Operations (CFO)",
                "Capital Expenditures (CapEx)",
                "Free Cash Flow (FCF)",
            ],
        },
    },
    {
        "id": "L1-003",
        "title": "P/E Ratio - Your First Valuation Tool",
        "description": "Master the Price-to-Earnings ratio, the most widely used valuation metric.",
        "complexity_level": 1,
        "duration_minutes": 12,
        "concepts": [
            "What P/E ratio tells you",
            "How to calculate P/E",
            "Comparing P/E across companies",
            "When P/E is high vs low",
        ],
        "formulas": [
            {"name": "P/E Ratio", "formula": "P/E = Price per Share / EPS"},
            {
                "name": "EPS",
                "formula": "EPS = (Net Income - Preferred Dividends) / Shares Outstanding",
            },
        ],
        "practical_examples": [
            "Stock price KES 50, EPS KES 5 => P/E = 10 (you pay 10 times earnings)",
            "Tech company P/E 25, Bank P/E 12 => Tech is pricier relative to earnings",
        ],
        "interpretation": "P/E < 15 often undervalued, P/E > 25 may be overvalued (compare to industry average)",
    },
    {
        "id": "L1-004",
        "title": "How to Place Your First Trade",
        "description": "Understand order types and execute your first stock purchase safely.",
        "complexity_level": 1,
        "duration_minutes": 8,
        "concepts": [
            "Market Order: Buy/sell immediately at current price",
            "Limit Order: Set your maximum buy or minimum sell price",
            "Stop Loss: Automatic sell to limit losses",
            "Position sizing: How much to invest",
        ],
        "formulas": [],
        "practical_examples": [
            "Market order: Buy 100 shares NOW at whatever price = quick execution",
            "Limit order: Buy 100 shares only if price drops to KES 30 = price control",
            "Stop loss: Sell if price falls below KES 28 = risk management",
        ],
        "safety_tips": [
            "Start small: Risk only 1-2% of portfolio per trade",
            "Always use limit orders for illiquid stocks",
            "Set a stop loss before you buy",
        ],
    },
]

INTERMEDIATE_LESSONS = [
    {
        "id": "L2-001",
        "title": "Profitability Metrics: ROE, ROA, and Margins",
        "description": "Deep dive into return ratios and margin analysis to assess company efficiency.",
        "complexity_level": 2,
        "duration_minutes": 18,
        "concepts": [
            "ROE: Return on Equity - efficiency of shareholder investment",
            "ROA: Return on Assets - how well assets generate profit",
            "Gross, Operating, and Net Margins",
            "Comparing margins across competitors",
        ],
        "formulas": [
            {
                "name": "ROE",
                "formula": "ROE = Net Income / Shareholders' Equity",
                "interpretation": ">15% excellent, 10-15% good, <10% poor",
            },
            {
                "name": "ROA",
                "formula": "ROA = Net Income / Total Assets",
                "interpretation": ">10% strong, 5-10% average, <5% weak",
            },
            {
                "name": "Gross Margin",
                "formula": "Gross Margin = Gross Profit / Revenue",
                "interpretation": "Higher = better pricing power and cost control",
            },
            {
                "name": "Operating Margin",
                "formula": "Operating Margin = Operating Income (EBIT) / Revenue",
                "interpretation": "Core profitability before tax/interest",
            },
            {
                "name": "Net Margin",
                "formula": "Net Margin = Net Income / Revenue",
                "interpretation": "Bottom-line profitability",
            },
        ],
        "practical_examples": [
            "Bank A: ROE 18%, Bank B: ROE 12% => Bank A uses equity more efficiently",
            "Company with Gross Margin 60% vs 40% => First has better pricing power",
            "Net Income KES 20B, Revenue KES 100B => Net Margin = 20% (excellent)",
        ],
        "case_study": {
            "company": "KCB Group",
            "net_income": 27400000000,
            "shareholders_equity": 148000000000,
            "total_assets": 1200000000000,
            "revenue": 112000000000,
            "calculations": {
                "ROE": "27.4B / 148B = 18.5%",
                "ROA": "27.4B / 1200B = 2.28%",
                "Net_Margin": "27.4B / 112B = 24.5%",
            },
        },
    },
    {
        "id": "L2-002",
        "title": "Cash Flow vs Profit - Why Cash is King",
        "description": "Learn why Free Cash Flow matters more than accounting profit.",
        "complexity_level": 2,
        "duration_minutes": 20,
        "concepts": [
            "Operating Cash Flow (OCF)",
            "Capital Expenditures (CapEx)",
            "Free Cash Flow (FCF)",
            "Why companies with profit can still go bankrupt",
        ],
        "formulas": [
            {
                "name": "Free Cash Flow",
                "formula": "FCF = Cash from Operations - Capital Expenditures",
                "interpretation": "Positive FCF essential - cash available for dividends, debt repayment, growth",
            }
        ],
        "practical_examples": [
            "Company reports profit KES 10M but OCF is -KES 5M => Red flag (burning cash)",
            "FCF KES 15B => Can pay KES 5B dividends, invest KES 10B in expansion",
            "High profit but low FCF => May be inflating earnings through accounting tricks",
        ],
        "red_flags": [
            "Profit growing but cash flow declining",
            "Negative free cash flow for multiple years",
            "Large gap between profit and operating cash flow",
        ],
    },
    {
        "id": "L2-003",
        "title": "Moving Averages - Finding the Trend",
        "description": "Use Simple and Exponential Moving Averages to identify market trends.",
        "complexity_level": 2,
        "duration_minutes": 15,
        "concepts": [
            "SMA: Simple Moving Average",
            "EMA: Exponential Moving Average (reacts faster)",
            "50-day and 200-day MAs",
            "Golden Cross and Death Cross signals",
        ],
        "formulas": [
            {
                "name": "SMA",
                "formula": "SMA_n = (Sum of last n closing prices) / n",
                "example": "SMA_5 = (50+51+49+52+48) / 5 = 50",
            },
            {
                "name": "EMA",
                "formula": "EMA_today = Price_today × k + EMA_yesterday × (1 - k), where k = 2/(n+1)",
                "advantage": "Gives more weight to recent prices",
            },
        ],
        "practical_examples": [
            "Price crosses above 50-day MA => Bullish signal (uptrend starting)",
            "Price crosses below 200-day MA => Bearish signal (downtrend)",
            "50-day crosses above 200-day => Golden Cross (strong buy signal)",
            "50-day crosses below 200-day => Death Cross (strong sell signal)",
        ],
        "typical_periods": [20, 50, 100, 200],
        "how_to_use": "Buy when price > MA in uptrend, sell when price < MA in downtrend",
    },
    {
        "id": "L2-004",
        "title": "Risk Management - Position Sizing and Stop Losses",
        "description": "Learn how to protect your capital with proper position sizing and stop losses.",
        "complexity_level": 2,
        "duration_minutes": 16,
        "concepts": [
            "The 1-2% rule (never risk more per trade)",
            "Position sizing based on stop loss",
            "Types of stop losses",
            "Risk/Reward ratio",
        ],
        "formulas": [
            {
                "name": "Position Size (Fixed Fractional)",
                "formula": "Position Value = Portfolio Value × Risk Per Trade",
                "example": "KES 100,000 portfolio, 1% risk = KES 1,000 risk per trade",
            },
            {
                "name": "Shares to Buy (Stop-Based)",
                "formula": "Shares = (Portfolio × Risk %) / (Entry Price - Stop Price)",
                "example": "Portfolio KES 100K, 1% risk, Entry KES 50, Stop KES 45 => 1000/(50-45) = 200 shares",
            },
            {
                "name": "Risk/Reward Ratio",
                "formula": "RR = (Target Price - Entry) / (Entry - Stop Loss)",
                "recommendation": "Aim for minimum 1:2 (risk KES 1 to make KES 2)",
            },
        ],
        "practical_examples": [
            "Entry KES 50, Stop KES 47, Target KES 59 => Risk KES 3, Reward KES 9 => RR = 1:3 (good)",
            "Never risk more than 2% on one trade = survive 50 losses in a row",
            "Fixed % stop: Sell if down 7% from entry",
            "ATR-based stop: Stop at Entry - (2 × ATR)",
        ],
    },
]

ADVANCED_LESSONS = [
    {
        "id": "L3-001",
        "title": "DCF Valuation - Calculating Intrinsic Value",
        "description": "Master Discounted Cash Flow modeling to value companies like a professional analyst.",
        "complexity_level": 3,
        "duration_minutes": 30,
        "concepts": [
            "Free Cash Flow projections",
            "WACC (Weighted Average Cost of Capital)",
            "Terminal Value calculation",
            "Discount rate and time value of money",
        ],
        "formulas": [
            {
                "name": "Free Cash Flow to Firm (FCFF)",
                "formula": "FCFF = EBIT × (1 - Tax Rate) + D&A - Change in NWC - CapEx",
            },
            {
                "name": "WACC",
                "formula": "WACC = (E/V) × Re + (D/V) × Rd × (1 - T)",
                "where": "E=equity value, D=debt value, V=E+D, Re=cost of equity, Rd=cost of debt, T=tax rate",
            },
            {
                "name": "Cost of Equity (CAPM)",
                "formula": "Re = Rf + Beta × (Rm - Rf)",
                "where": "Rf=risk-free rate, Rm=market return, Beta=systematic risk",
            },
            {
                "name": "Terminal Value (Perpetuity)",
                "formula": "TV = FCF_n × (1 + g) / (WACC - g)",
                "caution": "Use conservative growth rate g (2-3% for mature companies)",
            },
            {
                "name": "Intrinsic Value",
                "formula": "NPV = Σ(FCF_t / (1+WACC)^t) + (TV / (1+WACC)^n)",
            },
        ],
        "step_by_step": [
            "Step 1: Forecast FCF for 5-10 years",
            "Step 2: Calculate WACC (discount rate)",
            "Step 3: Calculate Terminal Value at year n",
            "Step 4: Discount all cash flows to present value",
            "Step 5: Sum to get Enterprise Value",
            "Step 6: Subtract debt, add cash, divide by shares for per-share value",
        ],
        "practical_example": {
            "company": "Sample Ltd",
            "fcf_projections": [100, 110, 121, 133, 146],
            "wacc": 0.10,
            "terminal_growth": 0.03,
            "calculation": "PV of FCFs + PV of Terminal Value = Intrinsic Value",
        },
    },
    {
        "id": "L3-002",
        "title": "RSI & MACD - Advanced Momentum Indicators",
        "description": "Master RSI and MACD for precise entry and exit timing.",
        "complexity_level": 3,
        "duration_minutes": 22,
        "concepts": [
            "RSI: Relative Strength Index",
            "MACD: Moving Average Convergence Divergence",
            "Divergence patterns",
            "Combining indicators for confirmation",
        ],
        "formulas": [
            {
                "name": "RSI",
                "formula": "RS = Avg Gain(14) / Avg Loss(14); RSI = 100 - (100 / (1 + RS))",
                "interpretation": "RSI < 30 = oversold (buy signal), RSI > 70 = overbought (sell signal)",
            },
            {
                "name": "MACD",
                "formula": "MACD Line = EMA(12) - EMA(26); Signal Line = EMA(9) of MACD; Histogram = MACD - Signal",
                "interpretation": "MACD crosses above Signal = bullish, below = bearish",
            },
        ],
        "advanced_strategies": [
            "Bullish divergence: Price makes lower low, RSI makes higher low => Reversal up",
            "Bearish divergence: Price makes higher high, RSI makes lower high => Reversal down",
            "MACD histogram expanding => Strong trend, contracting => Weakening",
            "Wait for RSI < 30 AND MACD bullish crossover => High-confidence buy",
        ],
        "typical_periods": {"RSI": 14, "MACD": "12, 26, 9"},
    },
    {
        "id": "L3-003",
        "title": "Portfolio Theory - Sharpe Ratio, Beta, and Diversification",
        "description": "Optimize your portfolio for maximum risk-adjusted returns.",
        "complexity_level": 3,
        "duration_minutes": 25,
        "concepts": [
            "Sharpe Ratio: Risk-adjusted return",
            "Beta: Systematic risk vs market",
            "Portfolio diversification",
            "Correlation and covariance",
        ],
        "formulas": [
            {
                "name": "Sharpe Ratio",
                "formula": "Sharpe = (Portfolio Return - Risk Free Rate) / Standard Deviation",
                "interpretation": "Sharpe > 1 good, > 2 excellent, > 3 exceptional",
            },
            {
                "name": "Beta",
                "formula": "Beta = Covariance(Stock, Market) / Variance(Market)",
                "interpretation": "Beta > 1 more volatile than market, < 1 less volatile, = 1 moves with market",
            },
            {
                "name": "Expected Return (CAPM)",
                "formula": "E[R] = Rf + Beta × (E[Rm] - Rf)",
            },
            {
                "name": "Portfolio Variance",
                "formula": "σ²_p = w₁²σ₁² + w₂²σ₂² + 2w₁w₂Cov(R₁,R₂)",
                "note": "Diversification reduces variance when assets not perfectly correlated",
            },
        ],
        "practical_examples": [
            "Strategy A: 15% return, 20% std dev, Rf=3% => Sharpe = (15-3)/20 = 0.6",
            "Strategy B: 12% return, 8% std dev => Sharpe = (12-3)/8 = 1.125 (better!)",
            "Stock with Beta 1.5 => Expect 1.5× market volatility",
            "Diversify across 10-15 uncorrelated stocks to reduce portfolio risk",
        ],
    },
    {
        "id": "L3-004",
        "title": "Composite Scoring Model - Building a Quantitative Strategy",
        "description": "Combine fundamental, technical, and sentiment analysis into a single scoring system.",
        "complexity_level": 3,
        "duration_minutes": 28,
        "concepts": [
            "Multi-factor analysis",
            "Normalizing metrics (0-100 scale)",
            "Weighted scoring",
            "Backtesting and optimization",
        ],
        "sample_weights": {
            "fundamentals": 0.45,
            "technicals": 0.35,
            "sentiment": 0.10,
            "liquidity_volatility": 0.10,
        },
        "sample_metrics": {
            "fundamentals": [
                "P/E percentile (inverted)",
                "Revenue growth 3yr",
                "ROE 3yr",
                "FCF margin",
            ],
            "technicals": [
                "Price vs 50-day MA",
                "RSI (optimal 40-60)",
                "MACD signal",
                "OBV trend",
            ],
            "sentiment": ["Analyst revisions", "Insider activity"],
            "liquidity": ["Avg daily volume", "ATR %"],
        },
        "formulas": [
            {
                "name": "Combined Score",
                "formula": "Score = Σ(weight_group × Σ(weight_metric × normalized_metric))",
            }
        ],
        "decision_thresholds": {
            "buy": "Score >= 70",
            "hold": "40 <= Score < 70",
            "sell": "Score < 40",
        },
        "normalization_methods": [
            "Min-Max: (Value - Min) / (Max - Min) × 100",
            "Z-Score: (Value - Mean) / Std Dev",
            "Percentile Rank: Rank among peers",
        ],
    },
]

GLOSSARY = {
    "EPS": {
        "full_name": "Earnings Per Share",
        "definition": "Net income divided by shares outstanding. Measures per-share profitability.",
        "formula": "(Net Income - Preferred Dividends) / Shares Outstanding",
    },
    "P/E": {
        "full_name": "Price-to-Earnings Ratio",
        "definition": "Stock price divided by earnings per share. Common valuation metric.",
        "formula": "Price per Share / EPS",
        "interpretation": "Lower P/E may indicate undervaluation; compare to industry average",
    },
    "ROE": {
        "full_name": "Return on Equity",
        "definition": "Measures return generated on shareholders' equity.",
        "formula": "Net Income / Shareholders' Equity",
        "interpretation": ">15% excellent, 10-15% good, <10% poor",
    },
    "ROA": {
        "full_name": "Return on Assets",
        "definition": "Efficiency of asset utilization in generating profit.",
        "formula": "Net Income / Total Assets",
    },
    "FCF": {
        "full_name": "Free Cash Flow",
        "definition": "Cash available after capital expenditures for dividends, debt repayment, growth.",
        "formula": "Operating Cash Flow - Capital Expenditures",
    },
    "EBITDA": {
        "full_name": "Earnings Before Interest, Tax, Depreciation & Amortization",
        "definition": "Proxy for operating cash earnings, useful for capital-intensive firms.",
        "formula": "Operating Income + Depreciation + Amortization",
    },
    "EV": {
        "full_name": "Enterprise Value",
        "definition": "Total value of company including debt, excluding cash.",
        "formula": "Market Cap + Total Debt - Cash",
    },
    "WACC": {
        "full_name": "Weighted Average Cost of Capital",
        "definition": "Blended cost of equity and debt, used as discount rate in DCF.",
        "formula": "(E/V)×Re + (D/V)×Rd×(1-T)",
    },
    "RSI": {
        "full_name": "Relative Strength Index",
        "definition": "Momentum oscillator measuring speed and magnitude of price changes.",
        "formula": "100 - (100 / (1 + RS)) where RS = Avg Gain / Avg Loss",
        "interpretation": "<30 oversold, >70 overbought",
    },
    "MACD": {
        "full_name": "Moving Average Convergence Divergence",
        "definition": "Trend-following momentum indicator.",
        "formula": "EMA(12) - EMA(26); Signal = EMA(9) of MACD",
    },
    "ATR": {
        "full_name": "Average True Range",
        "definition": "Volatility indicator measuring average price range.",
        "formula": "Average of True Range over 14 periods",
    },
    "OBV": {
        "full_name": "On Balance Volume",
        "definition": "Volume-based indicator tracking cumulative buying/selling pressure.",
        "formula": "Add volume on up days, subtract on down days",
    },
    "SMA": {
        "full_name": "Simple Moving Average",
        "definition": "Average price over n periods, smooths out price action.",
        "formula": "Sum of n closing prices / n",
    },
    "EMA": {
        "full_name": "Exponential Moving Average",
        "definition": "Weighted moving average giving more weight to recent prices.",
        "formula": "Price × k + EMA_prev × (1-k), k = 2/(n+1)",
    },
}

COMMON_PITFALLS = [
    {
        "pitfall": "Overreliance on Single Metric",
        "description": "Using only P/E ratio or one indicator to make decisions.",
        "solution": "Always use multi-factor analysis. Combine fundamental + technical + sentiment.",
    },
    {
        "pitfall": "Survivorship Bias",
        "description": "Backtesting only surviving companies, ignoring delisted/bankrupt ones.",
        "solution": "Include all companies that existed during backtest period, including failures.",
    },
    {
        "pitfall": "Look-Ahead Bias",
        "description": "Using future data (e.g., next quarter's earnings) for past trading signals.",
        "solution": "Ensure all data used for signals was available at that point in time.",
    },
    {
        "pitfall": "Ignoring Transaction Costs",
        "description": "Backtests showing profit but not accounting for fees, slippage, taxes.",
        "solution": "Include realistic 0.15% trading fees, 0.05% slippage, 5% CGT in calculations.",
    },
    {
        "pitfall": "Overfitting",
        "description": "Strategy with 20 parameters works perfectly on historical data but fails live.",
        "solution": "Keep strategies simple. Test out-of-sample. Use walk-forward analysis.",
    },
    {
        "pitfall": "Chasing Performance",
        "description": "Buying stocks after they've already risen sharply.",
        "solution": "Buy undervalued or consolidating stocks, not parabolic movers.",
    },
    {
        "pitfall": "Ignoring Macroeconomic Context",
        "description": "Great company analysis but missing interest rate hikes killing growth stocks.",
        "solution": "Always monitor macro: rates, inflation, GDP, currency trends.",
    },
    {
        "pitfall": "Emotional Trading",
        "description": "Panic selling at bottoms, FOMO buying at tops.",
        "solution": "Use systematic rules. Set stop losses before entering. Stick to plan.",
    },
]

LEARNING_PATHS = {
    "complete_beginner": {
        "title": "Complete Beginner to Confident Trader",
        "duration_weeks": 8,
        "path": [
            {
                "week": 1,
                "lessons": ["L1-001", "L1-002"],
                "homework": "Open brokerage account, read 3 annual reports",
            },
            {
                "week": 2,
                "lessons": ["L1-003", "L1-004"],
                "homework": "Calculate P/E for 5 NSE stocks",
            },
            {
                "week": 3,
                "lessons": ["L2-001"],
                "homework": "Analyze ROE, ROA for 3 banks",
            },
            {
                "week": 4,
                "lessons": ["L2-002"],
                "homework": "Calculate FCF for 2 companies",
            },
            {
                "week": 5,
                "lessons": ["L2-003"],
                "homework": "Plot 50-day and 200-day MAs for SCOM",
            },
            {
                "week": 6,
                "lessons": ["L2-004"],
                "homework": "Calculate position size for 3 example trades",
            },
            {
                "week": 7,
                "lessons": ["L3-001"],
                "homework": "Build simple DCF model for one stock",
            },
            {
                "week": 8,
                "lessons": ["L3-002", "L3-003"],
                "homework": "Create a diversified 10-stock portfolio",
            },
        ],
    },
    "value_investing": {
        "title": "Value Investing for NSE",
        "duration_weeks": 10,
        "description": "Learn to identify undervalued stocks using Benjamin Graham and Warren Buffett principles, adapted for the Nairobi Securities Exchange",
        "path": [
            {
                "week": 1,
                "lessons": ["V1-001", "V1-002"],
                "homework": "Identify 5 NSE stocks trading below book value",
            },
            {
                "week": 2,
                "lessons": ["V1-003"],
                "homework": "Calculate margin of safety for 3 stocks",
            },
            {
                "week": 3,
                "lessons": ["V2-001", "V2-002"],
                "homework": "Analyze competitive advantages of 2 companies",
            },
            {
                "week": 4,
                "lessons": ["V2-003"],
                "homework": "Build intrinsic value model for 1 stock",
            },
            {
                "week": 5,
                "lessons": ["V2-004"],
                "homework": "Analyze liquidity and risk metrics",
            },
            {
                "week": 6,
                "lessons": ["V3-001"],
                "homework": "Compare ROE across banking sector",
            },
            {
                "week": 7,
                "lessons": ["V3-002"],
                "homework": "Sector analysis: cyclical vs defensive",
            },
            {
                "week": 8,
                "lessons": ["V3-003"],
                "homework": "10-year historical analysis of 1 company",
            },
            {
                "week": 9,
                "lessons": ["V3-004"],
                "homework": "Kenya market cycle analysis",
            },
            {
                "week": 10,
                "project": "Build value portfolio with 8-10 stocks, 3-5 year target",
            },
        ],
    },
    "fundamental_focused": {
        "title": "Fundamental Analysis Mastery",
        "duration_weeks": 6,
        "path": [
            {"week": 1, "lessons": ["L1-002", "L1-003"]},
            {"week": 2, "lessons": ["L2-001", "L2-002"]},
            {"week": 3, "lessons": ["L3-001"]},
            {"week": 4, "lessons": ["L3-004"], "focus": "Fundamental scoring"},
            {
                "week": 5,
                "practice": "Analyze 20 NSE stocks, rank by composite fundamental score",
            },
            {
                "week": 6,
                "project": "Build DCF models for top 5 stocks, compare to market price",
            },
        ],
    },
    "technical_focused": {
        "title": "Technical Trading Specialist",
        "duration_weeks": 5,
        "path": [
            {"week": 1, "lessons": ["L1-001", "L1-004"]},
            {"week": 2, "lessons": ["L2-003"]},
            {"week": 3, "lessons": ["L2-004"], "focus": "Risk management"},
            {"week": 4, "lessons": ["L3-002"], "focus": "RSI & MACD"},
            {"week": 5, "project": "Backtest a technical strategy on 2 years of data"},
        ],
    },
}


def get_lesson_by_id(lesson_id: str) -> Dict[str, Any]:
    """Retrieve a specific lesson by ID."""
    all_lessons = BEGINNER_LESSONS + INTERMEDIATE_LESSONS + ADVANCED_LESSONS
    for lesson in all_lessons:
        if lesson["id"] == lesson_id:
            return lesson
    return None


def get_lessons_by_level(complexity_level: int) -> List[Dict[str, Any]]:
    """Get all lessons for a specific complexity level."""
    if complexity_level == 1:
        return BEGINNER_LESSONS
    elif complexity_level == 2:
        return INTERMEDIATE_LESSONS
    elif complexity_level == 3:
        return ADVANCED_LESSONS
    return []


def search_glossary(term: str) -> Dict[str, Any]:
    """Search for a term in the glossary."""
    term_upper = term.upper()
    if term_upper in GLOSSARY:
        return GLOSSARY[term_upper]

    # Partial match
    for key, value in GLOSSARY.items():
        if term.lower() in value["full_name"].lower():
            return value

    return None
