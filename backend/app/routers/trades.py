from fastapi import APIRouter, Depends
from ..schemas.trades import OrderRequest, OrderResponse
from ..services.trades_service import place_order
from ..services.ledger_service import record_order
from ..services.user_service import get_user
from ..routers.auth import current_user_email

router = APIRouter(prefix="/trades", tags=["trades"])


@router.post("/orders", response_model=OrderResponse)
def create_order(
    req: OrderRequest,
    email: str = Depends(current_user_email)
) -> OrderResponse:
    user = get_user(email)
    if user and user.two_fa_enabled:
        pass
    resp = place_order(req)
    if resp.status == "accepted":
        record_order(resp.order_id, req)
    return resp