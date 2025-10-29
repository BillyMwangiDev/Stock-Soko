"""
Complete Value Investing Framework
Enhanced with Benjamin Graham & Warren Buffett principles
Research-backed and adapted for NSE

This module combines classical value investing with modern analysis,
specifically adapted for the Nairobi Securities Exchange.
"""

from dataclasses import dataclass
from typing import Any, Dict, List

GRAHAM_DEFENSIVE_INVESTOR_CRITERIA = {
    "description": "Benjamin Graham's criteria for conservative investors seeking safety and steady returns",
    "quantitative_criteria": [
        {
            "criterion": "Adequate Size",
            "rule": "Market cap > KES 10 billion for NSE",
            "reasoning": "Larger companies tend to be more stable and less volatile"
        },
        {
            "criterion": "Strong Financial Condition",
            "rule": "Current Ratio >= 2.0",
            "formula": "Current Ratio = Current Assets / Current Liabilities",
            "interpretation": "Company can pay short-term debts twice over"
        },
        {
            "criterion": "Earnings Stability",
            "rule": "Positive earnings in each of past 10 years",
            "nse_adaptation": "Check 5-10 years due to data availability"
        },
        {
            "criterion": "Dividend Record",
            "rule": "Uninterrupted dividends for at least 20 years",
            "nse_adaptation": "Look for 5+ consecutive years on NSE"
        },
        {
            "criterion": "Earnings Growth",
            "rule": "EPS growth >= 33% over past 10 years (3% annually)",
            "formula": "((EPS_current / EPS_10yrs_ago)^(1/10) - 1) * 100"
        },
        {
            "criterion": "Moderate P/E Ratio",
            "rule": "P/E <= 15 times average earnings of past 3 years",
            "nse_adaptation": "P/E < 12 for large caps, < 10 for small caps"
        },
        {
            "criterion": "Moderate P/B Ratio",
            "rule": "P/B <= 1.5",
            "graham_preference": "P/B < 1.0 (trading below book value)"
        },
        {
            "criterion": "Graham Number",
            "formula": "Graham Number = √(22.5 × EPS × Book Value per Share)",
            "rule": "Stock price should not exceed Graham Number",
            "explanation": "Combines P/E and P/B limits into single metric"
        }
    ],
    "nse_application_example": {
        "stock": "Example Bank",
        "market_cap": "KES 120B",
        "current_ratio": 2.5,
        "eps_last_10_years": "Positive each year",
        "dividends": "8 consecutive years",
        "eps_growth_10yr": "40% (3.5% annually)",
        "pe_ratio": 10.5,
        "pb_ratio": 1.2,
        "graham_number_calc": "√(22.5 × 2.5 × 12) = KES 25.98",
        "current_price": "KES 24.50",
        "result": "PASS - Meets defensive investor criteria"
    }
}

GRAHAM_ENTERPRISING_INVESTOR_CRITERIA = {
    "description": "For more active investors willing to do extra research for potentially higher returns",
    "approaches": [
        {
            "strategy": "Buying Unpopular Large Companies",
            "criteria": [
                "Large cap (KES 10B+)",
                "Temporarily depressed price",
                "P/E significantly below historical average",
                "Strong financials despite price weakness"
            ],
            "nse_example": "Quality banks during 2016-2017 NPL crisis"
        },
        {
            "strategy": "Net-Net Working Capital",
            "formula": "NCAV = Current Assets - Total Liabilities",
            "rule": "Buy if market cap < (2/3) × NCAV",
            "explanation": "Company worth more dead than alive - extreme value",
            "nse_note": "Rare on NSE but watch for distressed situations"
        },
        {
            "strategy": "Secondary Companies",
            "description": "Smaller, less popular companies with good fundamentals",
            "criteria": [
                "Market cap KES 2-10B",
                "P/E < 10",
                "P/B < 1.0",
                "Debt/Equity < 0.5"
            ],
            "risk_note": "Higher liquidity risk, require larger margin of safety (40-50%)"
        }
    ]
}

