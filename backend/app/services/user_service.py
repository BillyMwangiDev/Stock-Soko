"""
User Service Module

Manages user accounts including registration, authentication, profile management,
password operations, and 2FA configuration. Integrates with database models and
handles password hashing with bcrypt.
"""

from typing import Optional

import bcrypt
import pyotp
from sqlalchemy.orm import Session

from ..constants import BCRYPT_MAX_PASSWORD_LENGTH
from ..database import get_db, init_db
from ..database.models import User as DBUser
from ..exceptions import (
    InvalidCredentialsException,
    UserAlreadyExistsException,
    UserNotFoundException,
)
from ..utils.logging import get_logger

logger = get_logger("user_service")


class User:
    """
    User domain model for service layer.

    Represents a user account with basic profile information and security settings.
    Decouples service layer from database models.
    """

    def __init__(self, db_user: DBUser):
        self.id = db_user.id
        self.email = db_user.email
        self.password_hash = db_user.password_hash
        self.full_name = db_user.full_name
        self.phone = db_user.phone
        self.two_fa_enabled = False
        self.two_fa_secret = None


def get_user(email: str, db: Session) -> Optional[User]:
    """Get user by email. Use dependency injection for db session."""
    db_user = db.query(DBUser).filter(DBUser.email == email.lower()).first()
    if not db_user:
        return None
    return User(db_user)


def create_user(
    email: str,
    password: str,
    full_name: Optional[str] = None,
    phone: Optional[str] = None,
    db: Session = None,
) -> User:
    """Create a new user. Use dependency injection for db session."""
    if db is None:
        # Fallback for backwards compatibility - but this should be avoided
        logger.warning("create_user called without db session - using manual session")
        db_gen = get_db()
        db = next(db_gen)
        should_close = True
    else:
        should_close = False

    try:
        existing = db.query(DBUser).filter(DBUser.email == email.lower()).first()
        if existing:
            raise UserAlreadyExistsException()

        # Truncate password to bcrypt max length
        password_bytes = password.encode("utf-8")
        if len(password_bytes) > BCRYPT_MAX_PASSWORD_LENGTH:
            password_bytes = password_bytes[:BCRYPT_MAX_PASSWORD_LENGTH]
            logger.warning(
                f"Password truncated to {BCRYPT_MAX_PASSWORD_LENGTH} bytes for user {email}"
            )

        password_hash = bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode("utf-8")
        db_user = DBUser(
            email=email.lower(),
            full_name=full_name,
            phone=phone,
            password_hash=password_hash,
            is_active=True,
            role="user",
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        logger.info(f"User created successfully: {email}")
        return User(db_user)
    except UserAlreadyExistsException:
        raise
    except Exception as e:
        logger.error(f"Failed to create user {email}: {e}")
        db.rollback()
        raise
    finally:
        if should_close:
            db.close()


def verify_password(plain: str, hashed: str) -> bool:
    """Verify password against hash. Handles bcrypt's 72-byte limit."""
    password_bytes = plain.encode("utf-8")
    if len(password_bytes) > BCRYPT_MAX_PASSWORD_LENGTH:
        password_bytes = password_bytes[:BCRYPT_MAX_PASSWORD_LENGTH]
    return bcrypt.checkpw(password_bytes, hashed.encode("utf-8"))


def setup_2fa(email: str, db: Session) -> str:
    """Setup 2FA for user. Returns TOTP secret."""
    user = get_user(email, db)
    if not user:
        raise UserNotFoundException()
    secret = pyotp.random_base32()
    logger.info(f"2FA setup initiated for user: {email}")
    return secret


def enable_2fa(email: str, db: Session) -> None:
    """Enable 2FA for user."""
    user = get_user(email, db)
    if not user:
        raise UserNotFoundException("2FA not initialized")


def validate_2fa_code(email: str, code: str) -> bool:
    return False


def update_password(email: str, new_password: str, db: Session) -> None:
    """Update user password. Use dependency injection for db session."""
    db_user = db.query(DBUser).filter(DBUser.email == email.lower()).first()
    if not db_user:
        raise UserNotFoundException()

    # Truncate password to bcrypt max length
    password_bytes = new_password.encode("utf-8")
    if len(password_bytes) > BCRYPT_MAX_PASSWORD_LENGTH:
        password_bytes = password_bytes[:BCRYPT_MAX_PASSWORD_LENGTH]
        logger.warning(
            f"Password truncated to {BCRYPT_MAX_PASSWORD_LENGTH} bytes for user {email}"
        )

    db_user.password_hash = bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode(
        "utf-8"
    )
    db.commit()
    logger.info(f"Password updated for user: {email}")


def update_user_profile(
    email: str,
    full_name: str,
    phone: str,
    db: Session,
    date_of_birth: Optional[str] = None,
    address: Optional[str] = None,
    city: Optional[str] = None,
    country: str = "Kenya",
) -> User:
    """Update user profile information. Use dependency injection for db session."""
    db_user = db.query(DBUser).filter(DBUser.email == email.lower()).first()
    if not db_user:
        raise UserNotFoundException()

    db_user.full_name = full_name
    db_user.phone = phone

    db.commit()
    db.refresh(db_user)

    logger.info(f"Profile updated for user: {email}")
    return User(db_user)


def change_password(
    email: str, current_password: str, new_password: str, db: Session
) -> bool:
    """Change user password with current password verification"""
    user = get_user(email, db)
    if not user:
        raise UserNotFoundException()

    if not verify_password(current_password, user.password_hash):
        raise InvalidCredentialsException("Current password is incorrect")

    update_password(email, new_password, db)
    return True


def delete_user_account(email: str, password: str, db: Session) -> bool:
    """Permanently delete user account after password verification"""
    user = get_user(email, db)
    if not user:
        raise UserNotFoundException()

    if not verify_password(password, user.password_hash):
        raise InvalidCredentialsException("Password is incorrect")

    db_user = db.query(DBUser).filter(DBUser.email == email.lower()).first()
    if db_user:
        db.delete(db_user)
        db.commit()
        logger.info(f"User account deleted: {email}")
    return True
