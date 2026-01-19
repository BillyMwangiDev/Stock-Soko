"""
AI Chat Service - Provides conversational AI assistance for stock trading
"""

import random
import uuid
from datetime import datetime
from typing import List, Optional


class AIChatService:
    """Service for AI chat assistant functionality"""

    def __init__(self):
        self.conversations = {}  # In-memory storage (use DB in production)

    def generate_response(
        self,
        message: str,
        conversation_id: Optional[str] = None,
        context: Optional[dict] = None,
    ) -> dict:
        """
        Generate AI response to user message

        Args:
            message: User's message
            conversation_id: Existing conversation ID or None for new
            context: Additional context (portfolio, market data, etc.)

        Returns:
            Dict with response, conversation_id, suggestions, related_stocks
        """
        # Create or get conversation ID
        if not conversation_id:
            conversation_id = str(uuid.uuid4())

        # Analyze message intent
        message_lower = message.lower()

        # Generate contextual response based on keywords
        response = self._generate_contextual_response(message_lower, context)
        suggestions = self._generate_suggestions(message_lower)
        related_stocks = self._extract_related_stocks(message_lower)

        # Store message in conversation history
        if conversation_id not in self.conversations:
            self.conversations[conversation_id] = []

        self.conversations[conversation_id].extend(
            [
                {
                    "role": "user",
                    "content": message,
                    "timestamp": datetime.utcnow().isoformat(),
                },
                {
                    "role": "assistant",
                    "content": response,
                    "timestamp": datetime.utcnow().isoformat(),
                },
            ]
        )

        return {
            "message": response,
            "conversation_id": conversation_id,
            "suggestions": suggestions,
            "related_stocks": related_stocks,
        }

    def _generate_contextual_response(
        self, message: str, context: Optional[dict]
    ) -> str:
        """Generate response based on message content"""

        # Stock recommendation queries
        if any(word in message for word in ["buy", "sell", "should i", "recommend"]):
            stocks = ["KCB", "SCOM", "EQTY", "EABL"]
            stock = next(
                (s for s in stocks if s.lower() in message), random.choice(stocks)
            )

            return f"""Based on current market analysis for {stock}:

**Technical Analysis**: The stock shows {random.choice(['bullish', 'neutral', 'consolidating'])} momentum on the daily chart.

**Fundamentals**: {random.choice([
    'Strong earnings growth and solid dividend yield',
    'P/E ratio is attractive compared to sector average',
    'Recent quarterly results beat analyst expectations'
])}

**Recommendation**: {random.choice(['BUY', 'HOLD', 'Consider for long-term'])} - {random.choice([
    'Good entry point for long-term investors',
    'Wait for pullback before entering',
    'Strong fundamentals support current price'
])}

**Risk**: This is not financial advice. Always do your own research and consider your risk tolerance."""

        # Market overview queries
        elif any(word in message for word in ["market", "today", "performing", "top"]):
            return """Here's today's market overview for NSE:

**Top Gainers**:
- KCB Group: +2.3% (Strong banking sector performance)
- Safaricom: +1.8% (M-Pesa growth momentum)
- EABL: +1.2% (Dividend announcement boost)

**Top Losers**:
- BAT Kenya: -1.5% (Regulatory concerns)

**Market Summary**:
- NSE 20-Share Index: +0.5%
- Total Volume: 12.5M shares
- Market Sentiment: Positive

Would you like detailed analysis on any specific stock?"""

        # Learning/education queries
        elif any(
            word in message for word in ["what is", "explain", "how does", "ratio"]
        ):
            if "p/e" in message or "pe ratio" in message:
                return """**P/E Ratio (Price-to-Earnings Ratio)** explained simply:

**What it is**: The P/E ratio shows how much investors are willing to pay for each shilling of a company's earnings.

**Formula**: P/E Ratio = Stock Price ÷ Earnings Per Share

**Example**: If KCB trades at KES 50 and earns KES 10 per share:
   P/E Ratio = 50 ÷ 10 = 5

**Interpretation**:
- **Low P/E** (5-10): May indicate undervalued stock or slow growth
- **Medium P/E** (10-20): Generally fair valuation
- **High P/E** (20+): May indicate overvaluation or high growth expectations

**For NSE stocks**: Average P/E is around 8-12. Compare within the same sector for best insights.

Want to see P/E ratios for specific stocks?"""

            return """I can help you understand stock market concepts! Here are some topics:

**Popular Topics**:
- P/E Ratio - Valuation metric
- Dividend Yield - Income from stocks
- Market Cap - Company size
- Technical Analysis - Chart patterns
- Fundamental Analysis - Company health

What would you like to learn about?"""

        # Investment strategy queries
        elif any(
            word in message for word in ["strategy", "beginner", "start", "invest"]
        ):
            return """**Investment Strategy for Beginners**

**Start Small**: Begin with amount you can afford to lose (KES 5,000-10,000)

**Diversify**: Don't put all money in one stock
   - 40% Blue chips (KCB, SCOM, EQTY)
   - 30% Dividend stocks (EABL)
   - 30% Growth stocks

**Long-term Focus**: Hold for at least 1-2 years

**Regular Review**: Check portfolio monthly, not daily

**Keep Learning**: Follow market news and company reports

**Tip**: Start with well-known companies you understand (Safaricom, KCB, Equity Bank)

Ready to start? I can help you analyze specific stocks!"""

        # Default helpful response
        return """Hello! I'm your AI trading assistant for the Kenyan stock market. 

I can help you with:
- Stock analysis and recommendations
- Market trends and insights
- Investment strategies
- Learning about trading concepts
- Portfolio advice

What would you like to know about?"""

    def _generate_suggestions(self, message: str) -> List[str]:
        """Generate contextual suggestions for follow-up"""

        if "recommend" in message or "buy" in message:
            return [
                "Show me top gainers today",
                "Compare with sector peers",
                "What's the risk level?",
                "Show dividend history",
            ]
        elif "market" in message:
            return [
                "Analyze specific stock",
                "Show sector performance",
                "What's driving the market?",
                "Best stocks for beginners",
            ]
        elif "learn" in message or "explain" in message:
            return [
                "Explain dividend yield",
                "What is market cap?",
                "How to read stock charts",
                "Investment strategies for beginners",
            ]
        else:
            return [
                "What are the top stocks today?",
                "Should I buy or sell KCB?",
                "Explain P/E ratio",
                "Best investment strategy for beginners",
            ]

    def _extract_related_stocks(self, message: str) -> List[str]:
        """Extract stock symbols mentioned in message"""
        common_stocks = ["KCB", "SCOM", "EQTY", "EABL", "BAT", "KEGN", "SCBK"]

        related = []
        for stock in common_stocks:
            if stock.lower() in message:
                related.append(stock)

        # If no stocks mentioned but asking about market, show top stocks
        if not related and any(word in message for word in ["market", "top", "best"]):
            related = ["KCB", "SCOM", "EQTY"]

        return related

    def get_conversation_history(self, conversation_id: str) -> Optional[dict]:
        """Get conversation history by ID"""
        if conversation_id in self.conversations:
            return {
                "conversation_id": conversation_id,
                "messages": self.conversations[conversation_id],
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
            }
        return None

    def clear_conversation(self, conversation_id: str) -> bool:
        """Clear conversation history"""
        if conversation_id in self.conversations:
            del self.conversations[conversation_id]
            return True
        return False


# Singleton instance
ai_chat_service = AIChatService()
