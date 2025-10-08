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
	"""
	Initiate M-Pesa deposit via STK Push
	
	- **phone_number**: M-Pesa registered phone number (254...)
	- **amount**: Amount to deposit in KES
	"""
	return initiate_mpesa_stk(req)


@router.post("/mpesa/callback")
def callback(payload: dict) -> dict:
	"""M-Pesa callback endpoint for payment notifications"""
	# Sandbox callback receiver (no-op)
	return {"status": "received", "payload": payload}


@router.post("/withdraw")
async def withdraw(
    req: WithdrawalRequest,
    current_user: dict = Depends(get_current_user)
):
	"""
	Request withdrawal to M-Pesa or Bank account
	
	- **phone_number**: Destination phone number
	- **amount**: Amount to withdraw
	- **destination**: 'mpesa' or 'bank'
	"""
	from datetime import datetime
	import uuid
	
	# Validate amount
	if req.amount <= 0:
		raise HTTPException(status_code=400, detail="Amount must be greater than 0")
	
	if req.amount < 100:
		raise HTTPException(status_code=400, detail="Minimum withdrawal is KES 100")
	
	# Mock withdrawal processing (integrate with M-Pesa B2C API in production)
	transaction_id = str(uuid.uuid4())
	
	return {
		"transaction_id": transaction_id,
		"status": "pending",
		"message": f"Withdrawal request of KES {req.amount} submitted successfully",
		"estimated_completion": "1-3 business days",
		"destination": req.destination,
		"created_at": datetime.utcnow().isoformat()
	}


@router.get("/transactions")
async def get_transactions(
    limit: int = 20,
    offset: int = 0,
    current_user: dict = Depends(get_current_user)
):
	"""
	Get transaction history for current user
	
	- **limit**: Number of transactions to return
	- **offset**: Pagination offset
	"""
	from datetime import datetime, timedelta
	import uuid
	
	# Mock transaction data (use database in production)
	mock_transactions = [
		{
			"transaction_id": str(uuid.uuid4()),
			"type": "deposit",
			"amount": 5000.0,
			"status": "completed",
			"created_at": (datetime.utcnow() - timedelta(days=2)).isoformat(),
			"description": "M-Pesa Deposit"
		},
		{
			"transaction_id": str(uuid.uuid4()),
			"type": "trade",
			"amount": -1500.0,
			"status": "completed",
			"created_at": (datetime.utcnow() - timedelta(days=1)).isoformat(),
			"description": "Buy SCOM (10 shares)"
		},
		{
			"transaction_id": str(uuid.uuid4()),
			"type": "withdrawal",
			"amount": -1000.0,
			"status": "pending",
			"created_at": datetime.utcnow().isoformat(),
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
