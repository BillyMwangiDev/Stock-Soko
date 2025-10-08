import time
from typing import Dict, List
from ..schemas.ledger import OrderRecord, Position
from ..schemas.trades import OrderRequest
from ..services.markets_service import get_quote


_orders: List[OrderRecord] = []
_positions: Dict[str, Position] = {}


def record_order(order_id: str, req: OrderRequest) -> OrderRecord:
	# Use current quote as execution price for simulation
	quote = get_quote(req.symbol)
	price = quote.last_price
	rec = OrderRecord(
		order_id=order_id,
		symbol=req.symbol,
		side=req.side,  # type: ignore
		quantity=req.quantity,
		price=price,
		status="filled",
		ts=time.time(),
	)
	_orders.append(rec)
	_update_position(rec)
	return rec


def _update_position(rec: OrderRecord) -> None:
	pos = _positions.get(rec.symbol)
	if rec.side == "buy":
		if pos:
			new_qty = pos.quantity + rec.quantity
			new_avg = (pos.avg_price * pos.quantity + rec.price * rec.quantity) / max(new_qty, 1)
			_positions[rec.symbol] = Position(
				symbol=rec.symbol,
				quantity=new_qty,
				avg_price=new_avg,
				market_value=new_qty * rec.price,
				unrealized_pl=(rec.price - new_avg) * new_qty,
			)
		else:
			_positions[rec.symbol] = Position(
				symbol=rec.symbol,
				quantity=rec.quantity,
				avg_price=rec.price,
				market_value=rec.quantity * rec.price,
				unrealized_pl=0.0,
			)
	else:  # sell
		if not pos or pos.quantity <= 0:
			return
		new_qty = max(pos.quantity - rec.quantity, 0)
		_positions[rec.symbol] = Position(
			symbol=rec.symbol,
			quantity=new_qty,
			avg_price=pos.avg_price,
			market_value=new_qty * rec.price,
			unrealized_pl=(rec.price - pos.avg_price) * new_qty,
		)


def list_positions() -> List[Position]:
	# Recompute market_value/unrealized_pl with latest quotes
	result: List[Position] = []
	for symbol, pos in _positions.items():
		quote = get_quote(symbol)
		mv = pos.quantity * quote.last_price
		upl = (quote.last_price - pos.avg_price) * pos.quantity
		result.append(Position(symbol=symbol, quantity=pos.quantity, avg_price=pos.avg_price, market_value=mv, unrealized_pl=upl))
	return result


def list_orders() -> List[OrderRecord]:
	return list(_orders)


class LedgerService:
	"""Service class for ledger operations"""
	
	def get_positions(self, user_email: str) -> Dict:
		"""Get positions for a user (mock - returns all positions for now)"""
		positions_list = list_positions()
		return {
			"positions": [
				{
					"symbol": p.symbol,
					"quantity": p.quantity,
					"avg_price": p.avg_price,
					"market_value": p.market_value,
					"unrealized_pl": p.unrealized_pl
				}
				for p in positions_list
			]
		}
	
	def get_balance(self, user_email: str) -> Dict:
		"""Get balance for a user (mock - returns dummy balance)"""
		return {
			"available": 100000.0,  # Mock balance
			"reserved": 0.0,
			"total": 100000.0
		}


# Export singleton instance
ledger_service = LedgerService()