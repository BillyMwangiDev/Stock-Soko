"""
Market Data Providers - Multi-vendor integration
Supports Twelve Data, Alpha Vantage, and Finnhub APIs
"""

import time
from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

import httpx

from ..config import (
    ALPHA_VANTAGE_API_KEY,
    CACHE_TTL_SECONDS,
    FINNHUB_API_KEY,
    MARKET_DATA_PROVIDER,
    MARKETSTACK_API_KEY,
    PRICE_CACHE_TTL,
    TWELVE_DATA_API_KEY,
)
from ..constants import (
    ALPHA_VANTAGE_DAILY_LIMIT,
    DEFAULT_DAILY_API_LIMIT,
    FINNHUB_DAILY_LIMIT,
    SECONDS_PER_DAY,
    TWELVE_DATA_DAILY_LIMIT,
)
from ..exceptions import MarketDataProviderException
from ..utils.logging import get_logger

logger = get_logger("market_data_providers")


# Simple in-memory cache
class SimpleCache:
    def __init__(self, ttl: int = 300):
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.ttl = ttl

    def get(self, key: str) -> Optional[Any]:
        if key in self.cache:
            data, timestamp = self.cache[key].values()
            if time.time() - timestamp < self.ttl:
                return data
            else:
                del self.cache[key]
        return None

    def set(self, key: str, value: Any):
        self.cache[key] = {"data": value, "timestamp": time.time()}

    def clear(self):
        self.cache.clear()


# Global cache instance
cache = SimpleCache(ttl=CACHE_TTL_SECONDS)


class MarketDataProvider(ABC):
    """Base class for market data providers"""

    @abstractmethod
    def get_quote(self, symbol: str) -> Dict[str, Any]:
        """Get current quote for a symbol"""
        pass

    @abstractmethod
    def get_historical(
        self, symbol: str, interval: str = "1day", outputsize: int = 30
    ) -> List[Dict[str, Any]]:
        """Get historical price data"""
        pass

    @abstractmethod
    def get_movers(self) -> Dict[str, List[Dict[str, Any]]]:
        """Get top gainers and losers"""
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """Check if provider API key is configured"""
        pass


class TwelveDataProvider(MarketDataProvider):
    """Twelve Data API Provider - Free tier: 800 calls/day"""

    BASE_URL = "https://api.twelvedata.com"

    def __init__(self):
        self.api_key = TWELVE_DATA_API_KEY

    def is_available(self) -> bool:
        return bool(self.api_key)

    def _normalize_symbol(self, symbol: str) -> str:
        """Convert NSE:SCOM to SCOM for API"""
        return symbol.replace("NSE:", "").replace("KE:", "")

    def get_quote(self, symbol: str) -> Dict[str, Any]:
        """Get real-time quote from Twelve Data"""
        cache_key = f"twelve_quote_{symbol}"
        cached = cache.get(cache_key)
        if cached:
            logger.info(f"Cache hit for {symbol}")
            return cached

        normalized_symbol = self._normalize_symbol(symbol)
        url = f"{self.BASE_URL}/quote"
        params = {
            "symbol": normalized_symbol,
            "apikey": self.api_key,
            "exchange": "NSE",  # Nairobi Securities Exchange
        }

        try:
            with httpx.Client(timeout=10) as client:
                response = client.get(url, params=params)
                response.raise_for_status()
                data = response.json()

                if "code" in data and data["code"] >= 400:
                    raise ValueError(
                        f"API Error: {data.get('message', 'Unknown error')}"
                    )

                result = {
                    "symbol": symbol,
                    "price": float(data.get("close", 0)),
                    "open": float(data.get("open", 0)),
                    "high": float(data.get("high", 0)),
                    "low": float(data.get("low", 0)),
                    "volume": int(data.get("volume", 0)),
                    "change": float(data.get("change", 0)),
                    "change_percent": float(data.get("percent_change", 0)),
                    "timestamp": data.get("timestamp", datetime.now().isoformat()),
                    "provider": "twelve_data",
                }

                cache.set(cache_key, result)
                logger.info(f"Fetched quote for {symbol} from Twelve Data")
                return result
        except Exception as e:
            logger.error(f"Twelve Data API error for {symbol}: {e}")
            raise

    def get_historical(
        self, symbol: str, interval: str = "1day", outputsize: int = 30
    ) -> List[Dict[str, Any]]:
        """Get historical data from Twelve Data"""
        cache_key = f"twelve_hist_{symbol}_{interval}_{outputsize}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        normalized_symbol = self._normalize_symbol(symbol)
        url = f"{self.BASE_URL}/time_series"
        params = {
            "symbol": normalized_symbol,
            "interval": interval,
            "outputsize": outputsize,
            "apikey": self.api_key,
            "exchange": "NSE",
        }

        try:
            with httpx.Client(timeout=15) as client:
                response = client.get(url, params=params)
                response.raise_for_status()
                data = response.json()

                if "values" not in data:
                    raise ValueError("No historical data returned")

                result = [
                    {
                        "datetime": item.get("datetime"),
                        "open": float(item.get("open", 0)),
                        "high": float(item.get("high", 0)),
                        "low": float(item.get("low", 0)),
                        "close": float(item.get("close", 0)),
                        "volume": int(item.get("volume", 0)),
                    }
                    for item in data["values"]
                ]

                cache.set(cache_key, result)
                logger.info(f"Fetched {len(result)} historical records for {symbol}")
                return result
        except Exception as e:
            logger.error(f"Twelve Data historical error for {symbol}: {e}")
            raise

    def get_movers(self) -> Dict[str, List[Dict[str, Any]]]:
        """Get top movers (not directly supported, returns empty)"""
        logger.warning("Twelve Data doesn't have dedicated movers endpoint")
        return {"gainers": [], "losers": []}


