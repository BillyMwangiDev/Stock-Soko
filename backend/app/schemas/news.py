from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class NewsArticle(BaseModel):
    id: str
    title: str
    source: str
    url: str
    published_at: datetime
    summary: Optional[str] = None
    sentiment: Optional[str] = Field(None, description="positive, negative, or neutral")
    related_symbols: Optional[List[str]] = []
    image_url: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "id": "1",
                "title": "NSE 20-Share Index Gains on Banking Rally",
                "source": "Business Daily",
                "url": "https://example.com/article",
                "published_at": "2025-01-15T10:00:00Z",
                "summary": "The NSE 20-Share index rose 0.5% driven by gains in the banking sector...",
                "sentiment": "positive",
                "related_symbols": ["KCB", "EQTY"],
                "image_url": None,
            }
        }


class NewsFilter(BaseModel):
    category: Optional[str] = Field(
        None, description="all, market, sector, or specific symbol"
    )
    sentiment: Optional[str] = Field(None, description="positive, negative, neutral")
    limit: int = Field(20, ge=1, le=100)
    offset: int = Field(0, ge=0)


class NewsResponse(BaseModel):
    articles: List[NewsArticle]
    total: int
    offset: int
    limit: int
