from typing import Dict, Any, Optional
from ..config import (
    FIREBASE_CREDENTIALS_PATH,
    FIREBASE_PROJECT_ID,
    ENABLE_NOTIFICATIONS,
)
from ..utils.logging import get_logger

logger = get_logger("notification_service")

try:
    import firebase_admin
    from firebase_admin import credentials, messaging

    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False
    logger.warning("Firebase not installed, notifications disabled")


class NotificationService:
    def __init__(self):
        self.initialized = False

        if FIREBASE_AVAILABLE and ENABLE_NOTIFICATIONS and FIREBASE_CREDENTIALS_PATH:
            try:
                cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
                firebase_admin.initialize_app(
                    cred,
                    {
                        "projectId": FIREBASE_PROJECT_ID,
                    },
                )
                self.initialized = True
                logger.info("Firebase notification service initialized")
            except Exception as e:
                logger.error(f"Failed to initialize Firebase: {e}")
                self.initialized = False
        else:
            logger.info("Firebase notifications not configured (using mock mode)")

    def send_notification(
        self,
        fcm_token: str,
        title: str,
        body: str,
        data: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """Send push notification to a device"""

        if not self.initialized:
            logger.info(f"[MOCK] Notification: {title} - {body}")
            return {"success": True, "mock": True}

        try:
            message = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=body,
                ),
                data=data or {},
                token=fcm_token,
            )

            response = messaging.send(message)
            logger.info(f"Notification sent successfully: {response}")

            return {"success": True, "message_id": response}

        except Exception as e:
            logger.error(f"Failed to send notification: {e}")
            return {"success": False, "error": str(e)}

    def send_multicast(
        self,
        fcm_tokens: list,
        title: str,
        body: str,
        data: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """Send notification to multiple devices"""

        if not self.initialized:
            logger.info(
                f"[MOCK] Multicast: {title} - {body} to {len(fcm_tokens)} devices"
            )
            return {"success": True, "mock": True, "sent": len(fcm_tokens)}

        try:
            message = messaging.MulticastMessage(
                notification=messaging.Notification(
                    title=title,
                    body=body,
                ),
                data=data or {},
                tokens=fcm_tokens,
            )

            response = messaging.send_multicast(message)
            logger.info(
                f"Multicast sent: {response.success_count} success, {response.failure_count} failed"
            )

            return {
                "success": True,
                "success_count": response.success_count,
                "failure_count": response.failure_count,
            }

        except Exception as e:
            logger.error(f"Failed to send multicast: {e}")
            return {"success": False, "error": str(e)}


notification_service = NotificationService()


def send_price_alert_notification(
    user: Any, symbol: str, alert_type: str, target_price: float, current_price: float
):
    """Send price alert notification"""

    if not hasattr(user, "fcm_token") or not user.fcm_token:
        logger.info(f"User {user.id} has no FCM token, skipping notification")
        return

    if alert_type == "above":
        title = f"Price Alert: {symbol}"
        body = (
            f"{symbol} is now above KES {target_price:.2f} at KES {current_price:.2f}"
        )
    elif alert_type == "below":
        title = f"Price Alert: {symbol}"
        body = (
            f"{symbol} is now below KES {target_price:.2f} at KES {current_price:.2f}"
        )
    else:
        title = f"Price Alert: {symbol}"
        body = f"{symbol} reached KES {current_price:.2f}"

    notification_service.send_notification(
        fcm_token=user.fcm_token,
        title=title,
        body=body,
        data={"type": "price_alert", "symbol": symbol, "price": str(current_price)},
    )


def send_trade_notification(
    user: Any, order_type: str, symbol: str, quantity: int, price: float
):
    """Send trade execution notification"""

    if not hasattr(user, "fcm_token") or not user.fcm_token:
        return

    title = f"Trade Executed: {order_type.upper()}"
    body = f"Your {order_type} order for {quantity} shares of {symbol} @ KES {price:.2f} has been executed"

    notification_service.send_notification(
        fcm_token=user.fcm_token,
        title=title,
        body=body,
        data={
            "type": "trade_executed",
            "symbol": symbol,
            "order_type": order_type,
            "quantity": str(quantity),
            "price": str(price),
        },
    )


def send_payment_notification(user: Any, payment_type: str, amount: float, status: str):
    """Send payment notification"""

    if not hasattr(user, "fcm_token") or not user.fcm_token:
        return

    if status == "success":
        title = f"{payment_type.capitalize()} Successful"
        body = f"Your {payment_type} of KES {amount:.2f} was successful"
    else:
        title = f"{payment_type.capitalize()} Failed"
        body = f"Your {payment_type} of KES {amount:.2f} failed. Please try again"

    notification_service.send_notification(
        fcm_token=user.fcm_token,
        title=title,
        body=body,
        data={
            "type": "payment",
            "payment_type": payment_type,
            "amount": str(amount),
            "status": status,
        },
    )
