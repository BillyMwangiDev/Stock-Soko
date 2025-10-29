"""
Fees Router - Fee transparency and calculation endpoints
"""

from typing import Any, Dict

from fastapi import APIRouter, HTTPException, Query

from ..data.fee_structure import (BANK_FEES, FEE_EXAMPLES, MPESA_FEES,
                                  REGULATORY_INFO, SETTLEMENT, TRADING_FEES,
                                  calculate_mpesa_withdrawal_fee,
                                  calculate_trading_fees)

router = APIRouter(prefix="/fees", tags=["fees"])


@router.get("/trading")
async def get_trading_fees() -> Dict[str, Any]:
    """Get complete trading fee structure"""
    return {
        "fees": TRADING_FEES,
        "settlement": SETTLEMENT,
        "examples": FEE_EXAMPLES,
        "description": "All trading fees are charged per transaction and calculated as a percentage of trade value",
    }


@router.get("/payments")
async def get_payment_fees() -> Dict[str, Any]:
    """Get payment method fees (M-Pesa, Bank)"""
    return {
        "mpesa": MPESA_FEES,
        "bank": BANK_FEES,
        "description": "Deposit fees are waived. Withdrawal fees vary by method and amount.",
    }


@router.get("/calculate")
async def calculate_fees(
    amount: float = Query(..., gt=0, description="Trade amount in KES"),
    type: str = Query("buy", description="Transaction type: buy or sell"),
) -> Dict[str, Any]:
    """Calculate fees for a given trade amount"""
    try:
        if amount <= 0:
            raise HTTPException(status_code=400, detail="Amount must be greater than 0")

        fees = calculate_trading_fees(amount)

        return {
            "transaction_type": type,
            **fees,
            "breakdown": {
                "commission": f"{TRADING_FEES['commission']['rate'] * 100}% - {TRADING_FEES['commission']['description']}",
                "cds_fee": f"{TRADING_FEES['cds_fee']['rate'] * 100}% - {TRADING_FEES['cds_fee']['description']}",
                "nse_fee": f"{TRADING_FEES['nse_fee']['rate'] * 100}% - {TRADING_FEES['nse_fee']['description']}",
                "scfee": f"{TRADING_FEES['scfee']['rate'] * 100}% - {TRADING_FEES['scfee']['description']}",
            },
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/mpesa-withdrawal")
async def get_mpesa_withdrawal_fee(
    amount: float = Query(..., gt=0, description="Withdrawal amount in KES")
) -> Dict[str, Any]:
    """Calculate M-Pesa withdrawal fee for given amount"""
    try:
        if amount <= 0:
            raise HTTPException(status_code=400, detail="Amount must be greater than 0")

        if amount > 150000:
            raise HTTPException(
                status_code=400, detail="Maximum M-Pesa withdrawal is KES 150,000"
            )

        fee = calculate_mpesa_withdrawal_fee(amount)
        net_amount = amount - fee

        return {
            "withdrawal_amount": amount,
            "mpesa_fee": fee,
            "net_amount_received": net_amount,
            "currency": "KES",
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/regulatory")
async def get_regulatory_info() -> Dict[str, Any]:
    """Get regulatory information and disclosures"""
    return REGULATORY_INFO


@router.get("/settlement")
async def get_settlement_info() -> Dict[str, Any]:
    """Get settlement timeline information"""
    return {
        **SETTLEMENT,
        "note": "Kenyan market operates on a T+3 settlement cycle. This means shares and funds are transferred 3 business days after trade execution.",
    }


@router.get("/all")
async def get_all_fees() -> Dict[str, Any]:
    """Get complete fee structure - all fees in one response"""
    return {
        "trading": TRADING_FEES,
        "payments": {"mpesa": MPESA_FEES, "bank": BANK_FEES},
        "settlement": SETTLEMENT,
        "regulatory": REGULATORY_INFO,
        "examples": FEE_EXAMPLES,
    }
