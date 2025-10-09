from typing import Optional
import bcrypt
from sqlalchemy.orm import Session
import pyotp

from ..database import get_db, init_db
from ..database.models import User as DBUser


class User:
    def __init__(self, db_user: DBUser):
        self.id = db_user.id
        self.email = db_user.email
        self.password_hash = db_user.password_hash
        self.full_name = db_user.full_name
        self.phone = db_user.phone
        self.two_fa_enabled = False
        self.two_fa_secret = None


def get_db_session() -> Session:
    db = next(get_db())
    return db


def get_user(email: str) -> Optional[User]:
    db = get_db_session()
    try:
        db_user = db.query(DBUser).filter(DBUser.email == email.lower()).first()
        if not db_user:
            return None
        return User(db_user)
    finally:
        db.close()


def create_user(email: str, password: str, full_name: Optional[str] = None, phone: Optional[str] = None) -> User:
    db = get_db_session()
    try:
        existing = db.query(DBUser).filter(DBUser.email == email.lower()).first()
        if existing:
            raise ValueError("User already exists")
        
        # Truncate password to 72 bytes for bcrypt
        password_bytes = password.encode('utf-8')
        if len(password_bytes) > 72:
            password_bytes = password_bytes[:72]
        
        password_hash = bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')
        db_user = DBUser(
            email=email.lower(),
            full_name=full_name,
            phone=phone,
            password_hash=password_hash,
            is_active=True,
            role="user"
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return User(db_user)
    finally:
        db.close()


def verify_password(plain: str, hashed: str) -> bool:
    password_bytes = plain.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    return bcrypt.checkpw(password_bytes, hashed.encode('utf-8'))


def setup_2fa(email: str) -> str:
    user = get_user(email)
    if not user:
        raise ValueError("User not found")
    secret = pyotp.random_base32()
    return secret


def enable_2fa(email: str) -> None:
    user = get_user(email)
    if not user:
        raise ValueError("2FA not initialized")


def validate_2fa_code(email: str, code: str) -> bool:
    return False


def update_password(email: str, new_password: str) -> None:
    db = get_db_session()
    try:
        db_user = db.query(DBUser).filter(DBUser.email == email.lower()).first()
        if not db_user:
            raise ValueError("User not found")
        
        # Truncate password to 72 bytes for bcrypt
        password_bytes = new_password.encode('utf-8')
        if len(password_bytes) > 72:
            password_bytes = password_bytes[:72]
        
        db_user.password_hash = bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')
        db.commit()
    finally:
        db.close()


def update_user_profile(
    email: str,
    full_name: str,
    phone: str,
    date_of_birth: Optional[str] = None,
    address: Optional[str] = None,
    city: Optional[str] = None,
    country: str = "Kenya"
) -> User:
    """Update user profile information"""
    db = get_db_session()
    try:
        db_user = db.query(DBUser).filter(DBUser.email == email.lower()).first()
        if not db_user:
            raise ValueError("User not found")
        
        db_user.full_name = full_name
        db_user.phone = phone
        
        db.commit()
        db.refresh(db_user)
        
        return User(db_user)
    finally:
        db.close()


def change_password(email: str, current_password: str, new_password: str) -> bool:
    """Change user password with current password verification"""
    user = get_user(email)
    if not user:
        return False
    
    if not verify_password(current_password, user.password_hash):
        return False
    
    update_password(email, new_password)
    return True


def delete_user_account(email: str, password: str) -> bool:
    """Permanently delete user account after password verification"""
    user = get_user(email)
    if not user:
        return False
    
    if not verify_password(password, user.password_hash):
        return False
    
    db = get_db_session()
    try:
        db_user = db.query(DBUser).filter(DBUser.email == email.lower()).first()
        if db_user:
            db.delete(db_user)
            db.commit()
        return True
    finally:
        db.close()