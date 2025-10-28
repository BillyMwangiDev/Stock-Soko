"""
M-PESA Daraja API Integration Service

This module handles all interactions with Safaricom's Daraja API:
- OAuth token management with caching
- STK Push (Lipa Na M-Pesa Online)
- STK Query (Transaction status checking)
- B2C (Business to Customer payments)
- Callback processing
- Phone number validation
- Security credential generation

References:
- Daraja API Documentation: https://developer.safaricom.co.ke/
- Sandbox Credentials: https://developer.safaricom.co.ke/test_credentials
"""

import uuid
import base64
import time
import re
from datetime import datetime
from typing import Dict, Any, Optional, Tuple
from enum import Enum
import httpx
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_v1_5
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
from ..database.models import Transaction, Portfolio, User, Account
from ..utils.logging import get_logger

logger = get_logger("mpesa_service")

# Token cache to avoid frequent OAuth requests
_token_cache: Dict[str, Any] = {"token": None, "expires": 0}


class MpesaEnvironment(str, Enum):
    """M-PESA API environments"""
    SANDBOX = "sandbox"
    PRODUCTION = "production"


class TransactionStatus(str, Enum):
    """Transaction status codes"""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class MpesaResultCode(str, Enum):
    """M-PESA result codes"""
    SUCCESS = "0"
    INSUFFICIENT_BALANCE = "1"
    LESS_THAN_MIN = "2001"
    MORE_THAN_MAX = "2002"
    INVALID_AMOUNT = "2003"
    INVALID_PHONE = "2006"
    DUPLICATE_REQUEST = "2007"
    USER_CANCELLED = "1032"
    TIMEOUT = "1037"


def get_api_base_url() -> str:
    """Get base URL based on environment"""
    if MPESA_ENV == MpesaEnvironment.PRODUCTION:
        return "https://api.safaricom.co.ke"
    return "https://sandbox.safaricom.co.ke"


def validate_phone_number(phone: str) -> Tuple[bool, str]:
    """
    Validate and format Kenyan phone number for M-PESA
    
    Args:
        phone: Phone number in various formats
        
    Returns:
        Tuple of (is_valid, formatted_phone)
        
    Examples:
        >>> validate_phone_number("0712345678")
        (True, "254712345678")
        >>> validate_phone_number("+254712345678")
        (True, "254712345678")
        >>> validate_phone_number("712345678")
        (True, "254712345678")
    """
    # Remove all non-digit characters
    phone = re.sub(r'\D', '', phone)
    
    # Handle different formats
    if phone.startswith("254"):
        # Already in correct format
        pass
    elif phone.startswith("0"):
        # Remove leading 0 and add 254
        phone = "254" + phone[1:]
    elif phone.startswith("7") or phone.startswith("1"):
        # Add 254 prefix
        phone = "254" + phone
    else:
        return False, "Invalid phone number format"
    
    # Validate Kenyan phone number (should be 12 digits starting with 254)
    if len(phone) != 12 or not phone.startswith("254"):
        return False, "Phone number must be 12 digits (254XXXXXXXXX)"
    
    # Validate network prefix (Safaricom: 7XX, Airtel: 1XX, Telkom: 7XX)
    network_prefix = phone[3]  # 4th digit after 254
    if network_prefix not in ["7", "1"]:
        return False, "Invalid Kenyan mobile network"
    
    return True, phone


