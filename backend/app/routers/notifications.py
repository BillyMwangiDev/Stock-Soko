from fastapi import APIRouter, Depends, Request
from typing import Dict, Optional
from ..routers.auth import current_user_email
from ..utils.jwt import verify_token

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("/unread-count")
def get_unread_count(request: Request) -> Dict[str, int]:
    """Get count of unread notifications - works with or without authentication"""
    # Try to get the token from Authorization header
    auth_header = request.headers.get("Authorization", "")
    
    if auth_header.startswith("Bearer "):
        token = auth_header.replace("Bearer ", "")
        try:
            # If token is valid, return actual count
            verify_token(token)
            # Mock count for authenticated users
            return {"count": 3}
        except:
            # Invalid token, return 0
            return {"count": 0}
    
    # No token provided, return 0
    return {"count": 0}


@router.get("")
def get_notifications(email: str = Depends(current_user_email)):
    """Get all notifications for the user"""
    # Mock notifications - in production this would query the database
    return {
        "notifications": [
            {
                "id": "1",
                "type": "trade",
                "title": "Order Executed",
                "message": "Your buy order for 10 shares of KCB at KES 32.50 was executed successfully",
                "timestamp": "15m ago",
                "read": False,
                "ticker": "KCB",
                "actionLabel": "View Portfolio",
                "priority": "high",
            },
            {
                "id": "2",
                "type": "trade",
                "title": "Price Alert Triggered",
                "message": "SCOM reached your target price of KES 45.00",
                "timestamp": "1h ago",
                "read": False,
                "ticker": "SCOM",
                "actionLabel": "View Stock",
                "priority": "high",
            },
            {
                "id": "3",
                "type": "news",
                "title": "Market Update",
                "message": "NSE 20-Share Index gains 1.2% on banking sector strength",
                "timestamp": "2h ago",
                "read": False,
                "actionLabel": "Read More",
                "priority": "medium",
            },
        ]
    }


@router.post("/mark-read/{notification_id}")
def mark_notification_read(
    notification_id: str,
    email: str = Depends(current_user_email)
) -> Dict[str, str]:
    """Mark a notification as read"""
    return {"status": "success", "notification_id": notification_id}


@router.post("/mark-all-read")
def mark_all_read(email: str = Depends(current_user_email)) -> Dict[str, str]:
    """Mark all notifications as read"""
    return {"status": "success", "message": "All notifications marked as read"}


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: str,
    email: str = Depends(current_user_email)
) -> Dict[str, str]:
    """Delete a notification"""
    return {"status": "success", "notification_id": notification_id}

