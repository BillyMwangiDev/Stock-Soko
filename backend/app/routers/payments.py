from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..database import get_db
from ..database.models import User
from ..routers.auth import current_user_email
from ..schemas.payments import MpesaDepositRequest, MpesaDepositResponse
from ..services.mpesa_service import (get_transaction_history,
                                      initiate_mpesa_stk,
                                      initiate_mpesa_withdrawal,
                                      process_b2c_result,
                                      process_mpesa_callback, query_stk_status)
from ..utils.logging import get_logger

logger = get_logger("payments_router")

router = APIRouter(prefix="/payments", tags=["payments"])


class WithdrawalRequest(BaseModel):
    phone_number: str = Field(..., description="M-Pesa phone number")
    amount: float = Field(..., gt=0, description="Amount to withdraw")
    destination: str = Field("mpesa", description="mpesa or bank")

    class Config:
        json_schema_extra = {
            "example": {
                "phone_number": "254708374149",
                "amount": 1000,
                "destination": "mpesa",
            }
        }


class TransactionHistory(BaseModel):
    transaction_id: str
    type: str  # deposit, withdrawal, trade
    amount: float
    status: str  # pending, completed, failed
    created_at: str
    description: str


@router.post("/mpesa/deposit", response_model=MpesaDepositResponse)
def deposit(
    req: MpesaDepositRequest,
    db: Session = Depends(get_db),
    email: str = Depends(current_user_email),
) -> MpesaDepositResponse:
    """
    Initiate M-PESA STK Push deposit

    If account_id is provided, funds will be credited to that broker account.
    Otherwise, funds go to the primary broker account or general portfolio.
    """
    return initiate_mpesa_stk(req, db)


@router.post("/mpesa/callback")
async def callback(
    payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Process M-Pesa STK Push callback

    This endpoint is called by Safaricom after a customer completes/cancels an STK Push.
    It updates the transaction status and user's wallet balance.
    """
    try:
        logger.info(f"Received M-Pesa callback: {payload}")
        result = process_mpesa_callback(payload, db)
        return result
    except Exception as e:
        logger.error(f"Callback processing failed: {e}")
        return {"ResultCode": 1, "ResultDesc": f"Internal error: {str(e)}"}


@router.get("/mpesa/status/{checkout_request_id}")
async def check_transaction_status(
    checkout_request_id: str, email: str = Depends(current_user_email)
) -> Dict[str, Any]:
    """
    Query M-PESA STK Push transaction status

    Use this to check if a transaction has been completed, pending, or failed.
    """
    try:
        result = query_stk_status(checkout_request_id)
        return result
    except Exception as e:
        logger.error(f"Status query failed: {e}")
        raise HTTPException(status_code=500, detail=f"Status query failed: {str(e)}")


@router.post("/mpesa/b2c/result")
async def b2c_result(
    payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Process M-Pesa B2C result callback

    This endpoint is called by Safaricom after a B2C payment completes or fails.
    """
    try:
        logger.info(f"Received B2C result: {payload}")
        result = process_b2c_result(payload, db)
        return result
    except Exception as e:
        logger.error(f"B2C result processing failed: {e}")
        return {"ResultCode": 1, "ResultDesc": f"Internal error: {str(e)}"}


@router.post("/mpesa/b2c/timeout")
async def b2c_timeout(payload: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    """
    Process M-Pesa B2C timeout callback

    This endpoint is called by Safaricom if B2C request times out.
    """
    try:
        logger.warning(f"Received B2C timeout: {payload}")
        return {"ResultCode": 0, "ResultDesc": "Timeout received"}
    except Exception as e:
        logger.error(f"B2C timeout processing failed: {e}")
        return {"ResultCode": 1, "ResultDesc": f"Internal error: {str(e)}"}


@router.post("/mpesa/withdraw")
async def withdraw_mpesa(
    req: WithdrawalRequest,
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Initiate M-Pesa B2C withdrawal"""
    try:
        if req.amount <= 0:
            raise HTTPException(status_code=400, detail="Amount must be greater than 0")

        if req.amount < 100:
            raise HTTPException(status_code=400, detail="Minimum withdrawal is KES 100")

        # Get user
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Initiate withdrawal
        result = initiate_mpesa_withdrawal(req.phone_number, req.amount, user.id, db)

        if result["status"] == "error":
            raise HTTPException(status_code=400, detail=result["message"])

        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Withdrawal failed: {e}")
        raise HTTPException(status_code=500, detail=f"Withdrawal failed: {str(e)}")


@router.get("/transactions")
async def get_user_transactions(
    limit: int = Query(50, ge=1, le=200),
    transaction_type: Optional[str] = Query(None, regex="^(deposit|withdrawal)$"),
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Get user transaction history

    Query parameters:
    - limit: Maximum number of transactions to return (1-200, default: 50)
    - transaction_type: Filter by type (deposit or withdrawal)
    """
    try:
        # Get user
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Get transaction history
        return get_transaction_history(user.id, db, limit, transaction_type)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get transactions: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch transactions: {str(e)}"
        )


@router.get("/methods")
async def get_payment_methods() -> Dict[str, Any]:
    """Get available payment methods"""
    return {
        "methods": [
            {
                "id": "mpesa",
                "name": "M-Pesa",
                "type": "mobile_money",
                "logo": "mpesa_logo.png",
                "min_amount": 100,
                "max_amount": 150000,
                "fees": {"deposit": 0, "withdrawal": "Variable (KES 0-50)"},
                "supported_operations": ["deposit", "withdrawal"],
            },
            {
                "id": "bank",
                "name": "Bank Transfer",
                "type": "bank",
                "logo": "bank_logo.png",
                "min_amount": 1000,
                "max_amount": 1000000,
                "fees": {"deposit": 0, "withdrawal": "KES 50"},
                "supported_operations": ["deposit", "withdrawal"],
                "status": "coming_soon",
            },
        ]
    }
