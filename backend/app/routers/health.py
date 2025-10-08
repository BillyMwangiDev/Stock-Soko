from fastapi import APIRouter
from ..schemas.common import Message

router = APIRouter(tags=["health"])


@router.get("/health", response_model=Message)

def health() -> Message:
	return Message(message="ok")
