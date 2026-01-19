"""
Achievement System for Demo Mode
Tracks user milestones and awards badges
"""

from collections import defaultdict
from datetime import datetime, timezone
from typing import Any, Dict, List

from sqlalchemy.orm import Session

from ..database.models import Holding, Order, Portfolio, User
from ..utils.logging import get_logger

logger = get_logger("achievement_service")


# Achievement definitions
ACHIEVEMENTS = {
    "first_trade": {
        "id": "first_trade",
        "title": "First Trade",
        "description": "Execute your first trade",
        "icon": "TARGET",
        "points": 10,
        "category": "trading",
    },
    "portfolio_builder": {
        "id": "portfolio_builder",
        "title": "Portfolio Builder",
        "description": "Own 5 different stocks",
        "icon": "CHART",
        "points": 25,
        "category": "portfolio",
    },
    "diversifier": {
        "id": "diversifier",
        "title": "Diversifier",
        "description": "Own 10 different stocks",
        "icon": "STAR",
        "points": 50,
        "category": "portfolio",
    },
    "active_trader": {
        "id": "active_trader",
        "title": "Active Trader",
        "description": "Complete 10 trades",
        "icon": "BOLT",
        "points": 30,
        "category": "trading",
    },
    "day_trader": {
        "id": "day_trader",
        "title": "Day Trader",
        "description": "Complete 50 trades",
        "icon": "FIRE",
        "points": 100,
        "category": "trading",
    },
    "profit_maker": {
        "id": "profit_maker",
        "title": "Profit Maker",
        "description": "Achieve positive returns",
        "icon": "MONEY",
        "points": 20,
        "category": "performance",
    },
    "top_performer": {
        "id": "top_performer",
        "title": "Top Performer",
        "description": "Achieve 10% returns or more",
        "icon": "ROCKET",
        "points": 75,
        "category": "performance",
    },
    "high_roller": {
        "id": "high_roller",
        "title": "High Roller",
        "description": "Portfolio value exceeds $15,000",
        "icon": "DIAMOND",
        "points": 60,
        "category": "wealth",
    },
    "millionaire_mindset": {
        "id": "millionaire_mindset",
        "title": "Millionaire Mindset",
        "description": "Portfolio value exceeds $20,000",
        "icon": "CROWN",
        "points": 150,
        "category": "wealth",
    },
    "patient_investor": {
        "id": "patient_investor",
        "title": "Patient Investor",
        "description": "Hold a stock for 30+ days",
        "icon": "MEDITATION",
        "points": 40,
        "category": "strategy",
    },
    "alert_master": {
        "id": "alert_master",
        "title": "Alert Master",
        "description": "Create 5 price alerts",
        "icon": "BELL",
        "points": 15,
        "category": "tools",
    },
    "educated_investor": {
        "id": "educated_investor",
        "title": "Educated Investor",
        "description": "Complete 5 learning modules",
        "icon": "BOOK",
        "points": 35,
        "category": "education",
    },
    "sector_specialist": {
        "id": "sector_specialist",
        "title": "Sector Specialist",
        "description": "Own stocks from 3 different sectors",
        "icon": "GRADUATION",
        "points": 45,
        "category": "portfolio",
    },
    "risk_manager": {
        "id": "risk_manager",
        "title": "Risk Manager",
        "description": "Use stop-loss orders 5 times",
        "icon": "SHIELD",
        "points": 40,
        "category": "strategy",
    },
    "market_watcher": {
        "id": "market_watcher",
        "title": "Market Watcher",
        "description": "Add 10 stocks to watchlist",
        "icon": "EYE",
        "points": 20,
        "category": "research",
    },
}


