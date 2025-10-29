"""
Virtual Wallet Router for Demo Mode
Manages virtual balances and transactions for paper trading
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional
from ..database import get_db
from ..database.models import User
from ..routers.auth import current_user_email
from ..services.virtual_wallet_service import virtual_wallet_service
from ..utils.logging import get_logger

logger = get_logger("wallet_router")

router = APIRouter(prefix="/wallet", tags=["wallet"])


class VirtualDepositRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Amount to deposit")
    description: Optional[str] = Field(None, description="Transaction description")


class VirtualWithdrawalRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Amount to withdraw")
    description: Optional[str] = Field(None, description="Transaction description")


@router.post("/create")
async def create_virtual_wallet(
    email: str = Depends(current_user_email), db: Session = Depends(get_db)
):
    """
    Create virtual wallet with starting balance
    Automatically called on first app launch
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = virtual_wallet_service.create_wallet(user.id, db)

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])

    logger.info(f"Virtual wallet created for user {user.id}")

    return result


@router.get("/balance")
async def get_virtual_balance(
    email: str = Depends(current_user_email), db: Session = Depends(get_db)
):
    """
    Get current virtual wallet balance
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = virtual_wallet_service.get_balance(user.id, db)

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])

    return result


@router.post("/deposit")
async def virtual_deposit(
    request: VirtualDepositRequest,
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db),
):
    """
    Add virtual funds to wallet (demo mode only)
    Allows users to add more virtual money for testing
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = virtual_wallet_service.deposit(
        user_id=user.id,
        amount=request.amount,
        db=db,
        description=request.description or "Virtual deposit",
    )

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])

    logger.info(f"Virtual deposit: ${request.amount} for user {user.id}")

    return result


@router.post("/withdraw")
async def virtual_withdrawal(
    request: VirtualWithdrawalRequest,
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db),
):
    """
    Remove virtual funds from wallet (demo mode only)
    Simulates withdrawal for testing
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = virtual_wallet_service.withdraw(
        user_id=user.id,
        amount=request.amount,
        db=db,
        description=request.description or "Virtual withdrawal",
    )

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])

    logger.info(f"Virtual withdrawal: ${request.amount} for user {user.id}")

    return result


@router.post("/reset")
async def reset_virtual_wallet(
    email: str = Depends(current_user_email), db: Session = Depends(get_db)
):
    """
    Reset wallet to starting balance
    Useful for users who want to restart their demo trading
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = virtual_wallet_service.reset_wallet(user.id, db)

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])

    logger.info(f"Wallet reset for user {user.id}")

    return result


@router.get("/transactions")
async def get_virtual_transactions(
    limit: int = Query(
        50, ge=1, le=200, description="Number of transactions to return"
    ),
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db),
):
    """
    Get virtual wallet transaction history
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = virtual_wallet_service.get_transaction_history(
        user_id=user.id, db=db, limit=limit
    )

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])

    return result
