from celery import shared_task
from typing import List
from datetime import datetime
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..database.models import Alert, User
from ..services.markets_service import get_quote
from ..services.notification_service import send_price_alert_notification
from ..utils.logging import get_logger

logger = get_logger("alert_tasks")


@shared_task(name="app.tasks.alert_tasks.monitor_price_alerts")
def monitor_price_alerts():
    """
    Periodic task to monitor all active price alerts
    Runs every 30 seconds
    """
    logger.info("Starting price alert monitoring task")

    db = SessionLocal()

    try:
        # Use the new price alert service
        from ..services.price_alert_service import price_alert_service

        triggered_alerts = price_alert_service.check_and_trigger_alerts(db)

        logger.info(f"Alert monitoring complete. Triggered: {len(triggered_alerts)}")

        return {
            "success": True,
            "triggered": len(triggered_alerts),
            "alerts": triggered_alerts,
        }

    except Exception as e:
        logger.error(f"Error in monitor_price_alerts task: {e}")
        return {"success": False, "error": str(e)}

    finally:
        db.close()


def get_current_price(symbol: str) -> float:
    """Get current price for a symbol"""
    try:
        quote = get_quote(symbol)
        return float(quote.last_price)
    except Exception as e:
        logger.error(f"Error getting price for {symbol}: {e}")
        return 0.0


def should_trigger_alert(alert: Alert, current_price: float) -> bool:
    """Check if alert conditions are met"""
    if current_price == 0:
        return False

    if alert.alert_type == "above" and current_price >= alert.target_price:
        return True

    if alert.alert_type == "below" and current_price <= alert.target_price:
        return True

    if alert.alert_type == "percent_change":
        if alert.base_price and alert.base_price > 0:
            percent_change = (
                (current_price - alert.base_price) / alert.base_price
            ) * 100
            if abs(percent_change) >= abs(alert.target_percent):
                return True

    return False


def trigger_alert(db: Session, alert: Alert, current_price: float):
    """Trigger an alert and send notification"""
    try:
        alert.triggered = True
        alert.triggered_at = datetime.utcnow()
        alert.triggered_price = current_price

        user = db.query(User).filter(User.id == alert.user_id).first()

        if user:
            send_price_alert_notification(
                user=user,
                symbol=alert.symbol,
                alert_type=alert.alert_type,
                target_price=alert.target_price,
                current_price=current_price,
            )

        logger.info(
            f"Alert {alert.id} triggered for user {alert.user_id}: {alert.symbol} @ {current_price}"
        )

    except Exception as e:
        logger.error(f"Error triggering alert {alert.id}: {e}")
        raise


@shared_task(name="app.tasks.alert_tasks.cleanup_old_alerts")
def cleanup_old_alerts(days: int = 30):
    """
    Clean up old triggered alerts
    Runs daily
    """
    logger.info(f"Cleaning up alerts older than {days} days")

    db = SessionLocal()

    try:
        from datetime import timedelta

        cutoff_date = datetime.utcnow() - timedelta(days=days)

        deleted_count = (
            db.query(Alert)
            .filter(Alert.triggered == True, Alert.triggered_at < cutoff_date)
            .delete()
        )

        db.commit()

        logger.info(f"Deleted {deleted_count} old alerts")
        return {"success": True, "deleted": deleted_count}

    except Exception as e:
        logger.error(f"Error in cleanup_old_alerts: {e}")
        db.rollback()
        return {"success": False, "error": str(e)}

    finally:
        db.close()
