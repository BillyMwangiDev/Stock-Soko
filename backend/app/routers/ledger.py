from fastapi import APIRouter
from ..schemas.ledger import PositionsResponse, OrdersResponse
from ..services.ledger_service import list_positions, list_orders

router = APIRouter(prefix="/ledger", tags=["ledger"])


@router.get("/positions", response_model=PositionsResponse)

def get_positions() -> PositionsResponse:
	return PositionsResponse(positions=list_positions())


@router.get("/orders", response_model=OrdersResponse)

def get_orders() -> OrdersResponse:
	return OrdersResponse(orders=list_orders())
