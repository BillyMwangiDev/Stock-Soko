from pydantic import BaseModel
from typing import List, Literal


class Position(BaseModel):
	symbol: str
	quantity: int
	avg_price: float
	market_value: float
	unrealized_pl: float


class PositionsResponse(BaseModel):
	positions: List[Position]


class OrderRecord(BaseModel):
	order_id: str
	symbol: str
	side: Literal["buy", "sell"]
	quantity: int
	price: float
	status: str
	ts: float


class OrdersResponse(BaseModel):
	orders: List[OrderRecord]