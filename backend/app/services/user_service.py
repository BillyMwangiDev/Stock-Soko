from typing import Dict, Optional
from passlib.context import CryptContext
import pyotp
from pydantic import BaseModel

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class User(BaseModel):
	email: str
	password_hash: str
	full_name: Optional[str] = None
	two_fa_enabled: bool = False
	two_fa_secret: Optional[str] = None


_users: Dict[str, User] = {}


def get_user(email: str) -> Optional[User]:
	return _users.get(email.lower())


def create_user(email: str, password: str, full_name: Optional[str] = None) -> User:
	key = email.lower()
	if key in _users:
		raise ValueError("User already exists")
	ph = pwd_context.hash(password)
	user = User(email=email, password_hash=ph, full_name=full_name)
	_users[key] = user
	return user


def verify_password(plain: str, hashed: str) -> bool:
	return pwd_context.verify(plain, hashed)


def setup_2fa(email: str) -> str:
	user = get_user(email)
	if not user:
		raise ValueError("User not found")
	secret = pyotp.random_base32()
	user.two_fa_secret = secret
	return secret


def enable_2fa(email: str) -> None:
	user = get_user(email)
	if not user or not user.two_fa_secret:
		raise ValueError("2FA not initialized")
	user.two_fa_enabled = True


def validate_2fa_code(email: str, code: str) -> bool:
	user = get_user(email)
	if not user or not user.two_fa_secret:
		return False
	totp = pyotp.TOTP(user.two_fa_secret)
	return totp.verify(code)


def update_password(email: str, new_password: str) -> None:
	"""Update user's password with proper hashing"""
	user = get_user(email)
	if not user:
		raise ValueError("User not found")
	user.password_hash = pwd_context.hash(new_password)