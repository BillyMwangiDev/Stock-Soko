"""
Watchlist Router

Provides endpoints for managing user watchlists including adding, removing,
and retrieving watched stock symbols.
"""
from fastapi import APIRouter, HTTPException
from ..schemas.watchlist import WatchItem, WatchlistResponse
from ..services.watchlist_service import list_items, add_item, remove_item

router = APIRouter(prefix="/watchlist", tags=["watchlist"])


@router.get("", response_model=WatchlistResponse)
def get_watchlist() -> WatchlistResponse:
	"""
	Retrieve user's watchlist of stock symbols.
	
	Returns:
		WatchlistResponse: List of watched items with symbol and metadata
	"""
	return WatchlistResponse(items=list_items())


@router.post("", response_model=WatchlistResponse)
def post_watch_item(item: WatchItem) -> WatchlistResponse:
	"""
	Add a stock symbol to user's watchlist.
	
	Args:
		item: Watchlist item containing symbol and optional metadata
		
	Returns:
		WatchlistResponse: Updated watchlist
	"""
	add_item(item)
	return WatchlistResponse(items=list_items())


@router.delete("/{symbol}", response_model=WatchlistResponse)
def delete_watch_item(symbol: str) -> WatchlistResponse:
	"""
	Remove a stock symbol from user's watchlist.
	
	Args:
		symbol: Stock symbol to remove
		
	Returns:
		WatchlistResponse: Updated watchlist
		
	Raises:
		HTTPException: If symbol not found in watchlist
	"""
	ok = remove_item(symbol)
	if not ok:
		raise HTTPException(status_code=404, detail="Symbol not found in watchlist")
	return WatchlistResponse(items=list_items())