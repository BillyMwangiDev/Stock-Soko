"""
Trades Router

Provides endpoints for order placement, trade history, order cancellation,
and order status tracking for NSE stocks.
"""

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..database.models import Order, Stock, User
from ..routers.auth import current_user_email
from ..schemas.trades import OrderRequest, OrderResponse
from ..services.trades_service import place_order
from ..utils.logging import get_logger

logger = get_logger("trades_router")

router = APIRouter(prefix="/trades", tags=["trades"])


@router.post("/order", response_model=OrderResponse)
async def create_order(
    req: OrderRequest,
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db),
) -> OrderResponse:
    return place_order(req, email, db)


@router.post("/order/fractional", response_model=OrderResponse)
async def create_fractional_order(
    symbol: str,
    side: str,
    amount: float,  # Dollar amount instead of quantity
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db),
) -> OrderResponse:
    """
    Place a fractional share order by dollar amount

    Example: Buy $100 worth of SCOM
    The system calculates the fractional quantity based on current price
    """
    from ..services.markets_service import markets_service

    try:
        # Get current price
        quote = markets_service.get_quote(symbol)
        current_price = float(quote.last_price)

        if current_price <= 0:
            return OrderResponse(
                order_id=str(uuid.uuid4()),
                status="rejected",
                message="Invalid stock price",
            )

        # Calculate fractional quantity
        quantity = amount / current_price

        # Create order request
        order_req = OrderRequest(
            symbol=symbol, side=side, quantity=quantity, order_type="market"
        )

        # Place order using existing service
        response = place_order(order_req, email, db)

        # Update message to show dollar amount
        if response.status == "accepted":
            response.message = f"Order accepted - {side.upper()} ${amount:.2f} worth of {symbol} ({quantity:.6f} shares) @ KES {current_price:.2f}"

        logger.info(
            f"Fractional order: {side} ${amount} of {symbol} = {quantity:.6f} shares"
        )

        return response

    except Exception as e:
        logger.error(f"Failed to place fractional order: {e}")
        return OrderResponse(
            order_id=str(uuid.uuid4()), status="rejected", message=str(e)
        )


@router.get("/history")
async def get_trade_history(
    limit: int = Query(50, ge=1, le=200),
    status: Optional[str] = Query(None),
    symbol: Optional[str] = Query(None),
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    query = (
        db.query(Order)
        .filter(Order.user_id == user.id)
        .options(joinedload(Order.stock))
    )

    if status:
        query = query.filter(Order.status == status)

    if symbol:
        stock = db.query(Stock).filter(Stock.symbol == symbol).first()
        if stock:
            query = query.filter(Order.stock_id == stock.id)

    orders = query.order_by(Order.submitted_at.desc()).limit(limit).all()

    return {
        "orders": [
            {
                "id": o.id,
                "symbol": o.stock.symbol if o.stock else "",
                "name": o.stock.name if o.stock else "",
                "side": o.side,
                "order_type": o.order_type,
                "quantity": float(o.quantity),
                "price": float(o.price) if o.price else 0,
                "filled_quantity": float(o.filled_quantity) if o.filled_quantity else 0,
                "fees": float(o.fees) if o.fees else 0,
                "status": o.status,
                "submitted_at": o.submitted_at.isoformat() if o.submitted_at else None,
            }
            for o in orders
        ],
        "count": len(orders),
    }


@router.delete("/order/{order_id}")
async def cancel_order(
    order_id: str,
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    order = (
        db.query(Order).filter(Order.id == order_id, Order.user_id == user.id).first()
    )

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status != "pending":
        raise HTTPException(
            status_code=400, detail="Only pending orders can be cancelled"
        )

    order.status = "cancelled"
    db.commit()

    logger.info(f"Order {order_id} cancelled by user {user.id}")

    return {
        "status": "success",
        "message": "Order cancelled successfully",
        "order_id": order_id,
    }


@router.get("/status/{order_id}")
async def get_order_status(
    order_id: str,
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    order = (
        db.query(Order).filter(Order.id == order_id, Order.user_id == user.id).first()
    )

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return {
        "order_id": order.id,
        "status": order.status,
        "symbol": order.stock.symbol if order.stock else "",
        "side": order.side,
        "quantity": float(order.quantity),
        "filled_quantity": float(order.filled_quantity) if order.filled_quantity else 0,
        "price": float(order.price) if order.price else 0,
        "fees": float(order.fees) if order.fees else 0,
        "submitted_at": order.submitted_at.isoformat() if order.submitted_at else None,
        "updated_at": order.updated_at.isoformat() if order.updated_at else None,
    }


@router.put("/order/{order_id}")
async def modify_order(
    order_id: str,
    quantity: Optional[float] = Query(None, description="New quantity"),
    limit_price: Optional[float] = Query(None, description="New limit price"),
    stop_price: Optional[float] = Query(None, description="New stop price"),
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db),
):
    """
    Modify a pending order
    Only quantity, limit_price, and stop_price can be modified
    """
    from ..services.mock_trading_engine import mock_trading_engine

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = mock_trading_engine.modify_order(
        order_id=order_id,
        user_id=user.id,
        new_quantity=quantity,
        new_limit_price=limit_price,
        new_stop_price=stop_price,
        db=db,
    )

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])

    logger.info(f"Order {order_id} modified by user {user.id}")

    return result
