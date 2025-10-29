"""
Broker Integration Router
Handles broker connections, OAuth flows, and trading account linking
"""

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..database import get_db
from ..database.models import Account, Broker, User
from ..utils.logging import get_logger
from .auth import current_user_email

logger = get_logger("broker_router")

router = APIRouter(prefix="/broker", tags=["broker"])


class BrokerConnectRequest(BaseModel):
    broker_id: str = Field(..., description="Broker identifier")
    broker_name: str = Field(..., description="Broker display name")


class BrokerConnectionResponse(BaseModel):
    success: bool
    authorization_url: Optional[str] = None
    message: str


class BrokerStatusResponse(BaseModel):
    connected: bool
    broker_id: Optional[str] = None
    broker_name: Optional[str] = None
    account_number: Optional[str] = None
    cds_number: Optional[str] = None
    last_synced: Optional[str] = None


# Broker API configurations
BROKER_CONFIGS = {
    "dyer": {
        "name": "Dyer and Blair",
        "oauth_url": "https://api.dyerandblair.com/oauth/authorize",
        "api_base": "https://api.dyerandblair.com/v1",
        "client_id": "stocksoko_dyer_client",
        "requires_cds": True,
        "platforms": ["android", "ios"],
        "status": "live",
    },
    "kingdom": {
        "name": "Kingdom Securities",
        "oauth_url": "https://api.kingdomsecurities.co.ke/oauth/authorize",
        "api_base": "https://api.kingdomsecurities.co.ke/v1",
        "client_id": "stocksoko_kingdom_client",
        "requires_cds": True,
        "platforms": ["android"],
        "status": "live",
    },
    "aib-axys": {
        "name": "AIB-AXYS Africa Ltd",
        "oauth_url": "https://api.aib-axys.com/oauth/authorize",
        "api_base": "https://api.aib-axys.com/v1",
        "client_id": "stocksoko_aibaxys_client",
        "requires_cds": True,
        "platforms": ["android", "ios"],
        "status": "live",
    },
    "sterling": {
        "name": "Sterling",
        "oauth_url": "https://api.sterling.co.ke/oauth/authorize",
        "api_base": "https://api.sterling.co.ke/v1",
        "client_id": "stocksoko_sterling_client",
        "requires_cds": True,
        "platforms": ["android", "ios"],
        "status": "live",
    },
    "faida": {
        "name": "Faida Investment Bank",
        "oauth_url": "https://api.faidaib.co.ke/oauth/authorize",
        "api_base": "https://api.faidaib.co.ke/v1",
        "client_id": "stocksoko_faida_client",
        "requires_cds": True,
        "platforms": ["android", "ios"],
        "status": "live",
    },
    "ncba": {
        "name": "NCBA",
        "oauth_url": "https://api.ncba.co.ke/oauth/authorize",
        "api_base": "https://api.ncba.co.ke/v1",
        "client_id": "stocksoko_ncba_client",
        "requires_cds": True,
        "platforms": ["android", "ios"],
        "status": "live",
    },
    "genghis": {
        "name": "Genghis",
        "oauth_url": "https://api.genghiscapital.com/oauth/authorize",
        "api_base": "https://api.genghiscapital.com/v1",
        "client_id": "stocksoko_genghis_client",
        "requires_cds": True,
        "platforms": ["android", "ios"],
        "status": "live",
    },
    "efg-hermes": {
        "name": "EFG Hermes",
        "oauth_url": "https://api.efghermes.com/oauth/authorize",
        "api_base": "https://api.efghermes.com/v1",
        "client_id": "stocksoko_efghermes_client",
        "requires_cds": True,
        "platforms": ["android", "ios"],
        "status": "live",
    },
}


