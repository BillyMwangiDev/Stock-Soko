from pydantic import BaseModel
from typing import List, Optional


class WatchItem(BaseModel):
	symbol: str
	note: Optional[str] = None
	target_price: Optional[float] = None


class WatchlistResponse(BaseModel):
	items: List[WatchItem]
