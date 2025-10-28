from typing import Dict, Any, List
import httpx
from datetime import datetime
from ..config import config
from ..utils.logging import get_logger

logger = get_logger("marketstack_provider")

MARKETSTACK_API_KEY = config("MARKETSTACK_API_KEY", default="")
MARKETSTACK_BASE_URL = "http://api.marketstack.com/v1"


class MarketStackProvider:
    def __init__(self):
        self.api_key = MARKETSTACK_API_KEY
        self.base_url = MARKETSTACK_BASE_URL
    
    def is_available(self) -> bool:
        return bool(self.api_key)
    
    def _normalize_symbol(self, symbol: str) -> str:
        base = symbol.replace("NSE:", "").replace("KE:", "")
        return f"{base}.XNAI"
    
    def get_quote(self, symbol: str) -> Dict[str, Any]:
        if not self.is_available():
            raise ValueError("MarketStack API key not configured")
        
        normalized_symbol = self._normalize_symbol(symbol)
        
        params = {
            "access_key": self.api_key,
            "symbols": normalized_symbol
        }
        
        try:
            with httpx.Client(timeout=10) as client:
                response = client.get(f"{self.base_url}/eod/latest", params=params)
                response.raise_for_status()
                data = response.json()
                
                if not data.get("data"):
                    raise ValueError("No quote data returned")
                
                quote = data["data"][0]
                
                return {
                    "symbol": symbol,
                    "price": float(quote.get("close", 0)),
                    "open": float(quote.get("open", 0)),
                    "high": float(quote.get("high", 0)),
                    "low": float(quote.get("low", 0)),
                    "volume": int(quote.get("volume", 0)),
                    "change": float(quote.get("close", 0)) - float(quote.get("open", 0)),
                    "change_percent": ((float(quote.get("close", 0)) - float(quote.get("open", 0))) / float(quote.get("open", 1))) * 100,
                    "timestamp": quote.get("date", datetime.now().isoformat()),
                    "provider": "marketstack"
                }
        except Exception as e:
            logger.error(f"MarketStack API error for {symbol}: {e}")
            raise
    
    def get_historical(self, symbol: str, interval: str = "1day", outputsize: int = 30) -> List[Dict[str, Any]]:
        if not self.is_available():
            raise ValueError("MarketStack API key not configured")
        
        normalized_symbol = self._normalize_symbol(symbol)
        
        params = {
            "access_key": self.api_key,
            "symbols": normalized_symbol,
            "limit": outputsize
        }
        
        try:
            with httpx.Client(timeout=15) as client:
                response = client.get(f"{self.base_url}/eod", params=params)
                response.raise_for_status()
                data = response.json()
                
                if not data.get("data"):
                    raise ValueError("No historical data returned")
                
                return [
                    {
                        "datetime": item.get("date"),
                        "open": float(item.get("open", 0)),
                        "high": float(item.get("high", 0)),
                        "low": float(item.get("low", 0)),
                        "close": float(item.get("close", 0)),
                        "volume": int(item.get("volume", 0))
                    }
                    for item in data["data"]
                ]
        except Exception as e:
            logger.error(f"MarketStack historical error for {symbol}: {e}")
            raise
    
    def get_movers(self) -> Dict[str, List[Dict[str, Any]]]:
        logger.warning("MarketStack doesn't have dedicated movers endpoint")
        return {"gainers": [], "losers": []}