BUFFETT_QUALITY_PRINCIPLES = {
    "description": "Warren Buffett's focus on business quality over statistical cheapness",
    "key_principles": [
        {
            "principle": "Economic Moat",
            "definition": "Durable competitive advantage that protects returns",
            "types": [
                {
                    "type": "Intangible Assets",
                    "examples": "Brands (Tusker), Patents, Licenses (banking, telecom)",
                    "nse_stocks": "EABL, Safaricom, KCB"
                },
                {
                    "type": "Cost Advantages",
                    "examples": "Scale (lowest cost producer), Process advantages",
                    "nse_stocks": "Bamburi Cement (scale), Safaricom (network effects)"
                },
                {
                    "type": "Network Effects",
                    "examples": "Value increases as users increase",
                    "nse_stocks": "Safaricom M-Pesa (30M+ users)"
                },
                {
                    "type": "Switching Costs",
                    "examples": "High cost to change providers",
                    "nse_stocks": "Banks (customer inertia), Insurance"
                }
            ]
        },
        {
            "principle": "Management Quality",
            "assessment_criteria": [
                "Capital allocation track record",
                "Shareholder-friendly (dividends, buybacks)",
                "Integrity and transparency",
                "Long-term thinking over quarterly focus"
            ],
            "red_flags": [
                "Excessive related-party transactions",
                "Frequent equity dilution",
                "Overpaying for acquisitions",
                "Aggressive accounting practices"
            ]
        },
        {
            "principle": "Understandable Business",
            "buffett_circle_of_competence": "Only invest in businesses you understand",
            "nse_simple_businesses": [
                "Banking (borrow low, lend high)",
                "Beer manufacturing (make beer, sell beer)",
                "Telecom (airtime, data, M-Pesa)",
                "Cement (produce cement, sell to builders)"
            ],
            "avoid_complex": "Avoid if you can't explain it to a 10-year-old"
        },
        {
            "principle": "Favorable Long-Term Prospects",
            "questions_to_ask": [
                "Will people still need this product in 10-20 years?",
                "Is the industry growing or declining?",
                "Can the company raise prices (pricing power)?",
                "Are barriers to entry high?"
            ],
            "durable_nse_sectors": "Banking, Telecom, Consumer Staples, Utilities"
        }
    ]
}

ENHANCED_VALUATION_METHODS = {
    "earnings_power_value": {
        "description": "Bruce Greenwald's method - what would company earn in normal year",
        "formula": "EPV = Normalized Earnings × (1 / Cost of Capital)",
        "steps": [
            "Calculate normalized earnings (adjust for one-time items)",
            "Determine cost of capital (12-16% for NSE stocks)",
            "Divide normalized earnings by cost of capital",
            "Compare to current market price"
        ],
        "example": {
            "normalized_earnings": "KES 10B",
            "cost_of_capital": 0.15,
            "epv": "10B / 0.15 = KES 66.7B",
            "shares_outstanding": "1B shares",
            "epv_per_share": "KES 66.70",
            "current_price": "KES 45",
            "margin_of_safety": "32%"
        }
    },
    "asset_based_valuation": {
        "description": "Valuation based on company's assets",
        "methods": [
            {
                "method": "Book Value",
                "formula": "Book Value = Total Assets - Total Liabilities",
                "best_for": "Banks, insurance, asset-heavy companies",
                "adjustment": "Check for outdated asset values on balance sheet"
            },
            {
                "method": "Tangible Book Value",
                "formula": "Tangible BV = Book Value - Intangible Assets (goodwill, etc.)",
                "reasoning": "More conservative - intangibles may have no real value"
            },
            {
                "method": "Liquidation Value",
                "formula": "Liquidation = Assets at Fire Sale Prices - All Liabilities",
                "when_to_use": "Distressed companies, bankruptcy situations",
                "nse_application": "Rare but useful for severely depressed stocks"
            },
            {
                "method": "Replacement Value",
                "description": "Cost to build the business from scratch today",
                "components": "Land, buildings, equipment, licenses, brand",
                "nse_example": "Bank needs: licenses (priceless), branches (KES 100M+), systems, brand"
            }
        ]
    },
    "relative_valuation": {
        "description": "Compare to similar companies",
        "steps": [
            "Select 5-10 comparable companies (same sector, similar size)",
            "Calculate median P/E, P/B, EV/EBITDA",
            "Apply to target company's metrics",
            "Adjust for quality differences"
        ],
        "nse_example": {
            "target": "KCB",
            "comparables": "Equity, Co-op, NCBA, Stanbic",
            "median_pe": 9.0,
            "kcb_eps": "KES 3.50",
            "implied_fair_value": "9.0 × 3.50 = KES 31.50",
            "current_price": "KES 28.00",
            "undervaluation": "11%"
        }
    }
}

