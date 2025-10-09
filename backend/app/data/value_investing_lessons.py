"""
Value Investing Educational Module
Beginner-friendly lessons on value investing adapted for NSE

Based on Benjamin Graham and Warren Buffett principles,
customized for Kenyan market conditions.
"""

VALUE_INVESTING_BEGINNER = [
    {
        "id": "V1-001",
        "title": "What is Value Investing?",
        "description": "Introduction to buying stocks below their true worth and holding for long-term gains.",
        "complexity_level": 1,
        "duration_minutes": 15,
        "concepts": [
            "Value vs Price: What's the difference?",
            "Mr. Market concept: Market emotions create opportunities",
            "Long-term mindset: 3-5 year minimum holding period",
            "Margin of Safety: Your protection against mistakes"
        ],
        "key_principles": [
            "Buy stocks trading below intrinsic value",
            "Focus on business fundamentals, not market prices",
            "Patient approach: wait for the right price",
            "Think like a business owner, not a trader"
        ],
        "examples": [
            "If a business is worth KES 100 but trades at KES 60, that's a value opportunity",
            "KCB trading at P/E 8 when historical average is 12 = potential value",
            "During 2016 banking crisis, good banks sold cheaply due to fear"
        ],
        "nse_context": "NSE offers value opportunities during: market downturns, sector-specific crises, low foreign investor participation"
    },
    {
        "id": "V1-002",
        "title": "Margin of Safety - Your Most Important Concept",
        "description": "Learn to protect yourself by buying at significant discounts to intrinsic value.",
        "complexity_level": 1,
        "duration_minutes": 18,
        "concepts": [
            "What is Margin of Safety?",
            "Why you need it: protection against errors",
            "Calculating your margin",
            "NSE-specific requirements"
        ],
        "formulas": [
            {
                "name": "Margin of Safety",
                "formula": "MOS = (Intrinsic Value - Market Price) / Intrinsic Value × 100%",
                "example": "Intrinsic Value KES 100, Price KES 70 => MOS = 30%"
            }
        ],
        "guidelines": {
            "minimum_mos": "30% for stable large caps (e.g., Safaricom, KCB)",
            "higher_mos": "40-50% for volatile or smaller companies",
            "reason": "NSE has higher volatility than developed markets"
        },
        "practical_example": {
            "stock": "Example Bank",
            "intrinsic_value": 150,
            "current_price": 95,
            "mos_calculation": "(150 - 95) / 150 = 36.7%",
            "decision": "GOOD - Meets 30% minimum for banking stock"
        }
    },
    {
        "id": "V1-003",
        "title": "Simple Valuation - Is It Cheap?",
        "description": "Easy methods to estimate if a stock is undervalued using P/E and P/B ratios.",
        "complexity_level": 1,
        "duration_minutes": 20,
        "concepts": [
            "P/E Ratio: How many years to earn back investment",
            "P/B Ratio: Paying above or below book value",
            "Comparing to history and peers",
            "Red flags to watch for"
        ],
        "screening_rules": {
            "pe_ratio": {
                "bargain": "P/E < 8",
                "reasonable": "P/E 8-15",
                "expensive": "P/E > 15",
                "note": "Compare to company's 5-year average and sector peers"
            },
            "pb_ratio": {
                "deep_value": "P/B < 1.0 (trading below book value)",
                "fair": "P/B 1.0-1.5",
                "expensive": "P/B > 2.0"
            }
        },
        "nse_examples": [
            "Banks: Typically trade at P/E 6-12, P/B 0.8-1.5",
            "Manufacturing: P/E 8-15, P/B 1.0-2.0",
            "Telecom (Safaricom): P/E 10-15 due to stable earnings"
        ],
        "warnings": [
            "Low P/E alone isn't enough - check WHY it's low",
            "Declining earnings make low P/E a 'value trap'",
            "Check debt levels - high debt distorts book value"
        ]
    }
]

