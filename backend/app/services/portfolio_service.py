"""
Portfolio Service - Real-time portfolio valuation and performance tracking
"""

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session

from ..database.models import Holding, Portfolio, Stock, User
from ..utils.logging import get_logger
from .markets_service import markets_service

logger = get_logger("portfolio_service")


class PortfolioService:
    """Service for portfolio valuation and performance calculations"""

    def __init__(self, db: Session):
        self.db = db

    def calculate_portfolio_value(self, user_id: str) -> Dict[str, Any]:
        """Calculate real-time portfolio value using live market data"""
        try:
            # Get user's holdings
            holdings = self.db.query(Holding).filter(Holding.user_id == user_id).all()

            if not holdings:
                return {
                    "total_value": 0.0,
                    "cash": 0.0,
                    "invested": 0.0,
                    "unrealized_pl": 0.0,
                    "unrealized_pl_pct": 0.0,
                    "holdings_count": 0,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                }

            total_value = 0.0
            total_invested = 0.0
            holdings_data = []

            for holding in holdings:
                # Get stock details
                stock = (
                    self.db.query(Stock).filter(Stock.id == holding.stock_id).first()
                )
                if not stock:
                    continue

                # Get current price (try real-time, fallback to cached)
                try:
                    quote = markets_service.get_quote(stock.symbol)
                    current_price = quote.last_price
                except Exception as e:
                    logger.warning(
                        f"Failed to get live price for {stock.symbol}, using cached: {e}"
                    )
                    current_price = (
                        float(stock.latest_price)
                        if stock.latest_price
                        else float(holding.avg_price)
                    )

                # Calculate values
                quantity = float(holding.quantity)
                avg_price = float(holding.avg_price)

                market_value = quantity * current_price
                cost_basis = quantity * avg_price
                unrealized_pl = market_value - cost_basis
                unrealized_pl_pct = (
                    (unrealized_pl / cost_basis * 100) if cost_basis > 0 else 0
                )

                total_value += market_value
                total_invested += cost_basis

                holdings_data.append(
                    {
                        "symbol": stock.symbol,
                        "name": stock.name,
                        "quantity": quantity,
                        "avg_price": avg_price,
                        "current_price": current_price,
                        "market_value": round(market_value, 2),
                        "cost_basis": round(cost_basis, 2),
                        "unrealized_pl": round(unrealized_pl, 2),
                        "unrealized_pl_pct": round(unrealized_pl_pct, 2),
                        "allocation_pct": 0,  # Will be calculated after total is known
                    }
                )

            # Calculate allocation percentages
            for item in holdings_data:
                item["allocation_pct"] = round(
                    (
                        (item["market_value"] / total_value * 100)
                        if total_value > 0
                        else 0
                    ),
                    2,
                )

            # Get cash balance
            portfolio = (
                self.db.query(Portfolio).filter(Portfolio.user_id == user_id).first()
            )
            cash = float(portfolio.cash) if portfolio else 0.0

            # Calculate totals
            total_portfolio_value = total_value + cash
            total_unrealized_pl = total_value - total_invested
            total_unrealized_pl_pct = (
                (total_unrealized_pl / total_invested * 100)
                if total_invested > 0
                else 0
            )

            return {
                "total_value": round(total_portfolio_value, 2),
                "cash": round(cash, 2),
                "invested": round(total_invested, 2),
                "holdings_value": round(total_value, 2),
                "unrealized_pl": round(total_unrealized_pl, 2),
                "unrealized_pl_pct": round(total_unrealized_pl_pct, 2),
                "holdings": holdings_data,
                "holdings_count": len(holdings_data),
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }

        except Exception as e:
            logger.error(f"Failed to calculate portfolio value for user {user_id}: {e}")
            raise

    def calculate_unrealized_pl(self, user_id: str) -> Dict[str, Any]:
        """Calculate unrealized profit/loss per holding"""
        try:
            holdings = self.db.query(Holding).filter(Holding.user_id == user_id).all()

            unrealized_data = []

            for holding in holdings:
                stock = (
                    self.db.query(Stock).filter(Stock.id == holding.stock_id).first()
                )
                if not stock:
                    continue

                # Get current price
                try:
                    quote = markets_service.get_quote(stock.symbol)
                    current_price = quote.last_price
                except:
                    current_price = (
                        float(stock.latest_price)
                        if stock.latest_price
                        else float(holding.avg_price)
                    )

                quantity = float(holding.quantity)
                avg_price = float(holding.avg_price)

                unrealized_pl = (current_price - avg_price) * quantity
                unrealized_pl_pct = (
                    ((current_price - avg_price) / avg_price * 100)
                    if avg_price > 0
                    else 0
                )

                unrealized_data.append(
                    {
                        "symbol": stock.symbol,
                        "name": stock.name,
                        "quantity": quantity,
                        "avg_price": avg_price,
                        "current_price": current_price,
                        "unrealized_pl": round(unrealized_pl, 2),
                        "unrealized_pl_pct": round(unrealized_pl_pct, 2),
                    }
                )

            return {
                "holdings": unrealized_data,
                "count": len(unrealized_data),
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }

        except Exception as e:
            logger.error(f"Failed to calculate unrealized P/L for user {user_id}: {e}")
            raise

    def calculate_performance(self, user_id: str, days: int = 30) -> Dict[str, Any]:
        """Calculate portfolio performance over time"""
        try:
            # Get current portfolio value
            current_portfolio = self.calculate_portfolio_value(user_id)
            current_value = current_portfolio["total_value"]

            # For now, generate mock historical data
            # In production, this would fetch from a portfolio_history table
            historical_values = []

            for i in range(days, 0, -1):
                date = datetime.now(timezone.utc) - timedelta(days=i)
                # Simulate historical values with some variation
                value_variation = (days - i) / days  # Gradual growth
                simulated_value = current_value * (0.9 + (value_variation * 0.1))

                historical_values.append(
                    {
                        "date": date.date().isoformat(),
                        "value": round(simulated_value, 2),
                    }
                )

            # Add current value
            historical_values.append(
                {
                    "date": datetime.now(timezone.utc).date().isoformat(),
                    "value": current_value,
                }
            )

            # Calculate performance metrics
            start_value = historical_values[0]["value"]
            end_value = current_value

            absolute_return = end_value - start_value
            percent_return = (
                (absolute_return / start_value * 100) if start_value > 0 else 0
            )

            # Calculate daily returns for Sharpe ratio calculation
            daily_returns = []
            for i in range(1, len(historical_values)):
                prev_value = historical_values[i - 1]["value"]
                curr_value = historical_values[i]["value"]
                daily_return = (
                    (curr_value - prev_value) / prev_value if prev_value > 0 else 0
                )
                daily_returns.append(daily_return)

            # Simple volatility calculation
            avg_return = sum(daily_returns) / len(daily_returns) if daily_returns else 0
            variance = (
                sum((r - avg_return) ** 2 for r in daily_returns) / len(daily_returns)
                if daily_returns
                else 0
            )
            volatility = variance**0.5

            # Sharpe ratio (assuming risk-free rate of 7% annual = 0.019% daily)
            risk_free_rate_daily = 0.07 / 365
            sharpe_ratio = (
                (avg_return - risk_free_rate_daily) / volatility
                if volatility > 0
                else 0
            )

            return {
                "period_days": days,
                "start_value": round(start_value, 2),
                "end_value": round(end_value, 2),
                "absolute_return": round(absolute_return, 2),
                "percent_return": round(percent_return, 2),
                "volatility": round(volatility * 100, 2),  # As percentage
                "sharpe_ratio": round(sharpe_ratio, 2),
                "historical_values": historical_values,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }

        except Exception as e:
            logger.error(f"Failed to calculate performance for user {user_id}: {e}")
            raise

    def get_dividends(self, user_id: str) -> Dict[str, Any]:
        """Get dividend information for user's holdings"""
        try:
            holdings = self.db.query(Holding).filter(Holding.user_id == user_id).all()

            dividends_data = []
            total_annual_dividends = 0.0

            for holding in holdings:
                stock = (
                    self.db.query(Stock).filter(Stock.id == holding.stock_id).first()
                )
                if not stock or not stock.dividend_yield:
                    continue

                # Get current price
                try:
                    quote = markets_service.get_quote(stock.symbol)
                    current_price = quote.last_price
                except:
                    current_price = (
                        float(stock.latest_price) if stock.latest_price else 0
                    )

                quantity = float(holding.quantity)
                dividend_yield = float(stock.dividend_yield)
                market_value = quantity * current_price

                annual_dividend = market_value * (dividend_yield / 100)
                total_annual_dividends += annual_dividend

                dividends_data.append(
                    {
                        "symbol": stock.symbol,
                        "name": stock.name,
                        "quantity": quantity,
                        "dividend_yield": dividend_yield,
                        "annual_dividend": round(annual_dividend, 2),
                        "quarterly_estimate": round(annual_dividend / 4, 2),
                    }
                )

            return {
                "total_annual_dividends": round(total_annual_dividends, 2),
                "total_quarterly_estimate": round(total_annual_dividends / 4, 2),
                "total_monthly_estimate": round(total_annual_dividends / 12, 2),
                "dividends": dividends_data,
                "count": len(dividends_data),
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }

        except Exception as e:
            logger.error(f"Failed to get dividends for user {user_id}: {e}")
            raise


def get_portfolio_service(db: Session) -> PortfolioService:
    """Factory function to create portfolio service"""
    return PortfolioService(db)
