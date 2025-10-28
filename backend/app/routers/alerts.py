"""
Alerts Router

Manages price alerts for stocks including creation, updates, deletion,
and retrieval of active/triggered alerts.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from pydantic import BaseModel
from ..database import get_db
from ..database.models import Alert, User
from ..utils.jwt import get_current_user
from ..utils.logging import get_logger
from datetime import datetime, timezone

router = APIRouter(prefix="/alerts", tags=["alerts"])
logger = get_logger("alerts_router")


class AlertCreate(BaseModel):
    symbol: str
    alert_type: str
    target_price: float = None
    base_price: float = None
    target_percent: float = None


class AlertUpdate(BaseModel):
    active: bool = None
    target_price: float = None
    target_percent: float = None


class AlertResponse(BaseModel):
    id: str
    symbol: str
    alert_type: str
    target_price: float = None
    base_price: float = None
    target_percent: float = None
    active: bool
    triggered: bool
    triggered_at: datetime = None
    triggered_price: float = None
    created_at: datetime
    
    class Config:
        from_attributes = True


@router.post("/", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
def create_alert(
    alert: AlertCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new price alert"""
    
    if alert.alert_type not in ["above", "below", "percent_change"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid alert type. Must be: above, below, or percent_change"
        )
    
    if alert.alert_type in ["above", "below"] and alert.target_price is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="target_price is required for above/below alerts"
        )
    
    if alert.alert_type == "percent_change" and (alert.base_price is None or alert.target_percent is None):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="base_price and target_percent are required for percent_change alerts"
        )
    
    new_alert = Alert(
        user_id=current_user.id,
        symbol=alert.symbol,
        type=alert.alert_type,
        value=alert.target_price or alert.target_percent or 0,
        alert_type=alert.alert_type,
        target_price=alert.target_price,
        base_price=alert.base_price,
        target_percent=alert.target_percent,
        active=True,
        triggered=False
    )
    
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)
    
    logger.info(f"Created alert {new_alert.id} for user {current_user.id}")
    
    return new_alert


@router.get("/", response_model=List[AlertResponse])
def list_alerts(
    active_only: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all alerts for the current user"""
    
    query = db.query(Alert).filter(Alert.user_id == current_user.id)
    
    if active_only:
        query = query.filter(Alert.active == True, Alert.triggered == False)
    
    alerts = query.order_by(Alert.created_at.desc()).all()
    
    return alerts


@router.get("/{alert_id}", response_model=AlertResponse)
def get_alert(
    alert_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific alert"""
    
    alert = db.query(Alert).filter(
        Alert.id == alert_id,
        Alert.user_id == current_user.id
    ).first()
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    return alert


@router.put("/{alert_id}", response_model=AlertResponse)
def update_alert(
    alert_id: str,
    alert_update: AlertUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an alert"""
    
    alert = db.query(Alert).filter(
        Alert.id == alert_id,
        Alert.user_id == current_user.id
    ).first()
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    if alert_update.active is not None:
        alert.active = alert_update.active
    
    if alert_update.target_price is not None:
        alert.target_price = alert_update.target_price
        alert.value = alert_update.target_price
    
    if alert_update.target_percent is not None:
        alert.target_percent = alert_update.target_percent
        alert.value = alert_update.target_percent
    
    db.commit()
    db.refresh(alert)
    
    logger.info(f"Updated alert {alert_id}")
    
    return alert


@router.delete("/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_alert(
    alert_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an alert"""
    
    alert = db.query(Alert).filter(
        Alert.id == alert_id,
        Alert.user_id == current_user.id
    ).first()
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    db.delete(alert)
    db.commit()
    
    logger.info(f"Deleted alert {alert_id}")
    
    return None
