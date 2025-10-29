"""
Rule-Based Stock Recommendation System
Provides recommendations based on financial metrics and technical indicators
"""
import random
from typing import Any, Dict, List, Literal, Tuple

Recommendation = Literal["BUY", "HOLD", "SELL"]


class RuleBasedRecommender:
    """
    Rule-based recommendation engine for stocks
    Uses financial metrics and technical indicators to generate recommendations
    """
    
    def __init__(self):
        self.weights = {
            'financial_score': 0.4,
            'technical_score': 0.3,
            'momentum_score': 0.2,
            'risk_score': 0.1
        }
    
    def get_recommendation(self, stock_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate recommendation for a stock based on rule-based analysis
        
        Args:
            stock_data: Stock data dictionary with financial metrics
            
        Returns:
            Dict with recommendation, confidence, and reasoning
        """
        # Calculate scores
        financial_score = self._calculate_financial_score(stock_data)
        technical_score = self._calculate_technical_score(stock_data)
        momentum_score = self._calculate_momentum_score(stock_data)
        risk_score = self._calculate_risk_score(stock_data)
        
        # Calculate weighted overall score
        overall_score = (
            financial_score * self.weights['financial_score'] +
            technical_score * self.weights['technical_score'] +
            momentum_score * self.weights['momentum_score'] +
            risk_score * self.weights['risk_score']
        )
        
        # Determine recommendation
        recommendation, confidence = self._score_to_recommendation(overall_score)
        
        # Generate reasoning
        reasoning = self._generate_reasoning(
            stock_data,
            recommendation,
            financial_score,
            technical_score,
            momentum_score,
            risk_score
        )
        
        # Get key metrics
        key_metrics = self._get_key_metrics(stock_data)
        
        # Generate action points
        action_points = self._generate_action_points(
            recommendation,
            stock_data,
            overall_score
        )
        
        return {
            "recommendation": recommendation,
            "confidence": confidence,
            "overall_score": round(overall_score, 2),
            "reasoning": reasoning,
            "key_metrics": key_metrics,
            "action_points": action_points,
            "scores": {
                "financial": round(financial_score, 2),
                "technical": round(technical_score, 2),
                "momentum": round(momentum_score, 2),
                "risk": round(risk_score, 2)
            }
        }
    
    def _calculate_financial_score(self, stock: Dict[str, Any]) -> float:
        """Calculate financial health score (0-100)"""
        score = 50.0  # Base score
        
        # P/E Ratio Analysis (weight: 20 points)
        pe_ratio = stock.get('pe_ratio', 15)
        if 0 < pe_ratio < 8:
            score += 20  # Very undervalued
        elif 8 <= pe_ratio < 12:
            score += 15  # Undervalued
        elif 12 <= pe_ratio < 20:
            score += 10  # Fair value
        elif 20 <= pe_ratio < 30:
            score += 5   # Slightly overvalued
        else:
            score -= 5   # Overvalued or negative
        
        # ROE (Return on Equity) - weight: 15 points
        roe = stock.get('roe', 10)
        if roe >= 20:
            score += 15  # Excellent
        elif roe >= 15:
            score += 10  # Good
        elif roe >= 10:
            score += 5   # Average
        else:
            score += 0   # Poor
        
        # Profit Margin - weight: 10 points
        profit_margin = stock.get('profit_margin', 10)
        if profit_margin >= 25:
            score += 10
        elif profit_margin >= 15:
            score += 7
        elif profit_margin >= 10:
            score += 4
        else:
            score += 0
        
        # Dividend Yield - weight: 5 points
        dividend_yield = stock.get('dividend_yield', 0)
        if dividend_yield >= 7:
            score += 5
        elif dividend_yield >= 5:
            score += 3
        elif dividend_yield >= 3:
            score += 2
        
        # Debt to Equity - weight: 10 points
        debt_to_equity = stock.get('debt_to_equity', 0.5)
        if debt_to_equity < 0.3:
            score += 10  # Very healthy
        elif debt_to_equity < 0.5:
            score += 7   # Healthy
        elif debt_to_equity < 1.0:
            score += 3   # Acceptable
        else:
            score -= 5   # Concerning
        
        return min(max(score, 0), 100)
    
    def _calculate_technical_score(self, stock: Dict[str, Any]) -> float:
        """Calculate technical analysis score (0-100)"""
        score = 50.0
        
        # Price change - weight: 30 points
        change_pct = stock.get('change_percent', 0)
        if change_pct > 3:
            score += 30  # Strong uptrend
        elif change_pct > 1:
            score += 20  # Uptrend
        elif change_pct > 0:
            score += 10  # Slightly positive
        elif change_pct > -1:
            score -= 10  # Slightly negative
        elif change_pct > -3:
            score -= 20  # Downtrend
        else:
            score -= 30  # Strong downtrend
        
        # Volume indicator - weight: 20 points
        volume = stock.get('volume', 0)
        if volume > 5000000:
            score += 20  # High liquidity
        elif volume > 1000000:
            score += 15  # Good liquidity
        elif volume > 500000:
            score += 10  # Average liquidity
        else:
            score += 5   # Low liquidity
        
        return min(max(score, 0), 100)
    
    def _calculate_momentum_score(self, stock: Dict[str, Any]) -> float:
        """Calculate momentum score (0-100)"""
        score = 50.0
        
        # Revenue growth - weight: 30 points
        revenue_growth = stock.get('revenue_growth', 0)
        if revenue_growth > 15:
            score += 30
        elif revenue_growth > 10:
            score += 20
        elif revenue_growth > 5:
            score += 10
        elif revenue_growth > 0:
            score += 5
        else:
            score -= 10
        
        # Market sentiment - weight: 20 points
        sentiment = stock.get('market_sentiment', 'Neutral')
        if sentiment == 'Bullish':
            score += 20
        elif sentiment == 'Neutral':
            score += 10
        else:
            score -= 10
        
        return min(max(score, 0), 100)
    
    def _calculate_risk_score(self, stock: Dict[str, Any]) -> float:
        """Calculate risk-adjusted score (0-100) - lower risk = higher score"""
        score = 100.0
        
        # Risk score (1-10 scale, lower is better)
        risk = stock.get('risk_score', 5)
        # Invert: low risk gets high score
        score -= (risk * 5)
        
        # Volatility
        volatility = stock.get('volatility', 20)
        if volatility < 15:
            score += 0  # Low volatility bonus
        elif volatility < 25:
            score -= 10
        else:
            score -= 20  # High volatility penalty
        
        # Beta (market correlation)
        beta = stock.get('beta', 1.0)
        if beta < 0.8:
            score += 10  # Low correlation bonus
        elif beta > 1.2:
            score -= 10  # High correlation penalty
        
        return min(max(score, 0), 100)
    
    def _score_to_recommendation(self, score: float) -> Tuple[Recommendation, int]:
        """Convert overall score to recommendation and confidence"""
        if score >= 70:
            return "BUY", int(min((score - 70) * 3 + 70, 95))
        elif score >= 45:
            return "HOLD", int(60 + (score - 45) * 0.8)
        else:
            return "SELL", int(max(50 + (45 - score), 55))
    
    def _generate_reasoning(
        self,
        stock: Dict[str, Any],
        recommendation: Recommendation,
        fin_score: float,
        tech_score: float,
        mom_score: float,
        risk_score: float
    ) -> str:
        """Generate detailed reasoning for the recommendation"""
        name = stock.get('name', 'This stock')
        symbol = stock.get('symbol', '')
        
        reasoning_parts = []
        
        # Opening statement
        if recommendation == "BUY":
            reasoning_parts.append(
                f"{name} ({symbol}) shows strong indicators for potential growth."
            )
        elif recommendation == "HOLD":
            reasoning_parts.append(
                f"{name} ({symbol}) presents a balanced risk-reward profile. "
                "Suitable for maintaining current position."
            )
        else:
            reasoning_parts.append(
                f"{name} ({symbol}) shows concerning indicators that suggest caution."
            )
        
        # Financial analysis
        if fin_score >= 70:
            reasoning_parts.append(
                f"Strong fundamentals with {stock.get('roe', 0):.1f}% ROE and "
                f"{stock.get('profit_margin', 0):.1f}% profit margin."
            )
        elif fin_score < 40:
            reasoning_parts.append(
                "Financial metrics show room for improvement in profitability."
            )
        
        # Technical analysis
        change = stock.get('change_percent', 0)
        if change > 2:
            reasoning_parts.append(
                f"Strong upward momentum with +{change:.2f}% gain."
            )
        elif change < -2:
            reasoning_parts.append(
                f"Recent downward pressure with {change:.2f}% decline."
            )
        
        # Valuation
        pe = stock.get('pe_ratio', 15)
        if pe > 0 and pe < 10:
            reasoning_parts.append(
                f"Trading at attractive P/E ratio of {pe:.1f}x."
            )
        elif pe > 25:
            reasoning_parts.append(
                f"Premium valuation at P/E of {pe:.1f}x may limit upside."
            )
        
        # Dividend consideration
        div_yield = stock.get('dividend_yield', 0)
        if div_yield >= 5:
            reasoning_parts.append(
                f"Attractive dividend yield of {div_yield:.1f}% provides income cushion."
            )
        
        # Risk assessment
        risk = stock.get('risk_score', 5)
        if risk <= 3:
            reasoning_parts.append("Low risk profile suitable for conservative investors.")
        elif risk >= 7:
            reasoning_parts.append("Higher risk level - suitable for aggressive investors only.")
        
        return " ".join(reasoning_parts)
    
    def _get_key_metrics(self, stock: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract key metrics for display"""
        return [
            {
                "label": "P/E Ratio",
                "value": f"{stock.get('pe_ratio', 0):.1f}x",
                "status": self._get_pe_status(stock.get('pe_ratio', 15))
            },
            {
                "label": "ROE",
                "value": f"{stock.get('roe', 0):.1f}%",
                "status": "good" if stock.get('roe', 0) >= 15 else "neutral"
            },
            {
                "label": "Dividend Yield",
                "value": f"{stock.get('dividend_yield', 0):.1f}%",
                "status": "good" if stock.get('dividend_yield', 0) >= 5 else "neutral"
            },
            {
                "label": "Debt/Equity",
                "value": f"{stock.get('debt_to_equity', 0):.2f}",
                "status": "good" if stock.get('debt_to_equity', 1) < 0.5 else "neutral"
            },
            {
                "label": "Risk Score",
                "value": f"{stock.get('risk_score', 5):.1f}/10",
                "status": "good" if stock.get('risk_score', 5) <= 3 else "warning"
            }
        ]
    
    def _get_pe_status(self, pe_ratio: float) -> str:
        """Determine P/E ratio status"""
        if pe_ratio < 0:
            return "warning"
        elif pe_ratio < 10:
            return "good"
        elif pe_ratio < 20:
            return "neutral"
        else:
            return "warning"
    
    def _generate_action_points(
        self,
        recommendation: Recommendation,
        stock: Dict[str, Any],
        score: float
    ) -> List[str]:
        """Generate actionable points based on recommendation"""
        points = []
        symbol = stock.get('symbol', '')
        price = stock.get('last_price', 0)
        
        if recommendation == "BUY":
            points.append(f"Consider entry at current price of KES {price:.2f}")
            points.append("Recommended position size: 5-10% of portfolio")
            
            # Add stop loss based on volatility
            volatility = stock.get('volatility', 20)
            stop_loss = price * (1 - volatility / 200)  # Half volatility as stop
            points.append(f"Suggested stop loss: KES {stop_loss:.2f}")
            
            # Target price
            target = price * 1.15  # 15% upside target
            points.append(f"Price target (6-12 months): KES {target:.2f}")
            
        elif recommendation == "HOLD":
            points.append("Maintain current position if already invested")
            points.append("Monitor quarterly earnings and sector trends")
            points.append("Consider averaging up only on significant dips (>5%)")
            
        else:  # SELL
            points.append("Consider reducing or exiting position")
            points.append("Review fundamentals before making final decision")
            points.append("Reallocate to higher conviction opportunities")
        
        # Always add risk disclaimer
        points.append("⚠️ Not financial advice - do your own research")
        
        return points


# Singleton instance
rule_based_recommender = RuleBasedRecommender()

