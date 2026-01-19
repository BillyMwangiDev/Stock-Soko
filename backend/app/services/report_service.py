"""
Report Generation Service - PDF/CSV statements and tax reports
"""

from datetime import datetime
from io import BytesIO
from typing import Any, Dict, List

import pandas as pd
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4, letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from sqlalchemy.orm import Session

from ..database.models import Holding, Order, Stock, Transaction, User
from ..utils.logging import get_logger

logger = get_logger("report_service")


class ReportService:
    """Service for generating PDF and CSV reports"""

    def __init__(self, db: Session):
        self.db = db
        self.styles = getSampleStyleSheet()

    def generate_transaction_statement(
        self, user_id: str, start_date: datetime, end_date: datetime
    ) -> BytesIO:
        """Generate PDF transaction statement"""
        try:
            # Get user
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                raise ValueError("User not found")

            # Get transactions
            transactions = (
                self.db.query(Transaction)
                .filter(
                    Transaction.user_id == user_id,
                    Transaction.created_at >= start_date,
                    Transaction.created_at <= end_date,
                )
                .order_by(Transaction.created_at.desc())
                .all()
            )

            # Create PDF
            buffer = BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            elements = []

            # Title
            title_style = ParagraphStyle(
                "CustomTitle",
                parent=self.styles["Heading1"],
                fontSize=20,
                textColor=colors.HexColor("#16A34A"),
                alignment=TA_CENTER,
                spaceAfter=30,
            )

            elements.append(Paragraph("Stock Soko", title_style))
            elements.append(Paragraph("Transaction Statement", self.styles["Heading2"]))
            elements.append(Spacer(1, 0.3 * inch))

            # User info
            info_style = self.styles["Normal"]
            elements.append(
                Paragraph(
                    f"<b>Account Holder:</b> {user.full_name or user.email}", info_style
                )
            )
            elements.append(Paragraph(f"<b>Email:</b> {user.email}", info_style))
            elements.append(
                Paragraph(
                    f"<b>Statement Period:</b> {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}",
                    info_style,
                )
            )
            elements.append(
                Paragraph(
                    f"<b>Generated:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
                    info_style,
                )
            )
            elements.append(Spacer(1, 0.5 * inch))

            # Transactions table
            if transactions:
                table_data = [
                    ["Date", "Type", "Method", "Amount (KES)", "Status", "Reference"]
                ]

                for txn in transactions:
                    table_data.append(
                        [
                            (
                                txn.created_at.strftime("%Y-%m-%d %H:%M")
                                if txn.created_at
                                else ""
                            ),
                            txn.type.upper(),
                            txn.method.upper(),
                            f"{float(txn.amount):,.2f}",
                            txn.status.upper(),
                            txn.provider_reference or "-",
                        ]
                    )

                table = Table(
                    table_data,
                    colWidths=[
                        1.2 * inch,
                        0.8 * inch,
                        0.8 * inch,
                        1 * inch,
                        0.8 * inch,
                        1.5 * inch,
                    ],
                )
                table.setStyle(
                    TableStyle(
                        [
                            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#16A34A")),
                            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                            ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                            ("FONTSIZE", (0, 0), (-1, 0), 10),
                            ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                            ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
                            ("GRID", (0, 0), (-1, -1), 1, colors.black),
                            ("FONTSIZE", (0, 1), (-1, -1), 9),
                        ]
                    )
                )

                elements.append(table)

                # Summary
                elements.append(Spacer(1, 0.5 * inch))
                total_deposits = sum(
                    float(t.amount)
                    for t in transactions
                    if t.type == "deposit" and t.status == "completed"
                )
                total_withdrawals = sum(
                    float(t.amount)
                    for t in transactions
                    if t.type == "withdrawal" and t.status == "completed"
                )

                summary_data = [
                    ["Transaction Summary", ""],
                    ["Total Deposits", f"KES {total_deposits:,.2f}"],
                    ["Total Withdrawals", f"KES {total_withdrawals:,.2f}"],
                    [
                        "Net Cash Flow",
                        f"KES {(total_deposits - total_withdrawals):,.2f}",
                    ],
                    ["Total Transactions", str(len(transactions))],
                ]

                summary_table = Table(summary_data, colWidths=[2.5 * inch, 1.5 * inch])
                summary_table.setStyle(
                    TableStyle(
                        [
                            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2B3139")),
                            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                            ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                            ("GRID", (0, 0), (-1, -1), 1, colors.black),
                        ]
                    )
                )

                elements.append(summary_table)
            else:
                elements.append(
                    Paragraph(
                        "No transactions found for this period.", self.styles["Normal"]
                    )
                )

            # Footer
            elements.append(Spacer(1, 0.5 * inch))
            footer_style = ParagraphStyle(
                "Footer",
                parent=self.styles["Normal"],
                fontSize=8,
                textColor=colors.grey,
            )
            elements.append(
                Paragraph(
                    "This is a computer-generated statement. For queries, contact support@stocksoko.com",
                    footer_style,
                )
            )

            # Build PDF
            doc.build(elements)
            buffer.seek(0)

            logger.info(
                f"Generated transaction statement for user {user_id}: {len(transactions)} transactions"
            )
            return buffer

        except Exception as e:
            logger.error(f"Failed to generate transaction statement: {e}")
            raise

    def generate_tax_report(self, user_id: str, year: int) -> BytesIO:
        """Generate CSV tax report with capital gains/losses"""
        try:
            # Get user
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                raise ValueError("User not found")

            # Get all sell orders for the year
            start_date = datetime(year, 1, 1)
            end_date = datetime(year, 12, 31, 23, 59, 59)

            sell_orders = (
                self.db.query(Order)
                .filter(
                    Order.user_id == user_id,
                    Order.side == "sell",
                    Order.status == "executed",
                    Order.submitted_at >= start_date,
                    Order.submitted_at <= end_date,
                )
                .all()
            )

            # Calculate capital gains/losses
            tax_data = []
            total_capital_gains = 0.0

            for order in sell_orders:
                stock = self.db.query(Stock).filter(Stock.id == order.stock_id).first()

                # Get cost basis (simplified - using current holding avg_price)
                holding = (
                    self.db.query(Holding)
                    .filter(
                        Holding.user_id == user_id, Holding.stock_id == order.stock_id
                    )
                    .first()
                )

                cost_basis = float(holding.avg_price) if holding else float(order.price)
                sale_price = float(order.price)
                quantity = (
                    float(order.filled_quantity)
                    if order.filled_quantity > 0
                    else float(order.quantity)
                )

                proceeds = sale_price * quantity
                cost = cost_basis * quantity
                capital_gain = proceeds - cost - float(order.fees)

                total_capital_gains += capital_gain

                tax_data.append(
                    {
                        "Date": (
                            order.submitted_at.strftime("%Y-%m-%d")
                            if order.submitted_at
                            else ""
                        ),
                        "Stock Symbol": stock.symbol if stock else "",
                        "Stock Name": stock.name if stock else "",
                        "Quantity": quantity,
                        "Sale Price": sale_price,
                        "Cost Basis": cost_basis,
                        "Proceeds": proceeds,
                        "Cost": cost,
                        "Fees": float(order.fees),
                        "Capital Gain/Loss": capital_gain,
                        "Status": order.status,
                    }
                )

            # Get dividends (placeholder - would come from Dividend model)
            # For now, calculate estimated dividends from holdings
            holdings = self.db.query(Holding).filter(Holding.user_id == user_id).all()
            total_dividends = 0.0

            for holding in holdings:
                stock = (
                    self.db.query(Stock).filter(Stock.id == holding.stock_id).first()
                )
                if stock and stock.dividend_yield:
                    market_value = float(holding.quantity) * float(
                        stock.latest_price or 0
                    )
                    dividend = market_value * (float(stock.dividend_yield) / 100)
                    total_dividends += dividend

            # Create DataFrame
            df = pd.DataFrame(tax_data)

            # Add summary rows
            summary_df = pd.DataFrame(
                [
                    {
                        "Date": "",
                        "Stock Symbol": "",
                        "Stock Name": "",
                        "Quantity": "",
                        "Sale Price": "",
                        "Cost Basis": "",
                        "Proceeds": "",
                        "Cost": "",
                        "Fees": "",
                        "Capital Gain/Loss": "",
                        "Status": "",
                    },
                    {
                        "Date": "SUMMARY",
                        "Stock Symbol": "",
                        "Stock Name": "",
                        "Quantity": "",
                        "Sale Price": "",
                        "Cost Basis": "",
                        "Proceeds": "",
                        "Cost": "",
                        "Fees": "",
                        "Capital Gain/Loss": "",
                        "Status": "",
                    },
                    {
                        "Date": "Total Capital Gains/Losses",
                        "Stock Symbol": "",
                        "Stock Name": "",
                        "Quantity": "",
                        "Sale Price": "",
                        "Cost Basis": "",
                        "Proceeds": "",
                        "Cost": "",
                        "Fees": "",
                        "Capital Gain/Loss": f"{total_capital_gains:.2f}",
                        "Status": "",
                    },
                    {
                        "Date": "Estimated Dividend Income",
                        "Stock Symbol": "",
                        "Stock Name": "",
                        "Quantity": "",
                        "Sale Price": "",
                        "Cost Basis": "",
                        "Proceeds": "",
                        "Cost": "",
                        "Fees": "",
                        "Capital Gain/Loss": f"{total_dividends:.2f}",
                        "Status": "",
                    },
                    {
                        "Date": "Total Taxable Income",
                        "Stock Symbol": "",
                        "Stock Name": "",
                        "Quantity": "",
                        "Sale Price": "",
                        "Cost Basis": "",
                        "Proceeds": "",
                        "Cost": "",
                        "Fees": "",
                        "Capital Gain/Loss": f"{(total_capital_gains + total_dividends):.2f}",
                        "Status": "",
                    },
                ]
            )

            final_df = pd.concat([df, summary_df], ignore_index=True)

            # Export to CSV
            buffer = BytesIO()
            final_df.to_csv(buffer, index=False)
            buffer.seek(0)

            logger.info(
                f"Generated tax report for user {user_id}: {len(sell_orders)} transactions"
            )
            return buffer

        except Exception as e:
            logger.error(f"Failed to generate tax report: {e}")
            raise

    def generate_portfolio_summary(
        self, user_id: str, month: int, year: int
    ) -> BytesIO:
        """Generate monthly portfolio summary PDF"""
        try:
            # Get user
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                raise ValueError("User not found")

            # Get holdings
            holdings = self.db.query(Holding).filter(Holding.user_id == user_id).all()

            # Create PDF
            buffer = BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            elements = []

            # Title
            title_style = ParagraphStyle(
                "CustomTitle",
                parent=self.styles["Heading1"],
                fontSize=20,
                textColor=colors.HexColor("#16A34A"),
                alignment=TA_CENTER,
                spaceAfter=30,
            )

            elements.append(Paragraph("Stock Soko", title_style))
            elements.append(
                Paragraph("Monthly Portfolio Summary", self.styles["Heading2"])
            )
            elements.append(Spacer(1, 0.3 * inch))

            # Period info
            month_names = [
                "",
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
            ]

            elements.append(
                Paragraph(
                    f"<b>Account:</b> {user.full_name or user.email}",
                    self.styles["Normal"],
                )
            )
            elements.append(
                Paragraph(
                    f"<b>Period:</b> {month_names[month]} {year}", self.styles["Normal"]
                )
            )
            elements.append(
                Paragraph(
                    f"<b>Generated:</b> {datetime.now().strftime('%Y-%m-%d %H:%M')}",
                    self.styles["Normal"],
                )
            )
            elements.append(Spacer(1, 0.5 * inch))

            # Holdings table
            if holdings:
                table_data = [
                    [
                        "Stock",
                        "Quantity",
                        "Avg Price",
                        "Current Price",
                        "Market Value",
                        "P/L",
                        "P/L %",
                    ]
                ]

                total_value = 0.0
                total_cost = 0.0

                for holding in holdings:
                    stock = (
                        self.db.query(Stock)
                        .filter(Stock.id == holding.stock_id)
                        .first()
                    )
                    if not stock:
                        continue

                    quantity = float(holding.quantity)
                    avg_price = float(holding.avg_price)
                    current_price = float(stock.latest_price or avg_price)

                    market_value = quantity * current_price
                    cost_basis = quantity * avg_price
                    pl = market_value - cost_basis
                    pl_pct = (pl / cost_basis * 100) if cost_basis > 0 else 0

                    total_value += market_value
                    total_cost += cost_basis

                    table_data.append(
                        [
                            stock.symbol,
                            f"{quantity:.0f}",
                            f"{avg_price:.2f}",
                            f"{current_price:.2f}",
                            f"{market_value:,.2f}",
                            f"{pl:,.2f}",
                            f"{pl_pct:.2f}%",
                        ]
                    )

                # Add totals row
                total_pl = total_value - total_cost
                total_pl_pct = (total_pl / total_cost * 100) if total_cost > 0 else 0

                table_data.append(
                    [
                        "TOTAL",
                        "",
                        "",
                        "",
                        f"{total_value:,.2f}",
                        f"{total_pl:,.2f}",
                        f"{total_pl_pct:.2f}%",
                    ]
                )

                table = Table(table_data)
                table.setStyle(
                    TableStyle(
                        [
                            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#16A34A")),
                            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                            ("FONTSIZE", (0, 0), (-1, 0), 10),
                            ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                            (
                                "BACKGROUND",
                                (0, -1),
                                (-1, -1),
                                colors.HexColor("#2B3139"),
                            ),
                            ("TEXTCOLOR", (0, -1), (-1, -1), colors.whitesmoke),
                            ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
                            ("GRID", (0, 0), (-1, -1), 1, colors.black),
                        ]
                    )
                )

                elements.append(table)
            else:
                elements.append(Paragraph("No holdings found.", self.styles["Normal"]))

            # Footer
            elements.append(Spacer(1, inch))
            footer_style = ParagraphStyle(
                "Footer",
                parent=self.styles["Normal"],
                fontSize=8,
                textColor=colors.grey,
            )
            elements.append(
                Paragraph(
                    "This statement is for informational purposes only. Please consult with a tax professional for tax advice.",
                    footer_style,
                )
            )

            # Build PDF
            doc.build(elements)
            buffer.seek(0)

            logger.info(f"Generated portfolio summary for user {user_id}")
            return buffer

        except Exception as e:
            logger.error(f"Failed to generate portfolio summary: {e}")
            raise


def get_report_service(db: Session) -> ReportService:
    """Factory function to create report service"""
    return ReportService(db)
