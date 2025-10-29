"""
Stock Analysis Framework
Comprehensive analysis system for fundamental, technical, and macro analysis
"""
import random
from datetime import datetime, timedelta
from typing import Any, Dict, List, Literal


class StockAnalyzer:
    """
    Multi-dimensional stock analysis engine combining:
    - Fundamental Analysis (financial health, valuation, growth)
    - Technical Analysis (trends, indicators, patterns)
    - Macro & Sentiment Analysis (economic factors, market psychology)
    """
    
    def __init__(self, stock_data: Dict[str, Any]):
        self.stock = stock_data
        self.symbol = stock_data.get('symbol', '')
        
    def fundamental_analysis(self) -> Dict[str, Any]:
        """
        Analyze company's financial health, valuation, and long-term potential
        """
        # Financial Health Metrics
        revenue_growth = self.stock.get('revenue_growth', 0)
        profit_margin = self.stock.get('profit_margin', 0)
        debt_to_equity = self.stock.get('debt_to_equity', 0)
        
        # Valuation Ratios
        pe_ratio = self.stock.get('pe_ratio', 0)
        pb_ratio = self.stock.get('pb_ratio', 0)
        
        # Returns
        roe = self.stock.get('roe', 0)
        roa = self.stock.get('roa', 0)
        
        # Dividend Metrics
        dividend_yield = self.stock.get('dividend_yield', 0)
        
        # Scoring
        financial_score = self._score_financial_health(revenue_growth, profit_margin, debt_to_equity)
        valuation_score = self._score_valuation(pe_ratio, pb_ratio)
        profitability_score = self._score_profitability(roe, roa, profit_margin)
        dividend_score = self._score_dividend(dividend_yield)
        
        overall_fundamental_score = (
            financial_score * 0.3 +
            valuation_score * 0.3 +
            profitability_score * 0.3 +
            dividend_score * 0.1
        )
        
        return {
            'financial_health': {
                'revenue_growth': revenue_growth,
                'profit_margin': profit_margin,
                'debt_to_equity': debt_to_equity,
                'score': financial_score,
                'rating': self._get_rating(financial_score)
            },
            'valuation': {
                'pe_ratio': pe_ratio,
                'pb_ratio': pb_ratio,
                'score': valuation_score,
                'rating': self._get_rating(valuation_score),
                'status': self._get_valuation_status(pe_ratio)
            },
            'profitability': {
                'roe': roe,
                'roa': roa,
                'profit_margin': profit_margin,
                'score': profitability_score,
                'rating': self._get_rating(profitability_score)
            },
            'dividends': {
                'yield': dividend_yield,
                'score': dividend_score,
                'rating': self._get_rating(dividend_score)
            },
            'overall_score': overall_fundamental_score,
            'overall_rating': self._get_rating(overall_fundamental_score),
            'recommendation': self._get_fundamental_recommendation(overall_fundamental_score)
        }
    
    def technical_analysis(self) -> Dict[str, Any]:
        """
        Analyze price trends, momentum indicators, and chart patterns
        """
        current_price = self.stock.get('last_price', 0)
        ma_50 = self.stock.get('ma_50', current_price)
        ma_200 = self.stock.get('ma_200', current_price)
        rsi = self.stock.get('rsi', 50)
        macd = self.stock.get('macd', 0)
        macd_signal = self.stock.get('macd_signal', 0)
        volume = self.stock.get('volume', 0)
        avg_volume = self.stock.get('avg_volume', volume)
        
        # Trend Analysis
        trend = self._analyze_trend(current_price, ma_50, ma_200)
        
        # Momentum Indicators
        rsi_signal = self._analyze_rsi(rsi)
        macd_signal_result = self._analyze_macd(macd, macd_signal)
        volume_signal = self._analyze_volume(volume, avg_volume)
        
        # Support & Resistance
        support = self.stock.get('support_level', current_price * 0.95)
        resistance = self.stock.get('resistance_level', current_price * 1.05)
        
        # Technical Score
        technical_score = self._calculate_technical_score(
            trend, rsi_signal, macd_signal_result, volume_signal
        )
        
        return {
            'trend': trend,
            'moving_averages': {
                'ma_50': ma_50,
                'ma_200': ma_200,
                'price_vs_ma50': ((current_price - ma_50) / ma_50 * 100),
                'price_vs_ma200': ((current_price - ma_200) / ma_200 * 100),
                'golden_cross': ma_50 > ma_200,
                'signal': 'Bullish' if ma_50 > ma_200 else 'Bearish'
            },
            'momentum': {
                'rsi': rsi,
                'rsi_signal': rsi_signal,
                'macd': macd,
                'macd_signal': macd_signal,
                'macd_crossover': macd_signal_result,
                'volume_trend': volume_signal
            },
            'support_resistance': {
                'support': support,
                'resistance': resistance,
                'distance_to_support': ((current_price - support) / current_price * 100),
                'distance_to_resistance': ((resistance - current_price) / current_price * 100)
            },
            'overall_score': technical_score,
            'overall_rating': self._get_rating(technical_score),
            'recommendation': self._get_technical_recommendation(technical_score)
        }
    
    def macro_sentiment_analysis(self) -> Dict[str, Any]:
        """
        Assess external economic and psychological factors
        """
        market_sentiment = self.stock.get('market_sentiment', 'Neutral')
        sector_strength = self.stock.get('sector_strength', 'Moderate')
        
        # Economic Indicators (Kenya-specific)
        economic_factors = {
            'interest_rate_trend': 'Stable',  # CBK rate
            'inflation_trend': 'Moderate',     # 5-7% range
            'gdp_growth': 'Positive',          # 5%+ expected
            'usd_kes_stability': 'Stable',     # Currency impact
        }
        
        # Market Factors
        nse_trend = self.stock.get('kenya_market_trend', 'Bullish')
        global_impact = self.stock.get('global_market_impact', 'Low correlation')
        
        # Sentiment Score
        sentiment_score = self._calculate_sentiment_score(
            market_sentiment, sector_strength, nse_trend
        )
        
        return {
            'market_sentiment': market_sentiment,
            'sector_strength': sector_strength,
            'kenya_market': {
                'nse_trend': nse_trend,
                'sector_performance': sector_strength
            },
            'global_factors': {
                'correlation': global_impact,
                'impact_level': 'Moderate'
            },
            'economic_indicators': economic_factors,
            'overall_score': sentiment_score,
            'overall_rating': self._get_rating(sentiment_score),
            'recommendation': self._get_sentiment_recommendation(sentiment_score)
        }
    
    def generate_ai_recommendation(self) -> Dict[str, Any]:
        """
        Generate comprehensive AI recommendation based on all analysis types
        """
        fundamental = self.fundamental_analysis()
        technical = self.technical_analysis()
        macro = self.macro_sentiment_analysis()
        
        # Weighted composite score
        composite_score = (
            fundamental['overall_score'] * 0.40 +  # 40% weight on fundamentals
            technical['overall_score'] * 0.40 +    # 40% weight on technicals
            macro['overall_score'] * 0.20          # 20% weight on macro/sentiment
        )
        
        # Generate recommendation
        recommendation = self._get_composite_recommendation(
            composite_score,
            fundamental['recommendation'],
            technical['recommendation'],
            macro['recommendation']
        )
        
        # Generate detailed reasoning
        reasoning = self._generate_reasoning(
            recommendation,
            fundamental,
            technical,
            macro
        )
        
        # Risk assessment
        risk_level = self._assess_risk(fundamental, technical, composite_score)
        
        # Target price calculation
        current_price = self.stock.get('last_price', 0)
        target_price = self._calculate_target_price(
            current_price,
            recommendation,
            fundamental,
            technical
        )
        
        # Confidence calculation
        confidence = min(95, max(60, int(composite_score)))
        
        return {
            'symbol': self.symbol,
            'recommendation': recommendation,
            'confidence': confidence,
            'composite_score': composite_score,
            'target_price': target_price,
            'current_price': current_price,
            'upside_potential': ((target_price - current_price) / current_price * 100) if current_price > 0 else 0,
            'risk_level': risk_level,
            'time_horizon': self._get_time_horizon(fundamental, technical),
            'reasoning': reasoning,
            'analysis_breakdown': {
                'fundamental': fundamental,
                'technical': technical,
                'macro_sentiment': macro
            },
            'key_factors': self._extract_key_factors(fundamental, technical, macro),
            'risk_factors': self._identify_risk_factors(fundamental, technical),
            'catalysts': self._identify_catalysts(self.stock),
            'strategy': self._generate_strategy(recommendation, technical)
        }
    
    # Helper Methods
    
    def _score_financial_health(self, revenue_growth, profit_margin, debt_to_equity) -> float:
        """Score financial health metrics (0-100)"""
        score = 50  # Base score
        
        # Revenue growth (0-30 points)
        if revenue_growth > 15:
            score += 30
        elif revenue_growth > 10:
            score += 20
        elif revenue_growth > 5:
            score += 10
        
        # Profit margin (0-30 points)
        if profit_margin > 20:
            score += 30
        elif profit_margin > 15:
            score += 20
        elif profit_margin > 10:
            score += 10
        
        # Debt level (0-20 points)
        if debt_to_equity < 0.5:
            score += 20
        elif debt_to_equity < 1.0:
            score += 10
        elif debt_to_equity > 2.0:
            score -= 10
        
        return min(100, max(0, score))
    
    def _score_valuation(self, pe_ratio, pb_ratio) -> float:
        """Score valuation metrics (0-100)"""
        score = 50
        
        # P/E Ratio scoring (undervalued is better)
        if pe_ratio < 10:
            score += 40
        elif pe_ratio < 15:
            score += 25
        elif pe_ratio < 20:
            score += 10
        elif pe_ratio > 30:
            score -= 20
        
        # P/B Ratio scoring
        if pb_ratio < 1.0:
            score += 10
        elif pb_ratio < 2.0:
            score += 5
        
        return min(100, max(0, score))
    
    def _score_profitability(self, roe, roa, profit_margin) -> float:
        """Score profitability metrics (0-100)"""
        score = 50
        
        # ROE scoring
        if roe > 20:
            score += 30
        elif roe > 15:
            score += 20
        elif roe > 10:
            score += 10
        
        # ROA scoring
        if roa > 10:
            score += 20
        elif roa > 5:
            score += 10
        
        return min(100, max(0, score))
    
    def _score_dividend(self, dividend_yield) -> float:
        """Score dividend attractiveness (0-100)"""
        if dividend_yield > 6:
            return 100
        elif dividend_yield > 4:
            return 80
        elif dividend_yield > 2:
            return 60
        elif dividend_yield > 0:
            return 40
        return 20
    
    def _analyze_trend(self, price, ma_50, ma_200) -> Dict[str, Any]:
        """Analyze price trend using moving averages"""
        if ma_50 > ma_200 and price > ma_50:
            return {
                'direction': 'Strong Uptrend',
                'strength': 'Strong',
                'signal': 'Bullish',
                'score': 80
            }
        elif ma_50 > ma_200:
            return {
                'direction': 'Uptrend',
                'strength': 'Moderate',
                'signal': 'Bullish',
                'score': 65
            }
        elif ma_50 < ma_200 and price < ma_50:
            return {
                'direction': 'Strong Downtrend',
                'strength': 'Strong',
                'signal': 'Bearish',
                'score': 20
            }
        elif ma_50 < ma_200:
            return {
                'direction': 'Downtrend',
                'strength': 'Moderate',
                'signal': 'Bearish',
                'score': 35
            }
        else:
            return {
                'direction': 'Sideways',
                'strength': 'Weak',
                'signal': 'Neutral',
                'score': 50
            }
    
    def _analyze_rsi(self, rsi: float) -> Dict[str, str]:
        """Analyze RSI indicator"""
        if rsi > 70:
            return {'signal': 'Overbought', 'action': 'SELL', 'strength': 'Strong'}
        elif rsi > 60:
            return {'signal': 'Slightly Overbought', 'action': 'HOLD', 'strength': 'Moderate'}
        elif rsi < 30:
            return {'signal': 'Oversold', 'action': 'BUY', 'strength': 'Strong'}
        elif rsi < 40:
            return {'signal': 'Slightly Oversold', 'action': 'BUY', 'strength': 'Moderate'}
        else:
            return {'signal': 'Neutral', 'action': 'HOLD', 'strength': 'Weak'}
    
    def _analyze_macd(self, macd: float, signal: float) -> Dict[str, str]:
        """Analyze MACD indicator"""
        if macd > signal and macd > 0:
            return {'signal': 'Bullish Crossover', 'action': 'BUY', 'strength': 'Strong'}
        elif macd > signal:
            return {'signal': 'Bullish', 'action': 'BUY', 'strength': 'Moderate'}
        elif macd < signal and macd < 0:
            return {'signal': 'Bearish Crossover', 'action': 'SELL', 'strength': 'Strong'}
        elif macd < signal:
            return {'signal': 'Bearish', 'action': 'SELL', 'strength': 'Moderate'}
        else:
            return {'signal': 'Neutral', 'action': 'HOLD', 'strength': 'Weak'}
    
    def _analyze_volume(self, volume: float, avg_volume: float) -> Dict[str, str]:
        """Analyze volume trends"""
        volume_ratio = volume / avg_volume if avg_volume > 0 else 1.0
        
        if volume_ratio > 2.0:
            return {'signal': 'Very High Volume', 'confirmation': 'Strong', 'score': 90}
        elif volume_ratio > 1.5:
            return {'signal': 'High Volume', 'confirmation': 'Moderate', 'score': 75}
        elif volume_ratio < 0.5:
            return {'signal': 'Low Volume', 'confirmation': 'Weak', 'score': 30}
        else:
            return {'signal': 'Normal Volume', 'confirmation': 'Average', 'score': 50}
    
    def _calculate_technical_score(self, trend, rsi_signal, macd_signal, volume_signal) -> float:
        """Calculate composite technical score"""
        score = 50  # Base
        
        # Trend (40% weight)
        score += (trend['score'] - 50) * 0.4
        
        # RSI (25% weight)
        rsi_score = {'SELL': 20, 'HOLD': 50, 'BUY': 80}.get(rsi_signal['action'], 50)
        score += (rsi_score - 50) * 0.25
        
        # MACD (25% weight)
        macd_score = {'SELL': 20, 'HOLD': 50, 'BUY': 80}.get(macd_signal['action'], 50)
        score += (macd_score - 50) * 0.25
        
        # Volume (10% weight)
        score += (volume_signal['score'] - 50) * 0.1
        
        return min(100, max(0, score))
    
    def _calculate_sentiment_score(self, market_sentiment, sector_strength, nse_trend) -> float:
        """Calculate macro/sentiment score"""
        score = 50
        
        # Market sentiment
        sentiment_scores = {'Bullish': 80, 'Neutral': 50, 'Bearish': 20}
        score += (sentiment_scores.get(market_sentiment, 50) - 50) * 0.4
        
        # Sector strength
        sector_scores = {'Strong': 80, 'Moderate': 50, 'Weak': 30}
        score += (sector_scores.get(sector_strength, 50) - 50) * 0.3
        
        # NSE trend
        nse_scores = {'Bullish': 80, 'Neutral': 50, 'Bearish': 20}
        score += (nse_scores.get(nse_trend, 50) - 50) * 0.3
        
        return min(100, max(0, score))
    
    def _get_rating(self, score: float) -> str:
        """Convert score to rating"""
        if score >= 80:
            return 'Excellent'
        elif score >= 70:
            return 'Good'
        elif score >= 60:
            return 'Fair'
        elif score >= 40:
            return 'Below Average'
        else:
            return 'Poor'
    
    def _get_valuation_status(self, pe_ratio: float) -> str:
        """Determine if stock is undervalued, fairly valued, or overvalued"""
        if pe_ratio < 12:
            return 'Undervalued'
        elif pe_ratio < 18:
            return 'Fairly Valued'
        elif pe_ratio < 25:
            return 'Slightly Overvalued'
        else:
            return 'Overvalued'
    
    def _get_fundamental_recommendation(self, score: float) -> Literal['BUY', 'HOLD', 'SELL']:
        """Get recommendation based on fundamental score"""
        if score >= 70:
            return 'BUY'
        elif score >= 50:
            return 'HOLD'
        else:
            return 'SELL'
    
    def _get_technical_recommendation(self, score: float) -> Literal['BUY', 'HOLD', 'SELL']:
        """Get recommendation based on technical score"""
        if score >= 65:
            return 'BUY'
        elif score >= 45:
            return 'HOLD'
        else:
            return 'SELL'
    
    def _get_sentiment_recommendation(self, score: float) -> Literal['BUY', 'HOLD', 'SELL']:
        """Get recommendation based on sentiment score"""
        if score >= 65:
            return 'BUY'
        elif score >= 45:
            return 'HOLD'
        else:
            return 'SELL'
    
    def _get_composite_recommendation(
        self, 
        composite_score: float,
        fund_rec: str,
        tech_rec: str,
        sent_rec: str
    ) -> Literal['BUY', 'HOLD', 'SELL']:
        """
        Generate final recommendation using composite score and individual recommendations
        """
        # Strong consensus
        if fund_rec == tech_rec == sent_rec:
            return fund_rec
        
        # Use composite score
        if composite_score >= 70:
            return 'BUY'
        elif composite_score >= 45:
            return 'HOLD'
        else:
            return 'SELL'
    
    def _calculate_target_price(
        self,
        current_price: float,
        recommendation: str,
        fundamental: Dict,
        technical: Dict
    ) -> float:
        """Calculate target price based on analysis"""
        if recommendation == 'BUY':
            # Use resistance as initial target, then add upside based on fundamentals
            base_target = current_price * 1.15
            if fundamental['overall_score'] > 80:
                base_target = current_price * 1.25
            return round(base_target, 2)
        elif recommendation == 'SELL':
            # Use support as target
            base_target = current_price * 0.90
            if fundamental['overall_score'] < 30:
                base_target = current_price * 0.80
            return round(base_target, 2)
        else:
            # HOLD - slight upside
            return round(current_price * 1.05, 2)
    
    def _assess_risk(self, fundamental: Dict, technical: Dict, score: float) -> Literal['Low', 'Medium', 'High']:
        """Assess investment risk level"""
        risk_factors = 0
        
        # Poor fundamentals
        if fundamental['overall_score'] < 50:
            risk_factors += 2
        
        # Volatile technicals
        if technical['overall_score'] < 40 or technical['overall_score'] > 80:
            risk_factors += 1
        
        # High debt
        if fundamental['financial_health']['debt_to_equity'] > 1.5:
            risk_factors += 1
        
        # Overvalued
        if fundamental['valuation']['status'] == 'Overvalued':
            risk_factors += 1
        
        if risk_factors >= 3:
            return 'High'
        elif risk_factors >= 1:
            return 'Medium'
        else:
            return 'Low'
    
    def _get_time_horizon(self, fundamental: Dict, technical: Dict) -> Literal['Short', 'Medium', 'Long']:
        """Determine investment time horizon"""
        if fundamental['overall_score'] > 75:
            return 'Long'  # Strong fundamentals = long-term hold
        elif technical['overall_score'] > 70:
            return 'Short'  # Strong technicals = short-term trade
        else:
            return 'Medium'
    
    def _generate_reasoning(
        self,
        recommendation: str,
        fundamental: Dict,
        technical: Dict,
        macro: Dict
    ) -> str:
        """Generate human-readable reasoning for recommendation"""
        reasons = []
        
        # Fundamental reasons
        if fundamental['overall_score'] > 70:
            reasons.append(f"Strong fundamentals with {fundamental['overall_rating']} financial health")
            if fundamental['valuation']['status'] == 'Undervalued':
                reasons.append("Currently undervalued based on P/E ratio")
        elif fundamental['overall_score'] < 40:
            reasons.append(f"Weak fundamentals with {fundamental['overall_rating']} financial health")
        
        # Technical reasons
        if technical['moving_averages']['golden_cross']:
            reasons.append("Golden cross pattern suggests bullish momentum")
        elif not technical['moving_averages']['golden_cross']:
            reasons.append("Death cross pattern suggests bearish pressure")
        
        if technical['momentum']['rsi'] < 30:
            reasons.append("RSI indicates oversold conditions (buy opportunity)")
        elif technical['momentum']['rsi'] > 70:
            reasons.append("RSI indicates overbought conditions (take profits)")
        
        # Macro reasons
        if macro['market_sentiment'] == 'Bullish':
            reasons.append("Positive market sentiment and sector strength")
        elif macro['market_sentiment'] == 'Bearish':
            reasons.append("Negative market sentiment may pressure prices")
        
        return '. '.join(reasons) + '.'
    
    def _extract_key_factors(self, fundamental: Dict, technical: Dict, macro: Dict) -> List[str]:
        """Extract key factors influencing the recommendation"""
        factors = []
        
        # Top 5-7 most important factors
        if fundamental['profitability']['roe'] > 15:
            factors.append(f"High ROE ({fundamental['profitability']['roe']}%)")
        
        if fundamental['valuation']['status'] in ['Undervalued', 'Fairly Valued']:
            factors.append(f"Good valuation (P/E: {fundamental['valuation']['pe_ratio']})")
        
        if technical['moving_averages']['golden_cross']:
            factors.append("Bullish MA crossover")
        
        if technical['momentum']['rsi'] < 40:
            factors.append(f"Oversold RSI ({technical['momentum']['rsi']})")
        
        if fundamental['dividends']['yield'] > 4:
            factors.append(f"High dividend yield ({fundamental['dividends']['yield']}%)")
        
        return factors[:7]  # Limit to 7 factors
    
    def _identify_risk_factors(self, fundamental: Dict, technical: Dict) -> List[str]:
        """Identify potential risks"""
        risks = []
        
        if fundamental['financial_health']['debt_to_equity'] > 1.5:
            risks.append(f"High debt-to-equity ratio ({fundamental['financial_health']['debt_to_equity']})")
        
        if fundamental['valuation']['status'] == 'Overvalued':
            risks.append("Stock appears overvalued relative to earnings")
        
        if technical['momentum']['rsi'] > 70:
            risks.append("Overbought conditions may lead to pullback")
        
        if fundamental['financial_health']['revenue_growth'] < 0:
            risks.append("Declining revenue growth")
        
        return risks
    
    def _identify_catalysts(self, stock_data: Dict) -> List[str]:
        """Identify potential price catalysts"""
        catalysts = []
        
        # Example catalysts based on stock data
        if stock_data.get('upcoming_earnings'):
            catalysts.append("Upcoming earnings report")
        
        if stock_data.get('dividend_announcement'):
            catalysts.append("Dividend announcement expected")
        
        if stock_data.get('sector_growth'):
            catalysts.append("Strong sector growth trajectory")
        
        # Default catalysts
        catalysts.extend([
            "NSE market momentum",
            "Sector rotation opportunities",
            "Economic recovery in Kenya"
        ])
        
        return catalysts[:5]
    
    def _generate_strategy(self, recommendation: str, technical: Dict) -> Dict[str, Any]:
        """Generate trading strategy"""
        current_price = self.stock.get('last_price', 0)
        support = technical['support_resistance']['support']
        resistance = technical['support_resistance']['resistance']
        
        if recommendation == 'BUY':
            return {
                'action': 'BUY',
                'entry_strategy': 'Buy in phases near support levels',
                'entry_price': f"KES {support:.2f} - {current_price:.2f}",
                'stop_loss': f"KES {support * 0.95:.2f} (5% below support)",
                'target_1': f"KES {resistance:.2f} (first resistance)",
                'target_2': f"KES {resistance * 1.10:.2f} (extended target)",
                'position_size': '5-10% of portfolio',
                'time_horizon': '3-6 months'
            }
        elif recommendation == 'SELL':
            return {
                'action': 'SELL',
                'exit_strategy': 'Sell on rallies to resistance',
                'exit_price': f"KES {current_price:.2f} - {resistance:.2f}",
                'stop_loss': f"KES {support:.2f} (key support break)",
                'reason': 'Fundamentals weakening or overbought conditions',
                'position_size': 'Reduce or exit position',
                'time_horizon': 'Immediate to 1 month'
            }
        else:  # HOLD
            return {
                'action': 'HOLD',
                'strategy': 'Monitor for breakout above resistance or breakdown below support',
                'buy_trigger': f"Break above KES {resistance:.2f}",
                'sell_trigger': f"Break below KES {support:.2f}",
                'position_size': 'Maintain current position',
                'review_period': 'Monthly'
            }


def generate_comprehensive_analysis(stock_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate comprehensive stock analysis using all three methodologies
    """
    analyzer = StockAnalyzer(stock_data)
    return analyzer.generate_ai_recommendation()


def batch_analyze_stocks(stocks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Analyze multiple stocks and return ranked recommendations
    """
    analyses = []
    
    for stock in stocks:
        try:
            analysis = generate_comprehensive_analysis(stock)
            analyses.append(analysis)
        except Exception as e:
            print(f"Failed to analyze {stock.get('symbol')}: {e}")
            continue
    
    # Sort by composite score (best opportunities first)
    analyses.sort(key=lambda x: x['composite_score'], reverse=True)
    
    return analyses