VALUE_INVESTING_INTERMEDIATE = [
    {
        "id": "V2-001",
        "title": "Business Quality - The Moat Concept",
        "description": "Identify companies with durable competitive advantages that protect profits.",
        "complexity_level": 2,
        "duration_minutes": 25,
        "concepts": [
            "What is an economic moat?",
            "Types of moats in Kenya",
            "How moats protect returns",
            "Moat durability over time"
        ],
        "kenya_specific_moats": {
            "regulatory_licenses": {
                "examples": "Banking licenses, telecom frequencies, insurance permits",
                "advantage": "High barriers to entry, limited competition",
                "nse_stocks": ["KCB", "Equity", "Safaricom", "Jubilee Insurance"]
            },
            "brand_dominance": {
                "examples": "Trusted consumer brands with pricing power",
                "advantage": "Customer loyalty, premium pricing",
                "nse_stocks": ["EABL (Tusker, Guinness)", "BAT (cigarettes)"]
            },
            "distribution_networks": {
                "examples": "Extensive branch/dealer networks",
                "advantage": "Hard to replicate, customer convenience",
                "nse_stocks": ["Banks with 100+ branches", "Insurance agents"]
            },
            "scale_economies": {
                "examples": "Largest player with lowest costs",
                "advantage": "Can underprice competitors",
                "nse_stocks": ["Bamburi Cement", "Safaricom"]
            }
        },
        "assessment_questions": [
            "Could a new competitor easily take market share?",
            "Does the company have pricing power?",
            "Are customers loyal or do they switch easily?",
            "How much would it cost to build this business from scratch?"
        ]
    },
    {
        "id": "V2-002",
        "title": "Understanding Business Models",
        "description": "Learn to analyze how a company makes money and if it's sustainable.",
        "complexity_level": 2,
        "duration_minutes": 22,
        "concepts": [
            "Revenue sources: where money comes from",
            "Cost structure: fixed vs variable costs",
            "Cash conversion: earnings to actual cash",
            "Business model simplicity"
        ],
        "nse_business_models": {
            "banks": {
                "revenue": "Interest income (loans) + Fees (transfers, cards)",
                "costs": "Interest paid to depositors + Operating expenses",
                "key_metric": "Net Interest Margin (NIM)",
                "understand": "Banks borrow cheap (deposits 5-8%) and lend high (loans 12-16%)"
            },
            "manufacturing": {
                "revenue": "Product sales (cement, beer, etc.)",
                "costs": "Raw materials + Labor + Distribution",
                "key_metric": "Gross Margin",
                "understand": "Scale matters - larger volume = lower unit costs"
            },
            "telecom": {
                "revenue": "Airtime + Data + M-Pesa fees",
                "costs": "Network maintenance + Customer acquisition",
                "key_metric": "ARPU (Average Revenue Per User)",
                "understand": "Network effects - more users = more valuable"
            }
        },
        "simplicity_principle": "Warren Buffett rule: If you can't explain the business to a 10-year-old, don't invest"
    },
    {
        "id": "V2-003",
        "title": "Intrinsic Value Calculation Methods",
        "description": "Practical approaches to estimate what a business is truly worth.",
        "complexity_level": 2,
        "duration_minutes": 28,
        "methods": [
            {
                "name": "Asset-Based Valuation",
                "formula": "Book Value (Assets - Liabilities)",
                "when_to_use": "Banks, insurance companies, asset-heavy businesses",
                "example": "Bank with KES 500B assets, KES 450B liabilities => Book Value = KES 50B"
            },
            {
                "name": "Earnings Multiple",
                "formula": "Fair Value = Normalized Earnings × Reasonable P/E",
                "when_to_use": "Stable businesses with consistent earnings",
                "example": "Company earns KES 10/share consistently, sector P/E = 10 => Fair Value = KES 100"
            },
            {
                "name": "Dividend Discount Model (Simple)",
                "formula": "Value = Annual Dividend / Required Return",
                "when_to_use": "Mature companies with stable dividends",
                "example": "KES 4/share dividend, 12% required return => Value = 4/0.12 = KES 33"
            },
            {
                "name": "Owner Earnings Method",
                "formula": "Value = (Net Income + D&A - CapEx) × 10-15",
                "when_to_use": "Most businesses with positive cash flow",
                "explanation": "Warren Buffett's preferred method - focus on cash owner can take out"
            }
        ],
        "conservative_assumptions": {
            "growth_rate": "Use 5-10% for Kenya (lower than India/China)",
            "discount_rate": "15-20% to account for NSE volatility",
            "terminal_value": "Be conservative - don't assume growth forever"
        }
    },
    {
        "id": "V2-004",
        "title": "Liquidity and Risk Analysis",
        "description": "Assess if you can actually buy and sell the stock, and identify hidden risks.",
        "complexity_level": 2,
        "duration_minutes": 24,
        "liquidity_metrics": {
            "average_daily_volume": {
                "formula": "Average of daily shares traded over 90 days",
                "benchmark": "Minimum KES 500,000 daily turnover",
                "interpretation": "Can you buy 10,000 shares without moving the price?",
                "warning": "Avoid if your intended position > 20% of daily volume"
            },
            "bid_ask_spread": {
                "formula": "(Ask Price - Bid Price) / Bid Price",
                "acceptable": "0.5-2% for liquid stocks",
                "warning_sign": ">5% indicates poor liquidity",
                "impact": "Wide spreads eat into your returns"
            },
            "free_float": {
                "definition": "Percentage of shares available for public trading",
                "benchmark": ">20% for good liquidity",
                "nse_reality": "Many stocks have 60%+ insider ownership",
                "impact": "Low free float = harder to buy/sell"
            }
        },
        "risk_assessment": {
            "business_risk": "Can the industry be disrupted? (e.g., Fintech vs Banks)",
            "financial_risk": "Debt/Equity >1.0 is concerning for most sectors",
            "management_risk": "Check for related-party transactions, poor governance",
            "market_risk": "Beta >1.5 means stock is 50% more volatile than market"
        },
        "value_adjustment": "Illiquid stocks require 40-50% margin of safety (higher than normal 30%)"
    }
]

