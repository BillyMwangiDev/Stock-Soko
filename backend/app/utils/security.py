import re
from hashlib import sha256
from typing import Optional
from fastapi import Response, HTTPException, status


def hash_token(value: str) -> str:
    return sha256(value.encode("utf-8")).hexdigest()


def apply_security_headers(resp: Response) -> None:
    resp.headers.setdefault("X-Content-Type-Options", "nosniff")
    resp.headers.setdefault("X-Frame-Options", "DENY")
    resp.headers.setdefault("Referrer-Policy", "no-referrer")
    resp.headers.setdefault("X-XSS-Protection", "0")
    resp.headers.setdefault("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
    resp.headers.setdefault("Content-Security-Policy", "default-src 'self'")


def sanitize_text(value: str, max_length: int = 1000) -> str:
    if not value:
        return ""
    sanitized = value.replace("\n", " ").replace("\r", " ").strip()
    sanitized = re.sub(r'\s+', ' ', sanitized)
    return sanitized[:max_length]


def validate_phone_number(phone: str) -> str:
    phone_clean = re.sub(r'\D', '', phone)
    if not phone_clean:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid phone number format"
        )
    if phone_clean.startswith("0"):
        phone_clean = "254" + phone_clean[1:]
    elif phone_clean.startswith("254"):
        pass
    elif phone_clean.startswith("+254"):
        phone_clean = phone_clean[1:]
    else:
        phone_clean = "254" + phone_clean
    
    if len(phone_clean) != 12 or not phone_clean.startswith("254"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number must be in Kenyan format (254...)"
        )
    return phone_clean


def validate_email(email: str) -> str:
    email = email.lower().strip()
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )
    return email


def validate_password_strength(password: str) -> None:
    if len(password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters"
        )
    if not re.search(r'[A-Z]', password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one uppercase letter"
        )
    if not re.search(r'[a-z]', password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one lowercase letter"
        )
    if not re.search(r'\d', password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one digit"
        )