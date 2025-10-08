from typing import Dict, Any
from fastapi import APIRouter, Depends
from ..schemas.ledger import PositionsResponse, OrdersResponse
from ..services.ledger_service import list_positions, list_orders, get_account_balance
from ..routers.auth import current_user_email

router = APIRouter(prefix="/ledger", tags=["ledger"])


@router.get("/balance")
def get_balance(email: str = Depends(current_user_email)) -> Dict[str, Any]:
	balance = get_account_balance(email)
	return {
		"total": balance,
		"available": balance,
		"currency": "KES"
	}


@router.get("/positions", response_model=PositionsResponse)
def get_positions() -> PositionsResponse:
	return PositionsResponse(positions=list_positions())


@router.get("/orders", response_model=OrdersResponse)
def get_orders() -> OrdersResponse:
	return OrdersResponse(orders=list_orders())
