from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..database import get_db
from ..database.models import User
from ..utils.jwt import get_current_user
from ..services.notification_service import notification_service
from ..utils.logging import get_logger

router = APIRouter(prefix="/notifications", tags=["notifications"])
logger = get_logger("notifications_router")


class FCMTokenRequest(BaseModel):
    fcm_token: str


class NotificationPreferences(BaseModel):
    price_alerts: bool = True
    trade_execution: bool = True
    payments: bool = True
    news: bool = False
    marketing: bool = False


@router.post("/register-device")
def register_device_token(
    request: FCMTokenRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Register or update device FCM token for push notifications"""
    
    current_user.fcm_token = request.fcm_token
    db.commit()
    
    logger.info(f"Registered FCM token for user {current_user.id}")
    
    return {
        "success": True,
        "message": "Device registered successfully"
    }


@router.delete("/unregister-device")
def unregister_device(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Unregister device (remove FCM token)"""
    
    current_user.fcm_token = None
    db.commit()
    
    logger.info(f"Unregistered device for user {current_user.id}")
    
    return {
        "success": True,
        "message": "Device unregistered successfully"
    }


@router.post("/test")
def send_test_notification(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a test notification to the current user's device"""
    
    if not current_user.fcm_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No device registered for notifications"
        )
    
    result = notification_service.send_notification(
        fcm_token=current_user.fcm_token,
        title="Test Notification",
        body="Your notifications are working correctly!",
        data={"type": "test"}
    )
    
    return result


@router.get("/status")
def get_notification_status(
    current_user: User = Depends(get_current_user)
):
    """Get notification status for current user"""
    
    return {
        "device_registered": bool(current_user.fcm_token),
        "notifications_enabled": notification_service.initialized
    }


@router.get("/unread-count")
def get_unread_count(
    current_user: User = Depends(get_current_user)
):
    """Get count of unread notifications for current user"""
    # For now, return mock data. Can be extended with actual notification tracking
    return {
        "count": 0,
        "has_unread": False
    }
