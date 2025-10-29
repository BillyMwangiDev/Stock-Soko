"""
Mock Market Data Manager
Centralized location for all mock market data
"""

import random
from typing import Any, Dict, List, Optional

from ..constants import SPARKLINE_POINTS
from ..data.sample_stocks import SAMPLE_STOCKS
from ..schemas.markets import QuoteResponse


class MockDataManager:
    """Manages mock data for testing and fallback scenarios"""

    @staticmethod
    def get_mock_instruments() -> List[Dict[str, Any]]:
        """Get list of mock instruments"""
        return SAMPLE_STOCKS

    @staticmethod
    def get_mock_instrument(symbol: str) -> Optional[Dict[str, Any]]:
        """Get mock instrument by symbol"""
        symbol_upper = symbol.upper()
        for stock in SAMPLE_STOCKS:
            if stock["symbol"] == symbol_upper:
                return stock
        return None

    @staticmethod
    def get_mock_quote(symbol: str) -> QuoteResponse:
        """Generate mock quote for a symbol"""
        stock = MockDataManager.get_mock_instrument(symbol)
        if not stock:
            raise ValueError(f"Symbol {symbol} not found in mock data")

        base_price = stock["last_price"]
        # Generate realistic sparkline data
        spark = [
            round(base_price * (1 + (i - 8) * 0.002 + random.uniform(-0.01, 0.01)), 2)
            for i in range(SPARKLINE_POINTS)
        ]

        return QuoteResponse(
            symbol=symbol,
            last_price=stock["last_price"],
            change_pct=stock.get("change_percent", 0),
            ohlc=[
                round(stock["last_price"] * 0.995, 2),  # Open
                round(stock["last_price"] * 1.008, 2),  # High
                round(stock["last_price"] * 0.989, 2),  # Low
                stock["last_price"],  # Close
            ],
            sparkline=spark,
        )

    @staticmethod
    def get_mock_historical(symbol: str, days: int = 30) -> List[Dict[str, Any]]:
        """Generate mock historical data"""
        stock = MockDataManager.get_mock_instrument(symbol)
        if not stock:
            raise ValueError(f"Symbol {symbol} not found in mock data")

        base_price = stock["last_price"]
        historical = []

        for i in range(days):
            # Simulate price movement
            variation = random.uniform(-0.05, 0.05)  # ±5%
            price = round(base_price * (1 + variation), 2)

            historical.append(
                {
                    "date": f"2024-{10 - i // 30:02d}-{(30 - (i % 30)):02d}",
                    "open": round(price * 0.995, 2),
                    "high": round(price * 1.008, 2),
                    "low": round(price * 0.989, 2),
                    "close": price,
                    "volume": random.randint(100000, 5000000),
                }
            )

        return list(reversed(historical))

    @staticmethod
    def get_mock_market_movers() -> Dict[str, List[Dict[str, Any]]]:
        """Get mock market movers (gainers and losers)"""
        # Sort by change_percent
        sorted_stocks = sorted(
            SAMPLE_STOCKS, key=lambda x: x.get("change_percent", 0), reverse=True
        )

        # Top 5 gainers
        gainers = [
            {
                "symbol": stock["symbol"],
                "name": stock["name"],
                "price": stock["last_price"],
                "change": stock.get("change_percent", 0),
                "volume": stock.get("volume", 0),
            }
            for stock in sorted_stocks[:5]
            if stock.get("change_percent", 0) > 0
        ]

        # Top 5 losers
        losers = [
            {
                "symbol": stock["symbol"],
                "name": stock["name"],
                "price": stock["last_price"],
                "change": stock.get("change_percent", 0),
                "volume": stock.get("volume", 0),
            }
            for stock in reversed(sorted_stocks[-5:])
            if stock.get("change_percent", 0) < 0
        ]

        return {"gainers": gainers, "losers": losers}

    @staticmethod
    def get_mock_order_book(symbol: str) -> Dict[str, Any]:
        """Generate mock order book"""
        stock = MockDataManager.get_mock_instrument(symbol)
        if not stock:
            raise ValueError(f"Symbol {symbol} not found in mock data")

        base_price = stock["last_price"]
        bids = []
        asks = []

        # Generate 5 bid levels (buy orders below current price)
        total_bid_qty = 0
        for i in range(5):
            price = base_price * (1 - (i + 1) * 0.002)  # 0.2% steps
            quantity = random.randint(1000, 5000)
            total_bid_qty += quantity
            bids.append(
                {"price": round(price, 2), "quantity": quantity, "total": total_bid_qty}
            )

        # Generate 5 ask levels (sell orders above current price)
        total_ask_qty = 0
        for i in range(5):
            price = base_price * (1 + (i + 1) * 0.002)  # 0.2% steps
            quantity = random.randint(1000, 5000)
            total_ask_qty += quantity
            asks.append(
                {"price": round(price, 2), "quantity": quantity, "total": total_ask_qty}
            )

        spread = asks[0]["price"] - bids[0]["price"]
        spread_percent = (spread / base_price) * 100

        return {
            "bids": bids,
            "asks": asks,
            "spread": round(spread, 2),
            "spread_percent": round(spread_percent, 4),
        }

    @staticmethod
    def search_mock_instruments(query: str) -> List[Dict[str, Any]]:
        """Search mock instruments by name or symbol"""
        query_lower = query.lower()
        results = []

        for stock in SAMPLE_STOCKS:
            if (
                query_lower in stock["symbol"].lower()
                or query_lower in stock["name"].lower()
            ):
                results.append(stock)

        return results


# Singleton instance
mock_data_manager = MockDataManager()
