from typing import Dict, Any
from datetime import datetime, timedelta, timezone
from secrets import token_urlsafe
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, Field
import pyotp

from ..schemas.auth import UserCreate, TokenResponse, UserPublic, TwoFASetupResponse, TwoFAVerifyRequest
from ..services.user_service import create_user, get_user, verify_password, setup_2fa, enable_2fa, validate_2fa_code, update_password
from ..utils.jwt import create_access_token, decode_token
from ..utils.security import validate_phone_number, validate_email, validate_password_strength

router = APIRouter(prefix="/auth", tags=["auth"])

otp_storage: Dict[str, Dict[str, Any]] = {}
password_reset_tokens: Dict[str, Dict[str, Any]] = {}


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
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    return email


@router.post("/register", response_model=UserPublic)
def register(payload: UserCreate) -> UserPublic:
    try:
        if not validate_email(payload.email):
            raise ValueError("Invalid email format")
        
        validate_password_strength(payload.password)
        
        # Truncate password to 72 bytes for bcrypt compatibility
        password_bytes = payload.password.encode('utf-8')
        if len(password_bytes) > 72:
            truncated_password = password_bytes[:72].decode('utf-8', errors='ignore')
        else:
            truncated_password = payload.password
        
        user = create_user(payload.email, truncated_password, payload.full_name, payload.phone)
        return UserPublic(
            email=user.email,
            full_name=user.full_name,
            two_fa_enabled=user.two_fa_enabled
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends()) -> TokenResponse:
    user = get_user(form_data.username)
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    token = create_access_token(sub=user.email)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserPublic)
def me(email: str = Depends(current_user_email)) -> UserPublic:
    user = get_user(email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return UserPublic(
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        two_fa_enabled=user.two_fa_enabled
    )


@router.post("/2fa/setup", response_model=TwoFASetupResponse)
def twofa_setup(email: str = Depends(current_user_email)) -> TwoFASetupResponse:
    secret = setup_2fa(email)
    issuer = "StockSoko"
    otpauth_uri = pyotp.totp.TOTP(secret).provisioning_uri(
        name=email,
        issuer_name=issuer
    )
    return TwoFASetupResponse(secret=secret, otpauth_uri=otpauth_uri)


@router.post("/2fa/enable")
def twofa_enable(
    body: TwoFAVerifyRequest,
    email: str = Depends(current_user_email)
) -> Dict[str, str]:
    if not validate_2fa_code(email, body.code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid 2FA code"
        )
    enable_2fa(email)
    return {"message": "2FA enabled"}


@router.post("/otp/request")
async def request_otp(req: OTPRequest) -> Dict[str, Any]:
    phone_number = validate_phone_number(req.phone_number)
    otp_code = token_urlsafe(4)[:6].upper()
    
    otp_storage[phone_number] = {
        "code": otp_code,
        "expires_at": datetime.now(timezone.utc) + timedelta(minutes=5),
        "attempts": 0
    }
    
    return {
        "message": "OTP sent successfully",
        "phone_number": phone_number,
        "expires_in_seconds": 300
    }


@router.post("/otp/verify")
async def verify_otp(req: OTPVerify) -> Dict[str, Any]:
    phone_number = validate_phone_number(req.phone_number)
    
    if phone_number not in otp_storage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No OTP found for this phone number"
        )
    
    stored_otp = otp_storage[phone_number]
    
    if datetime.now(timezone.utc) > stored_otp["expires_at"]:
        del otp_storage[phone_number]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired"
        )
    
    if stored_otp["attempts"] >= 3:
        del otp_storage[phone_number]
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed attempts"
        )
    
    if req.otp_code.upper() != stored_otp["code"]:
        stored_otp["attempts"] += 1
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP code"
        )
    
    del otp_storage[phone_number]
    
    return {
        "message": "OTP verified successfully",
        "phone_number": phone_number,
        "verified": True
    }


@router.post("/forgot-password")
async def forgot_password(req: PasswordResetRequest) -> Dict[str, str]:
    email = validate_email(req.email)
    user = get_user(email)
    
    if not user:
        return {
            "message": "If the email exists, a reset link has been sent",
            "email": email
        }
    
    reset_token = token_urlsafe(32)
    
    password_reset_tokens[email] = {
        "token": reset_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(minutes=30)
    }
    
    return {
        "message": "Password reset link sent to email",
        "email": email
    }


@router.post("/reset-password")
async def reset_password(req: PasswordReset) -> Dict[str, str]:
    email = validate_email(req.email)
    
    if email not in password_reset_tokens:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No reset request found"
        )
    
    stored_data = password_reset_tokens[email]
    
    if datetime.now(timezone.utc) > stored_data["expires_at"]:
        del password_reset_tokens[email]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired"
        )
    
    if req.reset_token != stored_data["token"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset token"
        )
    
    user = get_user(email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    validate_password_strength(req.new_password)
    update_password(email, req.new_password)
    
    del password_reset_tokens[email]
    
    return {
        "message": "Password reset successfully",
        "email": email
    }