import uuid
import base64
import time
from datetime import datetime
from typing import Dict, Any, Optional
import httpx
from sqlalchemy.orm import Session
from ..schemas.payments import MpesaDepositRequest, MpesaDepositResponse
from ..config import (
	MPESA_CONSUMER_KEY, 
	MPESA_CONSUMER_SECRET, 
	MPESA_SHORTCODE, 
	MPESA_PASSKEY, 
	MPESA_CALLBACK_URL,
	MPESA_ENV
)
from ..database.models import Transaction, Portfolio, User
from ..utils.logging import get_logger

logger = get_logger("payments_service")

_token_cache: dict = {"token": None, "expires": 0}


def _get_daraja_token() -> str:
	"""Fetch OAuth token from Daraja API with caching."""
	if _token_cache["token"] and time.time() < _token_cache["expires"]:
		return _token_cache["token"]
	
	url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
	auth = base64.b64encode(f"{MPESA_CONSUMER_KEY}:{MPESA_CONSUMER_SECRET}".encode()).decode()
	headers = {"Authorization": f"Basic {auth}"}
	
	try:
		resp = httpx.get(url, headers=headers, timeout=10)
		resp.raise_for_status()
		data = resp.json()
		token = data.get("access_token")
		expires_in = int(data.get("expires_in", 3600))
		_token_cache["token"] = token
		_token_cache["expires"] = time.time() + expires_in - 60
		logger.info("Daraja OAuth token fetched")
		return token
	except Exception as e:
		logger.error(f"Daraja OAuth failed: {e}")
		raise


def initiate_mpesa_stk(req: MpesaDepositRequest) -> MpesaDepositResponse:
	"""Initiate STK Push via Daraja Lipa Na M-Pesa Online API."""
	try:
		token = _get_daraja_token()
	except Exception as e:
		return MpesaDepositResponse(
			checkout_request_id="",
			status="error",
			message=f"OAuth failed: {str(e)}"
		)
	
	url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
	timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
	password = base64.b64encode(f"{MPESA_SHORTCODE}{MPESA_PASSKEY}{timestamp}".encode()).decode()
	
	payload = {
		"BusinessShortCode": MPESA_SHORTCODE,
		"Password": password,
		"Timestamp": timestamp,
		"TransactionType": "CustomerPayBillOnline",
		"Amount": int(req.amount),
		"PartyA": req.phone_number.replace("+", ""),
		"PartyB": MPESA_SHORTCODE,
		"PhoneNumber": req.phone_number.replace("+", ""),
		"CallBackURL": MPESA_CALLBACK_URL,
		"AccountReference": "StockSoko",
		"TransactionDesc": "Deposit"
	}
	
	headers = {
		"Authorization": f"Bearer {token}",
		"Content-Type": "application/json"
	}
	
	try:
		resp = httpx.post(url, json=payload, headers=headers, timeout=15)
		resp.raise_for_status()
		data = resp.json()
		checkout_id = data.get("CheckoutRequestID", "")
		response_code = data.get("ResponseCode", "")
		customer_msg = data.get("CustomerMessage", "")
		
		if response_code == "0":
			logger.info(f"STK Push initiated: {checkout_id}")
			return MpesaDepositResponse(
				checkout_request_id=checkout_id,
				status="pending",
				message=customer_msg or "STK push sent to phone"
			)
		else:
			logger.warning(f"STK Push failed: {data}")
			return MpesaDepositResponse(
				checkout_request_id=checkout_id,
				status="failed",
				message=customer_msg or f"Request failed: {response_code}"
			)
	except httpx.HTTPStatusError as e:
		logger.error(f"Daraja STK HTTP error: {e.response.status_code} {e.response.text}")
		return MpesaDepositResponse(
			checkout_request_id="",
			status="error",
			message=f"API error: {e.response.status_code}"
		)
	except Exception as e:
		logger.error(f"STK Push exception: {e}")
		return MpesaDepositResponse(
			checkout_request_id="",
			status="error",
			message=f"Request failed: {str(e)}"
		)


