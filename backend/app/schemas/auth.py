from pydantic import BaseModel, EmailStr
from typing import Optional


class UserCreate(BaseModel):
	email: EmailStr
	password: str
	full_name: Optional[str] = None


class LoginRequest(BaseModel):
	email: EmailStr
	password: str


class TokenResponse(BaseModel):
	access_token: str
	token_type: str = "bearer"


class UserPublic(BaseModel):
	email: EmailStr
	full_name: Optional[str] = None
	two_fa_enabled: bool = False


class TwoFASetupResponse(BaseModel):
	secret: str
	otpauth_uri: str


class TwoFAVerifyRequest(BaseModel):
	code: str
