from typing import List, Optional

from pydantic import BaseModel


class WatchItem(BaseModel):
    symbol: str
    note: Optional[str] = None
    target_price: Optional[float] = None


class WatchlistResponse(BaseModel):
    items: List[WatchItem]
