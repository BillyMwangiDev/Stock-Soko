"""
Portfolio Analytics Router
Advanced portfolio insights, risk analysis, and performance metrics
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..database.models import User
from ..routers.auth import current_user_email
from ..services.portfolio_analytics_service import portfolio_analytics_service
from ..utils.logging import get_logger

logger = get_logger("portfolio_analytics_router")

router = APIRouter(prefix="/portfolio-analytics", tags=["portfolio-analytics"])


@router.get("/sector-allocation")
async def get_sector_allocation(
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db)
):
    """
    Get portfolio allocation by sector
    Includes pie chart data and diversification score
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    result = portfolio_analytics_service.get_sector_allocation(user.id, db)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    
    return result


@router.get("/performance-metrics")
async def get_performance_metrics(
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db)
):
    """
    Get advanced performance metrics
    
    Includes:
    - Total return (amount and percentage)
    - Sharpe ratio
    - Beta
    - Volatility
    - Risk level
    - 30-day historical performance
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    result = portfolio_analytics_service.get_performance_metrics(user.id, db)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    
    logger.info(f"Performance metrics for user {user.id}: {result.get('return_percent', 0):.2f}% return")
    
    return result


@router.get("/risk-analysis")
async def get_risk_analysis(
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db)
):
    """
    Get portfolio risk analysis
    
    Includes:
    - Overall risk score (0-100)
    - Risk level (Low/Medium/High)
    - Concentration analysis
    - Diversification metrics
    - Actionable recommendations
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    result = portfolio_analytics_service.get_risk_analysis(user.id, db)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    
    return result


@router.get("/top-holdings")
async def get_top_holdings(
    limit: int = Query(10, ge=1, le=50, description="Number of holdings to return"),
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db)
):
    """
    Get top holdings with detailed metrics
    
    For each holding:
    - Current market value
    - Cost basis
    - Gain/loss (amount and percentage)
    - Sector classification
    - Current and average price
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    result = portfolio_analytics_service.get_top_holdings(user.id, db, limit)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    
    return result


@router.get("/dashboard")
async def get_analytics_dashboard(
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db)
):
    """
    Get complete analytics dashboard
    Combines all analytics into a single response
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get all analytics
    sector_allocation = portfolio_analytics_service.get_sector_allocation(user.id, db)
    performance = portfolio_analytics_service.get_performance_metrics(user.id, db)
    risk = portfolio_analytics_service.get_risk_analysis(user.id, db)
    top_holdings = portfolio_analytics_service.get_top_holdings(user.id, db, 5)
    
    return {
        "success": True,
        "sector_allocation": sector_allocation if sector_allocation["success"] else None,
        "performance": performance if performance["success"] else None,
        "risk": risk if risk["success"] else None,
        "top_holdings": top_holdings if top_holdings["success"] else None
    }

