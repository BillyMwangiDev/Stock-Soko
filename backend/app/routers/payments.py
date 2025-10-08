from typing import Dict, Any, List
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from ..schemas.payments import MpesaDepositRequest, MpesaDepositResponse
from ..services.payments_service import initiate_mpesa_stk
from ..utils.jwt import get_current_user

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
                "destination": "mpesa"
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
def deposit(req: MpesaDepositRequest) -> MpesaDepositResponse:
    return initiate_mpesa_stk(req)


@router.post("/mpesa/callback")
def callback(payload: Dict[str, Any]) -> Dict[str, Any]:
    return {"status": "received", "payload": payload}


@router.post("/withdraw")
async def withdraw(
    req: WithdrawalRequest,
    current_user: Dict[str, str] = Depends(get_current_user)
) -> Dict[str, Any]:
    import uuid
    
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than 0")
    
    if req.amount < 100:
        raise HTTPException(status_code=400, detail="Minimum withdrawal is KES 100")
    
    transaction_id = str(uuid.uuid4())
    
    return {
        "transaction_id": transaction_id,
        "status": "pending",
        "message": f"Withdrawal request of KES {req.amount} submitted successfully",
        "estimated_completion": "1-3 business days",
        "destination": req.destination,
        "created_at": datetime.now(timezone.utc).isoformat()
    }


@router.get("/transactions")
async def get_transactions(
    limit: int = 20,
    offset: int = 0,
    current_user: Dict[str, str] = Depends(get_current_user)
) -> Dict[str, Any]:
    from datetime import timedelta
    import uuid
    
    now = datetime.now(timezone.utc)
    mock_transactions = [
        {
            "transaction_id": str(uuid.uuid4()),
            "type": "deposit",
            "amount": 5000.0,
            "status": "completed",
            "created_at": (now - timedelta(days=2)).isoformat(),
            "description": "M-Pesa Deposit"
        },
        {
            "transaction_id": str(uuid.uuid4()),
            "type": "trade",
            "amount": -1500.0,
            "status": "completed",
            "created_at": (now - timedelta(days=1)).isoformat(),
            "description": "Buy SCOM (10 shares)"
        },
        {
            "transaction_id": str(uuid.uuid4()),
            "type": "withdrawal",
            "amount": -1000.0,
            "status": "pending",
            "created_at": now.isoformat(),
            "description": "M-Pesa Withdrawal"
        }
    ]
    
    total = len(mock_transactions)
    transactions = mock_transactions[offset:offset + limit]
    
    return {
        "transactions": transactions,
        "total": total,
        "offset": offset,
        "limit": limit
    }