@router.post("/connect", response_model=BrokerConnectionResponse)
async def connect_broker(
    payload: BrokerConnectRequest, email: str = Depends(current_user_email)
) -> BrokerConnectionResponse:
    """
    Initiate broker connection and OAuth flow

    For brokers with APIs, this generates an OAuth authorization URL.
    For Stock Soko Direct, it creates an immediate connection.
    """
    broker_id = payload.broker_id

    if broker_id not in BROKER_CONFIGS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Broker '{broker_id}' not found",
        )

    broker_config = BROKER_CONFIGS[broker_id]

    # Stock Soko Direct - immediate connection
    if broker_id == "nse-direct":
        # Create direct trading account in database (future implementation)
        return BrokerConnectionResponse(
            success=True,
            authorization_url=None,
            message=f"Successfully connected to {broker_config['name']}",
        )

    # OAuth-based brokers
    if broker_config["oauth_url"]:
        # Generate OAuth authorization URL
        # In production, this would include:
        # - state parameter for CSRF protection
        # - redirect_uri for callback
        # - scope for requested permissions

        redirect_uri = "https://stocksoko.com/broker/callback"
        state = f"{email}:{broker_id}"  # In production, use secure token

        auth_url = (
            f"{broker_config['oauth_url']}"
            f"?client_id={broker_config['client_id']}"
            f"&redirect_uri={redirect_uri}"
            f"&state={state}"
            f"&response_type=code"
            f"&scope=trading,account,portfolio"
        )

        return BrokerConnectionResponse(
            success=True,
            authorization_url=auth_url,
            message=f"Please authorize Stock Soko to access your {broker_config['name']} account",
        )

    # Fallback for brokers without OAuth
    return BrokerConnectionResponse(
        success=False,
        authorization_url=None,
        message=f"{broker_config['name']} API integration not yet available",
    )


@router.get("/status/{broker_id}", response_model=BrokerStatusResponse)
async def get_broker_status(
    broker_id: str, email: str = Depends(current_user_email)
) -> BrokerStatusResponse:
    """
    Check broker connection status for the current user

    Returns connection details if broker is connected, otherwise returns disconnected status.
    """
    # Query database for user's broker connection (future implementation)

    return BrokerStatusResponse(
        connected=False,
        broker_id=None,
        broker_name=None,
        account_number=None,
        cds_number=None,
        last_synced=None,
    )


@router.get("/callback")
async def broker_oauth_callback(code: str, state: str, error: Optional[str] = None):
    """
    OAuth callback endpoint for broker authorization

    This endpoint receives the authorization code from the broker's OAuth server
    and exchanges it for an access token.
    """
    if error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Broker authorization failed: {error}",
        )

    # Parse state parameter
    try:
        email, broker_id = state.split(":")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid state parameter"
        )

    if broker_id not in BROKER_CONFIGS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Unknown broker: {broker_id}"
        )

    broker_config = BROKER_CONFIGS[broker_id]

    # Exchange authorization code for access token (future implementation)

    # For now, return a success message
    return {
        "success": True,
        "message": f"Successfully connected to {broker_config['name']}",
        "broker_id": broker_id,
    }


@router.delete("/disconnect/{broker_id}")
async def disconnect_broker(
    broker_id: str, email: str = Depends(current_user_email)
) -> Dict[str, Any]:
    """
    Disconnect a broker account

    Revokes access tokens and removes broker connection from user account.
    """
    if broker_id not in BROKER_CONFIGS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Broker '{broker_id}' not found",
        )

    # Revoke broker access token and delete from database (future implementation)

    return {
        "success": True,
        "message": f"Successfully disconnected from {BROKER_CONFIGS[broker_id]['name']}",
    }


@router.get("/list")
async def list_available_brokers() -> Dict[str, Any]:
    """
    List all available brokers with their capabilities

    Returns information about supported brokers and their features.
    """
    brokers = []

    for broker_id, config in BROKER_CONFIGS.items():
        brokers.append(
            {
                "id": broker_id,
                "name": config["name"],
                "has_api": config["oauth_url"] is not None,
                "requires_cds": config["requires_cds"],
                "status": config.get("status", "live"),
                "platforms": config.get("platforms", ["android", "ios"]),
                "android_available": "android" in config.get("platforms", []),
                "ios_available": "ios" in config.get("platforms", []),
            }
        )

    return {"brokers": brokers, "count": len(brokers)}