class AchievementService:
    """
    Manages user achievements and badges
    """

    # In-memory storage for demo mode
    _user_achievements = defaultdict(list)

    @staticmethod
    def check_achievements(user_id: str, db: Session) -> Dict[str, Any]:
        """
        Check all achievements for a user and award new ones

        Args:
            user_id: User ID
            db: Database session

        Returns:
            List of newly earned achievements
        """
        try:
            newly_earned = []
            existing = AchievementService._user_achievements[user_id]
            existing_ids = [a["achievement_id"] for a in existing]

            # Get user data
            portfolio = db.query(Portfolio).filter(Portfolio.user_id == user_id).first()
            holdings = db.query(Holding).filter(Holding.user_id == user_id).all()
            orders = (
                db.query(Order)
                .filter(Order.user_id == user_id, Order.status == "filled")
                .all()
            )

            # Check each achievement

            # First Trade
            if "first_trade" not in existing_ids and len(orders) >= 1:
                newly_earned.append(ACHIEVEMENTS["first_trade"])

            # Portfolio Builder (5 stocks)
            if "portfolio_builder" not in existing_ids and len(holdings) >= 5:
                newly_earned.append(ACHIEVEMENTS["portfolio_builder"])

            # Diversifier (10 stocks)
            if "diversifier" not in existing_ids and len(holdings) >= 10:
                newly_earned.append(ACHIEVEMENTS["diversifier"])

            # Active Trader (10 trades)
            if "active_trader" not in existing_ids and len(orders) >= 10:
                newly_earned.append(ACHIEVEMENTS["active_trader"])

            # Day Trader (50 trades)
            if "day_trader" not in existing_ids and len(orders) >= 50:
                newly_earned.append(ACHIEVEMENTS["day_trader"])

            # Profit Maker (positive returns)
            if portfolio and "profit_maker" not in existing_ids:
                total_value = (
                    float(portfolio.total_value) if portfolio.total_value else 0
                )
                if total_value > 10000:
                    newly_earned.append(ACHIEVEMENTS["profit_maker"])

            # Top Performer (10% returns)
            if portfolio and "top_performer" not in existing_ids:
                total_value = (
                    float(portfolio.total_value) if portfolio.total_value else 0
                )
                returns = ((total_value - 10000) / 10000) * 100
                if returns >= 10:
                    newly_earned.append(ACHIEVEMENTS["top_performer"])

            # High Roller ($15K portfolio)
            if portfolio and "high_roller" not in existing_ids:
                total_value = (
                    float(portfolio.total_value) if portfolio.total_value else 0
                )
                if total_value >= 15000:
                    newly_earned.append(ACHIEVEMENTS["high_roller"])

            # Millionaire Mindset ($20K portfolio)
            if portfolio and "millionaire_mindset" not in existing_ids:
                total_value = (
                    float(portfolio.total_value) if portfolio.total_value else 0
                )
                if total_value >= 20000:
                    newly_earned.append(ACHIEVEMENTS["millionaire_mindset"])

            # Risk Manager (5 stop-loss orders)
            if "risk_manager" not in existing_ids:
                stop_loss_orders = [o for o in orders if o.order_type == "stop_loss"]
                if len(stop_loss_orders) >= 5:
                    newly_earned.append(ACHIEVEMENTS["risk_manager"])

            # Award new achievements
            for achievement in newly_earned:
                AchievementService._user_achievements[user_id].append(
                    {
                        "achievement_id": achievement["id"],
                        "title": achievement["title"],
                        "description": achievement["description"],
                        "icon": achievement["icon"],
                        "points": achievement["points"],
                        "category": achievement["category"],
                        "earned_at": datetime.now(timezone.utc).isoformat(),
                    }
                )

                logger.info(f"User {user_id} earned achievement: {achievement['id']}")

            return {
                "success": True,
                "newly_earned": newly_earned,
                "count": len(newly_earned),
            }

        except Exception as e:
            logger.error(f"Failed to check achievements: {e}")
            return {"success": False, "message": str(e)}

    @staticmethod
    def get_user_achievements(user_id: str) -> Dict[str, Any]:
        """
        Get all achievements for a user

        Args:
            user_id: User ID

        Returns:
            User's earned achievements
        """
        try:
            earned = AchievementService._user_achievements[user_id]
            total_points = sum(a["points"] for a in earned)

            return {
                "success": True,
                "earned": earned,
                "count": len(earned),
                "total_points": total_points,
                "progress": {
                    "earned": len(earned),
                    "total": len(ACHIEVEMENTS),
                    "percent": (
                        round((len(earned) / len(ACHIEVEMENTS)) * 100, 1)
                        if ACHIEVEMENTS
                        else 0
                    ),
                },
            }

        except Exception as e:
            logger.error(f"Failed to get user achievements: {e}")
            return {"success": False, "message": str(e)}

    @staticmethod
    def get_all_achievements() -> Dict[str, Any]:
        """
        Get all available achievements

        Returns:
            All achievement definitions
        """
        try:
            achievements_list = list(ACHIEVEMENTS.values())

            # Group by category
            by_category = defaultdict(list)
            for achievement in achievements_list:
                by_category[achievement["category"]].append(achievement)

            return {
                "success": True,
                "achievements": achievements_list,
                "by_category": dict(by_category),
                "total": len(achievements_list),
                "categories": list(by_category.keys()),
            }

        except Exception as e:
            logger.error(f"Failed to get all achievements: {e}")
            return {"success": False, "message": str(e)}

    @staticmethod
    def get_progress(user_id: str, db: Session) -> Dict[str, Any]:
        """
        Get user's progress towards unearned achievements

        Args:
            user_id: User ID
            db: Database session

        Returns:
            Progress towards each achievement
        """
        try:
            earned_ids = [
                a["achievement_id"]
                for a in AchievementService._user_achievements[user_id]
            ]

            # Get user data
            portfolio = db.query(Portfolio).filter(Portfolio.user_id == user_id).first()
            holdings = db.query(Holding).filter(Holding.user_id == user_id).all()
            orders = (
                db.query(Order)
                .filter(Order.user_id == user_id, Order.status == "filled")
                .all()
            )

            progress = []

            # Calculate progress for unearned achievements
            for achievement_id, achievement in ACHIEVEMENTS.items():
                if achievement_id in earned_ids:
                    continue

                current = 0
                target = 1

                if achievement_id == "portfolio_builder":
                    current = len(holdings)
                    target = 5
                elif achievement_id == "diversifier":
                    current = len(holdings)
                    target = 10
                elif achievement_id == "active_trader":
                    current = len(orders)
                    target = 10
                elif achievement_id == "day_trader":
                    current = len(orders)
                    target = 50
                elif achievement_id == "high_roller":
                    current = (
                        float(portfolio.total_value)
                        if portfolio and portfolio.total_value
                        else 0
                    )
                    target = 15000
                elif achievement_id == "millionaire_mindset":
                    current = (
                        float(portfolio.total_value)
                        if portfolio and portfolio.total_value
                        else 0
                    )
                    target = 20000
                elif achievement_id == "risk_manager":
                    current = len([o for o in orders if o.order_type == "stop_loss"])
                    target = 5

                progress.append(
                    {
                        "achievement_id": achievement_id,
                        "title": achievement["title"],
                        "description": achievement["description"],
                        "icon": achievement["icon"],
                        "current": current,
                        "target": target,
                        "percent": (
                            min(100, round((current / target) * 100, 1))
                            if target > 0
                            else 0
                        ),
                    }
                )

            return {"success": True, "progress": progress, "count": len(progress)}

        except Exception as e:
            logger.error(f"Failed to get achievement progress: {e}")
            return {"success": False, "message": str(e)}


# Singleton instance
achievement_service = AchievementService()
