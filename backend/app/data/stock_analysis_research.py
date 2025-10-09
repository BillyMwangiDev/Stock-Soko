"""
Comprehensive Stock Analysis Research Framework

This module contains research-backed formulas, metrics, and frameworks for:
- Fundamental analysis (financial statement metrics, valuation)
- Technical analysis (indicators, patterns, timing)
- Risk management (position sizing, stops, portfolio metrics)
- Performance measurement and backtesting
- Composite scoring models

Use this as a reference for AI training, educational content, and analysis.
"""

from typing import Dict, List, Any, Tuple
from dataclasses import dataclass
import math


@dataclass
class AnalysisMetric:
    """Represents a single analysis metric with formula and interpretation."""
    name: str
    formula: str
    interpretation: str
    category: str
    complexity_level: int  # 1=beginner, 2=intermediate, 3=advanced
    how_used: str


class FundamentalMetrics:
    """Fundamental analysis metrics and formulas."""
    
    @staticmethod
    def eps(net_income: float, preferred_dividends: float, shares_outstanding: float) -> float:
        """
        Earnings Per Share
        Formula: EPS = (Net Income - Preferred Dividends) / Weighted Average Shares Outstanding
        """
        return (net_income - preferred_dividends) / shares_outstanding if shares_outstanding > 0 else 0
    
    @staticmethod
    def revenue_growth(revenue_current: float, revenue_previous: float) -> float:
        """
        Revenue Growth %
        Formula: (Revenue_t - Revenue_t-1) / Revenue_t-1 * 100
        """
        return ((revenue_current - revenue_previous) / revenue_previous * 100) if revenue_previous > 0 else 0
    
    @staticmethod
    def gross_margin(gross_profit: float, revenue: float) -> float:
        """
        Gross Margin
        Formula: Gross_Profit / Revenue
        """
        return (gross_profit / revenue) if revenue > 0 else 0
    
    @staticmethod
    def operating_margin(operating_income: float, revenue: float) -> float:
        """
        Operating Margin (EBIT Margin)
        Formula: Operating_Income (EBIT) / Revenue
        """
        return (operating_income / revenue) if revenue > 0 else 0
    
    @staticmethod
    def net_margin(net_income: float, revenue: float) -> float:
        """
        Net Margin
        Formula: Net_Income / Revenue
        """
        return (net_income / revenue) if revenue > 0 else 0
    
    @staticmethod
    def roa(net_income: float, total_assets: float) -> float:
        """
        Return on Assets
        Formula: Net_Income / Average_Total_Assets
        """
        return (net_income / total_assets) if total_assets > 0 else 0
    
    @staticmethod
    def roe(net_income: float, shareholders_equity: float) -> float:
        """
        Return on Equity
        Formula: Net_Income / Average_Shareholders_Equity
        """
        return (net_income / shareholders_equity) if shareholders_equity > 0 else 0
    
    @staticmethod
    def debt_to_equity(total_debt: float, shareholders_equity: float) -> float:
        """
        Debt to Equity Ratio
        Formula: Total_Debt / Shareholders_Equity
        """
        return (total_debt / shareholders_equity) if shareholders_equity > 0 else 0
    
    @staticmethod
    def interest_coverage(ebit: float, interest_expense: float) -> float:
        """
        Interest Coverage Ratio
        Formula: EBIT / Interest_Expense
        Interpretation: <2 often risky
        """
        return (ebit / interest_expense) if interest_expense > 0 else float('inf')
    
    @staticmethod
    def fcf(cash_from_operations: float, capex: float) -> float:
        """
        Free Cash Flow
        Formula: Cash_from_Operations - Capital_Expenditures
        """
        return cash_from_operations - capex
    
    @staticmethod
    def ev(market_cap: float, total_debt: float, cash: float) -> float:
        """
        Enterprise Value
        Formula: Market_Capitalization + Total_Debt - Cash_and_Cash_Equivalents
        """
        return market_cap + total_debt - cash
    
    @staticmethod
    def ebitda(operating_income: float, depreciation: float, amortization: float) -> float:
        """
        EBITDA
        Formula: Operating_Income + Depreciation + Amortization
        """
        return operating_income + depreciation + amortization


