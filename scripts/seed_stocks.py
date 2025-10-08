"""
Seed database with 20 NSE stocks from architecture specification
Run: python -m scripts.seed_stocks
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app.database import SessionLocal, init_db
from backend.app.database.models import Stock, News
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timedelta
import uuid

# 20 NSE stocks from YAML specification
SEED_STOCKS = [
    {
        "symbol": "EQTY",
        "name": "Equity Group Holdings",
        "sector": "Banking",
        "latest_price": 52.30,
        "previous_close": 51.75,
        "market_cap": 460000000000,
        "pe_ratio": 8.6,
        "dividend_yield": 4.2,
        "metadata": {"isin": "KES000000EQTY", "notes": "Flagship bank; large retail footprint"},
        "news": [
            {"title": "Equity Group reports resilient Q2 earnings", "source": "Business Daily", "published_at": "2025-10-01T08:00:00Z"},
            {"title": "Bank expands mobile lending product", "source": "Nation", "published_at": "2025-09-22T10:00:00Z"}
        ]
    },
    {
        "symbol": "KCB",
        "name": "KCB Group",
        "sector": "Banking",
        "latest_price": 35.45,
        "previous_close": 35.10,
        "market_cap": 300000000000,
        "pe_ratio": 9.1,
        "dividend_yield": 3.5,
        "metadata": {},
        "news": [{"title": "KCB posts moderate loan growth", "source": "Business Daily", "published_at": "2025-09-30T07:30:00Z"}]
    },
    {
        "symbol": "SCOM",
        "name": "Safaricom PLC",
        "sector": "Telecom",
        "latest_price": 23.10,
        "previous_close": 22.95,
        "market_cap": 900000000000,
        "pe_ratio": 18.2,
        "dividend_yield": 2.8,
        "metadata": {},
        "news": [{"title": "Safaricom pilots new fintech partnership", "source": "Reuters Africa", "published_at": "2025-09-28T14:00:00Z"}]
    },
    {
        "symbol": "NCBA",
        "name": "NCBA Group",
        "sector": "Banking",
        "latest_price": 18.25,
        "previous_close": 18.10,
        "market_cap": 220000000000,
        "pe_ratio": 7.4,
        "dividend_yield": 4.0,
        "metadata": {},
        "news": [{"title": "NCBA releases improved net interest margins", "source": "Nation", "published_at": "2025-09-20T09:00:00Z"}]
    },
    {
        "symbol": "UMME",
        "name": "Umeme PLC",
        "sector": "Utilities",
        "latest_price": 8.40,
        "previous_close": 8.55,
        "market_cap": 80000000000,
        "pe_ratio": 12.1,
        "dividend_yield": 5.1,
        "metadata": {},
        "news": [{"title": "Umeme tariff adjustments discussed in parliament", "source": "Business Daily", "published_at": "2025-09-25T11:00:00Z"}]
    },
    {
        "symbol": "EABL",
        "name": "East African Breweries Ltd",
        "sector": "Consumer Goods",
        "latest_price": 140.00,
        "previous_close": 139.50,
        "market_cap": 260000000000,
        "pe_ratio": 20.5,
        "dividend_yield": 3.2,
        "metadata": {},
        "news": [{"title": "EABL launches new product line in Kenya", "source": "Nation", "published_at": "2025-09-15T08:00:00Z"}]
    },
    {
        "symbol": "BAMB",
        "name": "Bamburi Cement",
        "sector": "Materials",
        "latest_price": 32.75,
        "previous_close": 32.00,
        "market_cap": 120000000000,
        "pe_ratio": 11.0,
        "dividend_yield": 2.0,
        "metadata": {},
        "news": [{"title": "Cement demand steady as construction resumes", "source": "Business Daily", "published_at": "2025-09-12T07:45:00Z"}]
    },
    {
        "symbol": "COOP",
        "name": "Co-operative Bank of Kenya",
        "sector": "Banking",
        "latest_price": 11.20,
        "previous_close": 11.00,
        "market_cap": 70000000000,
        "pe_ratio": 10.2,
        "dividend_yield": 2.5,
        "metadata": {},
        "news": [{"title": "Co-op Bank moves into digital banking partnerships", "source": "Business Daily", "published_at": "2025-09-10T09:10:00Z"}]
    },
    {
        "symbol": "SCBK",
        "name": "Standard Chartered Bank Kenya",
        "sector": "Banking",
        "latest_price": 18.60,
        "previous_close": 18.75,
        "market_cap": 85000000000,
        "pe_ratio": 13.3,
        "dividend_yield": 3.8,
        "metadata": {},
        "news": [{"title": "Standard Chartered Kenya expands SME financing", "source": "Reuters Africa", "published_at": "2025-09-18T10:00:00Z"}]
    },
    {
        "symbol": "BAT",
        "name": "British American Tobacco Kenya",
        "sector": "Consumer Goods",
        "latest_price": 360.00,
        "previous_close": 355.00,
        "market_cap": 150000000000,
        "pe_ratio": 14.8,
        "dividend_yield": 5.0,
        "metadata": {},
        "news": [{"title": "BAT Kenya faces regulatory discussions on packaging", "source": "Nation", "published_at": "2025-09-05T12:00:00Z"}]
    },
    {
        "symbol": "NMG",
        "name": "Nation Media Group",
        "sector": "Media",
        "latest_price": 19.50,
        "previous_close": 20.00,
        "market_cap": 25000000000,
        "pe_ratio": 22.0,
        "dividend_yield": 1.2,
        "metadata": {},
        "news": [{"title": "Nation Media explores digital subscription growth", "source": "Business Daily", "published_at": "2025-09-01T07:30:00Z"}]
    },
    {
        "symbol": "KPLC",
        "name": "Kenya Power & Lighting Company",
        "sector": "Utilities",
        "latest_price": 1.95,
        "previous_close": 2.05,
        "market_cap": 45000000000,
        "pe_ratio": 9.8,
        "dividend_yield": 6.0,
        "metadata": {},
        "news": [{"title": "Kenya Power regulatory update causes investor concern", "source": "Business Daily", "published_at": "2025-10-02T09:00:00Z"}]
    },
    {
        "symbol": "UCHM",
        "name": "Uchumi Supermarkets",
        "sector": "Retail",
        "latest_price": 0.45,
        "previous_close": 0.50,
        "market_cap": 1200000000,
        "pe_ratio": None,
        "dividend_yield": 0.0,
        "metadata": {},
        "news": [{"title": "Uchumi updates restructuring plans", "source": "Nation", "published_at": "2025-09-11T08:00:00Z"}]
    },
    {
        "symbol": "ARM",
        "name": "Athi River Mining",
        "sector": "Mining",
        "latest_price": 7.10,
        "previous_close": 7.00,
        "market_cap": 14000000000,
        "pe_ratio": 6.5,
        "dividend_yield": 1.0,
        "metadata": {},
        "news": [{"title": "Athi River Mining secures new supply contracts", "source": "Business Daily", "published_at": "2025-09-07T07:20:00Z"}]
    },
    {
        "symbol": "CRWN",
        "name": "Crown Paints Kenya",
        "sector": "Manufacturing",
        "latest_price": 12.40,
        "previous_close": 12.20,
        "market_cap": 6000000000,
        "pe_ratio": 15.1,
        "dividend_yield": 2.4,
        "metadata": {},
        "news": []
    },
    {
        "symbol": "UNGA",
        "name": "Unga Group PLC",
        "sector": "Food",
        "latest_price": 26.75,
        "previous_close": 26.50,
        "market_cap": 9000000000,
        "pe_ratio": 13.7,
        "dividend_yield": 3.0,
        "metadata": {},
        "news": []
    },
    {
        "symbol": "KNRE",
        "name": "Kenya Reinsurance Corporation",
        "sector": "Insurance",
        "latest_price": 7.80,
        "previous_close": 7.60,
        "market_cap": 5000000000,
        "pe_ratio": 8.0,
        "dividend_yield": 4.5,
        "metadata": {},
        "news": []
    },
    {
        "symbol": "JUB",
        "name": "Jubilee Holdings",
        "sector": "Insurance",
        "latest_price": 320.00,
        "previous_close": 318.50,
        "market_cap": 60000000000,
        "pe_ratio": 10.9,
        "dividend_yield": 2.7,
        "metadata": {},
        "news": []
    },
    {
        "symbol": "SLAM",
        "name": "Sanlam Kenya PLC",
        "sector": "Insurance",
        "latest_price": 3.95,
        "previous_close": 3.90,
        "market_cap": 2000000000,
        "pe_ratio": 11.5,
        "dividend_yield": 1.1,
        "metadata": {},
        "news": []
    },
    {
        "symbol": "BOC",
        "name": "BOC Kenya PLC",
        "sector": "Industrial",
        "latest_price": 18.00,
        "previous_close": 17.80,
        "market_cap": 4000000000,
        "pe_ratio": 9.9,
        "dividend_yield": 2.2,
        "metadata": {},
        "news": []
    }
]


def seed_stocks():
    """Seed database with 20 NSE stocks"""
    print("Initializing database...")
    init_db()
    
    db = SessionLocal()
    try:
        print(f"\nSeeding {len(SEED_STOCKS)} stocks...")
        
        stocks_created = 0
        stocks_updated = 0
        news_created = 0
        
        for stock_data in SEED_STOCKS:
            # Extract news before creating stock
            news_items = stock_data.pop("news", [])
            
            # Check if stock already exists
            existing_stock = db.query(Stock).filter(Stock.symbol == stock_data["symbol"]).first()
            
            if existing_stock:
                # Update existing stock
                for key, value in stock_data.items():
                    setattr(existing_stock, key, value)
                existing_stock.exchange = "NSE"
                existing_stock.currency = "KES"
                existing_stock.lot_size = 1
                existing_stock.updated_at = datetime.utcnow()
                stock = existing_stock
                stocks_updated += 1
                print(f"  Updated: {stock_data['symbol']} - {stock_data['name']}")
            else:
                # Create new stock
                stock = Stock(
                    id=uuid.uuid4(),
                    exchange="NSE",
                    currency="KES",
                    lot_size=1,
                    **stock_data
                )
                db.add(stock)
                stocks_created += 1
                print(f"  Created: {stock_data['symbol']} - {stock_data['name']}")
            
            # Add news items
            for news_item in news_items:
                # Check if news already exists
                existing_news = db.query(News).filter(
                    News.title == news_item["title"],
                    News.source == news_item["source"]
                ).first()
                
                if not existing_news:
                    news = News(
                        id=uuid.uuid4(),
                        stock_id=stock.id,
                        title=news_item["title"],
                        source=news_item["source"],
                        published_at=datetime.fromisoformat(news_item["published_at"].replace('Z', '+00:00')),
                        sentiment_score=0.5,  # Neutral/positive for these news items
                        metadata={}
                    )
                    db.add(news)
                    news_created += 1
        
        db.commit()
        
        print(f"\n[SUCCESS] Seed complete!")
        print(f"   Stocks created: {stocks_created}")
        print(f"   Stocks updated: {stocks_updated}")
        print(f"   News articles created: {news_created}")
        print(f"   Total stocks in DB: {db.query(Stock).count()}")
        
    except Exception as e:
        db.rollback()
        print(f"\n[ERROR] Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_stocks()

