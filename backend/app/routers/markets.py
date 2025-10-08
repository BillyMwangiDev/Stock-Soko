from typing import Optional, Dict, List, Any
from fastapi import APIRouter, HTTPException, Query
from ..schemas.markets import MarketListResponse, QuoteRequest, QuoteResponse
from ..services.markets_service import markets_service, list_markets, get_quote
from ..ai.recommender import sma_crossover_signal
from ..ai.indicators import rsi, macd

router = APIRouter(prefix="/markets", tags=["markets"])


@router.get("", response_model=MarketListResponse)
def get_markets() -> MarketListResponse:
    return MarketListResponse(instruments=list_markets())


@router.post("/quote", response_model=QuoteResponse)
def post_quote(req: QuoteRequest) -> QuoteResponse:
    try:
        return get_quote(req.symbol)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.post("/recommendation", response_model=Dict[str, Any])
def post_recommendation(req: QuoteRequest) -> Dict[str, Any]:
    quote = post_quote(req)
    signal = sma_crossover_signal(quote.sparkline)
    return {"symbol": req.symbol, "recommendation": signal}


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