class ValuationRatios:
    """Valuation ratio calculations."""
    
    @staticmethod
    def pe_ratio(price: float, eps: float) -> float:
        """
        Price to Earnings Ratio
        Formula: Price per Share / EPS
        """
        return (price / eps) if eps > 0 else 0
    
    @staticmethod
    def peg_ratio(pe: float, growth_rate: float) -> float:
        """
        PEG Ratio
        Formula: (P/E) / Annual_EPS_Growth_%
        Interpretation: PEG < 1 often viewed as undervalued
        """
        return (pe / growth_rate) if growth_rate > 0 else 0
    
    @staticmethod
    def pb_ratio(price: float, book_value_per_share: float) -> float:
        """
        Price to Book Ratio
        Formula: Price per Share / Book Value per Share
        """
        return (price / book_value_per_share) if book_value_per_share > 0 else 0
    
    @staticmethod
    def ev_to_ebitda(ev: float, ebitda: float) -> float:
        """
        EV/EBITDA Multiple
        Formula: Enterprise_Value / EBITDA
        """
        return (ev / ebitda) if ebitda > 0 else 0
    
    @staticmethod
    def price_to_sales(market_cap: float, revenue: float) -> float:
        """
        Price to Sales Ratio
        Formula: Market_Cap / Revenue
        """
        return (market_cap / revenue) if revenue > 0 else 0


class TechnicalIndicators:
    """Technical analysis indicator calculations."""
    
    @staticmethod
    def sma(prices: List[float], period: int) -> float:
        """
        Simple Moving Average
        Formula: SMA_n = (Σ Close_i for i=1..n) / n
        """
        if len(prices) < period:
            return 0
        return sum(prices[-period:]) / period
    
    @staticmethod
    def ema(prices: List[float], period: int) -> float:
        """
        Exponential Moving Average
        Formula: EMA_today = Price_today * k + EMA_yesterday * (1 - k)
        where k = 2 / (n + 1)
        """
        if len(prices) < period:
            return 0
        
        k = 2 / (period + 1)
        ema_value = prices[0]
        
        for price in prices[1:]:
            ema_value = price * k + ema_value * (1 - k)
        
        return ema_value
    
    @staticmethod
    def rsi(prices: List[float], period: int = 14) -> float:
        """
        Relative Strength Index
        Formula: RS = Average_Gain_14 / Average_Loss_14
                 RSI = 100 - (100 / (1 + RS))
        Interpretation: <30 oversold, >70 overbought
        """
        if len(prices) < period + 1:
            return 50
        
        gains = []
        losses = []
        
        for i in range(1, len(prices)):
            change = prices[i] - prices[i-1]
            if change > 0:
                gains.append(change)
                losses.append(0)
            else:
                gains.append(0)
                losses.append(abs(change))
        
        avg_gain = sum(gains[-period:]) / period
        avg_loss = sum(losses[-period:]) / period
        
        if avg_loss == 0:
            return 100
        
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        
        return rsi
    
    @staticmethod
    def macd(prices: List[float]) -> Tuple[float, float, float]:
        """
        MACD (Moving Average Convergence Divergence)
        Formula: MACD = EMA_12 - EMA_26
                 Signal = EMA_9(MACD)
                 Histogram = MACD - Signal
        """
        if len(prices) < 26:
            return 0, 0, 0
        
        ema_12 = TechnicalIndicators.ema(prices, 12)
        ema_26 = TechnicalIndicators.ema(prices, 26)
        macd_line = ema_12 - ema_26
        
        # Simplified signal line (would need MACD history for accurate calculation)
        signal_line = macd_line * 0.9  # Approximation
        histogram = macd_line - signal_line
        
        return macd_line, signal_line, histogram
    
    @staticmethod
    def atr(highs: List[float], lows: List[float], closes: List[float], period: int = 14) -> float:
        """
        Average True Range
        Formula: TrueRange = max(High - Low, abs(High - PrevClose), abs(Low - PrevClose))
                 ATR = Wilder's EMA of TrueRange over n periods
        """
        if len(highs) < period + 1:
            return 0
        
        true_ranges = []
        for i in range(1, len(highs)):
            tr = max(
                highs[i] - lows[i],
                abs(highs[i] - closes[i-1]),
                abs(lows[i] - closes[i-1])
            )
            true_ranges.append(tr)
        
        return sum(true_ranges[-period:]) / period


