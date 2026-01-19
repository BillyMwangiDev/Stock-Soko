"""
Tax Reports Router
Generate tax reports for trading activity
"""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session

from ..database import get_db
from ..database.models import User
from ..routers.auth import current_user_email
from ..services.tax_report_service import tax_report_service
from ..utils.logging import get_logger

logger = get_logger("tax_reports_router")

router = APIRouter(prefix="/tax-reports", tags=["tax-reports"])


@router.get("/summary")
async def get_tax_summary(
    tax_year: int = Query(
        default=None, description="Tax year (defaults to current year)"
    ),
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db),
):
    """
    Get tax summary for a given year
    Includes capital gains, fees, and trading volume
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Default to current year if not specified
    if not tax_year:
        tax_year = datetime.now().year

    result = tax_report_service.generate_summary_report(user.id, db, tax_year)

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])

    logger.info(f"Generated tax summary for user {user.id}, year {tax_year}")

    return result


@router.get("/export/csv")
async def export_tax_csv(
    tax_year: int = Query(
        default=None, description="Tax year (defaults to current year)"
    ),
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db),
):
    """
    Export tax report as CSV file
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Default to current year if not specified
    if not tax_year:
        tax_year = datetime.now().year

    result = tax_report_service.generate_csv_report(user.id, db, tax_year)

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])

    logger.info(f"Exported CSV tax report for user {user.id}, year {tax_year}")

    # Return CSV file
    return Response(
        content=result["content"],
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={result['filename']}"},
    )


@router.get("/capital-gains")
async def get_capital_gains(
    tax_year: int = Query(
        default=None, description="Tax year (defaults to current year)"
    ),
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db),
):
    """
    Get detailed capital gains/losses breakdown
    Uses FIFO method for cost basis calculation
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Default to current year if not specified
    if not tax_year:
        tax_year = datetime.now().year

    result = tax_report_service.calculate_capital_gains(user.id, db, tax_year)

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])

    return result
