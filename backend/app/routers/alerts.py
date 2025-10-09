"""
Alerts Router - Price alerts and notifications system
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid
from ..utils.jwt import get_current_user

router = APIRouter(prefix="/alerts", tags=["alerts"])


class PriceAlert(BaseModel):
    symbol: str = Field(..., description="Stock symbol")
    condition: str = Field(..., description="above, below, change_pct")
    target_value: float = Field(..., description="Target price or percentage")
    notify_email: bool = Field(True, description="Send email notification")
    notify_sms: bool = Field(False, description="Send SMS notification")
    
    class Config:
        json_schema_extra = {
            "example": {
                "symbol": "NSE:KCB",
                "condition": "above",
                "target_value": 25.00,
                "notify_email": True,
                "notify_sms": False
            }
        }


class AlertResponse(BaseModel):
    alert_id: str
    symbol: str
    condition: str
    target_value: float
    current_value: float
    status: str  # active, triggered, expired
    created_at: str
    triggered_at: Optional[str] = None


# In-memory storage (use database in production)
alerts_db = {}


@router.post("", response_model=AlertResponse)
async def create_alert(
    alert: PriceAlert,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new price alert
    
    - **symbol**: Stock symbol to monitor
    - **condition**: Trigger condition (above, below, change_pct)
    - **target_value**: Target price or percentage
    - **notify_email**: Send email when triggered
    - **notify_sms**: Send SMS when triggered
    """
    user_email = current_user.get("email")
    
    # Validate condition
    valid_conditions = ["above", "below", "change_pct"]
    if alert.condition not in valid_conditions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid condition. Must be one of: {', '.join(valid_conditions)}"
        )
    
    # Create alert
    alert_id = str(uuid.uuid4())
    
    # Mock current price
    current_price = 22.10  # In production, get from markets service
    
    alert_data = {
        "alert_id": alert_id,
        "user_email": user_email,
        "symbol": alert.symbol,
        "condition": alert.condition,
        "target_value": alert.target_value,
        "current_value": current_price,
        "status": "active",
        "created_at": datetime.utcnow().isoformat(),
        "triggered_at": None,
        "notify_email": alert.notify_email,
        "notify_sms": alert.notify_sms
    }
    
    # Store alert
    if user_email not in alerts_db:
        alerts_db[user_email] = []
    alerts_db[user_email].append(alert_data)
    
    return AlertResponse(**alert_data)


@router.get("", response_model=List[AlertResponse])
async def get_alerts(
    status: Optional[str] = Query(None, description="Filter by status: active, triggered, expired"),
    current_user: dict = Depends(get_current_user)
):
    """
    Get all price alerts for current user
    
    - **status**: Optional filter by status
    """
    user_email = current_user.get("email")
    
    user_alerts = alerts_db.get(user_email, [])
    
    # Filter by status if provided
    if status:
        user_alerts = [a for a in user_alerts if a["status"] == status]
    
    return [AlertResponse(**alert) for alert in user_alerts]


@router.get("/{alert_id}", response_model=AlertResponse)
async def get_alert(
    alert_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific alert by ID
    
    - **alert_id**: Alert identifier
    """
    user_email = current_user.get("email")
    user_alerts = alerts_db.get(user_email, [])
    
    for alert in user_alerts:
        if alert["alert_id"] == alert_id:
            return AlertResponse(**alert)
    
    raise HTTPException(status_code=404, detail="Alert not found")


@router.delete("/{alert_id}")
async def delete_alert(
    alert_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a price alert
    
    - **alert_id**: Alert to delete
    """
    user_email = current_user.get("email")
    
    if user_email not in alerts_db:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    user_alerts = alerts_db[user_email]
    
    for i, alert in enumerate(user_alerts):
        if alert["alert_id"] == alert_id:
            deleted = user_alerts.pop(i)
            return {
                "message": "Alert deleted successfully",
                "alert_id": alert_id,
                "symbol": deleted["symbol"]
            }
    
    raise HTTPException(status_code=404, detail="Alert not found")


@router.put("/{alert_id}/trigger")
async def trigger_alert(alert_id: str):
    """
    Mark an alert as triggered (called by background job)
    
    - **alert_id**: Alert to trigger
    """
    # Find and update alert
    for user_alerts in alerts_db.values():
        for alert in user_alerts:
            if alert["alert_id"] == alert_id:
                alert["status"] = "triggered"
                alert["triggered_at"] = datetime.utcnow().isoformat()
                
                return {
                    "message": "Alert triggered",
                    "alert": AlertResponse(**alert)
                }
    
    raise HTTPException(status_code=404, detail="Alert not found")