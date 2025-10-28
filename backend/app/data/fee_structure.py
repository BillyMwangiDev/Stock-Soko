"""
Fee Structure - Trading and payment fees for Stock Soko
"""

# NSE Trading Fees (as percentages)
TRADING_FEES = {
    "commission": {
        "rate": 0.0195,  # 1.95% brokerage commission
        "description": "Brokerage commission charged on trade value"
    },
    "cds_fee": {
        "rate": 0.0006,  # 0.06% CDS fee
        "description": "Central Depository System fee"
    },
    "nse_fee": {
        "rate": 0.0008,  # 0.08% NSE trading fee
        "description": "Nairobi Securities Exchange trading fee"
    },
    "scfee": {
        "rate": 0.0012,  # 0.12% Securities Clearing fee
        "description": "Securities clearing and settlement fee"
    },
    "total_rate": 0.0221,  # 2.21% total
    "description": "All trading fees combined equal approximately 2.21% of trade value"
}

# M-Pesa Fee Structure (KES)
MPESA_FEES = {
    "deposit": {
        "fee": 0,
        "description": "Free deposits via M-Pesa STK Push"
    },
    "withdrawal_tiers": [
        {"min": 1, "max": 49, "fee": 0},
        {"min": 50, "max": 100, "fee": 0},
        {"min": 101, "max": 500, "fee": 7},
        {"min": 501, "max": 1000, "fee": 13},
        {"min": 1001, "max": 1500, "fee": 23},
        {"min": 1501, "max": 2500, "fee": 33},
        {"min": 2501, "max": 3500, "fee": 52},
        {"min": 3501, "max": 5000, "fee": 69},
        {"min": 5001, "max": 7500, "fee": 87},
        {"min": 7501, "max": 10000, "fee": 115},
        {"min": 10001, "max": 15000, "fee": 167},
        {"min": 15001, "max": 20000, "fee": 185},
        {"min": 20001, "max": 35000, "fee": 197},
        {"min": 35001, "max": 50000, "fee": 278},
        {"min": 50001, "max": 150000, "fee": 309}
    ],
    "description": "M-Pesa withdrawal fees based on Safaricom tariff"
}

# Bank Transfer Fees (Future)
BANK_FEES = {
    "deposit": {
        "fee": 0,
        "description": "Free bank deposits (coming soon)"
    },
    "withdrawal": {
        "fee": 50,
        "description": "KES 50 flat fee for bank withdrawals (coming soon)"
    }
}

# Settlement Information
SETTLEMENT = {
    "timeline": "T+3",
    "description": "Trades settle 3 business days after execution",
    "details": {
        "T+0": "Trade execution day",
        "T+1": "Trade confirmation",
        "T+2": "Settlement preparation",
        "T+3": "Shares and funds transferred"
    }
}

# Regulatory Information
REGULATORY_INFO = {
    "licenses": [
        {
            "authority": "Capital Markets Authority (CMA)",
            "license_number": "Pending",
            "status": "Application in progress"
        },
        {
            "authority": "Nairobi Securities Exchange (NSE)",
            "membership": "Partner Broker",
            "status": "Active"
        }
    ],
    "disclosures": [
        "All investments carry risk. Past performance does not guarantee future results.",
        "Stock Soko is a digital platform that facilitates trading through licensed brokers.",
        "Investor funds are held in segregated accounts for security.",
        "All fees are disclosed upfront before trade execution.",
        "Shares are held with the Central Depository & Settlement Corporation (CDSC)."
    ]
}

# Fee Calculation Examples
FEE_EXAMPLES = [
    {
        "trade_value": 10000,
        "fees": {
            "commission": 195.00,
            "cds_fee": 6.00,
            "nse_fee": 8.00,
            "scfee": 12.00,
            "total": 221.00
        },
        "total_cost": 10221.00
    },
    {
        "trade_value": 50000,
        "fees": {
            "commission": 975.00,
            "cds_fee": 30.00,
            "nse_fee": 40.00,
            "scfee": 60.00,
            "total": 1105.00
        },
        "total_cost": 51105.00
    },
    {
        "trade_value": 100000,
        "fees": {
            "commission": 1950.00,
            "cds_fee": 60.00,
            "nse_fee": 80.00,
            "scfee": 120.00,
            "total": 2210.00
        },
        "total_cost": 102210.00
    }
]


def calculate_mpesa_withdrawal_fee(amount: float) -> float:
    """Calculate M-Pesa withdrawal fee based on amount"""
    for tier in MPESA_FEES["withdrawal_tiers"]:
        if tier["min"] <= amount <= tier["max"]:
            return tier["fee"]
    
    # If amount exceeds max tier, return highest fee
    return MPESA_FEES["withdrawal_tiers"][-1]["fee"]


def calculate_trading_fees(trade_value: float) -> dict:
    """Calculate all trading fees for a given trade value"""
    commission = trade_value * TRADING_FEES["commission"]["rate"]
    cds_fee = trade_value * TRADING_FEES["cds_fee"]["rate"]
    nse_fee = trade_value * TRADING_FEES["nse_fee"]["rate"]
    scfee = trade_value * TRADING_FEES["scfee"]["rate"]
    total_fees = commission + cds_fee + nse_fee + scfee
    
    return {
        "trade_value": round(trade_value, 2),
        "commission": round(commission, 2),
        "cds_fee": round(cds_fee, 2),
        "nse_fee": round(nse_fee, 2),
        "scfee": round(scfee, 2),
        "total_fees": round(total_fees, 2),
        "total_cost": round(trade_value + total_fees, 2),
        "fee_percentage": round((total_fees / trade_value * 100), 2) if trade_value > 0 else 0
    }

