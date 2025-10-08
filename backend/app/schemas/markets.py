from pydantic import BaseModel
from typing import List


class MarketInstrument(BaseModel):
	symbol: str
	name: str
	last_price: float
	change_pct: float
	currency: str = "KES"


class MarketListResponse(BaseModel):
	instruments: List[MarketInstrument]


class QuoteRequest(BaseModel):
	symbol: str


class QuoteResponse(BaseModel):
	symbol: str
	last_price: float
	change_pct: float
	ohlc: list[float]  # [open, high, low, close]
	sparkline: list[float]
