"""
Dividend Tracking Service for Demo Mode
Manages dividend announcements, payments, and history
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session
from ..database.models import User, Holding, Transaction
from ..utils.logging import get_logger
import uuid

logger = get_logger("dividend_service")


# Mock dividend data for Kenyan stocks
MOCK_DIVIDENDS = {
    "SCOM": {
        "company": "Safaricom PLC",
        "annual_yield": 5.2,
        "payment_frequency": "Semi-Annual",
        "next_ex_date": "2025-09-15",
        "next_payment_date": "2025-10-15",
        "last_dividend": 0.63,
        "history": [
            {"date": "2024-10-15", "amount": 0.63, "type": "interim"},
            {"date": "2024-04-15", "amount": 1.40, "type": "final"},
            {"date": "2023-10-15", "amount": 0.63, "type": "interim"},
            {"date": "2023-04-15", "amount": 1.37, "type": "final"},
        ]
    },
    "EQTY": {
        "company": "Equity Group Holdings",
        "annual_yield": 7.8,
        "payment_frequency": "Annual",
        "next_ex_date": "2025-05-01",
        "next_payment_date": "2025-06-01",
        "last_dividend": 3.50,
        "history": [
            {"date": "2024-06-01", "amount": 3.50, "type": "final"},
            {"date": "2023-06-01", "amount": 3.00, "type": "final"},
            {"date": "2022-06-01", "amount": 2.50, "type": "final"},
        ]
    },
    "KCB": {
        "company": "KCB Group",
        "annual_yield": 6.5,
        "payment_frequency": "Annual",
        "next_ex_date": "2025-06-15",
        "next_payment_date": "2025-07-15",
        "last_dividend": 3.00,
        "history": [
            {"date": "2024-07-15", "amount": 3.00, "type": "final"},
            {"date": "2023-07-15", "amount": 2.50, "type": "final"},
            {"date": "2022-07-15", "amount": 2.00, "type": "final"},
        ]
    },
    "NCBA": {
        "company": "NCBA Group",
        "annual_yield": 5.8,
        "payment_frequency": "Semi-Annual",
        "next_ex_date": "2025-08-01",
        "next_payment_date": "2025-09-01",
        "last_dividend": 0.50,
        "history": [
            {"date": "2024-09-01", "amount": 0.50, "type": "interim"},
            {"date": "2024-03-01", "amount": 1.00, "type": "final"},
        ]
    },
    "EABL": {
        "company": "East African Breweries",
        "annual_yield": 4.5,
        "payment_frequency": "Semi-Annual",
        "next_ex_date": "2025-07-01",
        "next_payment_date": "2025-08-01",
        "last_dividend": 4.50,
        "history": [
            {"date": "2024-08-01", "amount": 4.50, "type": "interim"},
            {"date": "2024-02-01", "amount": 5.00, "type": "final"},
        ]
    },
    "BAT": {
        "company": "British American Tobacco Kenya",
        "annual_yield": 8.2,
        "payment_frequency": "Semi-Annual",
        "next_ex_date": "2025-06-01",
        "next_payment_date": "2025-07-01",
        "last_dividend": 15.00,
        "history": [
            {"date": "2024-07-01", "amount": 15.00, "type": "interim"},
            {"date": "2024-01-01", "amount": 18.00, "type": "final"},
        ]
    },
}


class DividendService:
    """
    Manages dividend tracking and calculations
    """
    
    @staticmethod
    def get_stock_dividend_info(symbol: str) -> Dict[str, Any]:
        """
        Get dividend information for a stock
        
        Args:
            symbol: Stock symbol
            
        Returns:
            Dividend details including history and upcoming
        """
        try:
            dividend_data = MOCK_DIVIDENDS.get(symbol)
            
            if not dividend_data:
                return {
                    "success": True,
                    "symbol": symbol,
                    "has_dividends": False,
                    "message": "This stock does not pay dividends or data is unavailable"
                }
            
            return {
                "success": True,
                "symbol": symbol,
                "has_dividends": True,
                "company": dividend_data["company"],
                "annual_yield": dividend_data["annual_yield"],
                "payment_frequency": dividend_data["payment_frequency"],
                "next_ex_date": dividend_data["next_ex_date"],
                "next_payment_date": dividend_data["next_payment_date"],
                "last_dividend": dividend_data["last_dividend"],
                "history": dividend_data["history"]
            }
            
        except Exception as e:
            logger.error(f"Failed to get dividend info for {symbol}: {e}")
            return {
                "success": False,
                "message": str(e)
            }
    
    @staticmethod
    def calculate_portfolio_dividends(
        user_id: str,
        db: Session
    ) -> Dict[str, Any]:
        """
        Calculate expected dividends from user's portfolio
        
        Args:
            user_id: User ID
            db: Database session
            
        Returns:
            Portfolio dividend summary
        """
        try:
            # Get user holdings
            holdings = db.query(Holding).filter(Holding.user_id == user_id).all()
            
            if not holdings:
                return {
                    "success": True,
                    "total_annual_dividends": 0,
                    "positions": [],
                    "message": "No holdings found"
                }
            
            total_annual_dividends = 0
            positions = []
            
            for holding in holdings:
                symbol = holding.stock.symbol if holding.stock else ""
                dividend_data = MOCK_DIVIDENDS.get(symbol)
                
                if dividend_data:
                    # Calculate annual dividend for this position
                    quantity = float(holding.quantity)
                    last_dividend = dividend_data["last_dividend"]
                    
                    # Estimate annual dividend based on payment frequency
                    if dividend_data["payment_frequency"] == "Annual":
                        annual_dividend = last_dividend * quantity
                    elif dividend_data["payment_frequency"] == "Semi-Annual":
                        annual_dividend = last_dividend * 2 * quantity
                    elif dividend_data["payment_frequency"] == "Quarterly":
                        annual_dividend = last_dividend * 4 * quantity
                    else:
                        annual_dividend = last_dividend * quantity
                    
                    total_annual_dividends += annual_dividend
                    
                    positions.append({
                        "symbol": symbol,
                        "company": dividend_data["company"],
                        "quantity": quantity,
                        "annual_dividend": annual_dividend,
                        "yield": dividend_data["annual_yield"],
                        "next_payment": dividend_data["next_payment_date"]
                    })
            
            return {
                "success": True,
                "total_annual_dividends": round(total_annual_dividends, 2),
                "monthly_estimate": round(total_annual_dividends / 12, 2),
                "positions": positions,
                "count": len(positions)
            }
            
        except Exception as e:
            logger.error(f"Failed to calculate portfolio dividends: {e}")
            return {
                "success": False,
                "message": str(e)
            }
    
    @staticmethod
    def get_upcoming_dividends(
        user_id: str,
        db: Session,
        days_ahead: int = 90
    ) -> Dict[str, Any]:
        """
        Get upcoming dividend payments for user's holdings
        
        Args:
            user_id: User ID
            db: Database session
            days_ahead: Number of days to look ahead
            
        Returns:
            List of upcoming dividend payments
        """
        try:
            holdings = db.query(Holding).filter(Holding.user_id == user_id).all()
            
            if not holdings:
                return {
                    "success": True,
                    "upcoming": [],
                    "message": "No holdings found"
                }
            
            today = datetime.now().date()
            cutoff_date = today + timedelta(days=days_ahead)
            
            upcoming = []
            
            for holding in holdings:
                symbol = holding.stock.symbol if holding.stock else ""
                dividend_data = MOCK_DIVIDENDS.get(symbol)
                
                if dividend_data:
                    payment_date = datetime.strptime(dividend_data["next_payment_date"], "%Y-%m-%d").date()
                    
                    if today <= payment_date <= cutoff_date:
                        quantity = float(holding.quantity)
                        dividend_amount = dividend_data["last_dividend"] * quantity
                        
                        upcoming.append({
                            "symbol": symbol,
                            "company": dividend_data["company"],
                            "quantity": quantity,
                            "dividend_per_share": dividend_data["last_dividend"],
                            "total_amount": round(dividend_amount, 2),
                            "ex_date": dividend_data["next_ex_date"],
                            "payment_date": dividend_data["next_payment_date"],
                            "days_until_payment": (payment_date - today).days
                        })
            
            # Sort by payment date
            upcoming.sort(key=lambda x: x["payment_date"])
            
            return {
                "success": True,
                "upcoming": upcoming,
                "count": len(upcoming),
                "total_amount": sum(d["total_amount"] for d in upcoming)
            }
            
        except Exception as e:
            logger.error(f"Failed to get upcoming dividends: {e}")
            return {
                "success": False,
                "message": str(e)
            }
    
    @staticmethod
    def get_dividend_history(
        user_id: str,
        db: Session,
        symbol: Optional[str] = None,
        limit: int = 50
    ) -> Dict[str, Any]:
        """
        Get historical dividend payments
        For demo mode, this returns mock data
        
        Args:
            user_id: User ID
            db: Database session
            symbol: Optional symbol filter
            limit: Maximum records to return
            
        Returns:
            Historical dividend payments
        """
        try:
            # In demo mode, generate mock historical dividends
            history = []
            
            holdings = db.query(Holding).filter(Holding.user_id == user_id).all()
            
            for holding in holdings:
                stock_symbol = holding.stock.symbol if holding.stock else ""
                
                if symbol and stock_symbol != symbol:
                    continue
                
                dividend_data = MOCK_DIVIDENDS.get(stock_symbol)
                
                if dividend_data:
                    quantity = float(holding.quantity)
                    
                    for hist in dividend_data["history"]:
                        history.append({
                            "symbol": stock_symbol,
                            "company": dividend_data["company"],
                            "date": hist["date"],
                            "type": hist["type"],
                            "dividend_per_share": hist["amount"],
                            "quantity": quantity,
                            "total_amount": round(hist["amount"] * quantity, 2)
                        })
            
            # Sort by date descending
            history.sort(key=lambda x: x["date"], reverse=True)
            history = history[:limit]
            
            return {
                "success": True,
                "history": history,
                "count": len(history),
                "total_received": sum(d["total_amount"] for d in history)
            }
            
        except Exception as e:
            logger.error(f"Failed to get dividend history: {e}")
            return {
                "success": False,
                "message": str(e)
            }


# Singleton instance
dividend_service = DividendService()

