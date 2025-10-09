from typing import Optional, Dict, List, Any
from fastapi import APIRouter, HTTPException, Query
from ..schemas.markets import MarketListResponse, QuoteRequest, QuoteResponse
from ..services.markets_service import markets_service, list_markets, get_quote
from ..ai.recommender import sma_crossover_signal
from ..ai.indicators import rsi, macd
from ..data.sample_stocks import SAMPLE_STOCKS
from ..data.stock_analysis_framework import generate_comprehensive_analysis, batch_analyze_stocks

router = APIRouter(prefix="/markets", tags=["markets"])


@router.get("")
async def get_markets() -> Dict[str, Any]:
    """Get all market instruments with comprehensive data"""
    # Convert SAMPLE_STOCKS to the format expected by frontend
    instruments = []
    for stock in SAMPLE_STOCKS:
        instruments.append({
            "symbol": stock["symbol"],
            "name": stock["name"],
            "last_price": stock["last_price"],
            "change_pct": stock.get("change_percent", 0),
            "volume": stock.get("volume", 0),
            "market_cap": stock.get("market_cap", 0),
            "high": stock.get("high", stock["last_price"]),
            "low": stock.get("low", stock["last_price"]),
        })
    
    return {
        "instruments": instruments,
        "count": len(instruments)
    }


@router.post("/quote", response_model=QuoteResponse)
def post_quote(req: QuoteRequest) -> QuoteResponse:
    try:
        return get_quote(req.symbol)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.post("/recommendation", response_model=Dict[str, Any])
def post_recommendation(req: QuoteRequest) -> Dict[str, Any]:
    """
    Get comprehensive AI recommendation for a stock
    Uses fundamental, technical, and macro/sentiment analysis
    """
    # Find stock in SAMPLE_STOCKS
    stock = next((s for s in SAMPLE_STOCKS if s["symbol"] == req.symbol.upper()), None)
    
    if not stock:
        raise HTTPException(status_code=404, detail=f"Symbol {req.symbol} not found")
    
    # Generate comprehensive analysis using the framework
    try:
        analysis = generate_comprehensive_analysis(stock)
        return analysis
    except Exception as e:
        # Fallback to simple recommendation
        recommendation = stock.get("ai_recommendation", "HOLD")
        return {
            "symbol": req.symbol.upper(),
            "recommendation": recommendation,
            "confidence": stock.get("ai_confidence", 75),
            "reasoning": stock.get("ai_reason", "Based on fundamental and technical analysis"),
            "error": str(e)
        }


@router.post("/indicators", response_model=Dict[str, Any])
def post_indicators(req: QuoteRequest) -> Dict[str, Any]:
    quote = post_quote(req)
    rsi_values = rsi(quote.sparkline)
    macd_line, signal_line, histogram = macd(quote.sparkline)
    return {
        "symbol": req.symbol,
        "rsi": rsi_values[-1] if rsi_values else None,
        "macd": macd_line[-1] if macd_line else None,
        "macd_signal": signal_line[-1] if signal_line else None,
        "macd_hist": histogram[-1] if histogram else None,
    }


@router.get("/{symbol}/detail")
async def get_stock_detail(symbol: str) -> Dict[str, Any]:
    detail = markets_service.get_stock_detail(symbol)
    
    if not detail:
        raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")
    
    return detail


@router.get("/search")
async def search_stocks(
    q: str = Query(..., min_length=1, description="Search query")
) -> Dict[str, Any]:
    if len(q) < 1:
        raise HTTPException(status_code=400, detail="Query too short")
    
    results = markets_service.search_stocks(q)
    
    return {
        "query": q,
        "results": results,
        "count": len(results)
    }


@router.get("/sectors")
async def get_sector_performance() -> Dict[str, Any]:
    sectors = markets_service.get_sector_performance()
    
    return {
        "sectors": sectors,
        "count": len(sectors)
    }


@router.get("/stocks/{symbol}")
async def get_stock_by_symbol(symbol: str) -> Dict[str, Any]:
    """Get detailed stock information by symbol"""
    stock = next((s for s in SAMPLE_STOCKS if s["symbol"] == symbol.upper()), None)
    
    if not stock:
        raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")
    
    return stock


@router.get("/stocks")
async def get_all_stocks() -> Dict[str, Any]:
    """Get all available stocks"""
    return {
        "stocks": SAMPLE_STOCKS,
        "count": len(SAMPLE_STOCKS)
    }


@router.get("/gainers")
async def get_top_gainers(limit: int = 10) -> Dict[str, Any]:
    """Get top gaining stocks"""
    gainers = sorted(
        SAMPLE_STOCKS,
        key=lambda x: x.get("change_percent", 0),
        reverse=True
    )[:limit]
    
    return {
        "gainers": gainers,
        "count": len(gainers)
    }


@router.get("/losers")
async def get_top_losers(limit: int = 10) -> Dict[str, Any]:
    """Get top losing stocks"""
    losers = sorted(
        SAMPLE_STOCKS,
        key=lambda x: x.get("change_percent", 0)
    )[:limit]
    
    return {
        "losers": losers,
        "count": len(losers)
    }


@router.get("/high-dividend")
async def get_high_dividend_stocks(min_yield: float = 4.0) -> Dict[str, Any]:
    """Get stocks with high dividend yields"""
    high_dividend = [
        s for s in SAMPLE_STOCKS 
        if s.get("dividend_yield", 0) >= min_yield
    ]
    
    high_dividend.sort(key=lambda x: x.get("dividend_yield", 0), reverse=True)
    
    return {
        "stocks": high_dividend,
        "count": len(high_dividend)
    }


@router.get("/low-risk")
async def get_low_risk_stocks(max_risk: float = 3.0) -> Dict[str, Any]:
    """Get low-risk stocks"""
    low_risk = [
        s for s in SAMPLE_STOCKS 
        if s.get("risk_score", 10) <= max_risk
    ]
    
    low_risk.sort(key=lambda x: x.get("risk_score", 10))
    
    return {
        "stocks": low_risk,
        "count": len(low_risk)
    }