VALUE_INVESTING_ADVANCED = [
    {
        "id": "V3-001",
        "title": "Deep Dive: Return on Equity Analysis",
        "description": "Master ROE as a key quality indicator and learn to decompose it.",
        "complexity_level": 3,
        "duration_minutes": 30,
        "formulas": [
            {
                "name": "ROE (Basic)",
                "formula": "ROE = Net Income / Shareholders' Equity",
                "interpretation": ">20% excellent, 15-20% good, 10-15% average, <10% poor"
            },
            {
                "name": "DuPont Analysis (3-Factor)",
                "formula": "ROE = Profit Margin × Asset Turnover × Equity Multiplier",
                "components": {
                    "profit_margin": "Net Income / Revenue (profitability)",
                    "asset_turnover": "Revenue / Assets (efficiency)",
                    "equity_multiplier": "Assets / Equity (leverage)"
                },
                "insight": "Shows if high ROE comes from profits, efficiency, or debt"
            }
        ],
        "nse_sector_benchmarks": {
            "banking": "15-25% (higher leverage acceptable)",
            "manufacturing": "12-20%",
            "consumer_goods": "10-18%",
            "agriculture": "8-15% (capital intensive)"
        },
        "quality_checks": [
            "Consistency: ROE >15% for 5+ consecutive years",
            "Source: High ROE from profits > from leverage",
            "Trend: Improving or stable ROE > declining",
            "Peer comparison: Above industry average"
        ],
        "case_study": {
            "company_a": "ROE 25% but Debt/Equity 3.0 => Risky leverage",
            "company_b": "ROE 18% with Debt/Equity 0.5 => Quality business",
            "decision": "Company B is better value investment despite lower ROE"
        }
    },
    {
        "id": "V3-002",
        "title": "Sector Analysis for Value Investors",
        "description": "Understand sector dynamics to identify when entire sectors are undervalued.",
        "complexity_level": 3,
        "duration_minutes": 32,
        "sector_classification": {
            "cyclical": {
                "examples": "Banking, Construction, Manufacturing, Real Estate",
                "characteristics": "Earnings fluctuate with economic cycles",
                "value_strategy": "Buy during downturns when P/E looks high (low earnings)",
                "timing": "Economic recession, interest rate hikes, industry crisis"
            },
            "defensive": {
                "examples": "Utilities (electricity), Telecom, Consumer Staples",
                "characteristics": "Stable earnings regardless of economy",
                "value_strategy": "Focus on dividend yield and cash flow stability",
                "timing": "Less about timing, more about absolute valuation"
            },
            "growth": {
                "examples": "Technology, E-commerce, Fintech",
                "characteristics": "High growth but often expensive",
                "value_strategy": "Require current earnings-based value, not projections",
                "caution": "Growth stocks rarely qualify as value investments on NSE"
            }
        },
        "kenya_specific_factors": {
            "interest_rates": {
                "rising_rates": "Negative for banks (short-term), real estate, highly leveraged companies",
                "falling_rates": "Positive for banks (long-term), borrowers, construction"
            },
            "currency_exposure": {
                "kes_depreciation": "Hurts importers (fuel, machinery), helps exporters (tea, coffee, horticulture)",
                "hedging": "Check if company hedges forex risk"
            },
            "regulation": {
                "banking_cap_removal": "Improved bank profitability 2019+",
                "teleco m_licensing": "Protects Safaricom's dominance",
                "energy_policy": "Affects KenGen, Kenya Power valuations"
            }
        },
        "sector_rotation": "As value investor, focus on out-of-favor sectors with good fundamentals"
    },
    {
        "id": "V3-003",
        "title": "Historical Analysis - Finding Patterns",
        "description": "Use 10-year history to identify cyclical lows and assess business durability.",
        "complexity_level": 3,
        "duration_minutes": 35,
        "analysis_framework": {
            "revenue_trends": {
                "timeframe": "10 years of annual revenue",
                "key_questions": [
                    "Has revenue grown consistently?",
                    "Are there cyclical patterns?",
                    "Market share increasing or decreasing?",
                    "Any structural decline in the industry?"
                ],
                "red_flags": "Declining revenue for 3+ years without turnaround plan"
            },
            "profitability_trends": {
                "metrics": ["Gross Margin", "Operating Margin", "Net Margin"],
                "analysis": "Expanding margins = competitive advantage, Contracting = pressure",
                "cyclical_note": "For cyclical stocks, look at average margins through cycle"
            },
            "balance_sheet_evolution": {
                "debt_trends": "Is debt growing faster than business?",
                "working_capital": "Increasing inventory/receivables may signal slowing sales",
                "cash_generation": "Free Cash Flow positive and growing?"
            },
            "dividend_history": {
                "consistency": "How many consecutive years of dividends?",
                "growth": "Dividend per share CAGR over 10 years",
                "sustainability": "Payout ratio < 70% generally sustainable",
                "nse_context": "NSE companies often pay 50-80% of earnings as dividends"
            }
        },
        "valuation_history": {
            "pe_range": {
                "calculation": "Plot P/E ratio over 10 years",
                "identify": "Typical low (e.g., 6), average (10), high (14)",
                "current_assessment": "If P/E at 7, near historical low = potential value"
            },
            "pb_range": "Same approach for Price/Book ratio",
            "dividend_yield_range": "High yield relative to history = potential value signal"
        },
        "case_example": {
            "scenario": "2016 Banking Crisis",
            "observation": "Bank P/E ratios fell to 4-6 (from normal 8-12)",
            "analysis": "NPLs increased but quality banks maintained profitability",
            "opportunity": "Buy quality banks (KCB, Equity) at distressed valuations",
            "outcome": "2017-2019 recovery delivered 50-100% returns"
        }
    },
    {
        "id": "V3-004",
        "title": "Market Cycles and Behavioral Opportunities",
        "description": "Recognize market psychology patterns to find value during fear and sell during greed.",
        "complexity_level": 3,
        "duration_minutes": 30,
        "nse_market_cycles": {
            "bull_market_signs": [
                "NSE 20 Index in sustained uptrend",
                "High foreign investor participation",
                "IPOs oversubscribed",
                "Media coverage overwhelmingly positive",
                "Everyone talking about stocks"
            ],
            "bear_market_signs": [
                "Index making lower lows",
                "Foreign investor outflows",
                "Low trading volumes",
                "Negative sentiment dominates",
                "General public loses interest in stocks"
            ],
            "value_investor_approach": {
                "bull_market": "Be cautious, raise cash, hard to find value",
                "bear_market": "Be aggressive, deploy cash, abundant opportunities",
                "sideways_market": "Stock-specific opportunities, sector rotation"
            }
        },
        "sentiment_indicators": {
            "foreign_flows": {
                "data_source": "NSE weekly foreign investor reports",
                "interpretation": "Sustained outflows = potential buying opportunity",
                "contrarian": "Foreign money often wrong at extremes"
            },
            "media_sentiment": {
                "extreme_pessimism": "Business Daily front page doom = possible bottom",
                "extreme_optimism": "Everybody predicting bull run = possible top",
                "value_signal": "Buy when headlines are scary"
            },
            "insider_activity": {
                "bullish": "Directors buying their own stock",
                "bearish": "Directors selling heavily",
                "data_source": "NSE substantial shareholder notices"
            }
        },
        "behavioral_biases_to_exploit": [
            "Recency bias: Market overreacts to recent bad news",
            "Herd mentality: Everyone avoiding a sector creates opportunity",
            "Loss aversion: Panic selling during crisis",
            "Anchoring: Stock 'used to be KES 100' so KES 60 feels cheap (check fundamentals!)"
        ],
        "buffett_wisdom": "Be fearful when others are greedy, and greedy when others are fearful"
    }
]

