from typing import Optional

from pydantic import BaseModel, Field


class MpesaDepositRequest(BaseModel):
    phone_number: str = Field(..., description="M-Pesa phone number (e.g., 0712345678)")
    amount: float = Field(..., gt=0, description="Amount to deposit")
    account_id: Optional[str] = Field(
        None, description="Broker account ID to credit (optional)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "phone_number": "0712345678",
                "amount": 1000.0,
                "account_id": "account-uuid-here",
            }
        }


class MpesaDepositResponse(BaseModel):
    checkout_request_id: str
    status: str
    message: str