def _get_daraja_token() -> str:
    """
    Fetch OAuth access token from Daraja API with caching
    
    Tokens are cached until 1 minute before expiry to avoid race conditions.
    
    Returns:
        str: OAuth access token
        
    Raises:
        Exception: If OAuth request fails
    """
    # Return cached token if still valid
    if _token_cache["token"] and time.time() < _token_cache["expires"]:
        logger.debug("Using cached M-PESA OAuth token")
        return _token_cache["token"]
    
    base_url = get_api_base_url()
    url = f"{base_url}/oauth/v1/generate?grant_type=client_credentials"
    
    # Create Basic Auth credentials
    credentials = f"{MPESA_CONSUMER_KEY}:{MPESA_CONSUMER_SECRET}"
    auth = base64.b64encode(credentials.encode()).decode()
    headers = {"Authorization": f"Basic {auth}"}
    
    try:
        logger.info("Fetching new M-PESA OAuth token")
        resp = httpx.get(url, headers=headers, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        
        token = data.get("access_token")
        expires_in = int(data.get("expires_in", 3600))
        
        if not token:
            raise ValueError("No access token in response")
        
        # Cache token (expire 1 minute early to be safe)
        _token_cache["token"] = token
        _token_cache["expires"] = time.time() + expires_in - 60
        
        logger.info(f"OAuth token fetched successfully, expires in {expires_in}s")
        return token
        
    except httpx.HTTPStatusError as e:
        logger.error(f"OAuth HTTP error: {e.response.status_code} - {e.response.text}")
        raise Exception(f"Failed to get OAuth token: {e.response.status_code}")
    except Exception as e:
        logger.error(f"OAuth error: {str(e)}")
        raise Exception(f"Failed to get OAuth token: {str(e)}")


def generate_password(shortcode: str, passkey: str, timestamp: str) -> str:
    """
    Generate password for STK Push request
    
    Args:
        shortcode: Business shortcode
        passkey: Lipa Na M-Pesa passkey
        timestamp: Timestamp in format YYYYMMDDHHmmss
        
    Returns:
        Base64 encoded password
    """
    data = f"{shortcode}{passkey}{timestamp}"
    return base64.b64encode(data.encode()).decode()


def initiate_mpesa_stk(req: MpesaDepositRequest, db: Session = None) -> MpesaDepositResponse:
    """
    Initiate STK Push via Daraja Lipa Na M-Pesa Online API
    
    This sends a payment prompt to the customer's phone.
    If account_id is provided, the deposit will be credited to that broker account.
    
    Args:
        req: Deposit request containing phone number, amount, and optional account_id
        db: Database session (optional, for account validation)
        
    Returns:
        MpesaDepositResponse with checkout ID and status
    """
    # Validate account_id if provided
    if req.account_id and db:
        account = db.query(Account).filter(Account.id == req.account_id).first()
        if not account:
            logger.warning(f"Invalid account_id: {req.account_id}")
            return MpesaDepositResponse(
                checkout_request_id="",
                status="error",
                message="Invalid broker account"
            )
        if not account.is_active:
            return MpesaDepositResponse(
                checkout_request_id="",
                status="error",
                message="Broker account is not active"
            )
    
    # Validate phone number
    is_valid, phone_or_error = validate_phone_number(req.phone_number)
    if not is_valid:
        logger.warning(f"Invalid phone number: {req.phone_number} - {phone_or_error}")
        return MpesaDepositResponse(
            checkout_request_id="",
            status="error",
            message=phone_or_error
        )
    
    phone_number = phone_or_error
    
    # Validate amount
    if req.amount < 1:
        return MpesaDepositResponse(
            checkout_request_id="",
            status="error",
            message="Minimum deposit amount is KES 1"
        )
    
    if req.amount > 150000:
        return MpesaDepositResponse(
            checkout_request_id="",
            status="error",
            message="Maximum deposit amount is KES 150,000"
        )
    
    # Get OAuth token
    try:
        token = _get_daraja_token()
    except Exception as e:
        return MpesaDepositResponse(
            checkout_request_id="",
            status="error",
            message=f"Authentication failed: {str(e)}"
        )
    
    # Prepare STK Push request
    base_url = get_api_base_url()
    url = f"{base_url}/mpesa/stkpush/v1/processrequest"
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    password = generate_password(MPESA_SHORTCODE, MPESA_PASSKEY, timestamp)
    
    payload = {
        "BusinessShortCode": MPESA_SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(req.amount),
        "PartyA": phone_number,
        "PartyB": MPESA_SHORTCODE,
        "PhoneNumber": phone_number,
        "CallBackURL": MPESA_CALLBACK_URL,
        "AccountReference": "StockSoko",
        "TransactionDesc": f"Deposit KES {req.amount}"
    }
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        logger.info(f"Initiating STK Push: Phone={phone_number}, Amount={req.amount}")
        resp = httpx.post(url, json=payload, headers=headers, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        
        checkout_id = data.get("CheckoutRequestID", "")
        merchant_request_id = data.get("MerchantRequestID", "")
        response_code = data.get("ResponseCode", "")
        customer_msg = data.get("CustomerMessage", "")
        response_desc = data.get("ResponseDescription", "")
        
        logger.info(f"STK Push response: Code={response_code}, CheckoutID={checkout_id}")
        
        if response_code == MpesaResultCode.SUCCESS:
            return MpesaDepositResponse(
                checkout_request_id=checkout_id,
                status="pending",
                message=customer_msg or "Payment prompt sent to your phone"
            )
        else:
            logger.warning(f"STK Push failed: {response_desc}")
            return MpesaDepositResponse(
                checkout_request_id=checkout_id,
                status="failed",
                message=customer_msg or response_desc or f"Request failed: {response_code}"
            )
            
    except httpx.HTTPStatusError as e:
        error_text = e.response.text
        logger.error(f"STK Push HTTP error: {e.response.status_code} - {error_text}")
        
        # Try to parse error response
        try:
            error_data = e.response.json()
            error_message = error_data.get("errorMessage", str(e.response.status_code))
        except:
            error_message = f"API error: {e.response.status_code}"
        
        return MpesaDepositResponse(
            checkout_request_id="",
            status="error",
            message=error_message
        )
        
    except Exception as e:
        logger.error(f"STK Push exception: {str(e)}")
        return MpesaDepositResponse(
            checkout_request_id="",
            status="error",
            message=f"Request failed: {str(e)}"
        )


def query_stk_status(checkout_request_id: str) -> Dict[str, Any]:
    """
    Query the status of an STK Push transaction
    
    Args:
        checkout_request_id: The CheckoutRequestID from STK Push response
        
    Returns:
        Dict with transaction status and details
    """
    try:
        token = _get_daraja_token()
    except Exception as e:
        return {
            "status": "error",
            "message": f"Authentication failed: {str(e)}"
        }
    
    base_url = get_api_base_url()
    url = f"{base_url}/mpesa/stkpushquery/v1/query"
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    password = generate_password(MPESA_SHORTCODE, MPESA_PASSKEY, timestamp)
    
    payload = {
        "BusinessShortCode": MPESA_SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "CheckoutRequestID": checkout_request_id
    }
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        logger.info(f"Querying STK status for: {checkout_request_id}")
        resp = httpx.post(url, json=payload, headers=headers, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        
        result_code = data.get("ResultCode", "")
        result_desc = data.get("ResultDesc", "")
        
        logger.info(f"STK Query response: Code={result_code}, Desc={result_desc}")
        
        if result_code == MpesaResultCode.SUCCESS:
            status = TransactionStatus.COMPLETED
        elif result_code == MpesaResultCode.USER_CANCELLED:
            status = TransactionStatus.CANCELLED
        elif result_code in [MpesaResultCode.TIMEOUT]:
            status = TransactionStatus.FAILED
        else:
            status = TransactionStatus.PENDING
        
        return {
            "status": status,
            "result_code": result_code,
            "result_desc": result_desc,
            "checkout_request_id": checkout_request_id
        }
        
    except httpx.HTTPStatusError as e:
        logger.error(f"STK Query HTTP error: {e.response.status_code} - {e.response.text}")
        return {
            "status": "error",
            "message": f"Query failed: {e.response.status_code}"
        }
        
    except Exception as e:
        logger.error(f"STK Query exception: {str(e)}")
        return {
            "status": "error",
            "message": f"Query failed: {str(e)}"
        }


def process_mpesa_callback(callback_data: Dict[str, Any], db: Session) -> Dict[str, Any]:
    """
    Process M-PESA STK Push callback and update transaction
    
    This is called by Safaricom after the customer completes/cancels the payment.
    
    Args:
        callback_data: Callback payload from M-PESA
        db: Database session
        
    Returns:
        Dict with ResultCode and ResultDesc for M-PESA
    """
    try:
        # Extract callback data
        body = callback_data.get("Body", {})
        stk_callback = body.get("stkCallback", {})
        
        result_code = stk_callback.get("ResultCode")
        result_desc = stk_callback.get("ResultDesc", "")
        checkout_request_id = stk_callback.get("CheckoutRequestID", "")
        merchant_request_id = stk_callback.get("MerchantRequestID", "")
        
        logger.info(
            f"Processing callback: CheckoutID={checkout_request_id}, "
            f"Code={result_code}, Desc={result_desc}"
        )
        
        if result_code == 0:  # Success
            # Extract payment details from callback metadata
            callback_metadata = stk_callback.get("CallbackMetadata", {}).get("Item", [])
            
            amount = 0
            mpesa_receipt = ""
            phone_number = ""
            transaction_date = ""
            
            for item in callback_metadata:
                name = item.get("Name", "")
                if name == "Amount":
                    amount = float(item.get("Value", 0))
                elif name == "MpesaReceiptNumber":
                    mpesa_receipt = item.get("Value", "")
                elif name == "PhoneNumber":
                    phone_number = str(item.get("Value", ""))
                elif name == "TransactionDate":
                    transaction_date = str(item.get("Value", ""))
            
            logger.info(
                f"Payment successful: Receipt={mpesa_receipt}, "
                f"Amount={amount}, Phone={phone_number}"
            )
            
            # Find or create transaction
            transaction = db.query(Transaction).filter(
                Transaction.provider_reference == checkout_request_id
            ).first()
            
            if not transaction:
                # Create new transaction
                # Try to find user by phone
                user = db.query(User).filter(User.phone == phone_number).first()
                
                if not user:
                    # Try without country code
                    phone_local = phone_number.replace("254", "0", 1) if phone_number.startswith("254") else phone_number
                    user = db.query(User).filter(User.phone == phone_local).first()
                
                if user:
                    # Get or determine account_id
                    account_id = None
                    account = None
                    
                    # Try to find account from pending transaction or use primary account
                    primary_account = db.query(Account).filter(
                        Account.user_id == user.id,
                        Account.is_primary == True,
                        Account.is_active == True
                    ).first()
                    
                    if primary_account:
                        account_id = primary_account.id
                        account = primary_account
                    
                    transaction = Transaction(
                        id=str(uuid.uuid4()),
                        user_id=user.id,
                        account_id=account_id,
                        type="deposit",
                        method="mpesa",
                        amount=amount,
                        status=TransactionStatus.COMPLETED,
                        provider_reference=mpesa_receipt or checkout_request_id
                    )
                    db.add(transaction)
                    
                    # Credit broker account if available
                    if account:
                        account.balance = float(account.balance) + amount
                        account.total_deposits = float(account.total_deposits) + amount
                        logger.info(f"Credited broker account {account.id}: {amount}")
                    
                    # Also update portfolio for backward compatibility
                    portfolio = db.query(Portfolio).filter(Portfolio.user_id == user.id).first()
                    if portfolio:
                        portfolio.cash = float(portfolio.cash) + amount
                        portfolio.buying_power = float(portfolio.buying_power) + amount
                        portfolio.total_value = float(portfolio.total_value) + amount
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
                    logger.info(f"Transaction completed: User={user.email}, Amount={amount}, Account={account_id}")
                else:
                    logger.warning(f"User not found for phone: {phone_number}")
                    return {
                        "ResultCode": 1,
                        "ResultDesc": "User not found"
                    }
            else:
                # Update existing transaction
                transaction.status = TransactionStatus.COMPLETED
                transaction.provider_reference = mpesa_receipt or checkout_request_id
                
                # Credit broker account if specified
                if transaction.account_id:
                    account = db.query(Account).filter(Account.id == transaction.account_id).first()
                    if account:
                        account.balance = float(account.balance) + float(transaction.amount)
                        account.total_deposits = float(account.total_deposits) + float(transaction.amount)
                        logger.info(f"Credited broker account {account.id}: {transaction.amount}")
                
                # Update portfolio for backward compatibility
                portfolio = db.query(Portfolio).filter(Portfolio.user_id == transaction.user_id).first()
                if portfolio:
                    portfolio.cash = float(portfolio.cash) + float(transaction.amount)
                    portfolio.buying_power = float(portfolio.buying_power) + float(transaction.amount)
                    portfolio.total_value = float(portfolio.total_value) + float(transaction.amount)
                
                db.commit()
                logger.info(f"Transaction updated: Receipt={mpesa_receipt}, Account={transaction.account_id}")
            
            return {
                "ResultCode": 0,
                "ResultDesc": "Success"
            }
            
        else:
            # Failed or cancelled transaction
            logger.warning(f"Transaction failed/cancelled: Code={result_code}, Desc={result_desc}")
            
            transaction = db.query(Transaction).filter(
                Transaction.provider_reference == checkout_request_id
            ).first()
            
            if transaction:
                if result_code == 1032:  # User cancelled
                    transaction.status = TransactionStatus.CANCELLED
                else:
                    transaction.status = TransactionStatus.FAILED
                db.commit()
            
            return {
                "ResultCode": result_code,
                "ResultDesc": result_desc
            }
    
    except Exception as e:
        logger.error(f"Callback processing error: {str(e)}", exc_info=True)
        return {
            "ResultCode": 1,
            "ResultDesc": f"Internal error: {str(e)}"
        }


def initiate_mpesa_withdrawal(
    phone_number: str,
    amount: float,
    user_id: str,
    db: Session
) -> Dict[str, Any]:
    """
    Initiate B2C M-PESA withdrawal (Business to Customer payment)
    
    This sends money from the business to a customer's M-PESA account.
    
    Args:
        phone_number: Customer's phone number
        amount: Amount to send
        user_id: User ID for balance checking
        db: Database session
        
    Returns:
        Dict with status and details
    """
    # Validate phone number
    is_valid, phone_or_error = validate_phone_number(phone_number)
    if not is_valid:
        return {
            "status": "error",
            "message": phone_or_error
        }
    
    phone_number = phone_or_error
    
    # Validate amount
    if amount < 10:
        return {
            "status": "error",
            "message": "Minimum withdrawal amount is KES 10"
        }
    
    # Check user balance
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == user_id).first()
    if not portfolio or float(portfolio.cash) < amount:
        return {
            "status": "error",
            "message": "Insufficient balance"
        }
    
    try:
        # Get OAuth token
        token = _get_daraja_token()
        
        # B2C API endpoint
        base_url = get_api_base_url()
        url = f"{base_url}/mpesa/b2c/v1/paymentrequest"
        
        # Generate security credential
        # Note: In production, use actual certificate and encrypt initiator password
        # For sandbox, use test credential
        security_credential = base64.b64encode(b"Safaricom999!*!").decode()
        
        payload = {
            "InitiatorName": "testapi",
            "SecurityCredential": security_credential,
            "CommandID": "BusinessPayment",
            "Amount": int(amount),
            "PartyA": MPESA_SHORTCODE,
            "PartyB": phone_number,
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
            status=TransactionStatus.PENDING,
            provider_reference=""
        )
        db.add(transaction)
        db.commit()
        
        # Make B2C request
        logger.info(f"Initiating B2C: Phone={phone_number}, Amount={amount}")
        resp = httpx.post(url, json=payload, headers=headers, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        
        conversation_id = data.get("ConversationID", "")
        originator_conversation_id = data.get("OriginatorConversationID", "")
        response_code = data.get("ResponseCode", "")
        response_desc = data.get("ResponseDescription", "")
        
        logger.info(f"B2C response: Code={response_code}, ConversationID={conversation_id}")
        
        if response_code == "0":
            # Update transaction with conversation ID
            transaction.provider_reference = conversation_id
            
            # Deduct from wallet (will be reversed if withdrawal fails)
            portfolio.cash = float(portfolio.cash) - amount
            portfolio.buying_power = float(portfolio.buying_power) - amount
            
            db.commit()
            
            logger.info(f"B2C withdrawal initiated: ConversationID={conversation_id}")
            
            return {
                "status": "pending",
                "message": "Withdrawal initiated successfully",
                "transaction_id": transaction.id,
                "conversation_id": conversation_id
            }
        else:
            transaction.status = TransactionStatus.FAILED
            db.commit()
            
            logger.warning(f"B2C failed: {response_desc}")
            
            return {
                "status": "failed",
                "message": response_desc or "Withdrawal failed"
            }
    
    except httpx.HTTPStatusError as e:
        logger.error(f"B2C HTTP error: {e.response.status_code} - {e.response.text}")
        return {
            "status": "error",
            "message": f"API error: {e.response.status_code}"
        }
    except Exception as e:
        logger.error(f"B2C withdrawal error: {str(e)}", exc_info=True)
        return {
            "status": "error",
            "message": f"Failed to initiate withdrawal: {str(e)}"
        }


def process_b2c_result(result_data: Dict[str, Any], db: Session) -> Dict[str, Any]:
    """
    Process B2C result callback from M-PESA
    
    This is called by Safaricom after B2C payment completes or fails.
    
    Args:
        result_data: Result payload from M-PESA
        db: Database session
        
    Returns:
        Dict with ResultCode and ResultDesc
    """
    try:
        result = result_data.get("Result", {})
        result_code = result.get("ResultCode")
        result_desc = result.get("ResultDesc", "")
        conversation_id = result.get("ConversationID", "")
        originator_conversation_id = result.get("OriginatorConversationID", "")
        transaction_id = result.get("TransactionID", "")
        
        logger.info(
            f"Processing B2C result: ConversationID={conversation_id}, "
            f"Code={result_code}, Desc={result_desc}"
        )
        
        # Find transaction by conversation ID
        transaction = db.query(Transaction).filter(
            Transaction.provider_reference == conversation_id
        ).first()
        
        if not transaction:
            logger.warning(f"Transaction not found for ConversationID: {conversation_id}")
            return {
                "ResultCode": 1,
                "ResultDesc": "Transaction not found"
            }
        
        if result_code == 0:  # Success
            transaction.status = TransactionStatus.COMPLETED
            
            # Extract result parameters
            result_parameters = result.get("ResultParameters", {}).get("ResultParameter", [])
            for param in result_parameters:
                key = param.get("Key", "")
                if key == "TransactionReceipt":
                    transaction.provider_reference = param.get("Value", conversation_id)
                    break
            
            db.commit()
            logger.info(f"B2C completed: TransactionID={transaction_id}")
            
        else:  # Failed
            transaction.status = TransactionStatus.FAILED
            
            # Refund the amount back to user's wallet
            portfolio = db.query(Portfolio).filter(Portfolio.user_id == transaction.user_id).first()
            if portfolio:
                portfolio.cash = float(portfolio.cash) + float(transaction.amount)
                portfolio.buying_power = float(portfolio.buying_power) + float(transaction.amount)
            
            db.commit()
            logger.warning(f"B2C failed: {result_desc}")
        
        return {
            "ResultCode": 0,
            "ResultDesc": "Accepted"
        }
        
    except Exception as e:
        logger.error(f"B2C result processing error: {str(e)}", exc_info=True)
        return {
            "ResultCode": 1,
            "ResultDesc": f"Internal error: {str(e)}"
        }


def get_transaction_history(
    user_id: str,
    db: Session,
    limit: int = 50,
    transaction_type: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get user transaction history
    
    Args:
        user_id: User ID
        db: Database session
        limit: Maximum number of transactions to return
        transaction_type: Filter by type (deposit, withdrawal)
        
    Returns:
        Dict with transactions list and count
    """
    try:
        query = db.query(Transaction).filter(Transaction.user_id == user_id)
        
        if transaction_type:
            query = query.filter(Transaction.type == transaction_type)
        
        transactions = query.order_by(Transaction.created_at.desc()).limit(limit).all()
        
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
        logger.error(f"Failed to get transaction history: {str(e)}")
        raise