ADVANCED_VALUE_CONCEPTS = {
    "owner_earnings": {
        "buffett_concept": "Cash owner can take out without harming business",
        "formula": "Owner Earnings = Net Income + D&A + Other Non-Cash - CapEx - Working Capital Increase",
        "why_better_than_eps": [
            "EPS includes non-cash items",
            "EPS ignores capital needs",
            "Owner Earnings = actual cash available"
        ],
        "valuation": "Fair Value = Owner Earnings × 10-15 (depending on quality)",
        "nse_example": {
            "company": "Example Ltd",
            "net_income": "KES 5B",
            "depreciation": "KES 2B",
            "capex": "KES 1.5B",
            "working_capital_increase": "KES 0.5B",
            "owner_earnings": "5 + 2 - 1.5 - 0.5 = KES 5B",
            "multiple": 12,
            "fair_value": "5B × 12 = KES 60B"
        }
    },
    "earnings_quality_analysis": {
        "high_quality_earnings": [
            "Cash-based (Operating CF > Net Income)",
            "Recurring revenue (not one-time)",
            "Conservative accounting",
            "Low accruals"
        ],
        "low_quality_warnings": [
            "Net Income > Operating Cash Flow (for 2+ years)",
            "Frequent 'extraordinary items'",
            "Aggressive revenue recognition",
            "High accounts receivable growth"
        ],
        "nse_checks": [
            "Compare Net Income to Operating Cash Flow",
            "Check for related-party transactions",
            "Review audit report for qualifications",
            "Examine notes for accounting changes"
        ]
    },
    "debt_analysis_value_perspective": {
        "acceptable_debt_levels": {
            "non_financial": "Debt/Equity < 0.5 (conservative)",
            "financial": "Tier 1 Capital Ratio > 14% (for banks)",
            "cyclical": "Low debt crucial - can't weather downturns with high debt"
        },
        "interest_coverage": {
            "formula": "Interest Coverage = EBIT / Interest Expense",
            "minimum": "5 times (can afford 80% drop in EBIT)",
            "warning": "< 3 times is risky",
            "nse_note": "Many NSE companies have low debt, high coverage"
        },
        "debt_maturity_profile": "Check if debt matures soon (refinancing risk)"
    },
    "return_on_invested_capital": {
        "formula": "ROIC = NOPAT / Invested Capital",
        "where": "NOPAT = Operating Income × (1 - Tax Rate), Invested Capital = Equity + Debt - Cash",
        "interpretation": {
            "excellent": "> 15%",
            "good": "10-15%",
            "average": "5-10%",
            "poor": "< 5%"
        },
        "why_important": "Better than ROE - shows returns on all capital (equity + debt)",
        "value_signal": "ROIC > Cost of Capital consistently = value creator"
    }
}

BEHAVIORAL_VALUE_INVESTING = {
    "description": "Exploiting market psychology and behavioral biases",
    "common_biases_to_exploit": [
        {
            "bias": "Recency Bias",
            "definition": "Overweighting recent events",
            "how_to_exploit": "Buy good companies after recent bad quarter (market overreacts)",
            "nse_example": "Bank reports higher NPLs one quarter - stock drops 20% despite long-term strength"
        },
        {
            "bias": "Herd Mentality",
            "definition": "Following the crowd",
            "how_to_exploit": "Buy when sector is hated, sell when loved",
            "buffett_quote": "Be fearful when others are greedy, greedy when others are fearful"
        },
        {
            "bias": "Loss Aversion",
            "definition": "Fear of losses greater than desire for gains",
            "how_to_exploit": "Buy during panic selling, market crashes",
            "nse_example": "COVID-19 crash March 2020 - quality stocks down 40-50%"
        },
        {
            "bias": "Anchoring",
            "definition": "Fixating on past prices",
            "trap_to_avoid": "Stock was KES 100, now KES 50 = cheap?",
            "correct_approach": "Ignore past price, calculate intrinsic value independently"
        }
    ],
    "market_sentiment_indicators": {
        "extreme_pessimism_signs": [
            "NSE 20 P/E < 6 (historical average 8-10)",
            "Dividend yields > 8% (normal 4-6%)",
            "Foreign investors net sellers for 6+ months",
            "Media: doom and gloom headlines",
            "Volume drying up (capitulation)"
        ],
        "extreme_optimism_signs": [
            "NSE 20 P/E > 15",
            "Dividend yields < 3%",
            "Foreign investors buying heavily",
            "Media: everyone should invest in stocks",
            "IPOs oversubscribed 10x+"
        ],
        "contrarian_approach": "Invest when pessimism extreme, raise cash when optimism extreme"
    }
}

