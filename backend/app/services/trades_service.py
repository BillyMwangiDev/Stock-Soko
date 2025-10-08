import uuid
from ..schemas.trades import OrderRequest, OrderResponse


def place_order(req: OrderRequest) -> OrderResponse:
	order_id = str(uuid.uuid4())
	# MVP: accept market orders only; simulate immediate ack
	if req.order_type != "market":
		return OrderResponse(order_id=order_id, status="rejected", message="Only market orders supported in MVP")
	if req.quantity <= 0:
		return OrderResponse(order_id=order_id, status="rejected", message="Quantity must be positive")
	return OrderResponse(order_id=order_id, status="accepted", message="Order accepted (simulated)")
