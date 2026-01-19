from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str
    timestamp: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "role": "user",
                "content": "What are the top performing stocks today?",
                "timestamp": "2025-01-15T10:00:00Z",
            }
        }


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    conversation_id: Optional[str] = None
    context: Optional[dict] = Field(
        None, description="Additional context like user portfolio"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "message": "Should I buy KCB stock?",
                "conversation_id": "conv_123",
                "context": {"portfolio_value": 10000},
            }
        }


class ChatResponse(BaseModel):
    message: str
    conversation_id: str
    suggestions: Optional[List[str]] = []
    related_stocks: Optional[List[str]] = []

    class Config:
        json_schema_extra = {
            "example": {
                "message": "Based on current market analysis, KCB shows strong fundamentals...",
                "conversation_id": "conv_123",
                "suggestions": [
                    "Show me KCB's performance",
                    "Compare with other banks",
                ],
                "related_stocks": ["KCB", "EQTY", "SCBK"],
            }
        }


class ConversationHistory(BaseModel):
    conversation_id: str
    messages: List[ChatMessage]
    created_at: datetime
    updated_at: datetime
