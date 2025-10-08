"""
Dashboard Router - Aggregated statistics and overview data
"""
from fastapi import APIRouter, Depends
from typing import Dict, List
from datetime import datetime
from ..utils.jwt import get_current_user
from ..services.markets_service import markets_service
from ..services.ledger_service import ledger_service

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """
    Get aggregated dashboard statistics
    
    Returns:
    - Portfolio summary
    - Market highlights
    - Top gainers/losers
    - Recent activities
    - Quick stats
    """
    user_email = current_user.get("email")
    
    # Get market data
    market_data = markets_service.get_instruments()
    instruments = market_data.get("instruments", [])
    
    # Calculate market stats
    total_instruments = len(instruments)
    gainers = [i for i in instruments if i.get("change_pct", 0) > 0]
    losers = [i for i in instruments if i.get("change_pct", 0) < 0]
    unchanged = [i for i in instruments if i.get("change_pct", 0) == 0]
    
    # Get top movers
    sorted_by_change = sorted(instruments, key=lambda x: x.get("change_pct", 0), reverse=True)
    top_gainers = sorted_by_change[:5]
    top_losers = sorted_by_change[-5:][::-1]
    
    # Get portfolio data
    portfolio = ledger_service.get_positions(user_email)
    balance = ledger_service.get_balance(user_email)
    
    positions = portfolio.get("positions", [])
    total_portfolio_value = sum(p.get("market_value", 0) for p in positions)
    total_unrealized_pl = sum(p.get("unrealized_pl", 0) for p in positions)
    
    # Calculate portfolio performance
    if total_portfolio_value > 0:
        portfolio_return_pct = (total_unrealized_pl / (total_portfolio_value - total_unrealized_pl)) * 100
    else:
        portfolio_return_pct = 0
    
    return {
        "user": {
            "email": user_email,
            "greeting": f"Good {get_time_of_day()}, {user_email.split('@')[0].title()}!"
        },
        "portfolio_summary": {
            "total_value": total_portfolio_value,
            "cash_balance": balance.get("available", 0),
            "unrealized_pl": total_unrealized_pl,
            "return_percentage": round(portfolio_return_pct, 2),
            "positions_count": len(positions)
        },
        "market_stats": {
            "total_instruments": total_instruments,
            "gainers": len(gainers),
            "losers": len(losers),
            "unchanged": len(unchanged),
            "market_sentiment": "positive" if len(gainers) > len(losers) else "negative" if len(losers) > len(gainers) else "neutral"
        },
        "top_gainers": [
            {
                "symbol": stock.get("symbol"),
                "name": stock.get("name"),
                "last_price": stock.get("last_price"),
                "change_pct": stock.get("change_pct")
            }
            for stock in top_gainers
        ],
        "top_losers": [
            {
                "symbol": stock.get("symbol"),
                "name": stock.get("name"),
                "last_price": stock.get("last_price"),
                "change_pct": stock.get("change_pct")
            }
            for stock in top_losers
        ],
        "quick_actions": [
            {"id": "buy", "label": "Buy Stocks", "icon": "trending-up"},
            {"id": "sell", "label": "Sell Holdings", "icon": "trending-down"},
            {"id": "deposit", "label": "Deposit Funds", "icon": "wallet"},
            {"id": "watchlist", "label": "View Watchlist", "icon": "star"}
        ],
        "last_updated": datetime.utcnow().isoformat()
    }


@router.get("/recommendations")
async def get_recommendations(current_user: dict = Depends(get_current_user)):
    """
    Get personalized stock recommendations based on user portfolio
    
    Returns AI-powered recommendations
    """
    # Mock recommendations (integrate with AI recommender in production)
    return {
        "recommendations": [
            {
                "symbol": "KCB",
                "recommendation": "BUY",
                "confidence": 85,
                "reason": "Strong fundamentals with P/E ratio below sector average",
                "target_price": 48.50
            },
            {
                "symbol": "SCOM",
                "recommendation": "HOLD",
                "confidence": 75,
                "reason": "Solid M-Pesa growth, currently fairly valued",
                "target_price": 32.00
            },
            {
                "symbol": "EABL",
                "recommendation": "BUY",
                "confidence": 80,
                "reason": "Attractive dividend yield of 5.2%, stable earnings",
                "target_price": 195.00
            }
        ],
        "generated_at": datetime.utcnow().isoformat()
    }


def get_time_of_day() -> str:
    """Get time of day for greeting"""
    hour = datetime.utcnow().hour + 3  # EAT timezone (UTC+3)
    
    if 5 <= hour < 12:
        return "morning"
    elif 12 <= hour < 17:
        return "afternoon"
    elif 17 <= hour < 21:
        return "evening"
    else:
        return "night"

