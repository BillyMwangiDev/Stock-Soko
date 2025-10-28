"""
NSE (Nairobi Securities Exchange) API Provider
Documentation: https://www.nse.co.ke/dataservices/api-specification-documents/

NOTE: NSE API requires direct contact and credentials from NSE Data Services
Contact: dataservices@nse.co.ke | +254 202831000

API Types Available:
1. Equities Trading Gateway (FIX 5.0) - For trading
2. Equities Market Data Feed (MITCH - UDP) - Real-time market data
3. Bonds and Derivatives MITS Market Data API - Bonds/derivatives data
4. NSE Widgets API - Ticker and investor relations widgets

This provider implements a mock/sandbox version until official credentials are obtained.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import httpx
from ..config import NSE_API_KEY, NSE_API_SECRET, NSE_API_BASE_URL
from ..utils.logging import get_logger
from .market_data_providers import MarketDataProvider, cache

logger = get_logger("nse_provider")


class NSEProvider(MarketDataProvider):
    """
    NSE (Nairobi Securities Exchange) API Provider
    
    INTEGRATION STATUS: SANDBOX MODE
    
    To activate live NSE API:
    1. Contact NSE Data Services: dataservices@nse.co.ke
    2. Obtain API credentials and base URL
    3. Set environment variables:
       - NSE_API_KEY
       - NSE_API_SECRET
       - NSE_API_BASE_URL
    4. Choose integration type (FIX, MITCH-UDP, or REST)
    """
    
    # Configuration
    BASE_URL = NSE_API_BASE_URL
    API_KEY = NSE_API_KEY
    API_SECRET = NSE_API_SECRET
    
    # NSE-specific symbols (Kenya stocks)
    NSE_SYMBOLS = [
        "SCOM", "KCB", "EQTY", "EABL", "BAT", "KEGN", 
        "SCBK", "COOP", "SAFCOM", "ABSA", "NCBA"
    ]
    
    def __init__(self):
        self.api_key = self.API_KEY
        self.api_secret = self.API_SECRET
        self.base_url = self.BASE_URL
    
    def is_available(self) -> bool:
        """Check if NSE API credentials are configured"""
        return bool(self.api_key and self.api_secret)
    
    def _get_headers(self) -> Dict[str, str]:
        """Generate NSE API authentication headers"""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "X-API-Key": self.api_key,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    
    def _is_nse_symbol(self, symbol: str) -> bool:
        """Check if symbol is a Kenyan/NSE stock"""
        clean_symbol = symbol.replace("NSE:", "").replace("KE:", "").upper()
        return clean_symbol in self.NSE_SYMBOLS or symbol.startswith("NSE:") or symbol.startswith("KE:")
    
    async def get_quote_async(self, symbol: str) -> Dict[str, Any]:
        """
        Get real-time quote from NSE API (async version)
        
        NSE MITCH Protocol Endpoint (when live):
        GET /market-data/equities/quote/{symbol}
        """
        if not self.is_available():
            logger.warning("NSE API not configured, using mock data")
            return self._get_mock_quote(symbol)
        
        cache_key = f"nse_quote_{symbol}"
        cached = cache.get(cache_key)
        if cached:
            return cached
        
        clean_symbol = symbol.replace("NSE:", "").replace("KE:", "")
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/market-data/equities/quote/{clean_symbol}",
                    headers=self._get_headers(),
                    timeout=10.0
                )
                response.raise_for_status()
                data = response.json()
                
                # Normalize NSE response format
                quote = {
                    "symbol": f"NSE:{clean_symbol}",
                    "last_price": data.get("last_price"),
                    "change": data.get("change"),
                    "change_percent": data.get("change_percent"),
                    "volume": data.get("volume"),
                    "high": data.get("high"),
                    "low": data.get("low"),
                    "open": data.get("open"),
                    "close": data.get("close"),
                    "bid": data.get("bid"),
                    "ask": data.get("ask"),
                    "timestamp": data.get("timestamp", datetime.utcnow().isoformat()),
                    "source": "NSE"
                }
                
                cache.set(cache_key, quote)
                return quote
                
        except httpx.HTTPError as e:
            logger.error(f"NSE API error for {symbol}: {e}")
            return self._get_mock_quote(symbol)
    
    def get_quote(self, symbol: str) -> Dict[str, Any]:
        """
        Get real-time quote from NSE API (sync version)
        Fallback to mock data if API not available
        """
        if not self._is_nse_symbol(symbol):
            raise ValueError(f"Symbol {symbol} is not an NSE symbol")
        
        if not self.is_available():
            logger.warning("NSE API not configured, using mock data")
            return self._get_mock_quote(symbol)
        
        cache_key = f"nse_quote_{symbol}"
        cached = cache.get(cache_key)
        if cached:
            return cached
        
        clean_symbol = symbol.replace("NSE:", "").replace("KE:", "")
        
        try:
            with httpx.Client() as client:
                response = client.get(
                    f"{self.base_url}/market-data/equities/quote/{clean_symbol}",
                    headers=self._get_headers(),
                    timeout=10.0
                )
                response.raise_for_status()
                data = response.json()
                
                quote = {
                    "symbol": f"NSE:{clean_symbol}",
                    "last_price": data.get("last_price"),
                    "change": data.get("change"),
                    "change_percent": data.get("change_percent"),
                    "volume": data.get("volume"),
                    "high": data.get("high"),
                    "low": data.get("low"),
                    "open": data.get("open"),
                    "timestamp": data.get("timestamp", datetime.utcnow().isoformat()),
                    "source": "NSE"
                }
                
                cache.set(cache_key, quote)
                return quote
                
        except httpx.HTTPError as e:
            logger.error(f"NSE API error for {symbol}: {e}")
            return self._get_mock_quote(symbol)
    
    def get_historical(self, symbol: str, interval: str = "1day", 
                      outputsize: int = 30) -> List[Dict[str, Any]]:
        """
        Get historical price data from NSE
        
        NSE Endpoint (when live):
        GET /market-data/equities/historical/{symbol}
        Query params: interval, from_date, to_date
        """
        if not self.is_available():
            return self._get_mock_historical(symbol, outputsize)
        
        clean_symbol = symbol.replace("NSE:", "").replace("KE:", "")
        
        try:
            with httpx.Client() as client:
                response = client.get(
                    f"{self.base_url}/market-data/equities/historical/{clean_symbol}",
                    headers=self._get_headers(),
                    params={
                        "interval": interval,
                        "limit": outputsize
                    },
                    timeout=15.0
                )
                response.raise_for_status()
                return response.json().get("data", [])
                
        except httpx.HTTPError as e:
            logger.error(f"NSE historical data error: {e}")
            return self._get_mock_historical(symbol, outputsize)
    
    def get_movers(self) -> Dict[str, List[Dict[str, Any]]]:
        """
        Get top gainers and losers from NSE
        
        NSE Endpoint (when live):
        GET /market-data/equities/movers
        """
        if not self.is_available():
            return self._get_mock_movers()
        
        try:
            with httpx.Client() as client:
                response = client.get(
                    f"{self.base_url}/market-data/equities/movers",
                    headers=self._get_headers(),
                    timeout=10.0
                )
                response.raise_for_status()
                data = response.json()
                
                return {
                    "gainers": data.get("gainers", []),
                    "losers": data.get("losers", []),
                    "timestamp": datetime.utcnow().isoformat()
                }
                
        except httpx.HTTPError as e:
            logger.error(f"NSE movers error: {e}")
            return self._get_mock_movers()
    
    def _get_mock_quote(self, symbol: str) -> Dict[str, Any]:
        """Mock quote data for NSE symbols (sandbox mode)"""
        import random
        
        # Mock data for common NSE stocks
        mock_prices = {
            "SCOM": 18.25, "KCB": 22.10, "EQTY": 45.50,
            "EABL": 150.50, "BAT": 420.00, "KEGN": 2.85,
            "SCBK": 158.00, "COOP": 12.50, "SAFCOM": 18.25,
            "ABSA": 12.50, "NCBA": 38.50
        }
        
        clean_symbol = symbol.replace("NSE:", "").replace("KE:", "").upper()
        base_price = mock_prices.get(clean_symbol, 100.00)
        
        return {
            "symbol": f"NSE:{clean_symbol}",
            "last_price": round(base_price * random.uniform(0.98, 1.02), 2),
            "change": round(random.uniform(-2, 2), 2),
            "change_percent": round(random.uniform(-3, 3), 2),
            "volume": random.randint(100000, 10000000),
            "high": round(base_price * 1.02, 2),
            "low": round(base_price * 0.98, 2),
            "open": round(base_price * 1.005, 2),
            "timestamp": datetime.utcnow().isoformat(),
            "source": "NSE_MOCK"
        }
    
    def _get_mock_historical(self, symbol: str, days: int) -> List[Dict[str, Any]]:
        """Mock historical data"""
        import random
        data = []
        base_price = 100.0
        
        for i in range(days):
            date = datetime.utcnow() - timedelta(days=days-i)
            price = base_price * random.uniform(0.95, 1.05)
            data.append({
                "date": date.strftime("%Y-%m-%d"),
                "open": round(price * 0.99, 2),
                "high": round(price * 1.02, 2),
                "low": round(price * 0.97, 2),
                "close": round(price, 2),
                "volume": random.randint(100000, 1000000)
            })
        
        return data
    
    def _get_mock_movers(self) -> Dict[str, List[Dict[str, Any]]]:
        """Mock market movers data"""
        return {
            "gainers": [
                {"symbol": "NSE:EQTY", "price": 45.50, "change_percent": 2.3},
                {"symbol": "NSE:KEGN", "price": 2.85, "change_percent": 1.8},
                {"symbol": "NSE:SCOM", "price": 18.25, "change_percent": 1.2},
            ],
            "losers": [
                {"symbol": "NSE:BAT", "price": 420.00, "change_percent": -1.5},
                {"symbol": "NSE:KCB", "price": 22.10, "change_percent": -0.7},
                {"symbol": "NSE:COOP", "price": 12.50, "change_percent": -0.4},
            ],
            "timestamp": datetime.utcnow().isoformat()
        }


# Singleton instance
nse_provider = NSEProvider()