class AlphaVantageProvider(MarketDataProvider):
    """Alpha Vantage API Provider - Free tier: 500 calls/day, 5 calls/min"""

    BASE_URL = "https://www.alphavantage.co/query"

    def __init__(self):
        self.api_key = ALPHA_VANTAGE_API_KEY

    def is_available(self) -> bool:
        return bool(self.api_key)

    def _normalize_symbol(self, symbol: str) -> str:
        """Convert NSE:SCOM to SCOM.NSE for API"""
        base = symbol.replace("NSE:", "").replace("KE:", "")
        return f"{base}.NSE"

    def get_quote(self, symbol: str) -> Dict[str, Any]:
        """Get quote from Alpha Vantage"""
        cache_key = f"alpha_quote_{symbol}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        normalized_symbol = self._normalize_symbol(symbol)
        params = {
            "function": "GLOBAL_QUOTE",
            "symbol": normalized_symbol,
            "apikey": self.api_key,
        }

        try:
            with httpx.Client(timeout=10) as client:
                response = client.get(self.BASE_URL, params=params)
                response.raise_for_status()
                data = response.json()

                if "Global Quote" not in data:
                    raise ValueError("No quote data returned")

                quote = data["Global Quote"]
                result = {
                    "symbol": symbol,
                    "price": float(quote.get("05. price", 0)),
                    "open": float(quote.get("02. open", 0)),
                    "high": float(quote.get("03. high", 0)),
                    "low": float(quote.get("04. low", 0)),
                    "volume": int(quote.get("06. volume", 0)),
                    "change": float(quote.get("09. change", 0)),
                    "change_percent": float(
                        quote.get("10. change percent", "0").replace("%", "")
                    ),
                    "timestamp": quote.get(
                        "07. latest trading day", datetime.now().isoformat()
                    ),
                    "provider": "alpha_vantage",
                }

                cache.set(cache_key, result)
                logger.info(f"Fetched quote for {symbol} from Alpha Vantage")
                return result
        except Exception as e:
            logger.error(f"Alpha Vantage API error for {symbol}: {e}")
            raise

    def get_historical(
        self, symbol: str, interval: str = "1day", outputsize: int = 30
    ) -> List[Dict[str, Any]]:
        """Get historical data from Alpha Vantage"""
        cache_key = f"alpha_hist_{symbol}_{interval}_{outputsize}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        normalized_symbol = self._normalize_symbol(symbol)
        params = {
            "function": "TIME_SERIES_DAILY",
            "symbol": normalized_symbol,
            "outputsize": "compact" if outputsize <= 100 else "full",
            "apikey": self.api_key,
        }

        try:
            with httpx.Client(timeout=15) as client:
                response = client.get(self.BASE_URL, params=params)
                response.raise_for_status()
                data = response.json()

                if "Time Series (Daily)" not in data:
                    raise ValueError("No historical data returned")

                time_series = data["Time Series (Daily)"]
                result = [
                    {
                        "datetime": date,
                        "open": float(values.get("1. open", 0)),
                        "high": float(values.get("2. high", 0)),
                        "low": float(values.get("3. low", 0)),
                        "close": float(values.get("4. close", 0)),
                        "volume": int(values.get("5. volume", 0)),
                    }
                    for date, values in list(time_series.items())[:outputsize]
                ]

                cache.set(cache_key, result)
                logger.info(f"Fetched {len(result)} historical records for {symbol}")
                return result
        except Exception as e:
            logger.error(f"Alpha Vantage historical error for {symbol}: {e}")
            raise

    def get_movers(self) -> Dict[str, List[Dict[str, Any]]]:
        """Get top gainers/losers from Alpha Vantage"""
        cache_key = "alpha_movers"
        cached = cache.get(cache_key)
        if cached:
            return cached

        params = {"function": "TOP_GAINERS_LOSERS", "apikey": self.api_key}

        try:
            with httpx.Client(timeout=10) as client:
                response = client.get(self.BASE_URL, params=params)
                response.raise_for_status()
                data = response.json()

                result = {
                    "gainers": [
                        {
                            "symbol": item["ticker"],
                            "price": float(item["price"]),
                            "change_percent": float(
                                item["change_percentage"].replace("%", "")
                            ),
                            "volume": int(item["volume"]),
                        }
                        for item in data.get("top_gainers", [])[:5]
                    ],
                    "losers": [
                        {
                            "symbol": item["ticker"],
                            "price": float(item["price"]),
                            "change_percent": float(
                                item["change_percentage"].replace("%", "")
                            ),
                            "volume": int(item["volume"]),
                        }
                        for item in data.get("top_losers", [])[:5]
                    ],
                }

                cache.set(cache_key, result)
                logger.info("Fetched movers from Alpha Vantage")
                return result
        except Exception as e:
            logger.error(f"Alpha Vantage movers error: {e}")
            return {"gainers": [], "losers": []}


