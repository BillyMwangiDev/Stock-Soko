from pydantic import BaseModel


class MpesaDepositRequest(BaseModel):
	phone_number: str
	amount: float


class MpesaDepositResponse(BaseModel):
	checkout_request_id: str
	status: str
	message: str
