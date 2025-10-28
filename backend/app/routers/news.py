"""
News Router - Endpoints for market news and sentiment analysis
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from ..schemas.news import NewsResponse, NewsFilter
from ..services.news_service import news_service

router = APIRouter(prefix="/news", tags=["news"])


@router.get("", response_model=NewsResponse)
async def get_news(
    category: Optional[str] = Query(None, description="Filter by category or stock symbol"),
    sentiment: Optional[str] = Query(None, description="Filter by sentiment: positive, negative, neutral"),
    limit: int = Query(20, ge=1, le=100, description="Number of articles to return"),
    offset: int = Query(0, ge=0, description="Pagination offset")
):
    """
    Get market news articles with optional filtering
    
    - **category**: Filter by category (all, market, sector) or stock symbol (e.g., 'KCB')
    - **sentiment**: Filter by sentiment (positive, negative, neutral)
    - **limit**: Number of articles to return (max 100)
    - **offset**: Pagination offset
    """
    try:
        result = news_service.get_news(
            category=category,
            sentiment=sentiment,
            limit=limit,
            offset=offset
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch news: {str(e)}")


@router.get("/{article_id}")
async def get_article(article_id: str):
    """
    Get a single news article by ID
    
    - **article_id**: Unique article identifier
    """
    article = news_service.get_article_by_id(article_id)
    
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    return article


@router.post("/analyze-sentiment")
async def analyze_sentiment(text: str):
    """
    Analyze sentiment of given text
    
    - **text**: Text to analyze
    
    Returns: sentiment classification (positive, negative, neutral)
    """
    if not text or len(text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    sentiment = news_service.analyze_sentiment(text)
    
    return {
        "text": text,
        "sentiment": sentiment
    }


# ===============================================
# NEW ENDPOINTS - Real News Integration
# ===============================================

@router.get("/live")
async def get_live_news(
    symbol: Optional[str] = Query(None, description="Stock symbol for specific news"),
    limit: int = Query(20, ge=1, le=100, description="Number of articles")
):
    """Get live news from NewsAPI or Finnhub"""
    try:
        result = news_service.get_combined_news(symbol=symbol, limit=limit)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch live news: {str(e)}")


@router.get("/stock/{symbol}")
async def get_stock_news(
    symbol: str,
    limit: int = Query(10, ge=1, le=50, description="Number of articles")
):
    """Get news specific to a stock symbol from Finnhub"""
    try:
        articles = news_service.fetch_stock_news(symbol, limit)
        return {
            "symbol": symbol,
            "articles": articles,
            "count": len(articles)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stock news: {str(e)}")


@router.get("/research/fundamentals/{symbol}")
async def get_fundamentals(symbol: str):
    """Get company fundamentals from Finnhub"""
    try:
        fundamentals = news_service.get_company_fundamentals(symbol)
        
        if not fundamentals:
            # Return empty object if no data (API key missing or symbol not found)
            return {
                "symbol": symbol,
                "data": {},
                "source": "unavailable"
            }
        
        return {
            "symbol": symbol,
            "data": fundamentals,
            "source": "finnhub"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch fundamentals: {str(e)}")