class BrokerAccountBalance(BaseModel):
    """Broker account balance response"""

    account_id: str
    broker_id: str
    broker_name: str
    balance: float
    reserved_balance: float
    available_balance: float
    total_deposits: float
    total_withdrawals: float
    is_primary: bool
    status: str


@router.get("/accounts", response_model=List[BrokerAccountBalance])
async def get_user_broker_accounts(
    email: str = Depends(current_user_email), db: Session = Depends(get_db)
) -> List[BrokerAccountBalance]:
    """
    Get all broker accounts for the current user with their balances

    Returns a list of all connected broker accounts with:
    - Current balance
    - Reserved balance (for pending orders)
    - Available balance for trading
    - Lifetime deposits and withdrawals
    """
    try:
        # Get user
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Get all accounts
        accounts = (
            db.query(Account).join(Broker).filter(Account.user_id == user.id).all()
        )

        if not accounts:
            return []

        # Build response
        result = []
        for account in accounts:
            balance = float(account.balance) if account.balance else 0.0
            reserved = (
                float(account.reserved_balance) if account.reserved_balance else 0.0
            )

            result.append(
                BrokerAccountBalance(
                    account_id=account.id,
                    broker_id=account.broker_id,
                    broker_name=account.broker.name,
                    balance=balance,
                    reserved_balance=reserved,
                    available_balance=balance - reserved,
                    total_deposits=(
                        float(account.total_deposits) if account.total_deposits else 0.0
                    ),
                    total_withdrawals=(
                        float(account.total_withdrawals)
                        if account.total_withdrawals
                        else 0.0
                    ),
                    is_primary=account.is_primary,
                    status=account.status,
                )
            )

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get broker accounts: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch accounts: {str(e)}"
        )


@router.get("/accounts/{account_id}", response_model=BrokerAccountBalance)
async def get_broker_account_balance(
    account_id: str,
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db),
) -> BrokerAccountBalance:
    """
    Get balance for a specific broker account

    Returns detailed balance information including:
    - Current balance
    - Reserved balance (for pending orders)
    - Available balance for new trades
    """
    try:
        # Get user
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Get account
        account = (
            db.query(Account)
            .join(Broker)
            .filter(Account.id == account_id, Account.user_id == user.id)
            .first()
        )

        if not account:
            raise HTTPException(status_code=404, detail="Broker account not found")

        balance = float(account.balance) if account.balance else 0.0
        reserved = float(account.reserved_balance) if account.reserved_balance else 0.0

        return BrokerAccountBalance(
            account_id=account.id,
            broker_id=account.broker_id,
            broker_name=account.broker.name,
            balance=balance,
            reserved_balance=reserved,
            available_balance=balance - reserved,
            total_deposits=(
                float(account.total_deposits) if account.total_deposits else 0.0
            ),
            total_withdrawals=(
                float(account.total_withdrawals) if account.total_withdrawals else 0.0
            ),
            is_primary=account.is_primary,
            status=account.status,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get broker account: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch account: {str(e)}"
        )


@router.post("/accounts/{account_id}/set-primary")
async def set_primary_account(
    account_id: str,
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Set a broker account as the primary trading account

    The primary account will be used as the default for:
    - M-PESA deposits (when no account_id specified)
    - New trades (when no account selected)
    """
    try:
        # Get user
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Get the account to set as primary
        account = (
            db.query(Account)
            .filter(Account.id == account_id, Account.user_id == user.id)
            .first()
        )

        if not account:
            raise HTTPException(status_code=404, detail="Broker account not found")

        # Remove primary flag from all user's accounts
        db.query(Account).filter(Account.user_id == user.id).update(
            {"is_primary": False}
        )

        # Set this account as primary
        account.is_primary = True
        db.commit()

        logger.info(f"Set account {account_id} as primary for user {user.email}")

        return {
            "success": True,
            "message": f"Account set as primary",
            "account_id": account_id,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to set primary account: {e}")
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Failed to set primary account: {str(e)}"
        )
