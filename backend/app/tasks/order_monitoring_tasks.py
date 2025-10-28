"""
Order Monitoring Tasks
Background tasks for checking and executing pending orders
"""
from celery import shared_task
from ..database import get_db
from ..services.mock_trading_engine import mock_trading_engine
from ..services.notification_service import notification_service
from ..database.models import User
from ..utils.logging import get_logger

logger = get_logger("order_monitoring_tasks")


@shared_task(name="monitor_pending_orders")
def monitor_pending_orders():
    """
    Check all pending limit and stop-loss orders
    Execute if conditions are met
    Send notifications for filled orders
    
    Runs every minute via Celery beat
    """
    logger.info("Monitoring pending orders...")
    
    db = next(get_db())
    
    try:
        # Check and execute pending orders
        executed_orders = mock_trading_engine.monitor_pending_orders(db)
        
        if executed_orders:
            logger.info(f"Executed {len(executed_orders)} orders")
            
            # Send notifications for executed orders
            for execution in executed_orders:
                try:
                    # Get order details for notification
                    from ..database.models import Order
                    order = db.query(Order).filter(Order.id == execution['order_id']).first()
                    
                    if order and order.user:
                        # Send notification
                        user = order.user
                        
                        notification_service.send_notification(
                            user_id=user.id,
                            title=f"Order Executed: {order.symbol}",
                            body=f"Your {order.order_type} order to {order.side} {order.symbol} has been filled at {execution['result']['filled_price']:.2f}",
                            fcm_token=user.fcm_token,
                            data={
                                "type": "order_filled",
                                "order_id": order.id,
                                "symbol": order.symbol
                            }
                        )
                        
                        logger.info(f"Sent notification for order {order.id}")
                        
                except Exception as e:
                    logger.error(f"Failed to send notification for order {execution['order_id']}: {e}")
                    continue
        
        return {
            "success": True,
            "executed_count": len(executed_orders),
            "executed_orders": [e['order_id'] for e in executed_orders]
        }
        
    except Exception as e:
        logger.error(f"Failed to monitor pending orders: {e}")
        return {
            "success": False,
            "error": str(e)
        }
    
    finally:
        db.close()

