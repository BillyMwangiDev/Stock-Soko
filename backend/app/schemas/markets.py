from pydantic import BaseModel
from typing import List


class MarketInstrument(BaseModel):
    symbol: str
    name: str
    last_price: float
    change_pct: float
    currency: str = "KES"
    eps: float | None = None  # Earnings Per Share
    pe_ratio: float | None = None  # Price to Earnings ratio
    dividend_yield: float | None = None
    volume: int | None = None
    market_cap: float | None = None
    sector: str | None = None


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
