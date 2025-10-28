"""
Advanced Portfolio Analytics Service
Provides detailed metrics, risk analysis, and performance insights
"""
from typing import Dict, Any, List
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from sqlalchemy.orm import Session
from ..database.models import User, Portfolio, Holding, Order, Stock
from ..data.sample_stocks import SAMPLE_STOCKS
from ..utils.logging import get_logger
import random

logger = get_logger("portfolio_analytics_service")


# Sector mapping for Kenyan stocks
SECTOR_MAP = {
    "SCOM": "Telecommunications",
    "EQTY": "Banking",
    "KCB": "Banking",
    "NCBA": "Banking",
    "COOP": "Banking",
    "SBIC": "Banking",
    "EABL": "Consumer Goods",
    "BAT": "Consumer Goods",
    "KPLC": "Energy",
    "KENGEN": "Energy",
    "TOTAL": "Energy",
    "SASINI": "Agriculture",
    "KAPU": "Agriculture",
    "CAR": "Manufacturing",
    "BOC": "Manufacturing",
    "BAMB": "Manufacturing",
    "KUKZ": "Manufacturing",
    "FTGH": "Insurance",
    "JUB": "Insurance",
    "BRITAM": "Insurance",
}


class PortfolioAnalyticsService:
    """
    Advanced portfolio analysis and metrics
    """
    
    @staticmethod
    def get_sector_allocation(user_id: str, db: Session) -> Dict[str, Any]:
        """
        Calculate portfolio allocation by sector
        
        Args:
            user_id: User ID
            db: Database session
            
        Returns:
            Sector allocation breakdown
        """
        try:
            holdings = db.query(Holding).filter(Holding.user_id == user_id).all()
            
            if not holdings:
                return {
                    "success": True,
                    "sectors": [],
                    "message": "No holdings found"
                }
            
            sector_values = {}
            total_value = 0
            
            for holding in holdings:
                symbol = holding.stock.symbol if holding.stock else ""
                sector = SECTOR_MAP.get(symbol, "Other")
                
                market_value = float(holding.market_value) if holding.market_value else 0
                
                if sector not in sector_values:
                    sector_values[sector] = {"value": 0, "stocks": []}
                
                sector_values[sector]["value"] += market_value
                sector_values[sector]["stocks"].append(symbol)
                total_value += market_value
            
            # Calculate percentages
            sectors = []
            for sector, data in sector_values.items():
                sectors.append({
                    "sector": sector,
                    "value": round(data["value"], 2),
                    "percentage": round((data["value"] / total_value * 100), 2) if total_value > 0 else 0,
                    "stocks": data["stocks"],
                    "count": len(data["stocks"])
                })
            
            # Sort by value
            sectors.sort(key=lambda x: x["value"], reverse=True)
            
            return {
                "success": True,
                "sectors": sectors,
                "total_value": round(total_value, 2),
                "diversification_score": min(100, len(sectors) * 20)  # Simple score
            }
            
        except Exception as e:
            logger.error(f"Failed to get sector allocation: {e}")
            return {
                "success": False,
                "message": str(e)
            }
    
    @staticmethod
    def get_performance_metrics(user_id: str, db: Session) -> Dict[str, Any]:
        """
        Calculate advanced performance metrics
        
        Args:
            user_id: User ID
            db: Database session
            
        Returns:
            Performance metrics including Sharpe ratio, volatility
        """
        try:
            portfolio = db.query(Portfolio).filter(Portfolio.user_id == user_id).first()
            
            if not portfolio:
                return {
                    "success": False,
                    "message": "Portfolio not found"
                }
            
            starting_balance = 10000.00
            current_value = float(portfolio.total_value) if portfolio.total_value else 0
            
            # Calculate returns
            total_return = current_value - starting_balance
            return_percent = (total_return / starting_balance) * 100 if starting_balance > 0 else 0
            
            # Generate mock historical performance (30 days)
            historical = []
            for i in range(30):
                date = datetime.now() - timedelta(days=29-i)
                value = starting_balance + (total_return * (i / 29)) if i > 0 else starting_balance
                # Add some randomness
                value += random.uniform(-100, 100)
                historical.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "value": round(value, 2)
                })
            
            # Calculate volatility (simplified - standard deviation of returns)
            daily_returns = []
            for i in range(1, len(historical)):
                daily_return = ((historical[i]["value"] - historical[i-1]["value"]) / historical[i-1]["value"]) * 100
                daily_returns.append(daily_return)
            
            volatility = (sum((r - (sum(daily_returns) / len(daily_returns)))**2 for r in daily_returns) / len(daily_returns))**0.5 if daily_returns else 0
            
            # Calculate Sharpe Ratio (simplified - assuming 5% risk-free rate)
            risk_free_rate = 5.0  # Annual risk-free rate
            annual_return = return_percent  # Assuming current return
            annual_volatility = volatility * (252 ** 0.5)  # Annualized
            sharpe_ratio = (annual_return - risk_free_rate) / annual_volatility if annual_volatility > 0 else 0
            
            # Calculate Beta (simplified - vs NSE20 index)
            market_return = 8.0  # Assumed market return
            beta = annual_return / market_return if market_return > 0 else 1.0
            
            return {
                "success": True,
                "current_value": round(current_value, 2),
                "starting_balance": starting_balance,
                "total_return": round(total_return, 2),
                "return_percent": round(return_percent, 2),
                "volatility": round(volatility, 2),
                "annual_volatility": round(annual_volatility, 2),
                "sharpe_ratio": round(sharpe_ratio, 2),
                "beta": round(beta, 2),
                "risk_level": "Low" if volatility < 2 else "Medium" if volatility < 4 else "High",
                "historical_performance": historical
            }
            
        except Exception as e:
            logger.error(f"Failed to get performance metrics: {e}")
            return {
                "success": False,
                "message": str(e)
            }
    
    @staticmethod
    def get_risk_analysis(user_id: str, db: Session) -> Dict[str, Any]:
        """
        Analyze portfolio risk and provide recommendations
        
        Args:
            user_id: User ID
            db: Database session
            
        Returns:
            Risk analysis with recommendations
        """
        try:
            holdings = db.query(Holding).filter(Holding.user_id == user_id).all()
            portfolio = db.query(Portfolio).filter(Portfolio.user_id == user_id).first()
            
            if not holdings or not portfolio:
                return {
                    "success": True,
                    "risk_score": 0,
                    "message": "No holdings found"
                }
            
            # Calculate concentration risk
            total_value = float(portfolio.total_value) if portfolio.total_value else 0
            max_position = 0
            
            for holding in holdings:
                market_value = float(holding.market_value) if holding.market_value else 0
                position_percent = (market_value / total_value * 100) if total_value > 0 else 0
                max_position = max(max_position, position_percent)
            
            # Risk factors
            num_holdings = len(holdings)
            diversification_score = min(100, num_holdings * 10)
            concentration_risk = max_position
            
            # Get sector allocation
            sector_alloc = PortfolioAnalyticsService.get_sector_allocation(user_id, db)
            num_sectors = len(sector_alloc.get("sectors", [])) if sector_alloc.get("success") else 0
            
            # Calculate overall risk score (0-100, lower is less risky)
            risk_score = 50  # Base score
            risk_score -= (num_holdings * 2)  # More holdings = less risk
            risk_score += (concentration_risk / 2)  # High concentration = more risk
            risk_score -= (num_sectors * 5)  # More sectors = less risk
            risk_score = max(0, min(100, risk_score))
            
            # Generate recommendations
            recommendations = []
            
            if num_holdings < 5:
                recommendations.append({
                    "type": "diversification",
                    "severity": "high",
                    "message": "Consider adding more stocks to your portfolio (aim for at least 10-15)"
                })
            
            if concentration_risk > 30:
                recommendations.append({
                    "type": "concentration",
                    "severity": "medium",
                    "message": f"Your largest position is {concentration_risk:.1f}% of portfolio. Consider rebalancing to reduce risk"
                })
            
            if num_sectors < 3:
                recommendations.append({
                    "type": "sector_diversification",
                    "severity": "medium",
                    "message": "Diversify across more sectors to reduce sector-specific risk"
                })
            
            return {
                "success": True,
                "risk_score": round(risk_score, 1),
                "risk_level": "Low" if risk_score < 30 else "Medium" if risk_score < 60 else "High",
                "factors": {
                    "num_holdings": num_holdings,
                    "num_sectors": num_sectors,
                    "largest_position_percent": round(concentration_risk, 2),
                    "diversification_score": diversification_score
                },
                "recommendations": recommendations
            }
            
        except Exception as e:
            logger.error(f"Failed to get risk analysis: {e}")
            return {
                "success": False,
                "message": str(e)
            }
    
    @staticmethod
    def get_top_holdings(user_id: str, db: Session, limit: int = 10) -> Dict[str, Any]:
        """
        Get top holdings by value with detailed metrics
        
        Args:
            user_id: User ID
            db: Database session
            limit: Number of holdings to return
            
        Returns:
            Top holdings with performance data
        """
        try:
            holdings = db.query(Holding).filter(Holding.user_id == user_id).all()
            
            if not holdings:
                return {
                    "success": True,
                    "holdings": [],
                    "message": "No holdings found"
                }
            
            holdings_data = []
            
            for holding in holdings:
                symbol = holding.stock.symbol if holding.stock else ""
                market_value = float(holding.market_value) if holding.market_value else 0
                avg_price = float(holding.avg_price) if holding.avg_price else 0
                quantity = float(holding.quantity) if holding.quantity else 0
                
                # Get current price from stock
                current_price = float(holding.stock.latest_price) if holding.stock and holding.stock.latest_price else avg_price
                
                # Calculate metrics
                cost_basis = avg_price * quantity
                gain_loss = market_value - cost_basis
                gain_loss_percent = (gain_loss / cost_basis * 100) if cost_basis > 0 else 0
                
                holdings_data.append({
                    "symbol": symbol,
                    "name": holding.stock.name if holding.stock else "",
                    "quantity": quantity,
                    "avg_price": round(avg_price, 2),
                    "current_price": round(current_price, 2),
                    "market_value": round(market_value, 2),
                    "cost_basis": round(cost_basis, 2),
                    "gain_loss": round(gain_loss, 2),
                    "gain_loss_percent": round(gain_loss_percent, 2),
                    "sector": SECTOR_MAP.get(symbol, "Other")
                })
            
            # Sort by market value
            holdings_data.sort(key=lambda x: x["market_value"], reverse=True)
            
            return {
                "success": True,
                "holdings": holdings_data[:limit],
                "count": len(holdings_data)
            }
            
        except Exception as e:
            logger.error(f"Failed to get top holdings: {e}")
            return {
                "success": False,
                "message": str(e)
            }


# Singleton instance
portfolio_analytics_service = PortfolioAnalyticsService()

