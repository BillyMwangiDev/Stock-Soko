"""
Tax Report Export Service
Generates tax reports for trading activity
Supports PDF and CSV formats
"""

import csv
import io
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Any, Dict, List

from sqlalchemy.orm import Session

from ..database.models import Holding, Order, User
from ..utils.logging import get_logger

logger = get_logger("tax_report_service")


class TaxReportService:
    """
    Generates tax reports for trading activity
    Includes capital gains/losses, dividends, and fees
    """

    @staticmethod
    def calculate_capital_gains(
        user_id: str, db: Session, tax_year: int
    ) -> Dict[str, Any]:
        """
        Calculate capital gains/losses for a tax year using FIFO method

        Args:
            user_id: User ID
            db: Database session
            tax_year: Tax year (e.g., 2024)

        Returns:
            Capital gains summary
        """
        try:
            # Get all filled orders for the tax year
            year_start = datetime(tax_year, 1, 1)
            year_end = datetime(tax_year, 12, 31, 23, 59, 59)

            orders = (
                db.query(Order)
                .filter(
                    Order.user_id == user_id,
                    Order.status == "filled",
                    Order.filled_at >= year_start,
                    Order.filled_at <= year_end,
                )
                .order_by(Order.filled_at)
                .all()
            )

            # Separate buy and sell orders by stock
            holdings_by_symbol = {}
            realized_gains = []

            for order in orders:
                symbol = order.stock.symbol if order.stock else ""

                if symbol not in holdings_by_symbol:
                    holdings_by_symbol[symbol] = {"buys": [], "sells": []}

                if order.side == "buy":
                    holdings_by_symbol[symbol]["buys"].append(
                        {
                            "date": order.filled_at,
                            "quantity": float(order.filled_quantity),
                            "price": float(order.filled_price),
                            "fees": float(order.fees),
                        }
                    )
                elif order.side == "sell":
                    holdings_by_symbol[symbol]["sells"].append(
                        {
                            "date": order.filled_at,
                            "quantity": float(order.filled_quantity),
                            "price": float(order.filled_price),
                            "fees": float(order.fees),
                        }
                    )

            # Calculate gains using FIFO
            total_short_term_gain = 0
            total_long_term_gain = 0

            for symbol, transactions in holdings_by_symbol.items():
                buys = transactions["buys"].copy()

                for sell in transactions["sells"]:
                    sell_quantity = sell["quantity"]
                    sell_price = sell["price"]
                    sell_date = sell["date"]

                    while sell_quantity > 0 and buys:
                        buy = buys[0]

                        # Match shares
                        matched_quantity = min(sell_quantity, buy["quantity"])

                        # Calculate gain/loss
                        proceeds = matched_quantity * sell_price
                        cost_basis = matched_quantity * buy["price"]
                        gain = proceeds - cost_basis

                        # Determine if long-term or short-term
                        holding_period = (sell_date - buy["date"]).days
                        is_long_term = holding_period > 365

                        if is_long_term:
                            total_long_term_gain += gain
                        else:
                            total_short_term_gain += gain

                        realized_gains.append(
                            {
                                "symbol": symbol,
                                "buy_date": buy["date"].strftime("%Y-%m-%d"),
                                "sell_date": sell_date.strftime("%Y-%m-%d"),
                                "quantity": matched_quantity,
                                "cost_basis": round(cost_basis, 2),
                                "proceeds": round(proceeds, 2),
                                "gain_loss": round(gain, 2),
                                "holding_period_days": holding_period,
                                "term": "Long-term" if is_long_term else "Short-term",
                            }
                        )

                        # Update remaining quantities
                        sell_quantity -= matched_quantity
                        buy["quantity"] -= matched_quantity

                        if buy["quantity"] <= 0:
                            buys.pop(0)

            return {
                "success": True,
                "tax_year": tax_year,
                "short_term_gain": round(total_short_term_gain, 2),
                "long_term_gain": round(total_long_term_gain, 2),
                "total_gain": round(total_short_term_gain + total_long_term_gain, 2),
                "transactions": realized_gains,
                "count": len(realized_gains),
            }

        except Exception as e:
            logger.error(f"Failed to calculate capital gains: {e}")
            return {"success": False, "message": str(e)}

    @staticmethod
    def generate_csv_report(user_id: str, db: Session, tax_year: int) -> Dict[str, Any]:
        """
        Generate CSV tax report

        Args:
            user_id: User ID
            db: Database session
            tax_year: Tax year

        Returns:
            CSV content as string
        """
        try:
            # Get capital gains data
            gains_data = TaxReportService.calculate_capital_gains(user_id, db, tax_year)

            if not gains_data["success"]:
                return gains_data

            # Create CSV
            output = io.StringIO()
            writer = csv.writer(output)

            # Header
            writer.writerow(
                [
                    "Symbol",
                    "Description",
                    "Buy Date",
                    "Sell Date",
                    "Holding Period (Days)",
                    "Term",
                    "Quantity",
                    "Cost Basis (KES)",
                    "Sale Proceeds (KES)",
                    "Gain/Loss (KES)",
                ]
            )

            # Transactions
            for tx in gains_data["transactions"]:
                writer.writerow(
                    [
                        tx["symbol"],
                        f"{tx['symbol']} Stock",
                        tx["buy_date"],
                        tx["sell_date"],
                        tx["holding_period_days"],
                        tx["term"],
                        tx["quantity"],
                        f"{tx['cost_basis']:.2f}",
                        f"{tx['proceeds']:.2f}",
                        f"{tx['gain_loss']:.2f}",
                    ]
                )

            # Summary
            writer.writerow([])
            writer.writerow(["Summary"])
            writer.writerow(
                ["Short-term Capital Gains", f"{gains_data['short_term_gain']:.2f} KES"]
            )
            writer.writerow(
                ["Long-term Capital Gains", f"{gains_data['long_term_gain']:.2f} KES"]
            )
            writer.writerow(
                ["Total Capital Gains", f"{gains_data['total_gain']:.2f} KES"]
            )

            csv_content = output.getvalue()
            output.close()

            return {
                "success": True,
                "format": "csv",
                "content": csv_content,
                "filename": f"tax_report_{tax_year}.csv",
            }

        except Exception as e:
            logger.error(f"Failed to generate CSV report: {e}")
            return {"success": False, "message": str(e)}

    @staticmethod
    def generate_summary_report(
        user_id: str, db: Session, tax_year: int
    ) -> Dict[str, Any]:
        """
        Generate summary tax report (JSON format)

        Args:
            user_id: User ID
            db: Database session
            tax_year: Tax year

        Returns:
            Summary report data
        """
        try:
            # Get capital gains
            gains_data = TaxReportService.calculate_capital_gains(user_id, db, tax_year)

            if not gains_data["success"]:
                return gains_data

            # Get fee totals
            year_start = datetime(tax_year, 1, 1)
            year_end = datetime(tax_year, 12, 31, 23, 59, 59)

            orders = (
                db.query(Order)
                .filter(
                    Order.user_id == user_id,
                    Order.status == "filled",
                    Order.filled_at >= year_start,
                    Order.filled_at <= year_end,
                )
                .all()
            )

            total_fees = sum(float(o.fees) if o.fees else 0 for o in orders)

            # Calculate trading volume
            buy_volume = sum(
                float(o.filled_quantity) * float(o.filled_price)
                for o in orders
                if o.side == "buy"
            )
            sell_volume = sum(
                float(o.filled_quantity) * float(o.filled_price)
                for o in orders
                if o.side == "sell"
            )

            return {
                "success": True,
                "tax_year": tax_year,
                "summary": {
                    "total_capital_gains": gains_data["total_gain"],
                    "short_term_gains": gains_data["short_term_gain"],
                    "long_term_gains": gains_data["long_term_gain"],
                    "total_fees_paid": round(total_fees, 2),
                    "buy_volume": round(buy_volume, 2),
                    "sell_volume": round(sell_volume, 2),
                    "total_trades": len(orders),
                    "realized_transactions": gains_data["count"],
                },
                "transactions": gains_data["transactions"],
                "notes": [
                    "This is a demo/practice account using virtual money",
                    "These figures are for educational purposes only",
                    "Consult a tax professional for actual tax reporting",
                ],
            }

        except Exception as e:
            logger.error(f"Failed to generate summary report: {e}")
            return {"success": False, "message": str(e)}


# Singleton instance
tax_report_service = TaxReportService()
