from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import jwt, JWTError
from decouple import config
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

SECRET_KEY = config("JWT_SECRET", default="dev-secret-change-in-production")
ALGORITHM = config("JWT_ALGORITHM", default="HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = config("JWT_EXPIRATION_MINUTES", default=60, cast=int)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def create_access_token(sub: str, expires_delta: Optional[timedelta] = None) -> str:
	exp = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
	to_encode = {"sub": sub, "exp": exp}
	return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Optional[str]:
	try:
		payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
		return payload.get("sub")
	except JWTError:
		return None


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
	"""Dependency to get current authenticated user from JWT token"""
	email = decode_token(token)
	if not email:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Invalid authentication credentials",
			headers={"WWW-Authenticate": "Bearer"},
		)
	return {"email": email}
