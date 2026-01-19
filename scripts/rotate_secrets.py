"""
Secret Rotation Utility
Generates secure secrets for Stock Soko application
"""
import secrets
import string
from pathlib import Path


def generate_jwt_secret(length: int = 64) -> str:
    """Generate secure JWT secret"""
    return secrets.token_urlsafe(length)


def generate_password(length: int = 32) -> str:
    """Generate secure password with special characters"""
    alphabet = string.ascii_letters + string.digits + string.punctuation
    # Ensure at least one of each required character type
    password = [
        secrets.choice(string.ascii_lowercase),
        secrets.choice(string.ascii_uppercase),
        secrets.choice(string.digits),
        secrets.choice(string.punctuation),
    ]
    # Fill the rest randomly
    password.extend(secrets.choice(alphabet) for _ in range(length - 4))
    # Shuffle to avoid predictable patterns
    secrets.SystemRandom().shuffle(password)
    return ''.join(password)


def generate_api_key(length: int = 32) -> str:
    """Generate API key (alphanumeric)"""
    return secrets.token_hex(length)


def main():
    """Generate all secrets needed for Stock Soko"""
    print("=" * 60)
    print("Stock Soko Secret Generator")
    print("=" * 60)
    print()
    print("CRITICAL: Store these securely and never commit to Git!")
    print()
    
    print("1. JWT Secret (required)")
    print("-" * 60)
    jwt_secret = generate_jwt_secret(64)
    print(f"JWT_SECRET={jwt_secret}")
    print()
    
    print("2. Database Password (production)")
    print("-" * 60)
    db_password = generate_password(32)
    print(f"DATABASE_PASSWORD={db_password}")
    print(f"DATABASE_URL=postgresql://stocksoko:{db_password}@host:5432/stocksoko")
    print()
    
    print("3. SMTP Password (if using email)")
    print("-" * 60)
    ***REMOVED***
    print(f"***REMOVED***={smtp_password}")
    print()
    
    print("4. AWS Secret Access Key (if using S3)")
    print("-" * 60)
    aws_secret = generate_api_key(40)
    print(f"AWS_SECRET_ACCESS_KEY={aws_secret}")
    print()
    
    print("5. M-Pesa Consumer Secret (production)")
    print("-" * 60)
    mpesa_secret = generate_api_key(32)
    print(f"MPESA_CONSUMER_SECRET={mpesa_secret}")
    print()
    
    print("=" * 60)
    print("Next Steps:")
    print("=" * 60)
    print("1. Copy the values above")
    print("2. Update your production environment variables")
    print("3. Test the application")
    print("4. Revoke old secrets after verification")
    print("5. Document rotation in security log")
    print()
    print("NEVER share these values or commit them to Git!")
    print("=" * 60)


if __name__ == "__main__":
    main()