class ValueInvestingMetrics:
    """Value investing specific calculations."""
    
    @staticmethod
    def margin_of_safety(intrinsic_value: float, market_price: float) -> float:
        """
        Margin of Safety - Core value investing concept
        Formula: MOS = (Intrinsic_Value - Market_Price) / Intrinsic_Value
        NSE Requirement: 30-50% due to higher market volatility
        """
        if intrinsic_value == 0:
            return 0
        return ((intrinsic_value - market_price) / intrinsic_value) * 100
    
    @staticmethod
    def risk_reward_ratio(entry_price: float, target_price: float, stop_loss: float) -> float:
        """
        Risk/Reward Ratio for Value Investing
        Formula: RR = (Target - Entry) / (Entry - Stop)
        Value Investing Minimum: 3:1 or higher
        """
        risk = abs(entry_price - stop_loss)
        reward = abs(target_price - entry_price)
        return (reward / risk) if risk > 0 else 0
    
    @staticmethod
    def liquidity_score(avg_daily_volume_kes: float, bid_ask_spread: float, free_float: float) -> Dict[str, Any]:
        """
        Liquidity Analysis for NSE Stocks
        Returns: Score and interpretation
        """
        score = 0
        issues = []
        
        # Volume check (40% weight)
        if avg_daily_volume_kes >= 1000000:
            score += 40
        elif avg_daily_volume_kes >= 500000:
            score += 30
            issues.append("Moderate volume - may impact large positions")
        elif avg_daily_volume_kes >= 200000:
            score += 20
            issues.append("Low volume - liquidity concerns")
        else:
            issues.append("Very low volume - high liquidity risk")
        
        # Spread check (35% weight)
        spread_pct = bid_ask_spread * 100
        if spread_pct <= 2:
            score += 35
        elif spread_pct <= 5:
            score += 25
            issues.append("Wide spread - transaction costs elevated")
        else:
            score += 10
            issues.append("Very wide spread - poor liquidity")
        
        # Free float check (25% weight)
        if free_float >= 0.30:
            score += 25
        elif free_float >= 0.20:
            score += 20
        else:
            score += 10
            issues.append("Low free float - limited trading flexibility")
        
        rating = "Excellent" if score >= 80 else "Good" if score >= 60 else "Fair" if score >= 40 else "Poor"
        
        return {
            "score": score,
            "rating": rating,
            "issues": issues,
            "mos_adjustment": "Require 40-50% MOS" if score < 60 else "Standard 30% MOS acceptable"
        }


class RiskManagement:
    """Risk management formulas and calculations."""
    
    @staticmethod
    def position_size_fixed_fractional(portfolio_value: float, risk_per_trade: float) -> float:
        """
        Fixed Fractional Position Sizing
        Formula: Position_Value = Portfolio_Value * Risk_Per_Trade
        Common risk: 0.5% - 2% per trade
        """
        return portfolio_value * risk_per_trade
    
    @staticmethod
    def value_position_sizing(portfolio_value: float, conviction_level: str = 'medium') -> float:
        """
        Value Investing Position Sizing
        Max 5-10% per position, start with 2-3%
        """
        sizing_map = {
            'high': 0.08,    # 8% for high conviction
            'medium': 0.05,  # 5% for medium conviction
            'low': 0.03      # 3% for low conviction
        }
        return portfolio_value * sizing_map.get(conviction_level, 0.05)
    
    @staticmethod
    def shares_from_stop(portfolio_value: float, risk_per_trade: float, 
                        entry_price: float, stop_price: float) -> int:
        """
        Stop-Based Share Calculation
        Formula: Shares = (Portfolio_Value * Risk_Per_Trade) / (Entry_Price - Stop_Price)
        """
        risk_amount = portfolio_value * risk_per_trade
        price_risk = abs(entry_price - stop_price)
        
        return int(risk_amount / price_risk) if price_risk > 0 else 0
    
    @staticmethod
    def kelly_criterion(win_rate: float, avg_win: float, avg_loss: float) -> float:
        """
        Kelly Criterion
        Formula: Kelly = WinRate - ((1 - WinRate) / (AvgWin/AvgLoss))
        Caution: Often use fractional Kelly (1/4 or 1/2)
        """
        win_loss_ratio = avg_win / avg_loss if avg_loss > 0 else 0
        kelly = win_rate - ((1 - win_rate) / win_loss_ratio) if win_loss_ratio > 0 else 0
        return max(0, min(kelly, 1))  # Clamp between 0 and 1
    
    @staticmethod
    def risk_reward_ratio(entry: float, target: float, stop: float) -> float:
        """
        Risk/Reward Ratio
        Formula: RR = (Target_Price - Entry_Price) / (Entry_Price - Stop_Price)
        Recommended: >= 1:2 or 1:3
        """
        reward = abs(target - entry)
        risk = abs(entry - stop)
        return (reward / risk) if risk > 0 else 0
    
    @staticmethod
    def expectancy(win_rate: float, avg_win: float, avg_loss: float) -> float:
        """
        Trade Expectancy
        Formula: Expectancy = (WinRate * AvgWin) - (LossRate * AvgLoss)
        Positive expectancy = profitable strategy long-term
        """
        loss_rate = 1 - win_rate
        return (win_rate * avg_win) - (loss_rate * avg_loss)
    
    @staticmethod
    def sharpe_ratio(portfolio_return: float, risk_free_rate: float, std_dev: float) -> float:
        """
        Sharpe Ratio
        Formula: Sharpe = (Rp - Rf) / StdDev(Rp)
        """
        return ((portfolio_return - risk_free_rate) / std_dev) if std_dev > 0 else 0
    
    @staticmethod
    def max_drawdown(portfolio_values: List[float]) -> float:
        """
        Maximum Drawdown
        Formula: MaxDrawdown = max((PeakValue - TroughValue) / PeakValue)
        """
        if not portfolio_values:
            return 0
        
        max_dd = 0
        peak = portfolio_values[0]
        
        for value in portfolio_values:
            if value > peak:
                peak = value
            dd = (peak - value) / peak
            max_dd = max(max_dd, dd)
        
        return max_dd


