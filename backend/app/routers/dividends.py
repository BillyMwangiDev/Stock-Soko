"""
Dividends Router
Track and manage dividend payments
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..database.models import User
from ..routers.auth import current_user_email
from ..services.dividend_service import dividend_service
from ..utils.logging import get_logger

logger = get_logger("dividends_router")

router = APIRouter(prefix="/dividends", tags=["dividends"])


@router.get("/stock/{symbol}")
async def get_stock_dividends(
    symbol: str,
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db)
):
    """
    Get dividend information for a specific stock
    """
    result = dividend_service.get_stock_dividend_info(symbol)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    
    return result


@router.get("/portfolio/summary")
async def get_portfolio_dividends(
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db)
):
    """
    Calculate expected dividends from user's entire portfolio
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    result = dividend_service.calculate_portfolio_dividends(user.id, db)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    
    logger.info(f"Portfolio dividends calculated for user {user.id}")
    
    return result


@router.get("/upcoming")
async def get_upcoming_dividends(
    days_ahead: int = Query(90, ge=1, le=365, description="Days to look ahead"),
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db)
):
    """
    Get upcoming dividend payments for user's holdings
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    result = dividend_service.get_upcoming_dividends(user.id, db, days_ahead)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    
    return result


@router.get("/history")
async def get_dividend_history(
    symbol: Optional[str] = Query(None, description="Filter by symbol"),
    limit: int = Query(50, ge=1, le=200, description="Maximum records"),
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db)
):
    """
    Get historical dividend payments
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    result = dividend_service.get_dividend_history(user.id, db, symbol, limit)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    
    return result

