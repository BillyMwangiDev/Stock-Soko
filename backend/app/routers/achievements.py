"""
Achievements Router
Track and display user achievements and badges
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..database.models import User
from ..routers.auth import current_user_email
from ..services.achievement_service import achievement_service
from ..utils.logging import get_logger

logger = get_logger("achievements_router")

router = APIRouter(prefix="/achievements", tags=["achievements"])


@router.get("/all")
async def get_all_achievements(
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db)
):
    """
    Get all available achievements
    """
    result = achievement_service.get_all_achievements()
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    
    return result


@router.get("/my-achievements")
async def get_my_achievements(
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db)
):
    """
    Get user's earned achievements
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    result = achievement_service.get_user_achievements(user.id)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    
    return result


@router.post("/check")
async def check_achievements(
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db)
):
    """
    Check for newly earned achievements
    Should be called after significant actions (trades, etc.)
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    result = achievement_service.check_achievements(user.id, db)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    
    if result["newly_earned"]:
        logger.info(f"User {user.id} earned {result['count']} new achievements")
    
    return result


@router.get("/progress")
async def get_achievement_progress(
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db)
):
    """
    Get progress towards unearned achievements
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    result = achievement_service.get_progress(user.id, db)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    
    return result

