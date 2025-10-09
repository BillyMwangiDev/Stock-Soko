import uuid
import base64
import time
from datetime import datetime
import httpx
from ..schemas.payments import MpesaDepositRequest, MpesaDepositResponse
from ..config import MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_SHORTCODE, MPESA_PASSKEY, MPESA_CALLBACK_URL
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