VALUE_INVESTING_PORTFOLIO = {
    "portfolio_construction": {
        "position_sizing": {
            "max_single_position": "5-10% of portfolio",
            "initial_position": "2-3% with room to add if price drops",
            "rationale": "Allows averaging down if thesis intact but price falls",
            "cash_reserve": "10-20% for new opportunities"
        },
        "diversification_rules": {
            "minimum_stocks": "8-10 stocks (not too concentrated)",
            "maximum_stocks": "15-20 stocks (not too diversified)",
            "sector_limit": "No more than 30% in one sector",
            "market_cap_mix": "Blend of large, mid, small caps (weighted to large)"
        },
        "nse_specific": {
            "liquidity_requirement": "Each position must have >KES 1M daily turnover",
            "free_float_check": "Prefer stocks with >20% free float",
            "governance_screen": "Avoid stocks with governance red flags"
        }
    },
    "buying_strategy": {
        "entry_rules": [
            "30%+ margin of safety vs intrinsic value",
            "P/E below historical average and sector average",
            "Positive or improving business fundamentals",
            "Adequate liquidity to build position"
        ],
        "scaling_in": {
            "initial_buy": "1/3 of intended position",
            "add_more_if": "Price drops 10-15% but thesis intact",
            "final_position": "Fully invested at 30-40% discount to fair value"
        }
    },
    "holding_period": {
        "minimum": "3 years (value takes time to materialize)",
        "ideal": "5-10 years for quality compounders",
        "patience": "Market may take 2-3 years to recognize value"
    },
    "sell_discipline": {
        "sell_when": [
            "Price reaches intrinsic value estimate (full valuation)",
            "Fundamental deterioration (broken thesis)",
            "Better opportunity identified (opportunity cost)",
            "Margin of safety eliminated (overvalued)"
        ],
        "don't_sell_when": [
            "Market price falls (if fundamentals intact)",
            "Media negativity (often the best time to hold)",
            "Temporary earnings miss (if long-term intact)"
        ]
    },
    "monitoring_schedule": {
        "quarterly": "Review earnings reports, update thesis",
        "annually": "Recalculate intrinsic value, reassess moat",
        "continuous": "Watch for major corporate actions or industry changes"
    }
}