class FinnhubProvider(MarketDataProvider):
    """Finnhub API Provider - Free tier: 60 calls/min"""

    BASE_URL = "https://finnhub.io/api/v1"

    def __init__(self):
        self.api_key = FINNHUB_API_KEY

    def is_available(self) -> bool:
        return bool(self.api_key)

    def _normalize_symbol(self, symbol: str) -> str:
        """Convert NSE:SCOM to SCOM for API"""
        return symbol.replace("NSE:", "").replace("KE:", "")

    def get_quote(self, symbol: str) -> Dict[str, Any]:
        """Get quote from Finnhub"""
        cache_key = f"finnhub_quote_{symbol}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        normalized_symbol = self._normalize_symbol(symbol)
        url = f"{self.BASE_URL}/quote"
        params = {"symbol": normalized_symbol, "token": self.api_key}

        try:
            with httpx.Client(timeout=10) as client:
                response = client.get(url, params=params)
                response.raise_for_status()
                data = response.json()

                if not data.get("c"):
                    raise ValueError("No quote data returned")

                result = {
                    "symbol": symbol,
                    "price": float(data.get("c", 0)),  # current price
                    "open": float(data.get("o", 0)),
                    "high": float(data.get("h", 0)),
                    "low": float(data.get("l", 0)),
                    "volume": 0,  # Finnhub doesn't provide volume in quote
                    "change": float(data.get("d", 0)),  # change
                    "change_percent": float(data.get("dp", 0)),  # change percent
                    "timestamp": datetime.fromtimestamp(
                        data.get("t", time.time())
                    ).isoformat(),
                    "provider": "finnhub",
                }

                cache.set(cache_key, result)
                logger.info(f"Fetched quote for {symbol} from Finnhub")
                return result
        except Exception as e:
            logger.error(f"Finnhub API error for {symbol}: {e}")
            raise

    def get_historical(
        self, symbol: str, interval: str = "D", outputsize: int = 30
    ) -> List[Dict[str, Any]]:
        """Get historical data from Finnhub"""
        cache_key = f"finnhub_hist_{symbol}_{interval}_{outputsize}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        normalized_symbol = self._normalize_symbol(symbol)
        end_date = int(time.time())
        start_date = end_date - (outputsize * 86400)  # 86400 seconds in a day

        url = f"{self.BASE_URL}/stock/candle"
        params = {
            "symbol": normalized_symbol,
            "resolution": interval,
            "from": start_date,
            "to": end_date,
            "token": self.api_key,
        }

        try:
            with httpx.Client(timeout=15) as client:
                response = client.get(url, params=params)
                response.raise_for_status()
                data = response.json()

                if data.get("s") != "ok":
                    raise ValueError("No historical data returned")

                result = [
                    {
                        "datetime": datetime.fromtimestamp(data["t"][i]).isoformat(),
                        "open": float(data["o"][i]),
                        "high": float(data["h"][i]),
                        "low": float(data["l"][i]),
                        "close": float(data["c"][i]),
                        "volume": int(data["v"][i]),
                    }
                    for i in range(len(data["t"]))
                ]

                cache.set(cache_key, result)
                logger.info(f"Fetched {len(result)} historical records for {symbol}")
                return result
        except Exception as e:
            logger.error(f"Finnhub historical error for {symbol}: {e}")
            raise

    def get_movers(self) -> Dict[str, List[Dict[str, Any]]]:
        """Finnhub doesn't have dedicated movers endpoint"""
        logger.warning("Finnhub doesn't have dedicated movers endpoint")
        return {"gainers": [], "losers": []}


