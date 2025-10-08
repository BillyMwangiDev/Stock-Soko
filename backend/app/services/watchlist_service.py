from typing import Dict, List
from ..schemas.watchlist import WatchItem


# MVP in-memory store keyed by pseudo-user "default"
_watchlists: Dict[str, List[WatchItem]] = {"default": []}


def list_items(user_id: str = "default") -> List[WatchItem]:
	return _watchlists.get(user_id, [])


def add_item(item: WatchItem, user_id: str = "default") -> None:
	items = _watchlists.setdefault(user_id, [])
	# prevent duplicates by symbol
	if not any(i.symbol == item.symbol for i in items):
		items.append(item)


def remove_item(symbol: str, user_id: str = "default") -> bool:
	items = _watchlists.setdefault(user_id, [])
	initial = len(items)
	_watchlists[user_id] = [i for i in items if i.symbol != symbol]
	return len(_watchlists[user_id]) < initial