VALUE_SCREENING_CHECKLIST = {
    "quantitative_filters": {
        "valuation": {
            "pe_ratio": "<15 for large caps, <12 for small caps",
            "pb_ratio": "<1.5, ideally <1.0",
            "dividend_yield": ">4% for mature companies",
            "ev_to_ebitda": "<10 for most sectors"
        },
        "quality": {
            "roe": ">12% sustained over 5 years",
            "debt_to_equity": "<0.7 for non-financial companies",
            "current_ratio": ">1.5 (can pay short-term debts)",
            "interest_coverage": ">3 times (EBIT / Interest)"
        },
        "growth": {
            "revenue_growth": "Positive over 5-year average",
            "eps_growth": "Positive or flat (avoid declining)",
            "fcf_positive": "Free Cash Flow must be positive"
        }
    },
    "qualitative_filters": {
        "understanding": "Can you explain the business simply?",
        "moat": "Does it have sustainable competitive advantages?",
        "management": "Honest, competent, shareholder-aligned?",
        "industry": "Favorable long-term industry dynamics?"
    },
    "nse_specific_filters": {
        "liquidity": "Minimum KES 500K daily turnover",
        "free_float": "Minimum 20% public ownership",
        "audit": "Clean audit opinions (no qualifications)",
        "governance": "Good corporate governance record"
    }
}


def get_value_investing_lessons_by_level(level: int):
    """Get value investing lessons by complexity level."""
    if level == 1:
        return VALUE_INVESTING_BEGINNER
    elif level == 2:
        return VALUE_INVESTING_INTERMEDIATE
    elif level == 3:
        return VALUE_INVESTING_ADVANCED
    return []