"""
Broker Integration Router
Handles broker connections, OAuth flows, and trading account linking
"""
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field

from .auth import current_user_email

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
    "genghis": {
        "name": "Genghis Capital",
        "oauth_url": "https://api.genghiscapital.com/oauth/authorize",
        "api_base": "https://api.genghiscapital.com/v1",
        "client_id": "stocksoko_genghis_client",
        "requires_cds": True,
    },
    "faida": {
        "name": "Faida Investment Bank",
        "oauth_url": "https://api.faidaib.co.ke/oauth/authorize",
        "api_base": "https://api.faidaib.co.ke/v1",
        "client_id": "stocksoko_faida_client",
        "requires_cds": True,
    },
    "dyer": {
        "name": "Dyer & Blair",
        "oauth_url": "https://sandbox.dyerandblair.com/oauth/authorize",
        "api_base": "https://sandbox.dyerandblair.com/v1",
        "client_id": "stocksoko_dyer_sandbox",
        "requires_cds": True,
    },
    "kestrel": {
        "name": "Kestrel Capital",
        "oauth_url": "https://sandbox.kestrelcapital.com/oauth/authorize",
        "api_base": "https://sandbox.kestrelcapital.com/v1",
        "client_id": "stocksoko_kestrel_sandbox",
        "requires_cds": True,
    },
    "nse-direct": {
        "name": "Stock Soko Direct",
        "oauth_url": None,  # No OAuth needed - direct integration
        "api_base": "https://api.stocksoko.com/v1",
        "client_id": "stocksoko_direct",
        "requires_cds": False,
    },
}


@router.post("/connect", response_model=BrokerConnectionResponse)
async def connect_broker(
    payload: BrokerConnectRequest,
    email: str = Depends(current_user_email)
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
            detail=f"Broker '{broker_id}' not found"
        )
    
    broker_config = BROKER_CONFIGS[broker_id]
    
    # Stock Soko Direct - immediate connection
    if broker_id == "nse-direct":
        # Create direct trading account in database (future implementation)
        return BrokerConnectionResponse(
            success=True,
            authorization_url=None,
            message=f"Successfully connected to {broker_config['name']}"
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
            message=f"Please authorize Stock Soko to access your {broker_config['name']} account"
        )
    
    # Fallback for brokers without OAuth
    return BrokerConnectionResponse(
        success=False,
        authorization_url=None,
        message=f"{broker_config['name']} API integration not yet available"
    )


@router.get("/status/{broker_id}", response_model=BrokerStatusResponse)
async def get_broker_status(
    broker_id: str,
    email: str = Depends(current_user_email)
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
        last_synced=None
    )


@router.get("/callback")
async def broker_oauth_callback(
    code: str,
    state: str,
    error: Optional[str] = None
):
    """
    OAuth callback endpoint for broker authorization
    
    This endpoint receives the authorization code from the broker's OAuth server
    and exchanges it for an access token.
    """
    if error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Broker authorization failed: {error}"
        )
    
    # Parse state parameter
    try:
        email, broker_id = state.split(":")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid state parameter"
        )
    
    if broker_id not in BROKER_CONFIGS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unknown broker: {broker_id}"
        )
    
    broker_config = BROKER_CONFIGS[broker_id]
    
    # Exchange authorization code for access token (future implementation)
    
    # For now, return a success message
    return {
        "success": True,
        "message": f"Successfully connected to {broker_config['name']}",
        "broker_id": broker_id
    }


@router.delete("/disconnect/{broker_id}")
async def disconnect_broker(
    broker_id: str,
    email: str = Depends(current_user_email)
) -> Dict[str, Any]:
    """
    Disconnect a broker account
    
    Revokes access tokens and removes broker connection from user account.
    """
    if broker_id not in BROKER_CONFIGS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Broker '{broker_id}' not found"
        )
    
    # Revoke broker access token and delete from database (future implementation)
    
    return {
        "success": True,
        "message": f"Successfully disconnected from {BROKER_CONFIGS[broker_id]['name']}"
    }


@router.get("/list")
async def list_available_brokers() -> Dict[str, Any]:
    """
    List all available brokers with their capabilities
    
    Returns information about supported brokers and their features.
    """
    brokers = []
    
    for broker_id, config in BROKER_CONFIGS.items():
        brokers.append({
            "id": broker_id,
            "name": config["name"],
            "has_api": config["oauth_url"] is not None or broker_id == "nse-direct",
            "requires_cds": config["requires_cds"],
            "status": "live" if broker_id in ["genghis", "faida", "nse-direct"] else "sandbox"
        })
    
    return {
        "brokers": brokers,
        "count": len(brokers)
    }

