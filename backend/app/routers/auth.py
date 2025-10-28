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
from ..database import get_db
from sqlalchemy.orm import Session

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
    """
    Extract and validate user email from JWT token.
    
    Args:
        token: JWT access token from Authorization header
        
    Returns:
        str: Validated user email address
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    email = decode_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    return email


@router.post("/register", response_model=UserPublic)
def register(payload: UserCreate) -> UserPublic:
    """
    Register a new user account.
    
    Validates email format, password strength, and creates user account.
    Password is automatically truncated to 72 bytes for bcrypt compatibility.
    
    Args:
        payload: User registration data including email, password, full_name, phone
        
    Returns:
        UserPublic: Public user information without sensitive data
        
    Raises:
        HTTPException: If validation fails or user already exists
    """
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
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)) -> TokenResponse:
    """
    Authenticate user and issue JWT access token.
    
    Args:
        form_data: OAuth2 form data with username (email) and password
        db: Database session
        
    Returns:
        TokenResponse: JWT access token for authenticated requests
        
    Raises:
        HTTPException: If credentials are invalid
    """
    user = get_user(form_data.username, db)
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    token = create_access_token(sub=user.email)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserPublic)
def me(email: str = Depends(current_user_email), db: Session = Depends(get_db)) -> UserPublic:
    """
    Get current authenticated user's profile information.
    
    Args:
        email: Current user's email from JWT token
        db: Database session
        
    Returns:
        UserPublic: User profile data
        
    Raises:
        HTTPException: If user not found
    """
    user = get_user(email, db)
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


@router.post("/otp/request")
async def request_otp(req: OTPRequest) -> Dict[str, Any]:
    """
    Request OTP code for phone number verification.
    
    Generates a 6-character OTP valid for 5 minutes.
    
    Args:
        req: OTP request containing phone number
        
    Returns:
        Dict: Success message and expiration time
    """
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
    """
    Verify OTP code for phone number.
    
    Validates OTP code with max 3 attempts before lockout.
    
    Args:
        req: OTP verification request with phone number and code
        
    Returns:
        Dict: Verification success status
        
    Raises:
        HTTPException: If OTP invalid, expired, or too many attempts
    """
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
async def forgot_password(req: PasswordResetRequest, db: Session = Depends(get_db)) -> Dict[str, str]:
    """
    Initiate password reset process.
    
    Generates secure reset token valid for 30 minutes.
    Returns success message regardless of email existence for security.
    
    Args:
        req: Password reset request with email
        db: Database session
        
    Returns:
        Dict: Success message
    """
    email = validate_email(req.email)
    user = get_user(email, db)
    
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
async def reset_password(req: PasswordReset, db: Session = Depends(get_db)) -> Dict[str, str]:
    """
    Reset user password with valid reset token.
    
    Validates reset token and updates password after strength validation.
    
    Args:
        req: Password reset data with email, token, and new password
        db: Database session
        
    Returns:
        Dict: Success message
        
    Raises:
        HTTPException: If token invalid, expired, or password weak
    """
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
    
    user = get_user(email, db)
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


# ===============================================
# 2FA & SECURITY ENDPOINTS
# ===============================================

@router.post("/2fa/setup")
async def setup_2fa_endpoint(
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db)
):
    """Setup two-factor authentication for user"""
    from ..services.twofa_service import setup_2fa
    from ..database.models import User
    
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        result = setup_2fa(user.id, user.email, db)
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"2FA setup failed: {str(e)}")


@router.post("/2fa/verify")
async def verify_2fa_endpoint(
    code: str,
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db)
):
    """Verify 2FA code and enable 2FA"""
    from ..services.twofa_service import verify_2fa_code, enable_2fa
    from ..database.models import User
    
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        is_valid = verify_2fa_code(user.id, code, db)
        
        if is_valid:
            enable_2fa(user.id, db)
            return {
                "status": "success",
                "message": "2FA enabled successfully"
            }
        else:
            raise HTTPException(status_code=400, detail="Invalid 2FA code")
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"2FA verification failed: {str(e)}")


@router.post("/2fa/disable")
async def disable_2fa_endpoint(
    password: str,
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db)
):
    """Disable 2FA for user"""
    from ..services.twofa_service import disable_2fa
    from ..services.user_service import get_user, verify_password
    from ..database.models import User
    
    try:
        # Verify password first
        user_data = get_user(email, db)
        if not user_data or not verify_password(email, password):
            raise HTTPException(status_code=401, detail="Invalid password")
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        success = disable_2fa(user.id, db)
        
        if success:
            return {
                "status": "success",
                "message": "2FA disabled successfully"
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to disable 2FA")
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"2FA disable failed: {str(e)}")


@router.get("/2fa/status")
async def get_2fa_status(
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db)
):
    """Check if 2FA is enabled for user"""
    from ..services.twofa_service import is_2fa_enabled
    from ..database.models import User
    
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        enabled = is_2fa_enabled(user.id, db)
        
        return {
            "email": email,
            "twofa_enabled": enabled
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")


@router.post("/refresh")
async def refresh_token_endpoint(refresh_token: str):
    """Refresh access token using refresh token"""
    from ..utils.jwt import refresh_access_token
    
    try:
        result = refresh_access_token(refresh_token)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token"
            )
        
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Token refresh failed: {str(e)}")


@router.get("/sessions")
async def get_active_sessions(
    email: str = Depends(current_user_email)
):
    """Get active sessions for user (placeholder)"""
    # In production, track sessions in database or Redis
    return {
        "email": email,
        "active_sessions": [
            {
                "session_id": "current",
                "device": "Web Browser",
                "ip_address": "xxx.xxx.xxx.xxx",
                "last_active": datetime.now(timezone.utc).isoformat(),
                "is_current": True
            }
        ],
        "message": "Session tracking not fully implemented"
    }


@router.post("/logout-all")
async def logout_all_sessions(
    email: str = Depends(current_user_email)
):
    """Logout from all sessions (placeholder)"""
    # In production, invalidate all tokens for this user
    return {
        "email": email,
        "message": "All sessions terminated",
        "note": "Full session invalidation requires Redis/database implementation"
    }