VALUE_INVESTING_MISTAKES_TO_AVOID = {
    "value_traps": {
        "definition": "Stocks that look cheap but deserve to be cheap",
        "warning_signs": [
            "Declining revenue for 3+ years",
            "Eroding competitive position",
            "High debt in cyclical downturn",
            "Technological disruption threat",
            "Management with poor track record"
        ],
        "nse_examples": [
            "Manufacturer losing market share to imports",
            "Bank with persistent bad loan problems",
            "Retailer disrupted by e-commerce"
        ],
        "how_to_avoid": [
            "Focus on 'why' stock is cheap",
            "Check industry trends (growing or dying?)",
            "Assess whether problems are temporary or permanent",
            "Require strong business fundamentals"
        ]
    },
    "catching_falling_knives": {
        "mistake": "Buying stock in free fall without waiting for stabilization",
        "better_approach": [
            "Wait for price to stabilize",
            "Look for signs business is improving",
            "Average in slowly (don't buy all at once)",
            "Accept missing the very bottom"
        ],
        "nse_wisdom": "Better to buy at KES 30 after stability than KES 25 in free fall to KES 15"
    },
    "ignoring_catalysts": {
        "issue": "Buying value stock with no catalyst for revaluation",
        "catalyst_examples": [
            "Earnings turnaround expected",
            "New management team",
            "Asset sale / restructuring",
            "Sector rotation",
            "Re-inclusion in index"
        ],
        "patience_required": "Value can take 2-5 years to materialize, but catalysts help"
    }
}

WORKING_CAPITAL_ANALYSIS = {
    "description": "Analysis of short-term assets and liabilities",
    "key_metrics": [
        {
            "metric": "Current Ratio",
            "formula": "Current Ratio = Current Assets / Current Liabilities",
            "interpretation": ">2.0 excellent, 1.5-2.0 good, <1.5 warning"
        },
        {
            "metric": "Quick Ratio (Acid Test)",
            "formula": "Quick Ratio = (Current Assets - Inventory) / Current Liabilities",
            "interpretation": ">1.0 means can pay debts without selling inventory"
        },
        {
            "metric": "Cash Conversion Cycle",
            "formula": "CCC = Inventory Days + Receivables Days - Payables Days",
            "interpretation": "Lower is better - cash tied up for shorter time",
            "nse_sector_norms": {
                "retail": "30-60 days",
                "manufacturing": "90-120 days",
                "service": "30-45 days"
            }
        }
    ],
    "working_capital_quality": [
        "Increasing inventory = warning (can't sell products)",
        "Increasing receivables = warning (customers not paying)",
        "Decreasing payables days = warning (cash tight)",
        "Ideal: Negative working capital (customers pay before you pay suppliers)"
    ]
}

SUM_OF_PARTS_VALUATION = {
    "description": "Value each business segment separately, useful for conglomerates",
    "methodology": [
        "Identify all business segments",
        "Determine revenue and operating income per segment",
        "Apply appropriate P/E or EV/EBITDA multiple per segment",
        "Sum all segment values",
        "Subtract corporate debt, add cash"
    ],
    "nse_application": {
        "example": "Diversified company with 3 segments",
        "segment_1": {
            "description": "Banking division",
            "earnings": "KES 5B",
            "sector_pe": 10,
            "value": "KES 50B"
        },
        "segment_2": {
            "description": "Insurance division",
            "earnings": "KES 2B",
            "sector_pe": 12,
            "value": "KES 24B"
        },
        "segment_3": {
            "description": "Asset management",
            "earnings": "KES 1B",
            "sector_pe": 15,
            "value": "KES 15B"
        },
        "sum_of_parts": "50 + 24 + 15 = KES 89B",
        "less_debt": "KES 10B",
        "plus_cash": "KES 5B",
        "total_value": "KES 84B",
        "market_cap": "KES 65B",
        "undervaluation": "23% discount to sum-of-parts"
    },
    "when_to_use": "Conglomerates, holding companies, diversified businesses"
}

