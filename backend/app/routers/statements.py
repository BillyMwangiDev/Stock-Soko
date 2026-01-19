"""
Statements Router - Generate and download financial statements
"""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from ..database import get_db
from ..database.models import User
from ..routers.auth import current_user_email
from ..services.report_service import get_report_service
from ..utils.logging import get_logger

logger = get_logger("statements_router")

router = APIRouter(prefix="/statements", tags=["statements"])


@router.get("/transactions")
async def get_transaction_statement(
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)"),
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db),
):
    """Generate and download transaction statement PDF"""
    try:
        # Parse dates
        try:
            start = datetime.strptime(start_date, "%Y-%m-%d")
            end = datetime.strptime(end_date, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(
                status_code=400, detail="Invalid date format. Use YYYY-MM-DD"
            )

        # Get user
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Generate PDF
        report_service = get_report_service(db)
        pdf_buffer = report_service.generate_transaction_statement(user.id, start, end)

        # Return as downloadable PDF
        filename = f"statement_{start_date}_to_{end_date}.pdf"

        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Type": "application/pdf",
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to generate transaction statement: {e}")
        raise HTTPException(
            status_code=500, detail=f"Report generation failed: {str(e)}"
        )


@router.get("/tax")
async def get_tax_report(
    year: int = Query(2024, ge=2020, le=2030, description="Tax year"),
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db),
):
    """Generate and download tax report CSV"""
    try:
        # Get user
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Generate CSV
        report_service = get_report_service(db)
        csv_buffer = report_service.generate_tax_report(user.id, year)

        # Return as downloadable CSV
        filename = f"tax_report_{year}.csv"

        return StreamingResponse(
            csv_buffer,
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Type": "text/csv",
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to generate tax report: {e}")
        raise HTTPException(
            status_code=500, detail=f"Tax report generation failed: {str(e)}"
        )


@router.get("/portfolio")
async def get_portfolio_summary(
    month: int = Query(..., ge=1, le=12, description="Month (1-12)"),
    year: int = Query(..., ge=2020, le=2030, description="Year"),
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db),
):
    """Generate and download monthly portfolio summary PDF"""
    try:
        # Get user
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Generate PDF
        report_service = get_report_service(db)
        pdf_buffer = report_service.generate_portfolio_summary(user.id, month, year)

        # Return as downloadable PDF
        month_names = [
            "",
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ]
        filename = f"portfolio_summary_{month_names[month]}_{year}.pdf"

        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Type": "application/pdf",
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to generate portfolio summary: {e}")
        raise HTTPException(
            status_code=500, detail=f"Report generation failed: {str(e)}"
        )


@router.get("/available")
async def get_available_reports(
    email: str = Depends(current_user_email), db: Session = Depends(get_db)
):
    """Get list of available report types"""
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "reports": [
                {
                    "type": "transaction_statement",
                    "name": "Transaction Statement",
                    "description": "Detailed list of all deposits, withdrawals, and trades",
                    "format": "PDF",
                    "endpoint": "/statements/transactions",
                },
                {
                    "type": "tax_report",
                    "name": "Tax Report",
                    "description": "Capital gains/losses and dividend income for tax filing",
                    "format": "CSV",
                    "endpoint": "/statements/tax",
                },
                {
                    "type": "portfolio_summary",
                    "name": "Portfolio Summary",
                    "description": "Monthly snapshot of holdings and performance",
                    "format": "PDF",
                    "endpoint": "/statements/portfolio",
                },
            ]
        }

    except Exception as e:
        logger.error(f"Failed to get available reports: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve report types")