class MarketStackProvider(MarketDataProvider):
    """MarketStack API Provider - Free tier: 1000 calls/month"""

    BASE_URL = "http://api.marketstack.com/v1"

    def __init__(self):
        self.api_key = MARKETSTACK_API_KEY

    def is_available(self) -> bool:
        return bool(self.api_key)

    def _normalize_symbol(self, symbol: str) -> str:
        base = symbol.replace("NSE:", "").replace("KE:", "")
        return f"{base}.XNAI"

    def get_quote(self, symbol: str) -> Dict[str, Any]:
        cache_key = f"marketstack_quote_{symbol}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        normalized_symbol = self._normalize_symbol(symbol)
        params = {"access_key": self.api_key, "symbols": normalized_symbol}

        try:
            with httpx.Client(timeout=10) as client:
                response = client.get(f"{self.BASE_URL}/eod/latest", params=params)
                response.raise_for_status()
                data = response.json()

                if not data.get("data"):
                    raise ValueError("No quote data returned")

                quote = data["data"][0]
                result = {
                    "symbol": symbol,
                    "price": float(quote.get("close", 0)),
                    "open": float(quote.get("open", 0)),
                    "high": float(quote.get("high", 0)),
                    "low": float(quote.get("low", 0)),
                    "volume": int(quote.get("volume", 0)),
                    "change": float(quote.get("close", 0))
                    - float(quote.get("open", 0)),
                    "change_percent": (
                        (
                            (float(quote.get("close", 0)) - float(quote.get("open", 0)))
                            / float(quote.get("open", 1))
                        )
                        * 100
                        if float(quote.get("open", 0)) > 0
                        else 0
                    ),
                    "timestamp": quote.get("date", datetime.now().isoformat()),
                    "provider": "marketstack",
                }

                cache.set(cache_key, result)
                logger.info(f"Fetched quote for {symbol} from MarketStack")
                return result
        except Exception as e:
            logger.error(f"MarketStack API error for {symbol}: {e}")
            raise

    def get_historical(
        self, symbol: str, interval: str = "1day", outputsize: int = 30
    ) -> List[Dict[str, Any]]:
        cache_key = f"marketstack_hist_{symbol}_{interval}_{outputsize}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        normalized_symbol = self._normalize_symbol(symbol)
        params = {
            "access_key": self.api_key,
            "symbols": normalized_symbol,
            "limit": outputsize,
        }

        try:
            with httpx.Client(timeout=15) as client:
                response = client.get(f"{self.BASE_URL}/eod", params=params)
                response.raise_for_status()
                data = response.json()

                if not data.get("data"):
                    raise ValueError("No historical data returned")

                result = [
                    {
                        "datetime": item.get("date"),
                        "open": float(item.get("open", 0)),
                        "high": float(item.get("high", 0)),
                        "low": float(item.get("low", 0)),
                        "close": float(item.get("close", 0)),
                        "volume": int(item.get("volume", 0)),
                    }
                    for item in data["data"]
                ]

                cache.set(cache_key, result)
                logger.info(f"Fetched {len(result)} historical records for {symbol}")
                return result
        except Exception as e:
            logger.error(f"MarketStack historical error for {symbol}: {e}")
            raise

    def get_movers(self) -> Dict[str, List[Dict[str, Any]]]:
        logger.warning("MarketStack doesn't have dedicated movers endpoint")
        return {"gainers": [], "losers": []}