DIVIDEND_INVESTING_VALUE_APPROACH = {
    "description": "Focus on dividend-paying stocks for income + growth",
    "screening_criteria": {
        "dividend_yield": "> 5% (above NSE average of 4%)",
        "payout_ratio": "40-70% (sustainable range)",
        "dividend_growth": "5-year CAGR > inflation rate",
        "earnings_stability": "Consistent positive earnings"
    },
    "dividend_discount_model": {
        "simple_formula": "Fair Value = Annual Dividend / Required Return",
        "gordon_growth_model": "Fair Value = D₀ × (1 + g) / (r - g)",
        "where": "D₀ = current dividend, g = growth rate, r = required return",
        "nse_example": {
            "current_dividend": "KES 4.00",
            "growth_rate": "5% (g = 0.05)",
            "required_return": "14% (r = 0.14)",
            "fair_value": "4.00 × 1.05 / (0.14 - 0.05) = KES 46.67"
        }
    },
    "dividend_safety_checks": [
        "Payout ratio < 80% (room for cuts)",
        "FCF > Dividends (can afford to pay)",
        "Debt level manageable",
        "Earnings not declining"
    ],
    "nse_dividend_aristocrats": "Look for 5+ years consecutive dividends: KCB, Equity, EABL, Safaricom"
}

SPECIAL_SITUATIONS_VALUE = {
    "description": "Opportunities in corporate events and special circumstances",
    "types": [
        {
            "situation": "Spin-offs",
            "opportunity": "Parent sells/distributes subsidiary - often undervalued initially",
            "why_undervalued": "Forced selling by index funds, lack of analyst coverage",
            "research_needed": "Understand new standalone business, management, financials"
        },
        {
            "situation": "Rights Issues",
            "opportunity": "Existing shareholders get to buy new shares at discount",
            "value_play": "If company is undervalued, buying rights at discount compounds value",
            "nse_frequency": "Common on NSE for capital raising"
        },
        {
            "situation": "Privatization/Delisting",
            "opportunity": "Controlling shareholder offers to buy out minorities",
            "strategy": "Buy before offer if significantly undervalued",
            "risk": "Offer may not materialize, price may fall back"
        },
        {
            "situation": "Regulatory Changes",
            "opportunity": "New regulations create winners and losers",
            "nse_example": "Interest rate cap removal 2019 - boosted bank valuations",
            "approach": "Identify beneficiaries early, buy before market recognizes"
        }
    ]
}

def calculate_graham_number(eps: float, book_value_per_share: float) -> float:
    """
    Calculate Benjamin Graham's number for maximum price to pay
    Formula: √(22.5 × EPS × BVPS)
    
    22.5 = Represents P/E of 15 × P/B of 1.5
    """
    import math
    if eps <= 0 or book_value_per_share <= 0:
        return 0
    return math.sqrt(22.5 * eps * book_value_per_share)


def calculate_owner_earnings(net_income: float, depreciation: float, 
                            capex: float, working_capital_change: float) -> float:
    """
    Calculate Buffett's Owner Earnings
    More accurate than reported earnings for valuation
    """
    return net_income + depreciation - capex - working_capital_change


def earnings_power_value(normalized_earnings: float, cost_of_capital: float) -> float:
    """
    Bruce Greenwald's Earnings Power Value
    What would company be worth in a normal year
    """
    if cost_of_capital == 0:
        return 0
    return normalized_earnings / cost_of_capital


def gordon_growth_model(current_dividend: float, growth_rate: float, required_return: float) -> float:
    """
    Gordon Growth Model for dividend-paying stocks
    Formula: Fair Value = D₀ × (1 + g) / (r - g)
    """
    if required_return <= growth_rate:
        return 0
    return (current_dividend * (1 + growth_rate)) / (required_return - growth_rate)