#!/usr/bin/env python
"""
Seed Database with Mock Stock Data
"""
import sys
sys.path.insert(0, 'backend')

from app.database import SessionLocal, init_db
from app.database.models import Stock
from app.data.sample_stocks import SAMPLE_STOCKS

def seed_stocks():
    """Seed database with stock data"""
    init_db()
    
    db = SessionLocal()
    
    try:
        existing_count = db.query(Stock).count()
        
        if existing_count > 0:
            print(f"Database already has {existing_count} stocks. Skipping seed.")
            return 0
        
        print(f"Seeding {len(SAMPLE_STOCKS)} stocks...")
        
        for stock_data in SAMPLE_STOCKS:
            stock = Stock(**stock_data)
            db.add(stock)
        
        db.commit()
        print(f"Successfully seeded {len(SAMPLE_STOCKS)} stocks!")
        return 0
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        return 1
    finally:
        db.close()

if __name__ == '__main__':
    sys.exit(seed_stocks())