class ProviderRotator:
    """
    Rotates between providers to avoid rate limits

    Priority order:
    1. YFinance (free, unlimited)
    2. NSE API (for Kenyan stocks, when configured)
    3. TwelveData
    4. AlphaVantage
    5. Finnhub
    6. MarketStack
    """

    def __init__(self):
        # Import providers here to avoid circular imports
        try:
            from .yfinance_provider import yfinance_provider

            yf_provider = yfinance_provider
        except ImportError:
            logger.warning("yfinance not installed, skipping YFinance provider")
            yf_provider = None

        try:
            from .nse_provider import nse_provider

            nse_prov = nse_provider
        except ImportError:
            logger.warning("NSE provider not found")
            nse_prov = None

        # Prioritize free/unlimited providers
        self.providers = []
        if yf_provider:
            self.providers.append(yf_provider)
        if nse_prov and nse_prov.is_available():
            self.providers.append(nse_prov)

        # Add paid/limited providers
        self.providers.extend(
            [
                TwelveDataProvider(),
                AlphaVantageProvider(),
                FinnhubProvider(),
                MarketStackProvider(),
            ]
        )

        self.current_index = 0
        self.call_counts: Dict[str, int] = {}
        self.last_reset = time.time()

    def _reset_counts_if_needed(self):
        """Reset daily counters"""
        if time.time() - self.last_reset > SECONDS_PER_DAY:
            self.call_counts.clear()
            self.last_reset = time.time()
            logger.info("API call counters reset for new day")

    def get_provider(self) -> MarketDataProvider:
        """Get next available provider"""
        self._reset_counts_if_needed()

        # Try to find available provider
        for _ in range(len(self.providers)):
            provider = self.providers[self.current_index]
            provider_name = provider.__class__.__name__

            if provider.is_available():
                # Check rate limits
                calls_today = self.call_counts.get(provider_name, 0)

                # Daily limits for each provider
                limits = {
                    "YFinanceProvider": 999999,  # Unlimited
                    "NSEProvider": 999999,  # Depends on NSE plan
                    "TwelveDataProvider": TWELVE_DATA_DAILY_LIMIT,
                    "AlphaVantageProvider": ALPHA_VANTAGE_DAILY_LIMIT,
                    "FinnhubProvider": FINNHUB_DAILY_LIMIT,
                    "MarketStackProvider": DEFAULT_DAILY_API_LIMIT,
                }

                provider_limit = limits.get(provider_name, DEFAULT_DAILY_API_LIMIT)
                if calls_today < provider_limit:
                    self.call_counts[provider_name] = calls_today + 1
                    logger.info(
                        f"Using {provider_name} ({calls_today + 1}/{provider_limit} calls today)"
                    )
                    return provider
                else:
                    logger.warning(
                        f"{provider_name} daily limit reached: {calls_today}/{provider_limit}"
                    )

            # Move to next provider
            self.current_index = (self.current_index + 1) % len(self.providers)

        # If all providers exhausted, raise exception
        logger.error("All market data providers exhausted or unavailable")
        raise MarketDataProviderException(
            "All market data providers are currently unavailable or at capacity"
        )


# Global rotator instance
rotator = ProviderRotator()


def get_market_data_provider() -> MarketDataProvider:
    """Get market data provider based on configuration"""
    strategy = MARKET_DATA_PROVIDER.lower()

    if strategy == "twelve_data":
        return TwelveDataProvider()
    elif strategy == "alpha_vantage":
        return AlphaVantageProvider()
    elif strategy == "finnhub":
        return FinnhubProvider()
    elif strategy == "rotate":
        return rotator.get_provider()
    else:
        logger.warning(f"Unknown provider strategy: {strategy}, using rotate")
        return rotator.get_provider()
