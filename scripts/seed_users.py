"""
Seed database with test users
Run: python -m scripts.seed_users
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app.database import SessionLocal, init_db
from backend.app.database.models import User, UserProfile, Portfolio
import bcrypt
import uuid


SEED_USERS = [
    {
        "email": "alice+dev@stocksoko.test",
        "full_name": "Alice Developer",
        "phone": "+254711000001",
        "password": "Test123!",  # Will be hashed
        "kyc_status": "verified",
        "cash_balance": 100000.00
    },
    {
        "email": "bob+qa@stocksoko.test",
        "full_name": "Bob QA",
        "phone": "+254711000002",
        "password": "Test123!",
        "kyc_status": "pending",
        "cash_balance": 5000.00
    },
    {
        "email": "demo@stocksoko.test",
        "full_name": "Demo User",
        "phone": "+254711000003",
        "password": "Demo123!",
        "kyc_status": "verified",
        "cash_balance": 50000.00
    }
]


def seed_users():
    """Seed database with test users"""
    print("Initializing database...")
    init_db()
    
    db = SessionLocal()
    try:
        print(f"\nSeeding {len(SEED_USERS)} users...")
        
        users_created = 0
        
        for user_data in SEED_USERS:
            # Check if user already exists
            existing_user = db.query(User).filter(User.email == user_data["email"]).first()
            
            if existing_user:
                print(f"  Skipped (exists): {user_data['email']}")
                continue
            
            # Create user
            # Hash password using bcrypt (same as user_service)
            password_bytes = user_data["password"].encode('utf-8')
            if len(password_bytes) > 72:
                password_bytes = password_bytes[:72]
            password_hash = bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')
            
            user = User(
                # Let SQLAlchemy generate the ID automatically
                email=user_data["email"],
                phone=user_data["phone"],
                full_name=user_data["full_name"],
                password_hash=password_hash,
                is_active=True,
                role="user"
            )
            db.add(user)
            db.flush()  # Get user.id
            
            # Create profile
            profile = UserProfile(
                user_id=user.id,
                kyc_status=user_data["kyc_status"],
                nationality="KE",
                kyc_data={}
            )
            db.add(profile)
            
            # Create portfolio
            portfolio = Portfolio(
                user_id=user.id,
                cash=user_data["cash_balance"],
                buying_power=user_data["cash_balance"],
                total_value=user_data["cash_balance"],
                unrealized_pl=0
            )
            db.add(portfolio)
            
            users_created += 1
            print(f"  Created: {user_data['email']} (Cash: KES {user_data['cash_balance']:,.2f})")
        
        db.commit()
        
        print(f"\n[SUCCESS] User seed complete!")
        print(f"   Users created: {users_created}")
        print(f"   Total users in DB: {db.query(User).count()}")
        print("\n[CREDENTIALS] Test Credentials:")
        for user_data in SEED_USERS:
            print(f"   {user_data['email']} / {user_data['password']}")
        
    except Exception as e:
        db.rollback()
        print(f"\n[ERROR] Error seeding users: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_users()