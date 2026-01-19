"""
Profile Management Router
Handles user profile updates, password changes, and account management
"""

from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field

from ..services.user_service import (
    change_password,
    delete_user_account,
    get_user,
    update_user_profile,
)
from .auth import current_user_email

router = APIRouter(prefix="/auth", tags=["profile"])


class ProfileUpdate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=100)
    phone: str = Field(..., pattern=r"^\+254\d{9}$")
    date_of_birth: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: str = "Kenya"


class PasswordChange(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8)


class AccountDeletion(BaseModel):
    password: str = Field(..., min_length=1)
    confirmation: str = Field(..., pattern=r"^DELETE$")


@router.put("/profile")
async def update_profile(
    payload: ProfileUpdate, email: str = Depends(current_user_email)
) -> Dict[str, Any]:
    """Update user profile information"""
    try:
        user = get_user(email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        updated_user = update_user_profile(
            email=email,
            full_name=payload.full_name,
            phone=payload.phone,
            date_of_birth=payload.date_of_birth,
            address=payload.address,
            city=payload.city,
            country=payload.country,
        )

        return {
            "success": True,
            "message": "Profile updated successfully",
            "user": {
                "email": updated_user.email,
                "full_name": updated_user.full_name,
                "phone": updated_user.phone,
            },
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/change-password")
async def change_user_password(
    payload: PasswordChange, email: str = Depends(current_user_email)
) -> Dict[str, Any]:
    """Change user password"""
    try:
        success = change_password(
            email=email,
            current_password=payload.current_password,
            new_password=payload.new_password,
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Current password is incorrect",
            )

        return {"success": True, "message": "Password changed successfully"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/delete-account")
async def delete_account(
    payload: AccountDeletion, email: str = Depends(current_user_email)
) -> Dict[str, Any]:
    """Permanently delete user account"""
    try:
        success = delete_user_account(
            email=email,
            password=payload.password,
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Password is incorrect"
            )

        return {"success": True, "message": "Account deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
