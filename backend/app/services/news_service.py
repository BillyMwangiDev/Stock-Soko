"""
News Service - Provides market news and sentiment analysis
"""
from datetime import datetime, timedelta
from typing import List, Optional
import random


class NewsService:
    """Service for managing news articles and sentiment"""
    
    # Mock news data (in production, integrate with news APIs like NewsAPI, RSS feeds, etc.)
    MOCK_NEWS = [
        {
            "id": "1",
            "title": "NSE 20-Share Index Gains 0.5% on Banking Sector Rally",
            "source": "Business Daily",
            "url": "https://businessdaily.co.ke/markets",
            "summary": "The NSE 20-Share index rose 0.5% driven by strong gains in the banking sector, with KCB and Equity leading the rally.",
            "sentiment": "positive",
            "related_symbols": ["KCB", "EQTY"],
        },
        {
            "id": "2",
            "title": "Safaricom Reports Strong Q3 Earnings Amid M-Pesa Growth",
            "source": "The Standard",
            "url": "https://standardmedia.co.ke/business",
            "summary": "Safaricom's Q3 earnings beat analyst expectations, driven by 25% growth in M-Pesa transactions and increased data revenue.",
            "sentiment": "positive",
            "related_symbols": ["SCOM"],
        },
        {
            "id": "3",
            "title": "Market Volatility Expected Following CMA Regulatory Changes",
            "source": "Capital FM Business",
            "url": "https://capitalfm.co.ke/business",
            "summary": "The Capital Markets Authority announced new trading regulations expected to affect market liquidity and investor participation.",
            "sentiment": "neutral",
            "related_symbols": [],
        },
        {
            "id": "4",
            "title": "Manufacturing Sector Faces Headwinds Amid Rising Input Costs",
            "source": "Nation",
            "url": "https://nation.africa/business",
            "summary": "Manufacturing companies report declining margins as raw material costs surge, impacting profitability forecasts.",
            "sentiment": "negative",
            "related_symbols": ["BAT", "EABL"],
        },
        {
            "id": "5",
            "title": "KenGen Announces New Renewable Energy Project Worth KES 5B",
            "source": "Reuters",
            "url": "https://reuters.com/kenya",
            "summary": "KenGen unveils plans for a major geothermal expansion project, expected to add 200MW to the national grid by 2026.",
            "sentiment": "positive",
            "related_symbols": ["KEGN"],
        },
        {
            "id": "6",
            "title": "EABL Dividend Yield Attracts Income-Focused Investors",
            "source": "Business Daily",
            "url": "https://businessdaily.co.ke/markets",
            "summary": "East African Breweries maintains strong dividend policy, offering 5.2% yield attractive to income investors.",
            "sentiment": "positive",
            "related_symbols": ["EABL"],
        },
        {
            "id": "7",
            "title": "Forex Volatility Impacts Import-Dependent Companies",
            "source": "The Standard",
            "url": "https://standardmedia.co.ke/business",
            "summary": "Shilling depreciation creates headwinds for companies with high import exposure, affecting profit margins.",
            "sentiment": "negative",
            "related_symbols": [],
        },
        {
            "id": "8",
            "title": "Technology Sector Shows Resilience Amid Economic Challenges",
            "source": "Tech Crunch Africa",
            "url": "https://techcrunch.com/africa",
            "summary": "Kenya's tech companies demonstrate strong growth despite macroeconomic headwinds, with fintech leading the charge.",
            "sentiment": "positive",
            "related_symbols": ["SCOM"],
        },
    ]
    
    def get_news(
        self,
        category: Optional[str] = None,
        sentiment: Optional[str] = None,
        limit: int = 20,
        offset: int = 0
    ) -> dict:
        """
        Get news articles with filtering
        
        Args:
            category: Filter by category (all, market, sector, symbol)
            sentiment: Filter by sentiment (positive, negative, neutral)
            limit: Number of articles to return
            offset: Pagination offset
            
        Returns:
            Dict with articles, total, offset, limit
        """
        # Start with all news
        articles = self.MOCK_NEWS.copy()
        
        # Add timestamps (recent first)
        now = datetime.utcnow()
        for i, article in enumerate(articles):
            article["published_at"] = (now - timedelta(hours=i * 3)).isoformat()
            article["image_url"] = None
        
        # Filter by sentiment if specified
        if sentiment and sentiment in ["positive", "negative", "neutral"]:
            articles = [a for a in articles if a.get("sentiment") == sentiment]
        
        # Filter by category/symbol if specified
        if category and category not in ["all", None]:
            # If category is a stock symbol, filter by related_symbols
            articles = [
                a for a in articles 
                if category.upper() in a.get("related_symbols", [])
            ]
        
        # Get total before pagination
        total = len(articles)
        
        # Apply pagination
        articles = articles[offset:offset + limit]
        
        return {
            "articles": articles,
            "total": total,
            "offset": offset,
            "limit": limit
        }
    
    def get_article_by_id(self, article_id: str) -> Optional[dict]:
        """Get a single article by ID"""
        for article in self.MOCK_NEWS:
            if article["id"] == article_id:
                now = datetime.utcnow()
                article["published_at"] = now.isoformat()
                article["image_url"] = None
                return article
        return None
    
    def analyze_sentiment(self, text: str) -> str:
        """
        Analyze sentiment of text (mock implementation)
        In production, use ML model or sentiment analysis API
        """
        positive_words = ["gain", "rise", "growth", "profit", "strong", "beats", "surge"]
        negative_words = ["fall", "decline", "loss", "weak", "miss", "plunge"]
        
        text_lower = text.lower()
        
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count > negative_count:
            return "positive"
        elif negative_count > positive_count:
            return "negative"
        else:
            return "neutral"


# Singleton instance
news_service = NewsService()

