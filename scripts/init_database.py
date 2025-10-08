"""
Initialize database and create test users
Run this script once to set up the database with sample data
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.app.database import init_db
from backend.app.services.user_service import create_user


def main():
    print("Initializing database...")
    init_db()
    print("Database tables created successfully!")
    
    print("\nCreating test users...")
    
    test_users = [
        {
            "email": "john.doe@example.com",
            "password": "Test1234",
            "full_name": "John Doe"
        },
        {
            "email": "jane.smith@test.com",
            "password": "Secure2024",
            "full_name": "Jane Smith"
        },
        {
            "email": "trader@stocksoko.com",
            "password": "Trading123",
            "full_name": "Test Trader"
        },
        {
            "email": "investor@gmail.com",
            "password": "Invest2024",
            "full_name": "Sample Investor"
        },
        {
            "email": "admin@stocksoko.com",
            "password": "Admin2024",
            "full_name": "Admin User"
        }
    ]
    
    for user_data in test_users:
        try:
            user = create_user(
                email=user_data["email"],
                password=user_data["password"],
                full_name=user_data["full_name"]
            )
            print(f"Created user: {user.email}")
        except ValueError as e:
            print(f"Skipped {user_data['email']}: {e}")
    
    print("\nDatabase initialization complete!")
    print("\nTest User Credentials:")
    print("-" * 60)
    for user_data in test_users:
        print(f"Email: {user_data['email']}")
        print(f"Password: {user_data['password']}")
        print(f"Full Name: {user_data['full_name']}")
        print("-" * 60)
    
    print("\nYou can now:")
    print("1. Start backend: uvicorn backend.app.main:app --reload")
    print("2. Login with any test user credentials above")
    print("3. Test all features with pre-seeded users")


if __name__ == "__main__":
    main()

