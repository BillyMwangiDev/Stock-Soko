import uuid
from typing import Dict, Any
from decimal import Decimal
from sqlalchemy.orm import Session
from ..schemas.trades import OrderRequest, OrderResponse
from ..database.models import Order, User, Stock, Portfolio, Holding
from ..services.markets_service import markets_service
from ..services.mock_trading_engine import mock_trading_engine
from ..data.fee_structure import calculate_trading_fees
from ..utils.logging import get_logger

logger = get_logger("trades_service")


def _update_holdings(user_id: str, stock_id: str, symbol: str, side: str, quantity: float, price: float, db: Session):
	"""
	Update user holdings after order execution.
	Creates new holding if doesn't exist, updates existing holding otherwise.
	"""
	holding = db.query(Holding).filter(
		Holding.user_id == user_id,
		Holding.stock_id == stock_id
	).first()
	
	if side == "buy":
		if holding:
			# Update existing holding - calculate new average price
			total_quantity = float(holding.quantity) + quantity
			total_cost = (float(holding.quantity) * float(holding.avg_price)) + (quantity * price)
			new_avg_price = total_cost / total_quantity if total_quantity > 0 else price
			
			holding.quantity = Decimal(str(total_quantity))
			holding.avg_price = Decimal(str(new_avg_price))
		else:
			# Create new holding
			holding = Holding(
				user_id=user_id,
				stock_id=stock_id,
				symbol=symbol,
				quantity=Decimal(str(quantity)),
				avg_price=Decimal(str(price))
			)
			db.add(holding)
	
	elif side == "sell":
		if holding:
			new_quantity = float(holding.quantity) - quantity
			if new_quantity <= 0:
				# Remove holding if quantity is zero or negative
				db.delete(holding)
			else:
				# Update quantity, keep same average price
				holding.quantity = Decimal(str(new_quantity))
	
	logger.info(f"Holdings updated: {symbol} {side} {quantity} @ {price}")


def place_order(req: OrderRequest, email: str, db: Session) -> OrderResponse:
	"""
	Place a trading order with live price validation and fee calculation.
	
	Validates order type, quantity, user account, stock availability, and calculates
	fees based on NSE trading structure. Supports buy and sell market orders only.
	
	Args:
		req: Order request with symbol, side, quantity, order_type, and optional price
		email: User's email address for account lookup
		db: Database session for transaction management
		
	Returns:
		OrderResponse: Order status, ID, filled details, and execution message
		
	Raises:
		No exceptions raised; returns rejection status in OrderResponse for invalid inputs
	"""
	order_id = str(uuid.uuid4())
	
	try:
		# Validate order type
		if req.order_type != "market":
			return OrderResponse(
				order_id=order_id, 
				status="rejected", 
				message="Only market orders supported"
			)
		
		# Validate quantity
		if req.quantity <= 0:
			return OrderResponse(
				order_id=order_id, 
				status="rejected", 
				message="Quantity must be positive"
			)
		
		# Get user
		user = db.query(User).filter(User.email == email).first()
		if not user:
			return OrderResponse(
				order_id=order_id,
				status="rejected",
				message="User not found"
			)
		
		# Get stock
		stock = db.query(Stock).filter(Stock.symbol == req.symbol).first()
		if not stock:
			return OrderResponse(
				order_id=order_id,
				status="rejected",
				message=f"Stock {req.symbol} not found"
			)
		
		# Get live price
		try:
			quote = markets_service.get_quote(req.symbol)
			current_price = quote.last_price
		except Exception as e:
			logger.warning(f"Failed to get live price for {req.symbol}, using cached: {e}")
			current_price = float(stock.latest_price) if stock.latest_price else 0
		
		if current_price <= 0:
			return OrderResponse(
				order_id=order_id,
				status="rejected",
				message="Invalid stock price"
			)
		
		# Calculate order value and fees
		order_value = current_price * req.quantity
		fees = calculate_trading_fees(order_value)
		total_cost = order_value + fees["total_fees"] if req.side == "buy" else order_value - fees["total_fees"]
		
		# Get portfolio
		portfolio = db.query(Portfolio).filter(Portfolio.user_id == user.id).first()
		if not portfolio:
			portfolio = Portfolio(
				user_id=user.id,
				cash=0,
				buying_power=0,
				total_value=0
			)
			db.add(portfolio)
		
		# Validate balance for buy orders
		if req.side == "buy":
			if float(portfolio.cash) < total_cost:
				return OrderResponse(
					order_id=order_id,
					status="rejected",
					message=f"Insufficient funds. Required: KES {total_cost:.2f}, Available: KES {portfolio.cash:.2f}"
				)
		
		# Validate holdings for sell orders
		if req.side == "sell":
			holding = db.query(Holding).filter(
				Holding.user_id == user.id,
				Holding.stock_id == stock.id
			).first()
			
			if not holding or float(holding.quantity) < req.quantity:
				available = float(holding.quantity) if holding else 0
				return OrderResponse(
					order_id=order_id,
					status="rejected",
					message=f"Insufficient shares. Required: {req.quantity}, Available: {available}"
				)
		
		# Get account (for broker reference)
		from ..database.models import Account
		account = db.query(Account).filter(Account.user_id == user.id).first()
		account_id = account.id if account else None
		
		# Create order
		order = Order(
			id=order_id,
			user_id=user.id,
			account_id=account_id,
			stock_id=stock.id,
			side=req.side,
			order_type=req.order_type,
			quantity=req.quantity,
			price=current_price,
			status="accepted",
			filled_quantity=0,
			fees=fees["total_fees"]
		)
		db.add(order)
		db.commit()
		
		logger.info(f"Order {order_id} placed: {req.side} {req.quantity} {req.symbol} @ {current_price}")
		
		# Execute market order immediately
		if req.order_type == "market":
			execution_result = mock_trading_engine.execute_market_order(order, db)
			
			if execution_result["status"] == "filled":
				# Update holdings
				_update_holdings(
					user_id=user.id,
					stock_id=stock.id,
					symbol=req.symbol,
					side=req.side,
					quantity=req.quantity,
					price=execution_result["filled_price"],
					db=db
				)
				
				# Update portfolio cash
				if req.side == "buy":
					portfolio.cash = float(portfolio.cash) - total_cost
				else:
					portfolio.cash = float(portfolio.cash) + total_cost
				
				db.commit()
				
				return OrderResponse(
					order_id=order_id,
					status="filled",
					message=f"Order filled - {req.side.upper()} {req.quantity} {req.symbol} @ KES {execution_result['filled_price']:.2f}",
					price=execution_result['filled_price'],
					fees=fees["total_fees"],
					total_cost=total_cost
				)
		
		return OrderResponse(
			order_id=order_id,
			status="accepted",
			message=f"Order accepted - {req.side.upper()} {req.quantity} {req.symbol} @ KES {current_price:.2f}",
			price=current_price,
			fees=fees["total_fees"],
			total_cost=total_cost
		)
	
	except Exception as e:
		logger.error(f"Order placement failed: {e}")
		return OrderResponse(
			order_id=order_id,
			status="rejected",
			message=f"Order failed: {str(e)}"
		)