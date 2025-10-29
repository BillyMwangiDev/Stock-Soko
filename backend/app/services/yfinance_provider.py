"""
Yahoo Finance API Provider using yfinance library
100% FREE - No API key required, no rate limits
Best option for global stock data including Kenyan stocks
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import yfinance as yf
from ..utils.logging import get_logger
from .market_data_providers import MarketDataProvider, cache

logger = get_logger("yfinance_provider")


class YFinanceProvider(MarketDataProvider):
    """
    Yahoo Finance provider using yfinance library

    Advantages:
    - 100% FREE
    - No API key required
    - No rate limits
    - Global coverage (including NSE Kenya stocks)
    - Real-time data
    - Historical data
    - Company fundamentals

    Coverage:
    - Stocks (global)
    - ETFs
    - Mutual Funds
    - Indices
    - Forex
    - Crypto

    Kenyan Stocks:
    Use Yahoo Finance tickers: SCOM.NR, KCB.NR, EQTY.NR, etc.
    (.NR suffix for Nairobi Stock Exchange)
    """

    # Mapping of NSE symbols to Yahoo Finance tickers
    NSE_TO_YAHOO = {
        "SCOM": "SCOM.NR",
        "SAFCOM": "SCOM.NR",
        "KCB": "KCB.NR",
        "EQTY": "EQTY.NR",
        "EABL": "EABL.NR",
        "BAT": "BAT.NR",
        "KEGN": "KEGN.NR",
        "SCBK": "SCBK.NR",
        "COOP": "COOP.NR",
        "ABSA": "ABSA.NR",
        "NCBA": "NCBA.NR",
        "SBIC": "SBIC.NR",
        "BAMB": "BAMB.NR",
        "DTK": "DTK.NR",
    }

    def is_available(self) -> bool:
        """yfinance is always available (no API key needed)"""
        return True

    def _normalize_symbol(self, symbol: str) -> str:
        """
        Convert various symbol formats to Yahoo Finance format
        NSE:SCOM -> SCOM.NR
        SCOM -> SCOM.NR
        AAPL -> AAPL
        """
        # Remove exchange prefix
        clean_symbol = symbol.replace("NSE:", "").replace("KE:", "").upper()

        # Check if it's a Kenyan stock
        if clean_symbol in self.NSE_TO_YAHOO:
            return self.NSE_TO_YAHOO[clean_symbol]

        # For other stocks, return as-is (US stocks, etc.)
        return clean_symbol

    def _denormalize_symbol(self, yahoo_symbol: str) -> str:
        """Convert Yahoo Finance symbol back to our format"""
        if yahoo_symbol.endswith(".NR"):
            # Kenyan stock
            base = yahoo_symbol.replace(".NR", "")
            return f"NSE:{base}"
        return yahoo_symbol

    def get_quote(self, symbol: str) -> Dict[str, Any]:
        """Get real-time quote from Yahoo Finance"""
        cache_key = f"yfinance_quote_{symbol}"
        cached = cache.get(cache_key)
        if cached:
            logger.info(f"Cache hit for {symbol}")
            return cached

        yahoo_symbol = self._normalize_symbol(symbol)
        logger.info(f"Fetching quote for {symbol} (Yahoo: {yahoo_symbol})")

        try:
            ticker = yf.Ticker(yahoo_symbol)
            info = ticker.info

            # Get the most recent price data
            hist = ticker.history(period="1d", interval="1m")

            if hist.empty:
                # Try daily data if intraday is not available
                hist = ticker.history(period="5d")

            if hist.empty:
                logger.warning(f"No data available for {yahoo_symbol}")
                raise ValueError(f"No data available for {symbol}")

            last_row = hist.iloc[-1]
            first_row = hist.iloc[0]

            current_price = float(last_row["Close"])
            open_price = float(first_row["Open"])
            change = current_price - open_price
            change_percent = (change / open_price * 100) if open_price > 0 else 0

            quote = {
                "symbol": symbol,
                "last_price": round(current_price, 2),
                "change": round(change, 2),
                "change_percent": round(change_percent, 2),
                "open": round(float(last_row["Open"]), 2),
                "high": round(float(last_row["High"]), 2),
                "low": round(float(last_row["Low"]), 2),
                "close": round(current_price, 2),
                "volume": int(last_row["Volume"]),
                "previous_close": round(
                    float(info.get("previousClose", open_price)), 2
                ),
                "market_cap": info.get("marketCap"),
                "timestamp": datetime.utcnow().isoformat(),
                "source": "Yahoo Finance",
            }

            cache.set(cache_key, quote)
            logger.info(f"Successfully fetched quote for {symbol}: ${current_price}")
            return quote

        except Exception as e:
            logger.error(f"Error fetching quote for {symbol}: {e}")
            raise ValueError(f"Could not fetch quote for {symbol}: {str(e)}")

    def get_historical(
        self, symbol: str, interval: str = "1day", outputsize: int = 30
    ) -> List[Dict[str, Any]]:
        """
        Get historical price data from Yahoo Finance

        Args:
            symbol: Stock symbol (e.g., "NSE:SCOM" or "AAPL")
            interval: Time interval (1d, 1wk, 1mo)
            outputsize: Number of data points to return
        """
        yahoo_symbol = self._normalize_symbol(symbol)

        try:
            ticker = yf.Ticker(yahoo_symbol)

            # Map interval to yfinance format
            interval_map = {
                "1day": "1d",
                "1d": "1d",
                "daily": "1d",
                "1week": "1wk",
                "1wk": "1wk",
                "weekly": "1wk",
                "1month": "1mo",
                "1mo": "1mo",
                "monthly": "1mo",
            }
            yf_interval = interval_map.get(interval, "1d")

            # Calculate period based on outputsize and interval
            if yf_interval == "1d":
                period = f"{outputsize}d"
            elif yf_interval == "1wk":
                period = f"{outputsize}wk"
            elif yf_interval == "1mo":
                period = f"{outputsize}mo"
            else:
                period = "1mo"

            hist = ticker.history(period=period, interval=yf_interval)

            if hist.empty:
                logger.warning(f"No historical data for {yahoo_symbol}")
                return []

            data = []
            for index, row in hist.iterrows():
                data.append(
                    {
                        "date": index.strftime("%Y-%m-%d"),
                        "timestamp": int(index.timestamp()),
                        "open": round(float(row["Open"]), 2),
                        "high": round(float(row["High"]), 2),
                        "low": round(float(row["Low"]), 2),
                        "close": round(float(row["Close"]), 2),
                        "volume": int(row["Volume"]),
                    }
                )

            logger.info(f"Fetched {len(data)} historical data points for {symbol}")
            return data[-outputsize:]  # Return only requested number of points

        except Exception as e:
            logger.error(f"Error fetching historical data for {symbol}: {e}")
            return []

    def get_movers(self) -> Dict[str, List[Dict[str, Any]]]:
        """
        Get market movers (gainers and losers)
        Note: Yahoo Finance doesn't have a direct API for this,
        so we'll use a predefined list of popular stocks
        """
        # For NSE stocks
        nse_symbols = [
            "NSE:SCOM",
            "NSE:KCB",
            "NSE:EQTY",
            "NSE:EABL",
            "NSE:BAT",
            "NSE:COOP",
        ]

        movers_data = []
        for symbol in nse_symbols:
            try:
                quote = self.get_quote(symbol)
                movers_data.append(
                    {
                        "symbol": symbol,
                        "name": symbol.replace("NSE:", ""),
                        "price": quote["last_price"],
                        "change_percent": quote["change_percent"],
                        "volume": quote.get("volume", 0),
                    }
                )
            except Exception as e:
                logger.error(f"Error fetching mover data for {symbol}: {e}")
                continue

        # Sort by change_percent
        movers_data.sort(key=lambda x: x["change_percent"], reverse=True)

        # Split into gainers and losers
        gainers = [m for m in movers_data if m["change_percent"] > 0][:5]
        losers = [m for m in movers_data if m["change_percent"] < 0][:5]
        losers.sort(key=lambda x: x["change_percent"])  # Most negative first

        return {
            "gainers": gainers,
            "losers": losers,
            "timestamp": datetime.utcnow().isoformat(),
        }

    def get_company_info(self, symbol: str) -> Dict[str, Any]:
        """Get detailed company information"""
        yahoo_symbol = self._normalize_symbol(symbol)

        try:
            ticker = yf.Ticker(yahoo_symbol)
            info = ticker.info

            return {
                "symbol": symbol,
                "name": info.get("longName", info.get("shortName", "")),
                "sector": info.get("sector"),
                "industry": info.get("industry"),
                "description": info.get("longBusinessSummary"),
                "website": info.get("website"),
                "employees": info.get("fullTimeEmployees"),
                "market_cap": info.get("marketCap"),
                "pe_ratio": info.get("trailingPE"),
                "forward_pe": info.get("forwardPE"),
                "dividend_yield": info.get("dividendYield"),
                "beta": info.get("beta"),
                "52week_high": info.get("fiftyTwoWeekHigh"),
                "52week_low": info.get("fiftyTwoWeekLow"),
                "avg_volume": info.get("averageVolume"),
                "source": "Yahoo Finance",
            }
        except Exception as e:
            logger.error(f"Error fetching company info for {symbol}: {e}")
            return {}


# Singleton instance
yfinance_provider = YFinanceProvider()
