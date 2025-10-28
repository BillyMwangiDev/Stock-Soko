"""
Leaderboard Service for Demo Mode
Tracks and ranks users by trading performance
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from ..database.models import User, Portfolio, Order
from ..utils.logging import get_logger

logger = get_logger("leaderboard_service")


class LeaderboardService:
    """
    Manages global and friend leaderboards
    Ranks users by returns, win rate, and other metrics
    """
    
    @staticmethod
    def calculate_user_stats(user_id: str, db: Session) -> Dict[str, Any]:
        """
        Calculate performance stats for a user
        
        Args:
            user_id: User ID
            db: Database session
            
        Returns:
            User performance statistics
        """
        try:
            # Get portfolio
            portfolio = db.query(Portfolio).filter(Portfolio.user_id == user_id).first()
            
            if not portfolio:
                return {
                    "total_value": 0,
                    "starting_balance": 10000,
                    "return_amount": -10000,
                    "return_percent": -100.0,
                    "total_trades": 0,
                    "winning_trades": 0,
                    "losing_trades": 0,
                    "win_rate": 0.0
                }
            
            # Calculate returns
            starting_balance = 10000.00  # Virtual wallet starting balance
            total_value = float(portfolio.total_value) if portfolio.total_value else 0
            return_amount = total_value - starting_balance
            return_percent = (return_amount / starting_balance) * 100 if starting_balance > 0 else 0
            
            # Get trade stats
            filled_orders = db.query(Order).filter(
                Order.user_id == user_id,
                Order.status == "filled"
            ).all()
            
            total_trades = len(filled_orders)
            
            # Calculate win/loss (simplified - need buy/sell pairs in production)
            winning_trades = sum(1 for o in filled_orders if o.side == "sell" and float(o.filled_price) > float(o.price))
            losing_trades = total_trades - winning_trades if total_trades > 0 else 0
            win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0
            
            return {
                "total_value": round(total_value, 2),
                "starting_balance": starting_balance,
                "return_amount": round(return_amount, 2),
                "return_percent": round(return_percent, 2),
                "total_trades": total_trades,
                "winning_trades": winning_trades,
                "losing_trades": losing_trades,
                "win_rate": round(win_rate, 2)
            }
            
        except Exception as e:
            logger.error(f"Failed to calculate user stats: {e}")
            return {}
    
    @staticmethod
    def get_global_leaderboard(
        db: Session,
        period: str = "all_time",
        limit: int = 100
    ) -> Dict[str, Any]:
        """
        Get global leaderboard rankings
        
        Args:
            db: Database session
            period: all_time, monthly, weekly
            limit: Number of users to return
            
        Returns:
            Ranked list of users
        """
        try:
            # Get all users with portfolios
            users = db.query(User).join(Portfolio).limit(500).all()
            
            leaderboard = []
            
            for user in users:
                stats = LeaderboardService.calculate_user_stats(user.id, db)
                
                if stats:
                    leaderboard.append({
                        "user_id": user.id,
                        "username": user.username or user.email.split('@')[0],
                        "email_masked": f"{user.email[:3]}***{user.email.split('@')[1]}" if '@' in user.email else "***",
                        "total_value": stats["total_value"],
                        "return_amount": stats["return_amount"],
                        "return_percent": stats["return_percent"],
                        "total_trades": stats["total_trades"],
                        "win_rate": stats["win_rate"],
                        "created_at": user.created_at.isoformat() if user.created_at else None
                    })
            
            # Sort by return percentage
            leaderboard.sort(key=lambda x: x["return_percent"], reverse=True)
            
            # Add rank
            for idx, entry in enumerate(leaderboard[:limit], 1):
                entry["rank"] = idx
            
            return {
                "success": True,
                "period": period,
                "leaderboard": leaderboard[:limit],
                "total_participants": len(leaderboard),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to get global leaderboard: {e}")
            return {
                "success": False,
                "message": str(e)
            }
    
    @staticmethod
    def get_user_rank(user_id: str, db: Session) -> Dict[str, Any]:
        """
        Get a user's current rank and surrounding users
        
        Args:
            user_id: User ID
            db: Database session
            
        Returns:
            User's rank with context
        """
        try:
            # Get full leaderboard
            leaderboard_data = LeaderboardService.get_global_leaderboard(db, "all_time", 1000)
            
            if not leaderboard_data["success"]:
                return leaderboard_data
            
            leaderboard = leaderboard_data["leaderboard"]
            
            # Find user
            user_entry = next((e for e in leaderboard if e["user_id"] == user_id), None)
            
            if not user_entry:
                return {
                    "success": False,
                    "message": "User not found in leaderboard"
                }
            
            user_rank = user_entry["rank"]
            
            # Get surrounding users (5 above, 5 below)
            start_idx = max(0, user_rank - 6)
            end_idx = min(len(leaderboard), user_rank + 5)
            
            surrounding = leaderboard[start_idx:end_idx]
            
            return {
                "success": True,
                "user_rank": user_rank,
                "total_participants": len(leaderboard),
                "percentile": round((1 - (user_rank / len(leaderboard))) * 100, 1) if len(leaderboard) > 0 else 0,
                "user_stats": user_entry,
                "surrounding_users": surrounding
            }
            
        except Exception as e:
            logger.error(f"Failed to get user rank: {e}")
            return {
                "success": False,
                "message": str(e)
            }
    
    @staticmethod
    def get_top_performers(
        db: Session,
        metric: str = "return_percent",
        limit: int = 10
    ) -> Dict[str, Any]:
        """
        Get top performers by specific metric
        
        Args:
            db: Database session
            metric: return_percent, win_rate, total_trades
            limit: Number of users
            
        Returns:
            Top performers list
        """
        try:
            leaderboard_data = LeaderboardService.get_global_leaderboard(db, "all_time", limit)
            
            if not leaderboard_data["success"]:
                return leaderboard_data
            
            leaderboard = leaderboard_data["leaderboard"]
            
            # Sort by requested metric
            if metric == "win_rate":
                leaderboard.sort(key=lambda x: x["win_rate"], reverse=True)
            elif metric == "total_trades":
                leaderboard.sort(key=lambda x: x["total_trades"], reverse=True)
            else:  # return_percent (default)
                leaderboard.sort(key=lambda x: x["return_percent"], reverse=True)
            
            # Re-rank
            for idx, entry in enumerate(leaderboard[:limit], 1):
                entry["rank"] = idx
            
            return {
                "success": True,
                "metric": metric,
                "top_performers": leaderboard[:limit],
                "count": len(leaderboard[:limit])
            }
            
        except Exception as e:
            logger.error(f"Failed to get top performers: {e}")
            return {
                "success": False,
                "message": str(e)
            }


# Singleton instance
leaderboard_service = LeaderboardService()

