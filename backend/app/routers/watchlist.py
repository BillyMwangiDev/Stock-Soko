from fastapi import APIRouter, HTTPException
from ..schemas.watchlist import WatchItem, WatchlistResponse
from ..services.watchlist_service import list_items, add_item, remove_item

router = APIRouter(prefix="/watchlist", tags=["watchlist"])


@router.get("", response_model=WatchlistResponse)

def get_watchlist() -> WatchlistResponse:
	return WatchlistResponse(items=list_items())


@router.post("", response_model=WatchlistResponse)

def post_watch_item(item: WatchItem) -> WatchlistResponse:
	add_item(item)
	return WatchlistResponse(items=list_items())


@router.delete("/{symbol}", response_model=WatchlistResponse)

def delete_watch_item(symbol: str) -> WatchlistResponse:
	ok = remove_item(symbol)
	if not ok:
		raise HTTPException(status_code=404, detail="Symbol not found in watchlist")
	return WatchlistResponse(items=list_items())