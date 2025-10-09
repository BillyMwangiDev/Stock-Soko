"""
AI Chat Router - Endpoints for AI assistant conversations
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from ..schemas.ai_chat import ChatRequest, ChatResponse, ConversationHistory
from ..services.ai_chat_service import ai_chat_service
from ..utils.jwt import get_current_user

router = APIRouter(prefix="/ai", tags=["ai-assistant"])


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Send a message to the AI assistant and get a response
    
    - **message**: User's message/question
    - **conversation_id**: Optional conversation ID to continue existing chat
    - **context**: Optional context (portfolio data, preferences, etc.)
    
    Returns AI response with suggestions and related stocks
    """
    if not request.message or len(request.message.strip()) == 0:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    if len(request.message) > 1000:
        raise HTTPException(status_code=400, detail="Message too long (max 1000 characters)")
    
    try:
        # Add user info to context
        context = request.context or {}
        context["user_email"] = current_user.get("email")
        
        response = ai_chat_service.generate_response(
            message=request.message,
            conversation_id=request.conversation_id,
            context=context
        )
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate response: {str(e)}")


@router.get("/chat/{conversation_id}", response_model=ConversationHistory)
async def get_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get conversation history by ID
    
    - **conversation_id**: Unique conversation identifier
    """
    conversation = ai_chat_service.get_conversation_history(conversation_id)
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return conversation


@router.delete("/chat/{conversation_id}")
async def clear_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Clear/delete a conversation
    
    - **conversation_id**: Conversation to delete
    """
    success = ai_chat_service.clear_conversation(conversation_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return {"message": "Conversation cleared successfully"}


@router.get("/suggestions")
async def get_suggestions():
    """
    Get suggested questions for the AI assistant
    
    Returns list of common questions users can ask
    """
    suggestions = [
        "What are the top performing stocks today?",
        "Should I buy or sell KCB stock?",
        "Explain P/E ratio in simple terms",
        "What's the best investment strategy for beginners?",
        "Show me stocks with good dividend yields",
        "Analyze Safaricom's recent performance",
        "What sectors are performing well?",
        "How do I diversify my portfolio?"
    ]
    
    return {"suggestions": suggestions}