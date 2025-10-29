"""
Two-Factor Authentication Service
"""

import pyotp
import qrcode
from io import BytesIO
import base64
import secrets
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from ..database.models import User
from ..config import TOTP_ISSUER, TOTP_DIGITS
from ..utils.logging import get_logger

logger = get_logger("twofa_service")


def generate_secret() -> str:
    """Generate a new TOTP secret"""
    return pyotp.random_base32()


def generate_backup_codes(count: int = 10) -> List[str]:
    """Generate backup codes for 2FA recovery"""
    return [secrets.token_hex(4).upper() for _ in range(count)]


def setup_2fa(user_id: str, user_email: str, db: Session) -> Dict[str, Any]:
    """Setup 2FA for a user - generates secret and QR code"""
    try:
        # Get user
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")

        # Generate TOTP secret
        secret = generate_secret()

        # Store secret (temporarily - not enabled until verified)
        # Note: In production, add totp_secret field to User model
        # For now, we'll store in a temp location
        user.salt = secret  # Using salt field temporarily for demo
        db.commit()

        # Generate QR code
        totp = pyotp.TOTP(secret)
        provisioning_uri = totp.provisioning_uri(
            name=user_email, issuer_name=TOTP_ISSUER
        )

        # Create QR code image
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(provisioning_uri)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")

        # Convert to base64
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        qr_code_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

        # Generate backup codes
        backup_codes = generate_backup_codes(10)

        logger.info(f"2FA setup initiated for user {user_id}")

        return {
            "secret": secret,
            "qr_code": f"data:image/png;base64,{qr_code_base64}",
            "backup_codes": backup_codes,
            "status": "setup_pending",
            "message": "Scan QR code with authenticator app (Google Authenticator, Authy, etc.)",
        }

    except Exception as e:
        logger.error(f"2FA setup failed for user {user_id}: {e}")
        raise


def verify_2fa_code(user_id: str, code: str, db: Session) -> bool:
    """Verify a TOTP code"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.salt:  # salt is being used as totp_secret
            return False

        totp = pyotp.TOTP(user.salt)

        # Verify with a window of 1 (allows for time drift)
        is_valid = totp.verify(code, valid_window=1)

        if is_valid:
            logger.info(f"2FA code verified for user {user_id}")
        else:
            logger.warning(f"Invalid 2FA code for user {user_id}")

        return is_valid

    except Exception as e:
        logger.error(f"2FA verification failed: {e}")
        return False


def enable_2fa(user_id: str, db: Session) -> bool:
    """Enable 2FA for a user after successful verification"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return False

        # In production, set user.twofa_enabled = True
        # For now, we'll use role field to indicate 2FA status
        if user.role == "user":
            user.role = "user_2fa"

        db.commit()
        logger.info(f"2FA enabled for user {user_id}")
        return True

    except Exception as e:
        logger.error(f"Failed to enable 2FA: {e}")
        return False


def disable_2fa(user_id: str, db: Session) -> bool:
    """Disable 2FA for a user"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return False

        # Clear TOTP secret
        user.salt = None

        # Reset role
        if user.role == "user_2fa":
            user.role = "user"

        db.commit()
        logger.info(f"2FA disabled for user {user_id}")
        return True

    except Exception as e:
        logger.error(f"Failed to disable 2FA: {e}")
        return False


def is_2fa_enabled(user_id: str, db: Session) -> bool:
    """Check if 2FA is enabled for a user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return False

    return user.role == "user_2fa" and user.salt is not None


def verify_backup_code(user_id: str, backup_code: str, db: Session) -> bool:
    """Verify a backup code (simplified - in production store hashed backup codes)"""
    # This is a simplified implementation
    # In production, store hashed backup codes in database and verify against them
    logger.info(f"Backup code verification attempted for user {user_id}")
    return False  # Not implemented in this demo
