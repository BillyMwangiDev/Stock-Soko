from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..database.models import Order, User
from ..routers.auth import current_user_email
from ..schemas.ledger import OrdersResponse, PositionsResponse
from ..services.ledger_service import get_account_balance, list_orders, list_positions
from ..services.portfolio_service import get_portfolio_service
from ..utils.logging import get_logger

logger = get_logger("ledger_router")

router = APIRouter(prefix="/ledger", tags=["ledger"])


@router.get("/balance")
def get_balance(email: str = Depends(current_user_email)) -> Dict[str, Any]:
    balance = get_account_balance(email)
    return {"total": balance, "available": balance, "currency": "KES"}


@router.get("/positions", response_model=PositionsResponse)
def get_positions() -> PositionsResponse:
    return PositionsResponse(positions=list_positions())


@router.get("/orders", response_model=OrdersResponse)
def get_orders() -> OrdersResponse:
    return OrdersResponse(orders=list_orders())


# ===============================================
# NEW ENDPOINTS - Portfolio Enhancement
# ===============================================


@router.get("/portfolio/value")
async def get_portfolio_value(
    email: str = Depends(current_user_email), db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get real-time portfolio valuation with live market data"""
    try:
        # Get user with eager loading of positions
        user = (
            db.query(User)
            .filter(User.email == email)
            .options(joinedload(User.positions))
            .first()
        )
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        portfolio_service = get_portfolio_service(db)
        return portfolio_service.calculate_portfolio_value(user.id)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get portfolio value: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to calculate portfolio value: {str(e)}"
        )


@router.get("/portfolio/performance")
async def get_portfolio_performance(
    days: int = Query(
        30, ge=1, le=365, description="Number of days for performance calculation"
    ),
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Get portfolio performance over specified time period"""
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        portfolio_service = get_portfolio_service(db)
        return portfolio_service.calculate_performance(user.id, days)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get portfolio performance: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to calculate performance: {str(e)}"
        )


@router.get("/portfolio/unrealized-pl")
async def get_unrealized_pl(
    email: str = Depends(current_user_email), db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get unrealized profit/loss for all holdings"""
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        portfolio_service = get_portfolio_service(db)
        return portfolio_service.calculate_unrealized_pl(user.id)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get unrealized P/L: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to calculate P/L: {str(e)}"
        )


@router.get("/portfolio/dividends")
async def get_portfolio_dividends(
    email: str = Depends(current_user_email), db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get dividend information for user's holdings"""
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        portfolio_service = get_portfolio_service(db)
        return portfolio_service.get_dividends(user.id)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get dividends: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch dividends: {str(e)}"
        )


@router.get("/transactions")
async def get_transactions(
    limit: int = Query(
        50, ge=1, le=200, description="Number of transactions to return"
    ),
    offset: int = Query(0, ge=0, description="Number of transactions to skip"),
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Get transaction history for user"""
    try:
        from ..database.models import Order

        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Fetch user's orders as transactions
        orders = (
            db.query(Order)
            .filter(Order.user_id == user.id)
            .order_by(Order.submitted_at.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

        transactions = []
        for order in orders:
            transactions.append(
                {
                    "id": order.id,
                    "type": "trade",
                    "side": order.side,
                    "symbol": order.stock.symbol if order.stock else "",
                    "quantity": float(order.quantity),
                    "price": float(order.price) if order.price else 0,
                    "amount": float(order.quantity * order.price) if order.price else 0,
                    "fees": float(order.fees) if order.fees else 0,
                    "status": order.status,
                    "timestamp": (
                        order.submitted_at.isoformat() if order.submitted_at else None
                    ),
                }
            )

        return {
            "transactions": transactions,
            "count": len(transactions),
            "offset": offset,
            "limit": limit,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get transactions: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch transactions: {str(e)}"
        )
