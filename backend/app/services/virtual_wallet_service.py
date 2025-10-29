"""
Virtual Wallet Service for Demo Mode
Manages virtual balances for paper trading
"""

from typing import Dict, Any, Optional
from decimal import Decimal
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from ..database.models import Portfolio, User, Transaction
from ..utils.logging import get_logger
import uuid

logger = get_logger("virtual_wallet_service")


class VirtualWalletService:
    """
    Manages virtual money for demo/mock trading mode
    Each user gets a starting balance to practice with
    """

    STARTING_BALANCE = 10000.00  # $10,000 starting virtual balance

    @staticmethod
    def create_wallet(user_id: str, db: Session) -> Dict[str, Any]:
        """
        Create virtual wallet with starting balance

        Args:
            user_id: User ID
            db: Database session

        Returns:
            Wallet details with starting balance
        """
        try:
            # Check if portfolio already exists
            portfolio = db.query(Portfolio).filter(Portfolio.user_id == user_id).first()

            if portfolio:
                return {
                    "success": True,
                    "message": "Wallet already exists",
                    "balance": float(portfolio.cash),
                    "is_new": False,
                }

            # Create new portfolio with starting balance
            portfolio = Portfolio(
                user_id=user_id,
                cash=Decimal(str(VirtualWalletService.STARTING_BALANCE)),
                buying_power=Decimal(str(VirtualWalletService.STARTING_BALANCE)),
                total_value=Decimal(str(VirtualWalletService.STARTING_BALANCE)),
            )

            db.add(portfolio)

            # Create initial deposit transaction record
            transaction = Transaction(
                id=str(uuid.uuid4()),
                user_id=user_id,
                type="deposit",
                method="virtual",
                amount=Decimal(str(VirtualWalletService.STARTING_BALANCE)),
                status="completed",
                provider_reference="VIRTUAL_STARTING_BALANCE",
                created_at=datetime.now(timezone.utc),
            )

            db.add(transaction)
            db.commit()

            logger.info(
                f"Created virtual wallet for user {user_id} with ${VirtualWalletService.STARTING_BALANCE}"
            )

            return {
                "success": True,
                "message": f"Virtual wallet created with ${VirtualWalletService.STARTING_BALANCE} starting balance",
                "balance": VirtualWalletService.STARTING_BALANCE,
                "is_new": True,
            }

        except Exception as e:
            db.rollback()
            logger.error(f"Failed to create virtual wallet: {e}")
            return {"success": False, "message": str(e)}

    @staticmethod
    def get_balance(user_id: str, db: Session) -> Dict[str, Any]:
        """
        Get current virtual wallet balance

        Args:
            user_id: User ID
            db: Database session

        Returns:
            Current balance details
        """
        try:
            portfolio = db.query(Portfolio).filter(Portfolio.user_id == user_id).first()

            if not portfolio:
                # Auto-create wallet if doesn't exist
                result = VirtualWalletService.create_wallet(user_id, db)
                if not result["success"]:
                    return result

                portfolio = (
                    db.query(Portfolio).filter(Portfolio.user_id == user_id).first()
                )

            return {
                "success": True,
                "cash": float(portfolio.cash),
                "buying_power": float(portfolio.buying_power),
                "total_value": float(portfolio.total_value),
                "is_virtual": True,
                "currency": "KES",
            }

        except Exception as e:
            logger.error(f"Failed to get balance: {e}")
            return {"success": False, "message": str(e)}

    @staticmethod
    def deposit(
        user_id: str, amount: float, db: Session, description: str = "Virtual deposit"
    ) -> Dict[str, Any]:
        """
        Add virtual funds to wallet

        Args:
            user_id: User ID
            amount: Amount to deposit
            db: Database session
            description: Transaction description

        Returns:
            Updated balance details
        """
        try:
            if amount <= 0:
                return {"success": False, "message": "Amount must be positive"}

            portfolio = db.query(Portfolio).filter(Portfolio.user_id == user_id).first()

            if not portfolio:
                # Create wallet first
                create_result = VirtualWalletService.create_wallet(user_id, db)
                if not create_result["success"]:
                    return create_result

                portfolio = (
                    db.query(Portfolio).filter(Portfolio.user_id == user_id).first()
                )

            # Update balances
            portfolio.cash = Decimal(str(float(portfolio.cash) + amount))
            portfolio.buying_power = Decimal(
                str(float(portfolio.buying_power) + amount)
            )
            portfolio.total_value = Decimal(str(float(portfolio.total_value) + amount))

            # Create transaction record
            transaction = Transaction(
                id=str(uuid.uuid4()),
                user_id=user_id,
                type="deposit",
                method="virtual",
                amount=Decimal(str(amount)),
                status="completed",
                provider_reference=f"VIRTUAL_DEPOSIT_{uuid.uuid4().hex[:8].upper()}",
                created_at=datetime.now(timezone.utc),
            )

            db.add(transaction)
            db.commit()

            logger.info(f"Virtual deposit: ${amount} to user {user_id}")

            return {
                "success": True,
                "message": f"Successfully deposited ${amount:.2f}",
                "amount": amount,
                "new_balance": float(portfolio.cash),
                "transaction_id": transaction.id,
            }

        except Exception as e:
            db.rollback()
            logger.error(f"Failed to deposit: {e}")
            return {"success": False, "message": str(e)}

    @staticmethod
    def withdraw(
        user_id: str,
        amount: float,
        db: Session,
        description: str = "Virtual withdrawal",
    ) -> Dict[str, Any]:
        """
        Remove virtual funds from wallet

        Args:
            user_id: User ID
            amount: Amount to withdraw
            db: Database session
            description: Transaction description

        Returns:
            Updated balance details
        """
        try:
            if amount <= 0:
                return {"success": False, "message": "Amount must be positive"}

            portfolio = db.query(Portfolio).filter(Portfolio.user_id == user_id).first()

            if not portfolio:
                return {"success": False, "message": "Wallet not found"}

            # Check sufficient balance
            if float(portfolio.cash) < amount:
                return {
                    "success": False,
                    "message": f"Insufficient balance. Available: ${float(portfolio.cash):.2f}",
                }

            # Update balances
            portfolio.cash = Decimal(str(float(portfolio.cash) - amount))
            portfolio.buying_power = Decimal(
                str(float(portfolio.buying_power) - amount)
            )
            portfolio.total_value = Decimal(str(float(portfolio.total_value) - amount))

            # Create transaction record
            transaction = Transaction(
                id=str(uuid.uuid4()),
                user_id=user_id,
                type="withdrawal",
                method="virtual",
                amount=Decimal(str(amount)),
                status="completed",
                provider_reference=f"VIRTUAL_WITHDRAWAL_{uuid.uuid4().hex[:8].upper()}",
                created_at=datetime.now(timezone.utc),
            )

            db.add(transaction)
            db.commit()

            logger.info(f"Virtual withdrawal: ${amount} from user {user_id}")

            return {
                "success": True,
                "message": f"Successfully withdrew ${amount:.2f}",
                "amount": amount,
                "new_balance": float(portfolio.cash),
                "transaction_id": transaction.id,
            }

        except Exception as e:
            db.rollback()
            logger.error(f"Failed to withdraw: {e}")
            return {"success": False, "message": str(e)}

    @staticmethod
    def reset_wallet(user_id: str, db: Session) -> Dict[str, Any]:
        """
        Reset wallet to starting balance
        Useful for users who want to restart their demo trading

        Args:
            user_id: User ID
            db: Database session

        Returns:
            Reset confirmation with new balance
        """
        try:
            portfolio = db.query(Portfolio).filter(Portfolio.user_id == user_id).first()

            if not portfolio:
                return {"success": False, "message": "Wallet not found"}

            # Reset to starting balance
            portfolio.cash = Decimal(str(VirtualWalletService.STARTING_BALANCE))
            portfolio.buying_power = Decimal(str(VirtualWalletService.STARTING_BALANCE))
            portfolio.total_value = Decimal(str(VirtualWalletService.STARTING_BALANCE))

            # Create transaction record
            transaction = Transaction(
                id=str(uuid.uuid4()),
                user_id=user_id,
                type="deposit",
                method="virtual",
                amount=Decimal(str(VirtualWalletService.STARTING_BALANCE)),
                status="completed",
                provider_reference="VIRTUAL_WALLET_RESET",
                created_at=datetime.now(timezone.utc),
            )

            db.add(transaction)
            db.commit()

            logger.info(f"Wallet reset for user {user_id}")

            return {
                "success": True,
                "message": f"Wallet reset to ${VirtualWalletService.STARTING_BALANCE}",
                "balance": VirtualWalletService.STARTING_BALANCE,
            }

        except Exception as e:
            db.rollback()
            logger.error(f"Failed to reset wallet: {e}")
            return {"success": False, "message": str(e)}

    @staticmethod
    def get_transaction_history(
        user_id: str, db: Session, limit: int = 50
    ) -> Dict[str, Any]:
        """
        Get virtual wallet transaction history

        Args:
            user_id: User ID
            db: Database session
            limit: Maximum number of transactions to return

        Returns:
            List of transactions
        """
        try:
            transactions = (
                db.query(Transaction)
                .filter(Transaction.user_id == user_id, Transaction.method == "virtual")
                .order_by(Transaction.created_at.desc())
                .limit(limit)
                .all()
            )

            return {
                "success": True,
                "transactions": [
                    {
                        "id": t.id,
                        "type": t.type,
                        "amount": float(t.amount),
                        "status": t.status,
                        "reference": t.provider_reference,
                        "created_at": (
                            t.created_at.isoformat() if t.created_at else None
                        ),
                    }
                    for t in transactions
                ],
                "count": len(transactions),
            }

        except Exception as e:
            logger.error(f"Failed to get transaction history: {e}")
            return {"success": False, "message": str(e)}


# Singleton instance
virtual_wallet_service = VirtualWalletService()
