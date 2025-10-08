from hashlib import sha256
from fastapi import Response


def hash_token(value: str) -> str:
	return sha256(value.encode("utf-8")).hexdigest()


def apply_security_headers(resp: Response) -> None:
	resp.headers.setdefault("X-Content-Type-Options", "nosniff")
	resp.headers.setdefault("X-Frame-Options", "DENY")
	resp.headers.setdefault("Referrer-Policy", "no-referrer")
	resp.headers.setdefault("X-XSS-Protection", "0")


def sanitize_text(value: str) -> str:
	# Minimal sanitation placeholder (expand with proper validation where needed)
	return value.replace("\n", " ").strip()
