from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, Field
from ..schemas.auth import UserCreate, TokenResponse, UserPublic, TwoFASetupResponse, TwoFAVerifyRequest
from ..services.user_service import create_user, get_user, verify_password, setup_2fa, enable_2fa, validate_2fa_code, update_password
from ..utils.jwt import create_access_token, decode_token
import pyotp
import random
from datetime import datetime, timedelta

router = APIRouter(prefix="/auth", tags=["auth"])

# In-memory OTP storage (use Redis in production)
otp_storage = {}
password_reset_tokens = {}


class OTPRequest(BaseModel):
    phone_number: str = Field(..., description="Phone number to send OTP")


class OTPVerify(BaseModel):
    phone_number: str
    otp_code: str = Field(..., min_length=6, max_length=6)


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordReset(BaseModel):
    email: EmailStr
    reset_token: str
    new_password: str = Field(..., min_length=8)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def current_user_email(token: str = Depends(oauth2_scheme)) -> str:
	email = decode_token(token)
	if not email:
		raise HTTPException(status_code=401, detail="Invalid token")
	return email


@router.post("/register", response_model=UserPublic)

def register(payload: UserCreate) -> UserPublic:
	try:
		user = create_user(payload.email, payload.password, payload.full_name)
		return UserPublic(email=user.email, full_name=user.full_name, two_fa_enabled=user.two_fa_enabled)
	except ValueError as e:
		raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=TokenResponse)

def login(form_data: OAuth2PasswordRequestForm = Depends()) -> TokenResponse:
	user = get_user(form_data.username)
	if not user or not verify_password(form_data.password, user.password_hash):
		raise HTTPException(status_code=401, detail="Invalid credentials")
	# If 2FA is enabled, require TOTP via separate verify step; for MVP we allow token issuance
	token = create_access_token(sub=user.email)
	return TokenResponse(access_token=token)


@router.get("/me", response_model=UserPublic)

def me(email: str = Depends(current_user_email)) -> UserPublic:
	user = get_user(email)
	assert user is not None
	return UserPublic(email=user.email, full_name=user.full_name, two_fa_enabled=user.two_fa_enabled)


@router.post("/2fa/setup", response_model=TwoFASetupResponse)

def twofa_setup(email: str = Depends(current_user_email)) -> TwoFASetupResponse:
	secret = setup_2fa(email)
	issuer = "StockSoko"
	otpauth_uri = pyotp.totp.TOTP(secret).provisioning_uri(name=email, issuer_name=issuer)
	return TwoFASetupResponse(secret=secret, otpauth_uri=otpauth_uri)


@router.post("/2fa/enable")
def twofa_enable(body: TwoFAVerifyRequest, email: str = Depends(current_user_email)) -> dict:
	if not validate_2fa_code(email, body.code):
		raise HTTPException(status_code=400, detail="Invalid 2FA code")
	enable_2fa(email)
	return {"message": "2FA enabled"}


@router.post("/otp/request")
async def request_otp(req: OTPRequest):
	"""
	Request OTP for phone verification
	
	- **phone_number**: Phone number to verify
	
	Sends 6-digit OTP via SMS (sandbox mode - returns OTP in response)
	"""
	# Generate 6-digit OTP
	otp_code = str(random.randint(100000, 999999))
	
	# Store OTP with expiration (5 minutes)
	otp_storage[req.phone_number] = {
		"code": otp_code,
		"expires_at": datetime.utcnow() + timedelta(minutes=5),
		"attempts": 0
	}
	
	# In production, send via SMS API (e.g., Africa's Talking)
	# For sandbox/testing, return the OTP
	return {
		"message": "OTP sent successfully",
		"phone_number": req.phone_number,
		"otp_code": otp_code,  # Remove this in production!
		"expires_in_seconds": 300
	}


@router.post("/otp/verify")
async def verify_otp(req: OTPVerify):
	"""
	Verify OTP code
	
	- **phone_number**: Phone number that received OTP
	- **otp_code**: 6-digit OTP code
	"""
	if req.phone_number not in otp_storage:
		raise HTTPException(status_code=404, detail="No OTP found for this phone number")
	
	stored_otp = otp_storage[req.phone_number]
	
	# Check expiration
	if datetime.utcnow() > stored_otp["expires_at"]:
		del otp_storage[req.phone_number]
		raise HTTPException(status_code=400, detail="OTP has expired")
	
	# Check attempts
	if stored_otp["attempts"] >= 3:
		del otp_storage[req.phone_number]
		raise HTTPException(status_code=429, detail="Too many failed attempts")
	
	# Verify code
	if req.otp_code != stored_otp["code"]:
		stored_otp["attempts"] += 1
		raise HTTPException(status_code=400, detail="Invalid OTP code")
	
	# Success - remove OTP
	del otp_storage[req.phone_number]
	
	return {
		"message": "OTP verified successfully",
		"phone_number": req.phone_number,
		"verified": True
	}


@router.post("/forgot-password")
async def forgot_password(req: PasswordResetRequest):
	"""
	Request password reset
	
	- **email**: User's email address
	
	Sends password reset link to email (sandbox returns token)
	"""
	user = get_user(req.email)
	
	if not user:
		# Don't reveal if user exists (security best practice)
		return {
			"message": "If the email exists, a reset link has been sent",
			"email": req.email
		}
	
	# Generate reset token
	reset_token = str(random.randint(100000, 999999))
	
	# Store with 30 minute expiration
	password_reset_tokens[req.email] = {
		"token": reset_token,
		"expires_at": datetime.utcnow() + timedelta(minutes=30)
	}
	
	# In production, send via email
	# For sandbox, return token
	return {
		"message": "Password reset link sent to email",
		"email": req.email,
		"reset_token": reset_token,  # Remove in production!
		"expires_in_seconds": 1800
	}


@router.post("/reset-password")
async def reset_password(req: PasswordReset):
	"""
	Reset password with token
	
	- **email**: User's email
	- **reset_token**: Token received via email
	- **new_password**: New password (min 8 characters)
	"""
	if req.email not in password_reset_tokens:
		raise HTTPException(status_code=404, detail="No reset request found")
	
	stored_data = password_reset_tokens[req.email]
	
	# Check expiration
	if datetime.utcnow() > stored_data["expires_at"]:
		del password_reset_tokens[req.email]
		raise HTTPException(status_code=400, detail="Reset token has expired")
	
	# Verify token
	if req.reset_token != stored_data["token"]:
		raise HTTPException(status_code=400, detail="Invalid reset token")
	
	# Update password with proper hashing
	user = get_user(req.email)
	if not user:
		raise HTTPException(status_code=404, detail="User not found")
	
	# Update password in user service
	update_password(req.email, req.new_password)
	
	# Clean up
	del password_reset_tokens[req.email]
	
	return {
		"message": "Password reset successfully",
		"email": req.email
	}
