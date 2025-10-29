"""
Leaderboard Router
Global and friend leaderboards for trading competition
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..database.models import User
from ..routers.auth import current_user_email
from ..services.leaderboard_service import leaderboard_service
from ..utils.logging import get_logger

logger = get_logger("leaderboard_router")

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get("/global")
async def get_global_leaderboard(
    period: str = Query("all_time", description="Period: all_time, monthly, weekly"),
    limit: int = Query(100, ge=1, le=500, description="Number of users"),
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db),
):
    """
    Get global leaderboard rankings
    Users ranked by return percentage
    """
    result = leaderboard_service.get_global_leaderboard(db, period, limit)

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])

    return result


@router.get("/my-rank")
async def get_my_rank(
    email: str = Depends(current_user_email), db: Session = Depends(get_db)
):
    """
    Get current user's rank and surrounding users
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = leaderboard_service.get_user_rank(user.id, db)

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])

    logger.info(f"User {user.id} rank: {result['user_rank']}")

    return result


@router.get("/top-performers")
async def get_top_performers(
    metric: str = Query(
        "return_percent", description="Metric: return_percent, win_rate, total_trades"
    ),
    limit: int = Query(10, ge=1, le=50),
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db),
):
    """
    Get top performers by specific metric
    """
    valid_metrics = ["return_percent", "win_rate", "total_trades"]
    if metric not in valid_metrics:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid metric. Must be one of: {', '.join(valid_metrics)}",
        )

    result = leaderboard_service.get_top_performers(db, metric, limit)

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])

    return result


@router.get("/stats/{user_id}")
async def get_user_stats(
    user_id: str,
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db),
):
    """
    Get detailed stats for a specific user
    """
    stats = leaderboard_service.calculate_user_stats(user_id, db)

    if not stats:
        raise HTTPException(status_code=404, detail="User stats not found")

    return {"success": True, "user_id": user_id, "stats": stats}
