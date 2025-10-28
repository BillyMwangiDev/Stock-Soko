"""
Tests for M-PESA Daraja API Integration

This module tests all M-PESA functionality including:
- Phone number validation
- STK Push initiation
- STK status query
- Callback processing
- B2C withdrawals
- Transaction history
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime
import uuid

from backend.app.services.mpesa_service import (
    validate_phone_number,
    initiate_mpesa_stk,
    query_stk_status,
    process_mpesa_callback,
    initiate_mpesa_withdrawal,
    get_transaction_history,
    process_b2c_result,
    generate_password,
    MpesaResultCode,
    TransactionStatus
)
from backend.app.schemas.payments import MpesaDepositRequest
from backend.app.database.models import User, Portfolio, Transaction


class TestPhoneValidation:
    """Test phone number validation and formatting"""
    
    def test_valid_phone_with_country_code(self):
        """Test phone number already in correct format"""
        is_valid, phone = validate_phone_number("254712345678")
        assert is_valid is True
        assert phone == "254712345678"
    
    def test_valid_phone_with_plus(self):
        """Test phone number with + prefix"""
        is_valid, phone = validate_phone_number("+254712345678")
        assert is_valid is True
        assert phone == "254712345678"
    
    def test_valid_phone_with_zero(self):
        """Test phone number starting with 0"""
        is_valid, phone = validate_phone_number("0712345678")
        assert is_valid is True
        assert phone == "254712345678"
    
    def test_valid_phone_without_prefix(self):
        """Test phone number without any prefix"""
        is_valid, phone = validate_phone_number("712345678")
        assert is_valid is True
        assert phone == "254712345678"
    
    def test_valid_phone_with_spaces(self):
        """Test phone number with spaces"""
        is_valid, phone = validate_phone_number("0712 345 678")
        assert is_valid is True
        assert phone == "254712345678"
    
    def test_valid_phone_with_dashes(self):
        """Test phone number with dashes"""
        is_valid, phone = validate_phone_number("0712-345-678")
        assert is_valid is True
        assert phone == "254712345678"
    
    def test_invalid_phone_too_short(self):
        """Test phone number too short"""
        is_valid, error = validate_phone_number("07123456")
        assert is_valid is False
        assert "12 digits" in error
    
    def test_invalid_phone_too_long(self):
        """Test phone number too long"""
        is_valid, error = validate_phone_number("07123456789012")
        assert is_valid is False
        assert "12 digits" in error
    
    def test_invalid_phone_wrong_country(self):
        """Test phone number with wrong country code"""
        is_valid, error = validate_phone_number("255712345678")
        assert is_valid is False
    
    def test_invalid_network_prefix(self):
        """Test phone number with invalid network"""
        is_valid, error = validate_phone_number("0512345678")
        assert is_valid is False
        assert "network" in error.lower()
    
    def test_airtel_phone_number(self):
        """Test Airtel phone number"""
        is_valid, phone = validate_phone_number("0110123456")
        assert is_valid is True
        assert phone == "254110123456"
    
    def test_telkom_phone_number(self):
        """Test Telkom phone number"""
        is_valid, phone = validate_phone_number("0770123456")
        assert is_valid is True
        assert phone == "254770123456"


class TestPasswordGeneration:
    """Test password generation for STK Push"""
    
    def test_password_generation(self):
        """Test password is correctly generated"""
        shortcode = "174379"
        passkey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
        timestamp = "20231215120000"
        
        password = generate_password(shortcode, passkey, timestamp)
        
        # Password should be base64 encoded
        assert isinstance(password, str)
        assert len(password) > 0
        
        # Should be able to decode it
        import base64
        decoded = base64.b64decode(password)
        expected = f"{shortcode}{passkey}{timestamp}"
        assert decoded.decode() == expected


class TestSTKPush:
    """Test STK Push initiation"""
    
    @patch('backend.app.services.mpesa_service._get_daraja_token')
    @patch('backend.app.services.mpesa_service.httpx.post')
    def test_successful_stk_push(self, mock_post, mock_token):
        """Test successful STK Push initiation"""
        # Mock OAuth token
        mock_token.return_value = "test_token_123"
        
        # Mock successful STK Push response
        mock_response = Mock()
        mock_response.json.return_value = {
            "CheckoutRequestID": "ws_CO_12345",
            "MerchantRequestID": "12345-67890",
            "ResponseCode": "0",
            "ResponseDescription": "Success",
            "CustomerMessage": "Success. Request accepted for processing"
        }
        mock_response.raise_for_status = Mock()
        mock_post.return_value = mock_response
        
        # Make request
        request = MpesaDepositRequest(
            phone_number="0712345678",
            amount=100.0
        )
        
        response = initiate_mpesa_stk(request)
        
        # Assertions
        assert response.status == "pending"
        assert response.checkout_request_id == "ws_CO_12345"
        assert "accepted" in response.message.lower() or "sent" in response.message.lower()
        
        # Verify API was called with correct data
        mock_post.assert_called_once()
        call_args = mock_post.call_args
        payload = call_args[1]['json']
        
        assert payload['Amount'] == 100
        assert payload['PhoneNumber'] == "254712345678"
        assert payload['TransactionType'] == "CustomerPayBillOnline"
    
    @patch('backend.app.services.mpesa_service._get_daraja_token')
    def test_stk_push_invalid_phone(self, mock_token):
        """Test STK Push with invalid phone number"""
        mock_token.return_value = "test_token_123"
        
        request = MpesaDepositRequest(
            phone_number="0512345678",  # Invalid network
            amount=100.0
        )
        
        response = initiate_mpesa_stk(request)
        
        assert response.status == "error"
        assert "network" in response.message.lower()
    
    @patch('backend.app.services.mpesa_service._get_daraja_token')
    def test_stk_push_amount_too_low(self, mock_token):
        """Test STK Push with amount below minimum"""
        mock_token.return_value = "test_token_123"
        
        request = MpesaDepositRequest(
            phone_number="0712345678",
            amount=0.5
        )
        
        response = initiate_mpesa_stk(request)
        
        assert response.status == "error"
        assert "minimum" in response.message.lower()
    
    @patch('backend.app.services.mpesa_service._get_daraja_token')
    def test_stk_push_amount_too_high(self, mock_token):
        """Test STK Push with amount above maximum"""
        mock_token.return_value = "test_token_123"
        
        request = MpesaDepositRequest(
            phone_number="0712345678",
            amount=200000.0
        )
        
        response = initiate_mpesa_stk(request)
        
        assert response.status == "error"
        assert "maximum" in response.message.lower()
    
    @patch('backend.app.services.mpesa_service._get_daraja_token')
    @patch('backend.app.services.mpesa_service.httpx.post')
    def test_stk_push_api_error(self, mock_post, mock_token):
        """Test STK Push with API error"""
        mock_token.return_value = "test_token_123"
        
        # Mock API error
        import httpx
        mock_response = Mock()
        mock_response.status_code = 500
        mock_response.text = "Internal Server Error"
        mock_response.json.return_value = {"errorMessage": "Internal error"}
        mock_post.side_effect = httpx.HTTPStatusError(
            "Error", request=Mock(), response=mock_response
        )
        
        request = MpesaDepositRequest(
            phone_number="0712345678",
            amount=100.0
        )
        
        response = initiate_mpesa_stk(request)
        
        assert response.status == "error"
        assert response.checkout_request_id == ""


class TestSTKQuery:
    """Test STK status query"""
    
    @patch('backend.app.services.mpesa_service._get_daraja_token')
    @patch('backend.app.services.mpesa_service.httpx.post')
    def test_query_completed_transaction(self, mock_post, mock_token):
        """Test querying a completed transaction"""
        mock_token.return_value = "test_token_123"
        
        # Mock successful query response
        mock_response = Mock()
        mock_response.json.return_value = {
            "ResultCode": "0",
            "ResultDesc": "The service request is processed successfully",
            "CheckoutRequestID": "ws_CO_12345"
        }
        mock_response.raise_for_status = Mock()
        mock_post.return_value = mock_response
        
        result = query_stk_status("ws_CO_12345")
        
        assert result['status'] == TransactionStatus.COMPLETED
        assert result['result_code'] == "0"
        assert result['checkout_request_id'] == "ws_CO_12345"
    
    @patch('backend.app.services.mpesa_service._get_daraja_token')
    @patch('backend.app.services.mpesa_service.httpx.post')
    def test_query_cancelled_transaction(self, mock_post, mock_token):
        """Test querying a cancelled transaction"""
        mock_token.return_value = "test_token_123"
        
        mock_response = Mock()
        mock_response.json.return_value = {
            "ResultCode": "1032",
            "ResultDesc": "Request cancelled by user",
            "CheckoutRequestID": "ws_CO_12345"
        }
        mock_response.raise_for_status = Mock()
        mock_post.return_value = mock_response
        
        result = query_stk_status("ws_CO_12345")
        
        assert result['status'] == TransactionStatus.CANCELLED
        assert result['result_code'] == "1032"


class TestCallbackProcessing:
    """Test M-PESA callback processing"""
    
    def test_successful_callback_processing(self, db_session):
        """Test processing a successful callback"""
        # Create test user
        user = User(
            id=str(uuid.uuid4()),
            email="test@example.com",
            phone="254712345678",
            password_hash="hash",
            full_name="Test User"
        )
        db_session.add(user)
        
        # Create portfolio
        portfolio = Portfolio(
            user_id=user.id,
            cash=1000.0,
            buying_power=1000.0,
            total_value=1000.0
        )
        db_session.add(portfolio)
        db_session.commit()
        
        # Mock callback data
        callback_data = {
            "Body": {
                "stkCallback": {
                    "ResultCode": 0,
                    "ResultDesc": "The service request is processed successfully.",
                    "CheckoutRequestID": "ws_CO_12345",
                    "MerchantRequestID": "12345-67890",
                    "CallbackMetadata": {
                        "Item": [
                            {"Name": "Amount", "Value": 100.0},
                            {"Name": "MpesaReceiptNumber", "Value": "ABC123XYZ"},
                            {"Name": "PhoneNumber", "Value": 254712345678},
                            {"Name": "TransactionDate", "Value": 20231215120000}
                        ]
                    }
                }
            }
        }
        
        result = process_mpesa_callback(callback_data, db_session)
        
        # Assertions
        assert result["ResultCode"] == 0
        assert result["ResultDesc"] == "Success"
        
        # Check wallet was updated
        db_session.refresh(portfolio)
        assert float(portfolio.cash) == 1100.0
        assert float(portfolio.buying_power) == 1100.0
    
    def test_failed_callback_processing(self, db_session):
        """Test processing a failed callback"""
        callback_data = {
            "Body": {
                "stkCallback": {
                    "ResultCode": 1,
                    "ResultDesc": "Insufficient balance",
                    "CheckoutRequestID": "ws_CO_12345",
                    "MerchantRequestID": "12345-67890"
                }
            }
        }
        
        result = process_mpesa_callback(callback_data, db_session)
        
        # Should acknowledge the callback
        assert result["ResultCode"] == 1
        assert result["ResultDesc"] == "Insufficient balance"


class TestB2CWithdrawal:
    """Test B2C withdrawals"""
    
    @patch('backend.app.services.mpesa_service._get_daraja_token')
    @patch('backend.app.services.mpesa_service.httpx.post')
    def test_successful_withdrawal(self, mock_post, mock_token, db_session):
        """Test successful B2C withdrawal"""
        mock_token.return_value = "test_token_123"
        
        # Create test user with balance
        user = User(
            id=str(uuid.uuid4()),
            email="test@example.com",
            phone="254712345678",
            password_hash="hash",
            full_name="Test User"
        )
        db_session.add(user)
        
        portfolio = Portfolio(
            user_id=user.id,
            cash=5000.0,
            buying_power=5000.0,
            total_value=5000.0
        )
        db_session.add(portfolio)
        db_session.commit()
        
        # Mock successful B2C response
        mock_response = Mock()
        mock_response.json.return_value = {
            "ConversationID": "AG_20231215_12345",
            "OriginatorConversationID": "12345-67890",
            "ResponseCode": "0",
            "ResponseDescription": "Accept the service request successfully."
        }
        mock_response.raise_for_status = Mock()
        mock_post.return_value = mock_response
        
        result = initiate_mpesa_withdrawal("0712345678", 1000.0, user.id, db_session)
        
        assert result['status'] == "pending"
        assert 'conversation_id' in result
        
        # Check balance was deducted
        db_session.refresh(portfolio)
        assert float(portfolio.cash) == 4000.0
    
    def test_withdrawal_insufficient_balance(self, db_session):
        """Test withdrawal with insufficient balance"""
        user = User(
            id=str(uuid.uuid4()),
            email="test@example.com",
            phone="254712345678",
            password_hash="hash",
            full_name="Test User"
        )
        db_session.add(user)
        
        portfolio = Portfolio(
            user_id=user.id,
            cash=500.0,
            buying_power=500.0,
            total_value=500.0
        )
        db_session.add(portfolio)
        db_session.commit()
        
        result = initiate_mpesa_withdrawal("0712345678", 1000.0, user.id, db_session)
        
        assert result['status'] == "error"
        assert "insufficient" in result['message'].lower()
    
    def test_withdrawal_below_minimum(self, db_session):
        """Test withdrawal below minimum amount"""
        user = User(
            id=str(uuid.uuid4()),
            email="test@example.com",
            phone="254712345678",
            password_hash="hash",
            full_name="Test User"
        )
        db_session.add(user)
        
        portfolio = Portfolio(
            user_id=user.id,
            cash=500.0,
            buying_power=500.0,
            total_value=500.0
        )
        db_session.add(portfolio)
        db_session.commit()
        
        result = initiate_mpesa_withdrawal("0712345678", 5.0, user.id, db_session)
        
        assert result['status'] == "error"
        assert "minimum" in result['message'].lower()


class TestB2CResultProcessing:
    """Test B2C result callback processing"""
    
    def test_successful_b2c_result(self, db_session):
        """Test processing successful B2C result"""
        # Create test user and transaction
        user = User(
            id=str(uuid.uuid4()),
            email="test@example.com",
            phone="254712345678",
            password_hash="hash",
            full_name="Test User"
        )
        db_session.add(user)
        
        portfolio = Portfolio(
            user_id=user.id,
            cash=4000.0,
            buying_power=4000.0,
            total_value=4000.0
        )
        db_session.add(portfolio)
        
        transaction = Transaction(
            id=str(uuid.uuid4()),
            user_id=user.id,
            type="withdrawal",
            method="mpesa",
            amount=1000.0,
            status=TransactionStatus.PENDING,
            provider_reference="AG_20231215_12345"
        )
        db_session.add(transaction)
        db_session.commit()
        
        # Mock B2C result
        result_data = {
            "Result": {
                "ResultCode": 0,
                "ResultDesc": "The service request is processed successfully.",
                "ConversationID": "AG_20231215_12345",
                "OriginatorConversationID": "12345-67890",
                "TransactionID": "ABC123XYZ",
                "ResultParameters": {
                    "ResultParameter": [
                        {"Key": "TransactionReceipt", "Value": "ABC123XYZ"},
                        {"Key": "TransactionAmount", "Value": 1000.0}
                    ]
                }
            }
        }
        
        result = process_b2c_result(result_data, db_session)
        
        assert result["ResultCode"] == 0
        
        # Check transaction status
        db_session.refresh(transaction)
        assert transaction.status == TransactionStatus.COMPLETED
    
    def test_failed_b2c_result(self, db_session):
        """Test processing failed B2C result"""
        # Create test user and transaction
        user = User(
            id=str(uuid.uuid4()),
            email="test@example.com",
            phone="254712345678",
            password_hash="hash",
            full_name="Test User"
        )
        db_session.add(user)
        
        portfolio = Portfolio(
            user_id=user.id,
            cash=4000.0,
            buying_power=4000.0,
            total_value=4000.0
        )
        db_session.add(portfolio)
        
        transaction = Transaction(
            id=str(uuid.uuid4()),
            user_id=user.id,
            type="withdrawal",
            method="mpesa",
            amount=1000.0,
            status=TransactionStatus.PENDING,
            provider_reference="AG_20231215_12345"
        )
        db_session.add(transaction)
        db_session.commit()
        
        # Mock failed B2C result
        result_data = {
            "Result": {
                "ResultCode": 1,
                "ResultDesc": "Failed",
                "ConversationID": "AG_20231215_12345",
                "OriginatorConversationID": "12345-67890"
            }
        }
        
        result = process_b2c_result(result_data, db_session)
        
        assert result["ResultCode"] == 0  # We acknowledge receipt
        
        # Check transaction status and balance refund
        db_session.refresh(transaction)
        db_session.refresh(portfolio)
        assert transaction.status == TransactionStatus.FAILED
        assert float(portfolio.cash) == 5000.0  # Balance refunded


class TestTransactionHistory:
    """Test transaction history retrieval"""
    
    def test_get_all_transactions(self, db_session):
        """Test getting all transaction history"""
        user = User(
            id=str(uuid.uuid4()),
            email="test@example.com",
            phone="254712345678",
            password_hash="hash",
            full_name="Test User"
        )
        db_session.add(user)
        
        # Create test transactions
        for i in range(5):
            transaction = Transaction(
                id=str(uuid.uuid4()),
                user_id=user.id,
                type="deposit" if i % 2 == 0 else "withdrawal",
                method="mpesa",
                amount=100.0 * (i + 1),
                status=TransactionStatus.COMPLETED,
                provider_reference=f"REF_{i}"
            )
            db_session.add(transaction)
        
        db_session.commit()
        
        result = get_transaction_history(user.id, db_session, limit=50)
        
        assert result['count'] == 5
        assert len(result['transactions']) == 5
    
    def test_get_filtered_transactions(self, db_session):
        """Test getting filtered transaction history"""
        user = User(
            id=str(uuid.uuid4()),
            email="test@example.com",
            phone="254712345678",
            password_hash="hash",
            full_name="Test User"
        )
        db_session.add(user)
        
        # Create deposits and withdrawals
        for i in range(3):
            transaction = Transaction(
                id=str(uuid.uuid4()),
                user_id=user.id,
                type="deposit",
                method="mpesa",
                amount=100.0,
                status=TransactionStatus.COMPLETED,
                provider_reference=f"DEP_{i}"
            )
            db_session.add(transaction)
        
        for i in range(2):
            transaction = Transaction(
                id=str(uuid.uuid4()),
                user_id=user.id,
                type="withdrawal",
                method="mpesa",
                amount=50.0,
                status=TransactionStatus.COMPLETED,
                provider_reference=f"WITH_{i}"
            )
            db_session.add(transaction)
        
        db_session.commit()
        
        # Get only deposits
        result = get_transaction_history(user.id, db_session, limit=50, transaction_type="deposit")
        
        assert result['count'] == 3
        assert all(txn['type'] == 'deposit' for txn in result['transactions'])
    
    def test_get_transactions_with_limit(self, db_session):
        """Test transaction history with limit"""
        user = User(
            id=str(uuid.uuid4()),
            email="test@example.com",
            phone="254712345678",
            password_hash="hash",
            full_name="Test User"
        )
        db_session.add(user)
        
        # Create 10 transactions
        for i in range(10):
            transaction = Transaction(
                id=str(uuid.uuid4()),
                user_id=user.id,
                type="deposit",
                method="mpesa",
                amount=100.0,
                status=TransactionStatus.COMPLETED,
                provider_reference=f"REF_{i}"
            )
            db_session.add(transaction)
        
        db_session.commit()
        
        # Get only 5
        result = get_transaction_history(user.id, db_session, limit=5)
        
        assert result['count'] == 5
        assert len(result['transactions']) == 5

