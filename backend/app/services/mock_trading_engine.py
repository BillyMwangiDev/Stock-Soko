"""
Mock Trading Engine for Demo Mode
Handles order execution, monitoring, and fills for paper trading
"""
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy.orm import Session
from ..database.models import Order, Holding, Portfolio, User, Stock
from ..services.markets_service import markets_service
from ..utils.logging import get_logger

logger = get_logger("mock_trading_engine")


class MockTradingEngine:
    """
    Simulates real trading execution in demo mode
    Handles market, limit, and stop-loss orders
    """
    
    @staticmethod
    def execute_market_order(
        order: Order,
        db: Session
    ) -> Dict[str, Any]:
        """
        Execute market order instantly at current price
        
        Args:
            order: Order object with symbol, side, quantity
            db: Database session
            
        Returns:
            Execution details with filled price and status
        """
        try:
            # Get current mock price
            quote = markets_service.get_quote(order.symbol)
            current_price = float(quote.last_price)
            
            # Instant execution
            filled_price = current_price
            filled_quantity = float(order.quantity)
            filled_value = filled_price * filled_quantity
            
            # Update order
            order.status = "filled"
            order.filled_quantity = Decimal(str(filled_quantity))
            order.filled_price = Decimal(str(filled_price))
            order.filled_at = datetime.now(timezone.utc)
            
            db.commit()
            
            logger.info(f"Market order executed: {order.symbol} {order.side} {filled_quantity} @ {filled_price}")
            
            return {
                "status": "filled",
                "filled_price": filled_price,
                "filled_quantity": filled_quantity,
                "filled_value": filled_value,
                "execution_time": order.filled_at.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to execute market order: {e}")
            order.status = "rejected"
            order.rejection_reason = str(e)
            db.commit()
            
            return {
                "status": "rejected",
                "reason": str(e)
            }
    
    @staticmethod
    def execute_limit_order(
        order: Order,
        current_price: float,
        db: Session
    ) -> Optional[Dict[str, Any]]:
        """
        Check and execute limit order if price condition met
        
        Args:
            order: Order object with limit_price
            current_price: Current market price
            db: Database session
            
        Returns:
            Execution details if filled, None if still pending
        """
        try:
            limit_price = float(order.limit_price) if order.limit_price else None
            
            if not limit_price:
                return None
            
            # Check if limit order should execute
            should_execute = False
            
            if order.side == "buy" and current_price <= limit_price:
                # Buy limit: execute when price at or below limit
                should_execute = True
            elif order.side == "sell" and current_price >= limit_price:
                # Sell limit: execute when price at or above limit
                should_execute = True
            
            if not should_execute:
                return None
            
            # Execute the order
            filled_price = limit_price  # Fill at limit price
            filled_quantity = float(order.quantity)
            filled_value = filled_price * filled_quantity
            
            # Update order
            order.status = "filled"
            order.filled_quantity = Decimal(str(filled_quantity))
            order.filled_price = Decimal(str(filled_price))
            order.filled_at = datetime.now(timezone.utc)
            
            db.commit()
            
            logger.info(f"Limit order executed: {order.symbol} {order.side} {filled_quantity} @ {filled_price}")
            
            return {
                "status": "filled",
                "filled_price": filled_price,
                "filled_quantity": filled_quantity,
                "filled_value": filled_value,
                "execution_time": order.filled_at.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to execute limit order: {e}")
            return None
    
    @staticmethod
    def check_stop_loss_trigger(
        order: Order,
        current_price: float,
        db: Session
    ) -> Optional[Dict[str, Any]]:
        """
        Check if stop-loss should trigger and execute as market order
        
        Args:
            order: Order object with stop_price
            current_price: Current market price
            db: Database session
            
        Returns:
            Execution details if triggered, None otherwise
        """
        try:
            stop_price = float(order.stop_price) if order.stop_price else None
            
            if not stop_price:
                return None
            
            # Check if stop-loss should trigger
            should_trigger = False
            
            if order.side == "sell" and current_price <= stop_price:
                # Stop-loss sell: trigger when price at or below stop
                should_trigger = True
            elif order.side == "buy" and current_price >= stop_price:
                # Stop buy: trigger when price at or above stop
                should_trigger = True
            
            if not should_trigger:
                return None
            
            # Execute as market order at current price
            filled_price = current_price
            filled_quantity = float(order.quantity)
            filled_value = filled_price * filled_quantity
            
            # Update order
            order.status = "filled"
            order.filled_quantity = Decimal(str(filled_quantity))
            order.filled_price = Decimal(str(filled_price))
            order.filled_at = datetime.now(timezone.utc)
            
            db.commit()
            
            logger.info(f"Stop-loss triggered: {order.symbol} {order.side} {filled_quantity} @ {filled_price}")
            
            return {
                "status": "filled",
                "filled_price": filled_price,
                "filled_quantity": filled_quantity,
                "filled_value": filled_value,
                "execution_time": order.filled_at.isoformat(),
                "trigger_type": "stop_loss"
            }
            
        except Exception as e:
            logger.error(f"Failed to check stop-loss: {e}")
            return None
    
    @staticmethod
    def monitor_pending_orders(db: Session) -> List[Dict[str, Any]]:
        """
        Check all pending orders and execute if conditions met
        Should be called periodically (e.g., every minute)
        
        Args:
            db: Database session
            
        Returns:
            List of executed orders
        """
        executed_orders = []
        
        try:
            # Get all pending orders
            pending_orders = db.query(Order).filter(
                Order.status == "pending"
            ).all()
            
            for order in pending_orders:
                try:
                    # Get current price
                    quote = markets_service.get_quote(order.symbol)
                    current_price = float(quote.last_price)
                    
                    # Check order type and execute if conditions met
                    result = None
                    
                    if order.order_type == "limit":
                        result = MockTradingEngine.execute_limit_order(order, current_price, db)
                    elif order.order_type == "stop_loss":
                        result = MockTradingEngine.check_stop_loss_trigger(order, current_price, db)
                    
                    if result:
                        executed_orders.append({
                            "order_id": order.id,
                            "symbol": order.symbol,
                            "result": result
                        })
                        
                except Exception as e:
                    logger.error(f"Failed to process order {order.id}: {e}")
                    continue
            
            if executed_orders:
                logger.info(f"Executed {len(executed_orders)} pending orders")
            
        except Exception as e:
            logger.error(f"Failed to monitor pending orders: {e}")
        
        return executed_orders
    
    @staticmethod
    def cancel_order(
        order_id: str,
        user_id: str,
        db: Session
    ) -> Dict[str, Any]:
        """
        Cancel a pending order
        
        Args:
            order_id: Order ID to cancel
            user_id: User ID for authorization
            db: Database session
            
        Returns:
            Cancellation status
        """
        try:
            # Get order
            order = db.query(Order).filter(
                Order.id == order_id,
                Order.user_id == user_id
            ).first()
            
            if not order:
                return {
                    "success": False,
                    "message": "Order not found"
                }
            
            if order.status != "pending":
                return {
                    "success": False,
                    "message": f"Cannot cancel order with status: {order.status}"
                }
            
            # Cancel the order
            order.status = "cancelled"
            order.cancelled_at = datetime.now(timezone.utc)
            
            db.commit()
            
            logger.info(f"Order cancelled: {order_id}")
            
            return {
                "success": True,
                "message": "Order cancelled successfully",
                "order_id": order_id
            }
            
        except Exception as e:
            logger.error(f"Failed to cancel order: {e}")
            return {
                "success": False,
                "message": str(e)
            }
    
    @staticmethod
    def modify_order(
        order_id: str,
        user_id: str,
        new_quantity: Optional[float] = None,
        new_limit_price: Optional[float] = None,
        new_stop_price: Optional[float] = None,
        db: Session = None
    ) -> Dict[str, Any]:
        """
        Modify a pending order
        
        Args:
            order_id: Order ID to modify
            user_id: User ID for authorization
            new_quantity: New quantity (optional)
            new_limit_price: New limit price (optional)
            new_stop_price: New stop price (optional)
            db: Database session
            
        Returns:
            Modification status
        """
        try:
            # Get order
            order = db.query(Order).filter(
                Order.id == order_id,
                Order.user_id == user_id
            ).first()
            
            if not order:
                return {
                    "success": False,
                    "message": "Order not found"
                }
            
            if order.status != "pending":
                return {
                    "success": False,
                    "message": f"Cannot modify order with status: {order.status}"
                }
            
            # Update fields
            if new_quantity is not None:
                order.quantity = Decimal(str(new_quantity))
            
            if new_limit_price is not None:
                order.limit_price = Decimal(str(new_limit_price))
            
            if new_stop_price is not None:
                order.stop_price = Decimal(str(new_stop_price))
            
            order.updated_at = datetime.now(timezone.utc)
            
            db.commit()
            
            logger.info(f"Order modified: {order_id}")
            
            return {
                "success": True,
                "message": "Order modified successfully",
                "order_id": order_id,
                "updated_fields": {
                    "quantity": float(order.quantity) if new_quantity else None,
                    "limit_price": float(order.limit_price) if new_limit_price and order.limit_price else None,
                    "stop_price": float(order.stop_price) if new_stop_price and order.stop_price else None
                }
            }
            
        except Exception as e:
            logger.error(f"Failed to modify order: {e}")
            return {
                "success": False,
                "message": str(e)
            }


# Singleton instance
mock_trading_engine = MockTradingEngine()