def process_mpesa_callback(callback_data: Dict[str, Any], db: Session) -> Dict[str, Any]:
	"""Process M-Pesa STK Push callback and update transaction"""
	try:
		# Extract callback data
		body = callback_data.get("Body", {})
		stk_callback = body.get("stkCallback", {})
		
		result_code = stk_callback.get("ResultCode")
		result_desc = stk_callback.get("ResultDesc", "")
		checkout_request_id = stk_callback.get("CheckoutRequestID", "")
		
		logger.info(f"Processing callback for {checkout_request_id}: Code {result_code}")
		
		if result_code == 0:  # Success
			# Extract payment details from callback metadata
			callback_metadata = stk_callback.get("CallbackMetadata", {}).get("Item", [])
			
			amount = 0
			mpesa_receipt = ""
			phone_number = ""
			
			for item in callback_metadata:
				name = item.get("Name", "")
				if name == "Amount":
					amount = float(item.get("Value", 0))
				elif name == "MpesaReceiptNumber":
					mpesa_receipt = item.get("Value", "")
				elif name == "PhoneNumber":
					phone_number = str(item.get("Value", ""))
			
			# Find or create transaction
			transaction = db.query(Transaction).filter(
				Transaction.provider_reference == checkout_request_id
			).first()
			
			if not transaction:
				# Create new transaction (shouldn't happen, but handle it)
				# Try to find user by phone
				user = db.query(User).filter(User.phone == phone_number).first()
				
				if user:
					transaction = Transaction(
						id=str(uuid.uuid4()),
						user_id=user.id,
						type="deposit",
						method="mpesa",
						amount=amount,
						status="completed",
						provider_reference=mpesa_receipt or checkout_request_id
					)
					db.add(transaction)
					
					# Update wallet balance
					portfolio = db.query(Portfolio).filter(Portfolio.user_id == user.id).first()
					if portfolio:
						portfolio.cash = float(portfolio.cash) + amount
						portfolio.buying_power = float(portfolio.buying_power) + amount
					else:
						# Create portfolio if doesn't exist
						portfolio = Portfolio(
							user_id=user.id,
							cash=amount,
							buying_power=amount,
							total_value=amount
						)
						db.add(portfolio)
					
					db.commit()
					logger.info(f"Transaction completed: {mpesa_receipt}, Amount: {amount}")
			else:
				# Update existing transaction
				transaction.status = "completed"
				transaction.provider_reference = mpesa_receipt or checkout_request_id
				
				# Update wallet balance
				portfolio = db.query(Portfolio).filter(Portfolio.user_id == transaction.user_id).first()
				if portfolio:
					portfolio.cash = float(portfolio.cash) + float(transaction.amount)
					portfolio.buying_power = float(portfolio.buying_power) + float(transaction.amount)
				
				db.commit()
				logger.info(f"Transaction updated: {mpesa_receipt}")
			
			return {
				"ResultCode": 0,
				"ResultDesc": "Success"
			}
		else:
			# Failed transaction
			logger.warning(f"Transaction failed: {result_desc}")
			
			transaction = db.query(Transaction).filter(
				Transaction.provider_reference == checkout_request_id
			).first()
			
			if transaction:
				transaction.status = "failed"
				db.commit()
			
			return {
				"ResultCode": result_code,
				"ResultDesc": result_desc
			}
	
	except Exception as e:
		logger.error(f"Callback processing error: {e}")
		return {
			"ResultCode": 1,
			"ResultDesc": f"Internal error: {str(e)}"
		}


def initiate_mpesa_withdrawal(phone_number: str, amount: float, user_id: str, db: Session) -> Dict[str, Any]:
	"""Initiate B2C M-Pesa withdrawal"""
	try:
		# Check user balance
		portfolio = db.query(Portfolio).filter(Portfolio.user_id == user_id).first()
		if not portfolio or float(portfolio.cash) < amount:
			return {
				"status": "error",
				"message": "Insufficient balance"
			}
		
		# Get OAuth token
		token = _get_daraja_token()
		
		# B2C API endpoint
		url = "https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest"
		
		# Security credential (base64 encoded initiator password)
		# In production, use actual security credential
		security_credential = base64.b64encode(b"Safaricom999!*!").decode()
		
		payload = {
			"InitiatorName": "testapi",
			"SecurityCredential": security_credential,
			"CommandID": "BusinessPayment",
			"Amount": int(amount),
			"PartyA": MPESA_SHORTCODE,
			"PartyB": phone_number.replace("+", ""),
			"Remarks": "Withdrawal from Stock Soko",
			"QueueTimeOutURL": f"{MPESA_CALLBACK_URL}/timeout",
			"ResultURL": f"{MPESA_CALLBACK_URL}/result",
			"Occasion": "Withdrawal"
		}
		
		headers = {
			"Authorization": f"Bearer {token}",
			"Content-Type": "application/json"
		}
		
		# Create pending transaction
		transaction = Transaction(
			id=str(uuid.uuid4()),
			user_id=user_id,
			type="withdrawal",
			method="mpesa",
			amount=amount,
			status="pending",
			provider_reference=""
		)
		db.add(transaction)
		db.commit()
		
		# Make B2C request
		resp = httpx.post(url, json=payload, headers=headers, timeout=15)
		resp.raise_for_status()
		data = resp.json()
		
		conversation_id = data.get("ConversationID", "")
		response_code = data.get("ResponseCode", "")
		
		if response_code == "0":
			# Update transaction with conversation ID
			transaction.provider_reference = conversation_id
			
			# Deduct from wallet (will be reversed if withdrawal fails)
			portfolio.cash = float(portfolio.cash) - amount
			portfolio.buying_power = float(portfolio.buying_power) - amount
			
			db.commit()
			
			logger.info(f"B2C withdrawal initiated: {conversation_id}")
			
			return {
				"status": "pending",
				"message": "Withdrawal initiated successfully",
				"transaction_id": transaction.id,
				"conversation_id": conversation_id
			}
		else:
			transaction.status = "failed"
			db.commit()
			
			return {
				"status": "failed",
				"message": data.get("ResponseDescription", "Withdrawal failed")
			}
	
	except httpx.HTTPStatusError as e:
		logger.error(f"B2C HTTP error: {e.response.status_code} {e.response.text}")
		return {
			"status": "error",
			"message": f"API error: {e.response.status_code}"
		}
	except Exception as e:
		logger.error(f"B2C withdrawal error: {e}")
		return {
			"status": "error",
			"message": f"Failed to initiate withdrawal: {str(e)}"
		}


def get_transaction_history(user_id: str, db: Session, limit: int = 50) -> Dict[str, Any]:
	"""Get user transaction history"""
	try:
		transactions = db.query(Transaction).filter(
			Transaction.user_id == user_id
		).order_by(Transaction.created_at.desc()).limit(limit).all()
		
		transaction_list = [
			{
				"id": txn.id,
				"type": txn.type,
				"method": txn.method,
				"amount": float(txn.amount),
				"status": txn.status,
				"reference": txn.provider_reference,
				"created_at": txn.created_at.isoformat() if txn.created_at else None
			}
			for txn in transactions
		]
		
		return {
			"transactions": transaction_list,
			"count": len(transaction_list)
		}
	except Exception as e:
		logger.error(f"Failed to get transaction history: {e}")
		raise