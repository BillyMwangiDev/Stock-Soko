from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import random
from ..schemas.markets import MarketInstrument, QuoteResponse


class MarketsService:
    
    MOCK_INSTRUMENTS_DETAILED = [
        {
            "symbol": "NSE:SCOM",
            "name": "Safaricom PLC",
            "last_price": 18.25,
            "change_pct": 1.2,
            "volume": 12500000,
            "market_cap": 731000000000,  # 731 billion KES
            "pe_ratio": 8.5,
            "dividend_yield": 4.8,
            "sector": "Telecommunications",
            "high_52w": 25.50,
            "low_52w": 15.00,
        },
        {
            "symbol": "NSE:KCB",
            "name": "KCB Group PLC",
            "last_price": 22.10,
            "change_pct": -0.7,
            "volume": 3200000,
            "market_cap": 264200000000,  # 264 billion KES
            "pe_ratio": 3.2,
            "dividend_yield": 7.5,
            "sector": "Banking",
            "high_52w": 28.00,
            "low_52w": 18.50,
        },
        {
            "symbol": "NSE:EQTY",
            "name": "Equity Group Holdings",
            "last_price": 45.50,
            "change_pct": 2.3,
            "volume": 4100000,
            "market_cap": 172000000000,
            "pe_ratio": 4.1,
            "dividend_yield": 6.2,
            "sector": "Banking",
            "high_52w": 52.00,
            "low_52w": 38.00,
        },
        {
            "symbol": "NSE:EABL",
            "name": "East African Breweries",
            "last_price": 150.50,
            "change_pct": 0.3,
            "volume": 890000,
            "market_cap": 112000000000,
            "pe_ratio": 12.8,
            "dividend_yield": 5.2,
            "sector": "Consumer Goods",
            "high_52w": 175.00,
            "low_52w": 140.00,
        },
        {
            "symbol": "NSE:BAT",
            "name": "British American Tobacco Kenya",
            "last_price": 420.00,
            "change_pct": -1.5,
            "volume": 125000,
            "market_cap": 33600000000,
            "pe_ratio": 10.2,
            "dividend_yield": 8.5,
            "sector": "Consumer Goods",
            "high_52w": 480.00,
            "low_52w": 380.00,
        },
        {
            "symbol": "NSE:KEGN",
            "name": "Kenya Electricity Generating Company",
            "last_price": 2.85,
            "change_pct": 1.8,
            "volume": 8500000,
            "market_cap": 60000000000,
            "pe_ratio": 6.5,
            "dividend_yield": 3.5,
            "sector": "Energy",
            "high_52w": 3.50,
            "low_52w": 2.20,
        },
        {
            "symbol": "NSE:SCBK",
            "name": "Standard Chartered Bank Kenya",
            "last_price": 158.00,
            "change_pct": 0.6,
            "volume": 450000,
            "market_cap": 56640000000,
            "pe_ratio": 5.8,
            "dividend_yield": 9.2,
            "sector": "Banking",
            "high_52w": 180.00,
            "low_52w": 145.00,
        },
        {
            "symbol": "NSE:COOP",
            "name": "Co-operative Bank of Kenya",
            "last_price": 12.50,
            "change_pct": -0.4,
            "volume": 2100000,
            "market_cap": 54625000000,
            "pe_ratio": 3.8,
            "dividend_yield": 8.0,
            "sector": "Banking",
            "high_52w": 15.00,
            "low_52w": 10.50,
        },
    ]
    
    def get_instruments(self, sector: Optional[str] = None) -> Dict[str, Any]:
        instruments = self.MOCK_INSTRUMENTS_DETAILED.copy()
        
        for inst in instruments:
            variation = random.uniform(-0.5, 0.5)
            inst["last_price"] = round(inst["last_price"] * (1 + variation / 100), 2)
            inst["change_pct"] = round(inst["change_pct"] + variation / 10, 2)
        
        if sector:
            instruments = [i for i in instruments if i.get("sector", "").lower() == sector.lower()]
        
        return {
            "instruments": [MarketInstrument(**{k: v for k, v in inst.items() if k in MarketInstrument.model_fields}) for inst in instruments],
            "count": len(instruments),
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
                detail["eps"] = round(detail["last_price"] / detail["pe_ratio"], 2)
                detail["book_value"] = round(detail["last_price"] * 0.8, 2)
                detail["current_ratio"] = round(random.uniform(1.2, 2.5), 2)
                detail["debt_to_equity"] = round(random.uniform(0.3, 1.5), 2)
                
                return detail
        return None
    
    def get_quote(self, symbol: str) -> QuoteResponse:
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


markets_service = MarketsService()


def list_markets() -> List[MarketInstrument]:
    return markets_service.get_instruments()["instruments"]


def get_quote(symbol: str) -> QuoteResponse:
    return markets_service.get_quote(symbol)
