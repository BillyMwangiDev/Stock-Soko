from pydantic import BaseModel, Field


class OrderRequest(BaseModel):
	symbol: str
	side: str = Field(pattern="^(buy|sell)$")
	quantity: int
	order_type: str = "market"


class OrderResponse(BaseModel):
	order_id: str
	status: str  # accepted, filled, rejected, pending
	message: str
