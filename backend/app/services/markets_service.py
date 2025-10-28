"""
Markets Service Module

Provides market data access including stock quotes, historical data, market movers,
and NSE-specific instruments. Integrates multiple market data providers with caching
and fallback support for reliability.
"""
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
import random
from ..schemas.markets import MarketInstrument, QuoteResponse
from .market_data_providers import get_market_data_provider
from .cache_service import cache_service
from ..config import ENABLE_REAL_TIME_PRICES, PRICE_CACHE_TTL, HISTORICAL_CACHE_TTL
from ..utils.logging import get_logger
from ..data.sample_stocks import SAMPLE_STOCKS  # Use comprehensive stock data

logger = get_logger("markets_service")


class MarketsService:
    """
    Service for retrieving and managing market data.
    
    Provides access to real-time quotes, historical data, market movers, and
    instruments. Uses multiple data providers with intelligent rotation and
    caching for performance and reliability.
    
    Uses SAMPLE_STOCKS as the comprehensive data source (20 stocks with full details).
    """
    
    @property
    def MOCK_INSTRUMENTS_DETAILED(self) -> List[Dict[str, Any]]:
        """
        Convert SAMPLE_STOCKS to instrument format
        This ensures we use the comprehensive 20-stock dataset everywhere
        """
        instruments = []
        for stock in SAMPLE_STOCKS:
            # Calculate EPS from P/E ratio and price
            pe_ratio = stock.get('pe_ratio', 15)
            eps = stock['last_price'] / pe_ratio if pe_ratio > 0 else 0
            
            instruments.append({
                "symbol": f"NSE:{stock['symbol']}",
                "name": stock['name'],
                "last_price": stock['last_price'],
                "change_pct": stock.get('change_percent', 0),
                "volume": stock.get('volume', 0),
                "market_cap": stock.get('market_cap', 0),
                "pe_ratio": pe_ratio,
                "eps": round(eps, 2),
                "dividend_yield": stock.get('dividend_yield', 0),
                "sector": stock.get('sector', 'Unknown'),
                "high_52w": round(stock['last_price'] * 1.25, 2),
                "low_52w": round(stock['last_price'] * 0.75, 2),
                # Include extra comprehensive data
                "currency": "KES",
                "roe": stock.get('roe', 0),
                "roi": stock.get('roi', 0),
                "roa": stock.get('roa', 0),
                "profit_margin": stock.get('profit_margin', 0),
                "revenue_growth": stock.get('revenue_growth', 0),
                "debt_to_equity": stock.get('debt_to_equity', 0),
                "risk_score": stock.get('risk_score', 5),
                "ai_recommendation": stock.get('ai_recommendation', 'HOLD'),
                "ai_confidence": stock.get('ai_confidence', 50),
            })
        return instruments
    
    def get_instruments(self, sector: Optional[str] = None) -> Dict[str, Any]:
        """
        Get list of market instruments (stocks) with optional sector filtering.
        
        Args:
            sector: Optional sector name to filter instruments
            
        Returns:
            Dict containing instruments list, count, and timestamp
        """
        instruments = self.MOCK_INSTRUMENTS_DETAILED.copy()
        
        for inst in instruments:
            variation = random.uniform(-0.5, 0.5)
            inst["last_price"] = round(inst["last_price"] * (1 + variation / 100), 2)
            inst["change_pct"] = round(inst["change_pct"] + variation / 10, 2)
        
        if sector:
            instruments = [i for i in instruments if i.get("sector", "").lower() == sector.lower()]
        
        # Create MarketInstrument objects from dict data
        try:
            instrument_objects = []
            for inst in instruments:
                # Extract only fields that MarketInstrument expects
                instrument_data = {
                    "symbol": inst.get("symbol", ""),
                    "name": inst.get("name", ""),
                    "last_price": inst.get("last_price", 0.0),
                    "change_pct": inst.get("change_pct", 0.0),
                    "currency": inst.get("currency", "KES"),
                    "eps": inst.get("eps"),
                    "pe_ratio": inst.get("pe_ratio"),
                    "dividend_yield": inst.get("dividend_yield"),
                    "volume": inst.get("volume"),
                    "market_cap": inst.get("market_cap"),
                    "sector": inst.get("sector"),
                }
                instrument_objects.append(MarketInstrument(**instrument_data))
        except Exception as e:
            logger.error(f"Error creating MarketInstrument objects: {e}")
            # Fallback to empty list if there's an error
            instrument_objects = []
        
        return {
            "instruments": instrument_objects,
            "count": len(instrument_objects),
            "last_updated": datetime.now(timezone.utc).isoformat()
        }
    
    def get_stock_detail(self, symbol: str) -> Optional[Dict[str, Any]]:
        for inst in self.MOCK_INSTRUMENTS_DETAILED:
            if inst["symbol"] == symbol:
                variation = random.uniform(-0.3, 0.3)
                detail = inst.copy()
                detail["last_price"] = round(detail["last_price"] * (1 + variation / 100), 2)
                detail["change_pct"] = round(detail["change_pct"] + variation / 10, 2)
                
                detail["market_cap_formatted"] = f"KES {detail['market_cap'] / 1e9:.2f}B"
                detail["eps"] = detail.get("eps", round(detail["last_price"] / detail["pe_ratio"], 2))
                detail["book_value"] = round(detail["last_price"] * 0.8, 2)
                detail["current_ratio"] = round(random.uniform(1.2, 2.5), 2)
                detail["debt_to_equity"] = round(random.uniform(0.3, 1.5), 2)
                
                # Risk Profile Metrics
                detail["beta"] = round(random.uniform(0.6, 1.5), 2)  # Market sensitivity
                detail["volatility"] = round(random.uniform(15, 45), 2)  # Annual volatility %
                detail["sharpe_ratio"] = round(random.uniform(0.5, 2.5), 2)  # Risk-adjusted return
                detail["risk_rating"] = self._calculate_risk_rating(
                    detail.get("beta", 1.0),
                    detail.get("volatility", 25.0),
                    detail.get("debt_to_equity", 0.5)
                )
                
                return detail
        return None
    
    def _calculate_risk_rating(self, beta: float, volatility: float, debt_to_equity: float) -> str:
        """Calculate overall risk rating: Low, Medium, High, Very High"""
        risk_score = 0
        
        # Beta contribution (0-3 points)
        if beta < 0.8:
            risk_score += 0
        elif beta < 1.2:
            risk_score += 1
        elif beta < 1.5:
            risk_score += 2
        else:
            risk_score += 3
        
        # Volatility contribution (0-3 points)
        if volatility < 20:
            risk_score += 0
        elif volatility < 30:
            risk_score += 1
        elif volatility < 40:
            risk_score += 2
        else:
            risk_score += 3
        
        # Debt to Equity contribution (0-2 points)
        if debt_to_equity < 0.5:
            risk_score += 0
        elif debt_to_equity < 1.0:
            risk_score += 1
        else:
            risk_score += 2
        
        # Determine rating
        if risk_score <= 2:
            return "Low"
        elif risk_score <= 4:
            return "Medium"
        elif risk_score <= 6:
            return "High"
        else:
            return "Very High"
    
    def get_quote(self, symbol: str) -> QuoteResponse:
        # Try to get real-time quote if enabled
        if ENABLE_REAL_TIME_PRICES:
            try:
                provider = get_market_data_provider()
                real_quote = provider.get_quote(symbol)
                
                # Generate sparkline based on real price
                base_price = real_quote["price"]
                spark = [round(base_price * (1 + (i - 8) * 0.002 + random.uniform(-0.01, 0.01)), 2) for i in range(15)]
                
                return QuoteResponse(
                    symbol=symbol,
                    last_price=real_quote["price"],
                    change_pct=real_quote["change_percent"],
                    ohlc=[
                        real_quote["open"],
                        real_quote["high"],
                        real_quote["low"],
                        real_quote["price"]
                    ],
                    sparkline=spark,
                )
            except Exception as e:
                logger.warning(f"Failed to get real quote for {symbol}, falling back to mock: {e}")
        
        # Fallback to mock data
        for inst in self.MOCK_INSTRUMENTS_DETAILED:
            if inst["symbol"] == symbol:
                base_price = inst["last_price"]
                spark = [round(base_price * (1 + (i - 8) * 0.002 + random.uniform(-0.01, 0.01)), 2) for i in range(15)]
                
                return QuoteResponse(
                    symbol=symbol,
                    last_price=inst["last_price"],
                    change_pct=inst["change_pct"],
                    ohlc=[
                        round(inst["last_price"] * 0.995, 2),
                        round(inst["last_price"] * 1.008, 2),
                        round(inst["last_price"] * 0.989, 2),
                        inst["last_price"]
                    ],
                    sparkline=spark,
                )
        raise ValueError(f"Symbol {symbol} not found")
    
    def search_stocks(self, query: str) -> List[Dict[str, Any]]:
        query_lower = query.lower()
        
        results = []
        for inst in self.MOCK_INSTRUMENTS_DETAILED:
            if (query_lower in inst["symbol"].lower() or 
                query_lower in inst["name"].lower()):
                results.append({
                    "symbol": inst["symbol"],
                    "name": inst["name"],
                    "last_price": inst["last_price"],
                    "change_pct": inst["change_pct"],
                    "sector": inst["sector"]
                })
        
        return results
    
    def get_sector_performance(self) -> List[Dict[str, Any]]:
        sectors: Dict[str, Dict[str, Any]] = {}
        
        for inst in self.MOCK_INSTRUMENTS_DETAILED:
            sector = inst.get("sector", "Other")
            if sector not in sectors:
                sectors[sector] = {
                    "sector": sector,
                    "count": 0,
                    "avg_change": 0.0,
                    "total_change": 0.0
                }
            
            sectors[sector]["count"] += 1
            sectors[sector]["total_change"] += inst["change_pct"]
        
        result = []
        for sector_data in sectors.values():
            sector_data["avg_change"] = round(
                sector_data["total_change"] / sector_data["count"], 2
            )
            del sector_data["total_change"]
            result.append(sector_data)
        
        result.sort(key=lambda x: x["avg_change"], reverse=True)
        
        return result
    
    def get_live_quotes(self, symbols: List[str]) -> List[Dict[str, Any]]:
        """Get live quotes for multiple symbols"""
        quotes = []
        
        if ENABLE_REAL_TIME_PRICES:
            provider = get_market_data_provider()
            for symbol in symbols:
                try:
                    quote = provider.get_quote(symbol)
                    quotes.append(quote)
                except Exception as e:
                    logger.warning(f"Failed to get live quote for {symbol}: {e}")
                    # Add mock quote as fallback
                    mock_data = next((inst for inst in self.MOCK_INSTRUMENTS_DETAILED if inst["symbol"] == symbol), None)
                    if mock_data:
                        quotes.append({
                            "symbol": symbol,
                            "price": mock_data["last_price"],
                            "change_percent": mock_data["change_pct"],
                            "volume": mock_data["volume"],
                            "provider": "mock"
                        })
        else:
            # Use mock data
            for symbol in symbols:
                mock_data = next((inst for inst in self.MOCK_INSTRUMENTS_DETAILED if inst["symbol"] == symbol), None)
                if mock_data:
                    quotes.append({
                        "symbol": symbol,
                        "price": mock_data["last_price"],
                        "change_percent": mock_data["change_pct"],
                        "volume": mock_data["volume"],
                        "provider": "mock"
                    })
        
        return quotes
    
    def get_historical_data(self, symbol: str, interval: str = "1day", days: int = 30) -> List[Dict[str, Any]]:
        """Get historical price data"""
        if ENABLE_REAL_TIME_PRICES:
            try:
                provider = get_market_data_provider()
                return provider.get_historical(symbol, interval, days)
            except Exception as e:
                logger.warning(f"Failed to get historical data for {symbol}: {e}")
        
        # Generate mock historical data
        base_data = next((inst for inst in self.MOCK_INSTRUMENTS_DETAILED if inst["symbol"] == symbol), None)
        if not base_data:
            return []
        
        historical = []
        base_price = base_data["last_price"]
        
        for i in range(days, 0, -1):
            variation = random.uniform(-0.05, 0.05)
            price = round(base_price * (1 + variation), 2)
            
            historical.append({
                "datetime": (datetime.now() - timedelta(days=i)).isoformat(),
                "open": round(price * 0.995, 2),
                "high": round(price * 1.01, 2),
                "low": round(price * 0.99, 2),
                "close": price,
                "volume": random.randint(100000, 5000000)
            })
        
        return historical
    
    def get_market_movers(self) -> Dict[str, List[Dict[str, Any]]]:
        """Get top gainers and losers"""
        if ENABLE_REAL_TIME_PRICES:
            try:
                provider = get_market_data_provider()
                movers = provider.get_movers()
                if movers["gainers"] or movers["losers"]:
                    return movers
            except Exception as e:
                logger.warning(f"Failed to get market movers: {e}")
        
        # Generate mock movers from our instruments
        sorted_instruments = sorted(
            self.MOCK_INSTRUMENTS_DETAILED,
            key=lambda x: x["change_pct"],
            reverse=True
        )
        
        gainers = [
            {
                "symbol": inst["symbol"],
                "name": inst["name"],
                "price": inst["last_price"],
                "change_percent": inst["change_pct"],
                "volume": inst["volume"]
            }
            for inst in sorted_instruments[:5] if inst["change_pct"] > 0
        ]
        
        losers = [
            {
                "symbol": inst["symbol"],
                "name": inst["name"],
                "price": inst["last_price"],
                "change_percent": inst["change_pct"],
                "volume": inst["volume"]
            }
            for inst in sorted_instruments[-5:] if inst["change_pct"] < 0
        ]
        losers.reverse()
        
        return {"gainers": gainers, "losers": losers}


markets_service = MarketsService()


def list_markets() -> List[MarketInstrument]:
    return markets_service.get_instruments()["instruments"]


def get_quote(symbol: str) -> QuoteResponse:
    cache_key = f"quote_{symbol}"
    cached = cache_service.get(cache_key)
    
    if cached:
        logger.debug(f"Cache hit for quote {symbol}")
        return QuoteResponse(**cached) if isinstance(cached, dict) else cached
    
    quote = markets_service.get_quote(symbol)
    cache_service.set(cache_key, quote.dict(), ttl=PRICE_CACHE_TTL)
    logger.debug(f"Cache miss for quote {symbol}, fetched and cached")
    
    return quote


def get_live_quotes(symbols: List[str]) -> List[Dict[str, Any]]:
    """Get live quotes for multiple symbols"""
    return markets_service.get_live_quotes(symbols)


def get_market_movers() -> Dict[str, List[Dict[str, Any]]]:
    """Get market gainers and losers"""
    return markets_service.get_market_movers()


def get_historical_data(symbol: str, interval: str = "1day", days: int = 30) -> List[Dict[str, Any]]:
    """Get historical price data"""
    return markets_service.get_historical_data(symbol, interval, days)