"""
CDSC (Central Depository & Settlement Corporation) Service
Placeholder implementation until CDSC API access is obtained
"""

import random
from typing import Any, Dict

from sqlalchemy.orm import Session

from ..config import CDSC_API_KEY, CDSC_ENABLED
from ..database.models import Account, User
from ..utils.logging import get_logger

logger = get_logger("cdsc_service")


def generate_cds_number() -> str:
    """Generate a mock CDS account number"""
    # Format: CDS followed by 9 digits
    return f"CDS{random.randint(100000000, 999999999)}"


def create_cdsc_account(user_id: str, db: Session) -> Dict[str, Any]:
    """Create CDSC account for user (placeholder)"""
    try:
        # Check if user already has CDS account
        existing_account = (
            db.query(Account)
            .filter(Account.user_id == user_id, Account.cds_number.isnot(None))
            .first()
        )

        if existing_account:
            return {
                "status": "exists",
                "cds_number": existing_account.cds_number,
                "message": "User already has CDSC account",
            }

        # Generate CDS number
        cds_number = generate_cds_number()

        # Create account record
        account = Account(
            user_id=user_id,
            broker_id=None,  # Will be set when broker is connected
            cds_number=cds_number,
            status="pending_verification",
        )
        db.add(account)
        db.commit()

        logger.info(f"CDSC account created for user {user_id}: {cds_number}")

        return {
            "status": "created",
            "cds_number": cds_number,
            "message": "CDSC account created successfully (pending verification)",
            "note": "This is a placeholder. Actual CDSC integration pending API access.",
        }

    except Exception as e:
        logger.error(f"CDSC account creation failed: {e}")
        raise


def link_cdsc_account(user_id: str, cds_number: str, db: Session) -> Dict[str, Any]:
    """Link existing CDSC account (placeholder)"""
    try:
        # Validate CDS number format
        if not cds_number.startswith("CDS") or len(cds_number) != 12:
            raise ValueError(
                "Invalid CDS number format. Expected: CDS followed by 9 digits"
            )

        # Check if account already exists
        existing_account = (
            db.query(Account)
            .filter(Account.user_id == user_id, Account.cds_number == cds_number)
            .first()
        )

        if existing_account:
            return {
                "status": "already_linked",
                "cds_number": cds_number,
                "message": "This CDS account is already linked",
            }

        # Create account record
        account = Account(
            user_id=user_id,
            broker_id=None,
            cds_number=cds_number,
            status="pending_verification",
        )
        db.add(account)
        db.commit()

        logger.info(f"CDSC account linked for user {user_id}: {cds_number}")

        return {
            "status": "linked",
            "cds_number": cds_number,
            "message": "CDSC account linked successfully (pending verification)",
            "note": "Verification will occur when CDSC API integration is complete",
        }

    except ValueError as e:
        raise
    except Exception as e:
        logger.error(f"CDSC account linking failed: {e}")
        raise


def verify_cdsc_account(cds_number: str) -> Dict[str, Any]:
    """Verify CDSC account (placeholder - requires CDSC API)"""
    if not CDSC_ENABLED or not CDSC_API_KEY:
        return {
            "status": "unavailable",
            "message": "CDSC API integration not yet configured",
            "note": "Using placeholder verification",
        }

    # Placeholder verification
    # In production, call CDSC API to verify account status
    logger.info(f"CDSC verification requested for {cds_number}")

    return {
        "status": "pending",
        "cds_number": cds_number,
        "message": "Account verification pending",
        "note": "Actual CDSC API integration pending",
    }


def get_cdsc_account_info(user_id: str, db: Session) -> Dict[str, Any]:
    """Get user's CDSC account information"""
    try:
        account = (
            db.query(Account)
            .filter(Account.user_id == user_id, Account.cds_number.isnot(None))
            .first()
        )

        if not account:
            return {"has_account": False, "message": "No CDSC account linked"}

        return {
            "has_account": True,
            "cds_number": account.cds_number,
            "status": account.status,
            "broker": account.broker_id,
            "created_at": (
                account.created_at.isoformat() if account.created_at else None
            ),
        }

    except Exception as e:
        logger.error(f"Failed to get CDSC account info: {e}")
        raise