class DCFValuation:
    """Discounted Cash Flow valuation model."""
    
    @staticmethod
    def wacc(equity_value: float, debt_value: float, cost_equity: float, 
             cost_debt: float, tax_rate: float) -> float:
        """
        Weighted Average Cost of Capital
        Formula: WACC = (E/V)*Re + (D/V)*Rd*(1-T)
        """
        total_value = equity_value + debt_value
        if total_value == 0:
            return 0
        
        e_ratio = equity_value / total_value
        d_ratio = debt_value / total_value
        
        return (e_ratio * cost_equity) + (d_ratio * cost_debt * (1 - tax_rate))
    
    @staticmethod
    def capm_cost_of_equity(risk_free_rate: float, beta: float, market_return: float) -> float:
        """
        CAPM Cost of Equity
        Formula: Re = Rf + Beta * (Rm - Rf)
        """
        return risk_free_rate + beta * (market_return - risk_free_rate)
    
    @staticmethod
    def terminal_value(fcf: float, growth_rate: float, wacc: float) -> float:
        """
        Terminal Value (Perpetuity Growth Model)
        Formula: TV = FCF_n * (1 + g) / (WACC - g)
        """
        if wacc <= growth_rate:
            return 0
        return fcf * (1 + growth_rate) / (wacc - growth_rate)
    
    @staticmethod
    def dcf_value(fcf_projections: List[float], terminal_value: float, 
                  wacc: float) -> float:
        """
        DCF Intrinsic Value
        Formula: NPV = Σ (FCF_t / (1 + WACC)^t) + (TV / (1 + WACC)^n)
        """
        pv_fcf = sum(fcf / ((1 + wacc) ** (i + 1)) 
                     for i, fcf in enumerate(fcf_projections))
        pv_tv = terminal_value / ((1 + wacc) ** len(fcf_projections))
        
        return pv_fcf + pv_tv


# Educational content organized by complexity
EDUCATIONAL_MODULES = {
    "beginner": {
        "title": "Stock Market Fundamentals",
        "lessons": [
            {
                "id": "L1-001",
                "title": "Understanding Stock Prices",
                "description": "Learn what a stock is and how prices are determined by supply and demand.",
                "concepts": ["Stock ownership", "Market price", "Bid/Ask spread"],
                "duration": "10 min"
            },
            {
                "id": "L1-002",
                "title": "Reading Financial Statements",
                "description": "Introduction to the three core financial statements: Income Statement, Balance Sheet, and Cash Flow.",
                "concepts": ["Revenue", "Profit", "Assets", "Liabilities", "Cash Flow"],
                "duration": "15 min"
            },
            {
                "id": "L1-003",
                "title": "Basic Valuation Ratios",
                "description": "Learn P/E ratio, P/B ratio, and why they matter.",
                "formulas": ["P/E = Price / EPS", "P/B = Price / Book Value"],
                "duration": "12 min"
            },
            {
                "id": "L1-004",
                "title": "Market Orders vs Limit Orders",
                "description": "Understand different order types and when to use them.",
                "concepts": ["Market order", "Limit order", "Stop loss"],
                "duration": "8 min"
            }
        ]
    },
    "intermediate": {
        "title": "Financial Analysis & Metrics",
        "lessons": [
            {
                "id": "L2-001",
                "title": "Profitability Metrics Deep Dive",
                "description": "Master ROE, ROA, and margin analysis.",
                "formulas": [
                    "ROE = Net Income / Shareholders' Equity",
                    "ROA = Net Income / Total Assets",
                    "Gross Margin = Gross Profit / Revenue"
                ],
                "duration": "18 min"
            },
            {
                "id": "L2-002",
                "title": "Cash Flow Analysis",
                "description": "Learn why cash flow matters more than accounting profit.",
                "formulas": ["FCF = Operating Cash Flow - CapEx"],
                "duration": "20 min"
            },
            {
                "id": "L2-003",
                "title": "Technical Indicators: Moving Averages",
                "description": "Use SMA and EMA to identify trends.",
                "formulas": ["SMA = Σ Prices / n", "EMA with exponential weighting"],
                "duration": "15 min"
            },
            {
                "id": "L2-004",
                "title": "Risk Management Basics",
                "description": "Position sizing and stop-loss strategies.",
                "formulas": ["Position Size = Portfolio * Risk %", "Shares = Risk Amount / (Entry - Stop)"],
                "duration": "16 min"
            }
        ]
    },
    "advanced": {
        "title": "Advanced Valuation & Strategy",
        "lessons": [
            {
                "id": "L3-001",
                "title": "Discounted Cash Flow (DCF) Modeling",
                "description": "Build intrinsic valuation models from scratch.",
                "formulas": [
                    "WACC = (E/V)*Re + (D/V)*Rd*(1-T)",
                    "TV = FCF * (1 + g) / (WACC - g)",
                    "NPV = Σ(FCF/(1+WACC)^t) + TV/(1+WACC)^n"
                ],
                "duration": "30 min"
            },
            {
                "id": "L3-002",
                "title": "Technical Analysis: RSI & MACD",
                "description": "Master momentum oscillators for timing.",
                "formulas": [
                    "RSI = 100 - (100 / (1 + RS))",
                    "MACD = EMA12 - EMA26"
                ],
                "duration": "22 min"
            },
            {
                "id": "L3-003",
                "title": "Portfolio Theory & Optimization",
                "description": "Sharpe ratio, beta, and portfolio construction.",
                "formulas": [
                    "Sharpe = (Rp - Rf) / σ",
                    "Beta = Cov(Asset, Market) / Var(Market)"
                ],
                "duration": "25 min"
            },
            {
                "id": "L3-004",
                "title": "Composite Scoring Models",
                "description": "Combine fundamental + technical + sentiment into quantitative strategies.",
                "duration": "28 min"
            }
        ]
    }
}


# Metric definitions for reference
METRIC_DEFINITIONS = [
    AnalysisMetric(
        name="EPS (Earnings Per Share)",
        formula="(Net Income - Preferred Dividends) / Shares Outstanding",
        interpretation="Higher EPS indicates greater profitability per share. Rising EPS trend is positive.",
        category="fundamental",
        complexity_level=1,
        how_used="Compare to historical EPS and industry peers. Used to calculate P/E ratio."
    ),
    AnalysisMetric(
        name="P/E Ratio",
        formula="Price per Share / EPS",
        interpretation="Lower P/E may indicate undervaluation. Compare to sector average and growth rate.",
        category="valuation",
        complexity_level=1,
        how_used="Screen for value stocks. High P/E acceptable for high-growth companies."
    ),
    AnalysisMetric(
        name="ROE (Return on Equity)",
        formula="Net Income / Shareholders' Equity",
        interpretation="Measures return generated on shareholder investment. >15% often considered excellent.",
        category="fundamental",
        complexity_level=2,
        how_used="Compare across competitors. High ROE with low debt is ideal."
    ),
    AnalysisMetric(
        name="RSI (Relative Strength Index)",
        formula="100 - (100 / (1 + RS)) where RS = Avg Gain / Avg Loss over 14 periods",
        interpretation="<30 = oversold (potential buy), >70 = overbought (potential sell)",
        category="technical",
        complexity_level=2,
        how_used="Identify reversal points. Most effective in range-bound markets."
    ),
    AnalysisMetric(
        name="Free Cash Flow",
        formula="Operating Cash Flow - Capital Expenditures",
        interpretation="Cash available for dividends, buybacks, and growth. Positive FCF is essential.",
        category="fundamental",
        complexity_level=2,
        how_used="Preferred metric for DCF valuation. Shows real cash generation ability."
    ),
    AnalysisMetric(
        name="WACC (Weighted Average Cost of Capital)",
        formula="(E/V)*Re + (D/V)*Rd*(1-T)",
        interpretation="Discount rate for DCF. Lower WACC increases intrinsic value.",
        category="valuation",
        complexity_level=3,
        how_used="Used in DCF models to discount future cash flows to present value."
    ),
    AnalysisMetric(
        name="Sharpe Ratio",
        formula="(Portfolio Return - Risk Free Rate) / Standard Deviation",
        interpretation=">1 is good, >2 is excellent. Measures risk-adjusted returns.",
        category="risk",
        complexity_level=3,
        how_used="Compare strategies and portfolios. Higher Sharpe = better risk-adjusted performance."
    )
]

