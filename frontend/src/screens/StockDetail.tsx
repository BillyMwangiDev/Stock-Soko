import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, TextInput as RNTextInput, Modal, Animated } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme';
import { LoadingState } from '../components';
import PriceChart from '../components/PriceChart';
import { api } from '../api/client';
import { hapticFeedback } from '../utils/haptics';
import TradeOrder, { OrderData } from './TradeOrder';
import ReviewOrder from './ReviewOrder';
import type { TradeStackParamList } from '../navigation/types';

type StockDetailNavigationProp = StackNavigationProp<TradeStackParamList, 'StockDetail'>;
type StockDetailRouteProp = RouteProp<TradeStackParamList, 'StockDetail'>;

interface StockData {
  symbol: string;
  name: string;
  last_price: number;
  change_pct: number;
  change_amount: number;
  volume?: number;
  about?: string;
  news?: string;
  // Financial Metrics
  eps?: number;
  pe_ratio?: number;
  market_cap?: number;
  dividend_yield?: number;
  // Profitability Ratios
  roe?: number; // Return on Equity
  roa?: number; // Return on Assets
  roi?: number; // Return on Investment
  profit_margin?: number;
  revenue_growth?: number;
  // Company Fundamentals
  sector?: string;
  industry?: string;
  employees?: number;
  founded_year?: number;
  // Historical Data
  yearly_revenue?: Array<{ year: number; revenue: number }>;
  yearly_profit?: Array<{ year: number; profit: number }>;
  dividend_history?: Array<{ year: number; dividend: number }>;
  // Risk Metrics
  beta?: number;
  volatility?: number;
  sharpe_ratio?: number;
  debt_to_equity?: number;
  risk_rating?: string;
  // Market Context
  market_sentiment?: 'Bullish' | 'Bearish' | 'Neutral';
  global_market_impact?: string;
  kenya_market_trend?: string;
}

export default function StockDetail() {
  const navigation = useNavigation<StockDetailNavigationProp>();
  const route = useRoute<StockDetailRouteProp>();
  const { symbol } = route.params;

  const [stock, setStock] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('1M');
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  
  // Order Book states
  const [showOrderBook, setShowOrderBook] = useState(false);
  const [orderBook, setOrderBook] = useState<{
    bids: Array<{ price: number; quantity: number; total: number }>;
    asks: Array<{ price: number; quantity: number; total: number }>;
    spread: number;
    spreadPercent: number;
  } | null>(null);
  
  // Order flow states
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [tradeSide, setTradeSide] = useState<'buy' | 'sell'>('buy');
  const [currentOrder, setCurrentOrder] = useState<OrderData | null>(null);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [quantity, setQuantity] = useState('');
  const [quickQuantity, setQuickQuantity] = useState('');
  const [limitPrice, setLimitPrice] = useState('');

  useEffect(() => {
    loadStockData();
    checkWatchlist();
    loadAIRecommendation();
  }, [symbol]);

  useEffect(() => {
    if (stock) {
      loadOrderBook();
    }
  }, [stock]);

  const loadAIRecommendation = async () => {
    setLoadingAI(true);
    try {
      const res = await api.post('/markets/recommendation', { symbol });
      const recommendation = res.data.recommendation || 'HOLD';
      
      // Get current stock price safely
      let currentPrice = 0;
      if (stock?.last_price) {
        currentPrice = stock.last_price;
      } else {
        // If stock not loaded yet, fetch it
        try {
          const stockRes = await api.get(`/markets/stocks/${symbol}`);
          currentPrice = stockRes.data.last_price || 0;
        } catch (e) {
          console.error('Failed to fetch stock price for AI:', e);
        }
      }
      
      // Generate detailed analysis
      const analysis = {
        recommendation,
        confidence: Math.floor(Math.random() * 30) + 70,
        targetPrice: currentPrice > 0 ? (currentPrice * (1 + (Math.random() * 0.2 - 0.1))).toFixed(2) : 'N/A',
        reasoning: generateAIReasoning(recommendation, symbol),
        technicalSignals: generateTechnicalSignals(),
        fundamentalFactors: generateFundamentalFactors(),
        riskFactors: generateRiskFactors(),
        timeHorizon: '3-6 months',
      };
      
      setAiRecommendation(analysis);
    } catch (error) {
      console.error('Failed to load AI recommendation:', error);
    } finally {
      setLoadingAI(false);
    }
  };

  const generateAIReasoning = (rec: string, sym: string) => {
    const reasons = {
      'BUY': [
        `Strong upward momentum detected in ${sym} with increasing volume`,
        'Technical indicators suggest oversold conditions with potential reversal',
        'Positive earnings surprises and improving fundamentals',
        'Breaking above key resistance levels with strong volume confirmation'
      ],
      'SELL': [
        `Overbought conditions detected in ${sym} with weakening momentum`,
        'Technical breakdown below critical support levels',
        'Deteriorating fundamentals and earnings concerns',
        'Negative divergence in key momentum indicators'
      ],
      'HOLD': [
        `${sym} trading within consolidation range, awaiting clear direction`,
        'Mixed technical signals suggest neutral stance',
        'Current valuation fairly reflects fundamentals',
        'Market conditions suggest patience before new positions'
      ]
    };
    return reasons[rec as keyof typeof reasons] || reasons['HOLD'];
  };

  const generateTechnicalSignals = () => [
    { indicator: 'RSI (14)', value: (Math.random() * 40 + 30).toFixed(0), signal: Math.random() > 0.5 ? 'Bullish' : 'Neutral' },
    { indicator: 'MACD', value: Math.random() > 0.5 ? 'Positive' : 'Negative', signal: Math.random() > 0.5 ? 'Bullish' : 'Bearish' },
    { indicator: 'Moving Avg', value: '50/200 Cross', signal: Math.random() > 0.5 ? 'Golden Cross' : 'Neutral' },
    { indicator: 'Volume', value: '+' + (Math.random() * 50 + 10).toFixed(0) + '%', signal: 'Increasing' },
  ];

  const generateFundamentalFactors = () => [
    'Revenue growth of 15% YoY exceeding industry average',
    'Strong profit margins with improving operational efficiency',
    'Solid balance sheet with low debt-to-equity ratio',
    'Consistent dividend payments with 3.5% yield'
  ];

  const generateRiskFactors = () => [
    'Market volatility may impact short-term price action',
    'Sector rotation risks in current market conditions',
    'Regulatory changes could affect operations',
    'Global economic uncertainty remains elevated'
  ];

  const checkWatchlist = async () => {
    try {
      const res = await api.get('/watchlist');
      const watchlist = res.data.items || [];
      setIsInWatchlist(watchlist.some((item: any) => item.symbol === symbol));
    } catch (error) {
      console.error('Failed to check watchlist:', error);
    }
  };

  const toggleWatchlist = async () => {
    if (watchlistLoading) return;
    
    setWatchlistLoading(true);
    try {
      if (isInWatchlist) {
        // Remove from watchlist
        await api.delete(`/watchlist/${symbol}`);
        setIsInWatchlist(false);
        hapticFeedback.light();
        Alert.alert('Removed', `${symbol} removed from watchlist`);
      } else {
        // Add to watchlist
        await api.post('/watchlist', {
          symbol: symbol,
          name: stock?.name || symbol,
        });
        setIsInWatchlist(true);
        hapticFeedback.success();
        Alert.alert('Added', `${symbol} added to watchlist`);
      }
    } catch (error) {
      hapticFeedback.error();
      Alert.alert('Error', 'Failed to update watchlist. Please try again.');
      console.error('Watchlist error:', error);
    } finally {
      setWatchlistLoading(false);
    }
  };

  const loadStockData = async () => {
    try {
      const res = await api.get('/markets/stocks');
      const stockData = res.data.stocks?.find((s: any) => s.symbol === symbol);
      
      if (stockData) {
        setStock({
          ...stockData,
          change_pct: stockData.change_percent,
          change_amount: (stockData.last_price * stockData.change_percent) / 100,
          about: `${stockData.name} is a leading company listed on the Nairobi Securities Exchange, known for its strong market presence and consistent performance.`,
          news: 'Recent expansion plans aim to grow market share by 15% this quarter, with focus on innovative products and customer service excellence.',
        });
      }
    } catch (error) {
      console.error('Failed to load stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrderBook = async () => {
    try {
      // In production: const res = await api.get(`/markets/orderbook/${symbol}`);
      // For now, generate realistic mock data
      if (!stock) return;
      
      const basePrice = stock?.last_price || 100;
      const bids: Array<{ price: number; quantity: number; total: number }> = [];
      const asks: Array<{ price: number; quantity: number; total: number }> = [];
      
      // Generate 5 bid levels (buy orders below current price)
      let totalBidQty = 0;
      for (let i = 0; i < 5; i++) {
        const price = basePrice * (1 - (i + 1) * 0.002); // 0.2% steps
        const quantity = Math.floor(Math.random() * 5000) + 1000;
        totalBidQty += quantity;
        bids.push({ price, quantity, total: totalBidQty });
      }
      
      // Generate 5 ask levels (sell orders above current price)
      let totalAskQty = 0;
      for (let i = 0; i < 5; i++) {
        const price = basePrice * (1 + (i + 1) * 0.002); // 0.2% steps
        const quantity = Math.floor(Math.random() * 5000) + 1000;
        totalAskQty += quantity;
        asks.push({ price, quantity, total: totalAskQty });
      }
      
      const spread = asks[0].price - bids[0].price;
      const spreadPercent = (spread / basePrice) * 100;
      
      setOrderBook({ bids, asks, spread, spreadPercent });
    } catch (error) {
      console.error('Failed to load order book:', error);
    }
  };

  if (loading) {
    return <LoadingState message="Loading stock details..." />;
  }

  if (!stock) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Stock not found</Text>
      </View>
    );
  }

  const isPositive = stock.change_pct >= 0;

  const getRiskBadgeStyle = (rating: string) => {
    switch (rating) {
      case 'Low':
        return { backgroundColor: colors.success + '20', borderColor: colors.success };
      case 'Medium':
        return { backgroundColor: colors.warning + '20', borderColor: colors.warning };
      case 'High':
        return { backgroundColor: colors.error + '20', borderColor: colors.error };
      case 'Very High':
        return { backgroundColor: colors.error + '40', borderColor: colors.error };
      default:
        return { backgroundColor: colors.text.disabled + '20', borderColor: colors.text.disabled };
    }
  };

  return (
    <View style={styles.container}>      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{stock.name}</Text>
        <TouchableOpacity 
          onPress={toggleWatchlist} 
          style={styles.watchlistButton}
          disabled={watchlistLoading}
        >
          <Text style={[styles.watchlistIcon, isInWatchlist && styles.watchlistIconActive]}>
            {isInWatchlist ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        
        <View style={[styles.priceSection, isPositive ? styles.sentimentPositive : styles.sentimentNegative]}>
          <View style={styles.priceInfo}>
            <Text style={styles.stockLabel}>{stock.name} ({stock.symbol})</Text>
            <Text style={styles.stockPrice}>KSH {stock.last_price.toFixed(2)}</Text>
            <View style={styles.changeRow}>
              <Text style={styles.todayLabel}>Today</Text>
              <Text style={[styles.changePercent, isPositive ? styles.positiveText : styles.negativeText]}>
                {isPositive ? '+' : ''}{stock.change_pct.toFixed(2)}%
              </Text>
            </View>
          </View>

        </View>

        {/* Interactive Price Chart */}
        <PriceChart symbol={stock.symbol} currentPrice={stock.last_price} />

        {/* Order Book - OKX Style */}
        <View style={styles.orderBookSection}>
          <View style={styles.orderBookHeader}>
            <Text style={styles.orderBookTitle}>Order Book</Text>
            <View style={styles.orderBookTabs}>
              <Text style={[styles.orderBookTab, styles.orderBookTabActive]}>Depth</Text>
              <Text style={styles.orderBookTab}>Recent Trades</Text>
            </View>
          </View>

          <View style={styles.orderBookContent}>
            <View style={styles.orderBookColumn}>
              <Text style={styles.orderBookColumnTitle}>Sell Orders</Text>
              {[
                { price: stock.last_price * 1.02, amount: 150, total: stock.last_price * 1.02 * 150 },
                { price: stock.last_price * 1.015, amount: 230, total: stock.last_price * 1.015 * 230 },
                { price: stock.last_price * 1.01, amount: 320, total: stock.last_price * 1.01 * 320 },
                { price: stock.last_price * 1.005, amount: 450, total: stock.last_price * 1.005 * 450 },
              ].map((order, idx) => (
                <View key={idx} style={styles.orderBookRow}>
                  <Text style={[styles.orderPrice, styles.sellPrice]}>{order.price.toFixed(2)}</Text>
                  <Text style={styles.orderAmount}>{order.amount}</Text>
                  <Text style={styles.orderTotal}>{order.total.toFixed(0)}</Text>
                </View>
              ))}
            </View>

            <View style={styles.spreadIndicator}>
              <Text style={styles.spreadLabel}>Spread</Text>
              <Text style={styles.spreadValue}>0.5%</Text>
            </View>

            <View style={styles.orderBookColumn}>
              <Text style={styles.orderBookColumnTitle}>Buy Orders</Text>
              {[
                { price: stock.last_price * 0.995, amount: 480, total: stock.last_price * 0.995 * 480 },
                { price: stock.last_price * 0.99, amount: 350, total: stock.last_price * 0.99 * 350 },
                { price: stock.last_price * 0.985, amount: 270, total: stock.last_price * 0.985 * 270 },
                { price: stock.last_price * 0.98, amount: 190, total: stock.last_price * 0.98 * 190 },
              ].map((order, idx) => (
                <View key={idx} style={styles.orderBookRow}>
                  <Text style={[styles.orderPrice, styles.buyPrice]}>{order.price.toFixed(2)}</Text>
                  <Text style={styles.orderAmount}>{order.amount}</Text>
                  <Text style={styles.orderTotal}>{order.total.toFixed(0)}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Trading Controls - OKX Style */}
        <View style={styles.tradingControls}>
          <View style={styles.tradingHeader}>
            <Text style={styles.tradingTitle}>Place Order</Text>
            <View style={styles.orderTypeSelector}>
              <TouchableOpacity 
                style={[styles.orderTypeButton, orderType === 'market' && styles.orderTypeButtonActive]}
                onPress={() => setOrderType('market')}
              >
                <Text style={[styles.orderTypeText, orderType === 'market' && styles.orderTypeTextActive]}>Market</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.orderTypeButton, orderType === 'limit' && styles.orderTypeButtonActive]}
                onPress={() => setOrderType('limit')}
              >
                <Text style={[styles.orderTypeText, orderType === 'limit' && styles.orderTypeTextActive]}>Limit</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.orderForm}>
            {orderType === 'limit' && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Price (KES)</Text>
                <View style={styles.inputContainer}>
                  <RNTextInput
                    style={styles.formInput}
                    placeholder={stock.last_price.toFixed(2)}
                    placeholderTextColor={colors.text.disabled}
                    keyboardType="decimal-pad"
                    value={limitPrice}
                    onChangeText={setLimitPrice}
                  />
                </View>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Quantity (Shares)</Text>
              <View style={styles.inputContainer}>
                <RNTextInput
                  style={styles.formInput}
                  placeholder="0"
                  placeholderTextColor={colors.text.disabled}
                  keyboardType="number-pad"
                  value={quantity}
                  onChangeText={setQuantity}
                />
                <View style={styles.quickAmounts}>
                  <TouchableOpacity style={styles.quickAmountBtn} onPress={() => setQuantity('10')}>
                    <Text style={styles.quickAmountText}>10</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quickAmountBtn} onPress={() => setQuantity('50')}>
                    <Text style={styles.quickAmountText}>50</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quickAmountBtn} onPress={() => setQuantity('100')}>
                    <Text style={styles.quickAmountText}>100</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.orderSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Est. Total</Text>
                <Text style={styles.summaryValue}>
                  KES {((orderType === 'limit' ? parseFloat(limitPrice || '0') : stock.last_price) * parseFloat(quantity || '0')).toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Fee (0.2%)</Text>
                <Text style={styles.summaryValue}>
                  KES {(((orderType === 'limit' ? parseFloat(limitPrice || '0') : stock.last_price) * parseFloat(quantity || '0')) * 0.002).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* AI Recommendation with Detailed Analysis */}
        {aiRecommendation && (
          <View style={styles.aiSection}>
            <View style={styles.aiHeader}>
              <Text style={styles.aiTitle}>AI Analysis</Text>
              <View style={[
                styles.recommendationBadge,
                aiRecommendation.recommendation === 'BUY' && styles.recommendationBuy,
                aiRecommendation.recommendation === 'SELL' && styles.recommendationSell,
                aiRecommendation.recommendation === 'HOLD' && styles.recommendationHold,
              ]}>
                <Text style={styles.recommendationText}>{aiRecommendation.recommendation}</Text>
              </View>
            </View>

            <View style={styles.aiMetrics}>
              <View style={styles.aiMetricItem}>
                <Text style={styles.aiMetricLabel}>Confidence</Text>
                <Text style={styles.aiMetricValue}>{aiRecommendation.confidence}%</Text>
              </View>
              <View style={styles.aiMetricItem}>
                <Text style={styles.aiMetricLabel}>Target Price</Text>
                <Text style={styles.aiMetricValue}>KES {aiRecommendation.targetPrice}</Text>
              </View>
              <View style={styles.aiMetricItem}>
                <Text style={styles.aiMetricLabel}>Time Horizon</Text>
                <Text style={styles.aiMetricValue}>{aiRecommendation.timeHorizon}</Text>
              </View>
            </View>

            <View style={styles.aiAnalysis}>
              <Text style={styles.aiSubtitle}>Key Reasons</Text>
              {aiRecommendation.reasoning.map((reason: string, idx: number) => (
                <View key={idx} style={styles.reasonItem}>
                  <Text style={styles.reasonBullet}>-</Text>
                  <Text style={styles.reasonText}>{reason}</Text>
                </View>
              ))}
            </View>

            <View style={styles.aiAnalysis}>
              <Text style={styles.aiSubtitle}>Technical Signals</Text>
              {aiRecommendation.technicalSignals.map((signal: any, idx: number) => (
                <View key={idx} style={styles.signalRow}>
                  <Text style={styles.signalIndicator}>{signal.indicator}</Text>
                  <Text style={styles.signalValue}>{signal.value}</Text>
                  <Text style={[
                    styles.signalLabel,
                    signal.signal.includes('Bullish') && styles.signalBullish,
                    signal.signal.includes('Bearish') && styles.signalBearish,
                  ]}>{signal.signal}</Text>
                </View>
              ))}
            </View>

            <View style={styles.aiAnalysis}>
              <Text style={styles.aiSubtitle}>Fundamental Factors</Text>
              {aiRecommendation.fundamentalFactors.map((factor: string, idx: number) => (
                <View key={idx} style={styles.factorItem}>
                  <Text style={styles.factorBullet}>+</Text>
                  <Text style={styles.factorText}>{factor}</Text>
                </View>
              ))}
            </View>

            <View style={styles.aiAnalysis}>
              <Text style={styles.aiSubtitle}>Risk Considerations</Text>
              {aiRecommendation.riskFactors.map((risk: string, idx: number) => (
                <View key={idx} style={styles.riskItem}>
                  <Text style={styles.riskBullet}>!</Text>
                  <Text style={styles.riskText}>{risk}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.aiDisclaimer}>
              This analysis is AI-generated and for informational purposes only. Always conduct your own research before making investment decisions.
            </Text>
          </View>
        )}

        
        <View style={styles.metricsCard}>
          <Text style={styles.metricsTitle}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>P/E Ratio</Text>
              <Text style={styles.metricValue}>{stock.pe_ratio || 'N/A'}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>EPS (KES)</Text>
              <Text style={styles.metricValue}>{stock.eps?.toFixed(2) || 'N/A'}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Market Cap</Text>
              <Text style={styles.metricValue}>{stock.market_cap ? `${(stock.market_cap / 1e9).toFixed(2)}B` : 'N/A'}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Dividend Yield</Text>
              <Text style={styles.metricValue}>{stock.dividend_yield ? `${stock.dividend_yield.toFixed(1)}%` : 'N/A'}</Text>
            </View>
          </View>
        </View>

        
        <View style={styles.riskCard}>
          <Text style={styles.riskTitle}>Risk Profile</Text>
          <View style={styles.riskHeader}>
            <Text style={styles.riskRating}>Risk Rating: </Text>
            <View style={[styles.riskBadge, getRiskBadgeStyle(stock.risk_rating || 'Medium')]}>
              <Text style={styles.riskBadgeText}>{stock.risk_rating || 'Medium'}</Text>
            </View>
          </View>
          
          <View style={styles.riskMetricsGrid}>
            <View style={styles.riskMetricItem}>
              <Text style={styles.riskMetricLabel}>Beta (Volatility)</Text>
              <Text style={styles.riskMetricValue}>{stock.beta?.toFixed(2) || '1.00'}</Text>
              <Text style={styles.riskMetricHint}>
                {(stock.beta || 1) < 1 ? 'Less volatile than market' : 'More volatile than market'}
              </Text>
            </View>
            <View style={styles.riskMetricItem}>
              <Text style={styles.riskMetricLabel}>Annual Volatility</Text>
              <Text style={styles.riskMetricValue}>{stock.volatility?.toFixed(1) || '25.0'}%</Text>
              <Text style={styles.riskMetricHint}>
                {(stock.volatility || 25) < 20 ? 'Low fluctuation' : (stock.volatility || 25) < 35 ? 'Moderate fluctuation' : 'High fluctuation'}
              </Text>
            </View>
            <View style={styles.riskMetricItem}>
              <Text style={styles.riskMetricLabel}>Sharpe Ratio</Text>
              <Text style={styles.riskMetricValue}>{stock.sharpe_ratio?.toFixed(2) || '1.50'}</Text>
              <Text style={styles.riskMetricHint}>
                {(stock.sharpe_ratio || 1.5) > 2 ? 'Excellent returns' : (stock.sharpe_ratio || 1.5) > 1 ? 'Good returns' : 'Fair returns'}
              </Text>
            </View>
            <View style={styles.riskMetricItem}>
              <Text style={styles.riskMetricLabel}>Debt/Equity</Text>
              <Text style={styles.riskMetricValue}>{stock.debt_to_equity?.toFixed(2) || '0.50'}</Text>
              <Text style={styles.riskMetricHint}>
                {(stock.debt_to_equity || 0.5) < 0.5 ? 'Low leverage' : (stock.debt_to_equity || 0.5) < 1 ? 'Moderate leverage' : 'High leverage'}
              </Text>
            </View>
          </View>

          <View style={styles.riskInfo}>
            <Text style={styles.riskInfoText}>
              Note: Risk assessment based on market volatility, debt levels, and historical performance.
            </Text>
          </View>
        </View>

        <View style={styles.fundamentalsWrapper}>
          <Text style={styles.sectionMainTitle}>Company Fundamentals & Analysis</Text>
          
          <View style={styles.fundamentalCard}>
            <View style={styles.fundamentalHeader}>
              <Text style={styles.fundamentalHeaderText}>Company Profile</Text>
            </View>
            <View style={styles.fundamentalRow}>
              <Text style={styles.fundamentalLabel}>Sector</Text>
              <Text style={styles.fundamentalValue}>{stock.sector || 'Financial Services'}</Text>
            </View>
            <View style={styles.fundamentalRow}>
              <Text style={styles.fundamentalLabel}>Industry</Text>
              <Text style={styles.fundamentalValue}>{stock.industry || 'Banking'}</Text>
            </View>
            <View style={styles.fundamentalRow}>
              <Text style={styles.fundamentalLabel}>Employees</Text>
              <Text style={styles.fundamentalValue}>{stock.employees?.toLocaleString() || '5,000+'}</Text>
            </View>
            <View style={styles.fundamentalRow}>
              <Text style={styles.fundamentalLabel}>Founded</Text>
              <Text style={styles.fundamentalValue}>{stock.founded_year || '1968'}</Text>
            </View>
          </View>

          
          <View style={styles.fundamentalCard}>
            <View style={styles.fundamentalHeader}>
              <Text style={styles.fundamentalHeaderText}>Profitability Metrics</Text>
            </View>
            
            {/* ROE */}
            <View style={styles.metricRow}>
              <View style={styles.metricLeft}>
                <Text style={styles.metricLabel}>Return on Equity (ROE)</Text>
                <Text style={styles.metricHint}>Net Income ÷ Shareholders Equity</Text>
              </View>
              <View style={styles.metricRight}>
                <Text style={[
                  styles.metricValue,
                  { color: (stock.roe || 18.5) > 15 ? colors.success : (stock.roe || 18.5) > 10 ? colors.warning : colors.error }
                ]}>
                  {(stock.roe || 18.5).toFixed(1)}%
                </Text>
                <Text style={[
                  styles.metricRating,
                  { color: (stock.roe || 18.5) > 15 ? colors.success : (stock.roe || 18.5) > 10 ? colors.warning : colors.error }
                ]}>
                  {(stock.roe || 18.5) > 15 ? 'Excellent' : (stock.roe || 18.5) > 10 ? 'Good' : 'Poor'}
                </Text>
              </View>
            </View>

            {/* ROA */}
            <View style={styles.metricRow}>
              <View style={styles.metricLeft}>
                <Text style={styles.metricLabel}>Return on Assets (ROA)</Text>
                <Text style={styles.metricHint}>Net Income ÷ Total Assets</Text>
              </View>
              <View style={styles.metricRight}>
                <Text style={[
                  styles.metricValue,
                  { color: (stock.roa || 12.3) > 10 ? colors.success : (stock.roa || 12.3) > 5 ? colors.warning : colors.error }
                ]}>
                  {(stock.roa || 12.3).toFixed(1)}%
                </Text>
                <Text style={[
                  styles.metricRating,
                  { color: (stock.roa || 12.3) > 10 ? colors.success : (stock.roa || 12.3) > 5 ? colors.warning : colors.error }
                ]}>
                  {(stock.roa || 12.3) > 10 ? 'Strong' : (stock.roa || 12.3) > 5 ? 'Average' : 'Weak'}
                </Text>
              </View>
            </View>

            {/* P/E Ratio */}
            <View style={styles.metricRow}>
              <View style={styles.metricLeft}>
                <Text style={styles.metricLabel}>Price/Earnings Ratio (P/E)</Text>
                <Text style={styles.metricHint}>Share Price ÷ EPS</Text>
              </View>
              <View style={styles.metricRight}>
                <Text style={[
                  styles.metricValue,
                  { color: (stock.pe_ratio || 12.5) < 15 ? colors.success : (stock.pe_ratio || 12.5) < 25 ? colors.warning : colors.error }
                ]}>
                  {(stock.pe_ratio || 12.5).toFixed(2)}x
                </Text>
                <Text style={[
                  styles.metricRating,
                  { color: (stock.pe_ratio || 12.5) < 15 ? colors.success : (stock.pe_ratio || 12.5) < 25 ? colors.warning : colors.error }
                ]}>
                  {(stock.pe_ratio || 12.5) < 15 ? 'Undervalued' : (stock.pe_ratio || 12.5) < 25 ? 'Fair' : 'Expensive'}
                </Text>
              </View>
            </View>

            {/* Profit Margin */}
            <View style={styles.metricRow}>
              <View style={styles.metricLeft}>
                <Text style={styles.metricLabel}>Profit Margin</Text>
                <Text style={styles.metricHint}>Net Profit ÷ Revenue</Text>
              </View>
              <View style={styles.metricRight}>
                <Text style={[
                  styles.metricValue,
                  { color: (stock.profit_margin || 24.5) > 20 ? colors.success : colors.warning }
                ]}>
                  {(stock.profit_margin || 24.5).toFixed(1)}%
                </Text>
              </View>
            </View>
          </View>

          
          <View style={styles.fundamentalCard}>
            <View style={styles.fundamentalHeader}>
              <Text style={styles.fundamentalHeaderText}>Market Analysis</Text>
            </View>
            
            <View style={styles.marketContextContainer}>
              <View style={styles.marketContextItem}>
                <Text style={styles.marketContextLabel}>Kenya Market (NSE)</Text>
                <View style={[
                  styles.marketContextBadge,
                  { backgroundColor: colors.success + '20' }
                ]}>
                  <Text style={[styles.marketContextValue, { color: colors.success }]}>
                    {stock.kenya_market_trend || 'Bullish'}
                  </Text>
                </View>
                <Text style={styles.marketContextDesc}>NSE 20: +2.3% MTD | Strong banking sector</Text>
              </View>
              
              <View style={styles.marketContextDivider} />
              
              <View style={styles.marketContextItem}>
                <Text style={styles.marketContextLabel}>Global Markets</Text>
                <View style={[
                  styles.marketContextBadge,
                  { backgroundColor: colors.warning + '20' }
                ]}>
                  <Text style={[styles.marketContextValue, { color: colors.warning }]}>
                    {stock.market_sentiment || 'Neutral'}
                  </Text>
                </View>
                <Text style={styles.marketContextDesc}>
                  {stock.global_market_impact || 'USD/KES stable | Moderate correlation'}
                </Text>
              </View>
            </View>
          </View>

          
          <View style={styles.fundamentalCard}>
            <View style={styles.fundamentalHeader}>
              <Text style={styles.fundamentalHeaderText}>Historical Performance (4 Years)</Text>
            </View>
            
            {/* Revenue Chart */}
            <View style={styles.historicalSection}>
              <Text style={styles.historicalTitle}>Annual Revenue</Text>
              <View style={styles.barChartContainer}>
                {(stock.yearly_revenue || [
                  { year: 2021, revenue: 85 },
                  { year: 2022, revenue: 92 },
                  { year: 2023, revenue: 98 },
                  { year: 2024, revenue: 112 },
                ]).map((data, index, arr) => {
                  const maxRevenue = Math.max(...arr.map(d => d.revenue));
                  const heightPercent = (data.revenue / maxRevenue) * 100;
                  const growth = index > 0 ? ((data.revenue - arr[index-1].revenue) / arr[index-1].revenue * 100) : 0;
                  return (
                    <View key={data.year} style={styles.barChartItem}>
                      <View style={styles.barChartBar}>
                        <View style={[
                          styles.barChartFill,
                          {
                            height: `${heightPercent}%`,
                            backgroundColor: index === arr.length - 1 ? colors.primary.main : colors.success
                          }
                        ]} />
                      </View>
                      <Text style={styles.barChartValueText}>{data.revenue}B</Text>
                      {index > 0 && (
                        <Text style={[styles.barChartGrowth, { color: growth > 0 ? colors.success : colors.error }]}>
                          {growth > 0 ? '+' : ''}{growth.toFixed(0)}%
                        </Text>
                      )}
                      <Text style={styles.barChartLabel}>{data.year}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Profit Chart */}
            <View style={styles.historicalSection}>
              <Text style={styles.historicalTitle}>Annual Profit</Text>
              <View style={styles.barChartContainer}>
                {(stock.yearly_profit || [
                  { year: 2021, profit: 18 },
                  { year: 2022, profit: 21 },
                  { year: 2023, profit: 23.5 },
                  { year: 2024, profit: 27.4 },
                ]).map((data, index, arr) => {
                  const maxProfit = Math.max(...arr.map(d => d.profit));
                  const heightPercent = (data.profit / maxProfit) * 100;
                  const growth = index > 0 ? ((data.profit - arr[index-1].profit) / arr[index-1].profit * 100) : 0;
                  return (
                    <View key={data.year} style={styles.barChartItem}>
                      <View style={styles.barChartBar}>
                        <View style={[
                          styles.barChartFill,
                          {
                            height: `${heightPercent}%`,
                            backgroundColor: index === arr.length - 1 ? colors.primary.main : colors.success
                          }
                        ]} />
                      </View>
                      <Text style={styles.barChartValueText}>{data.profit.toFixed(1)}B</Text>
                      {index > 0 && (
                        <Text style={[styles.barChartGrowth, { color: growth > 0 ? colors.success : colors.error }]}>
                          +{growth.toFixed(0)}%
                        </Text>
                      )}
                      <Text style={styles.barChartLabel}>{data.year}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Dividend History Chart */}
            <View style={styles.historicalSection}>
              <Text style={styles.historicalTitle}>Annual Dividends (per share)</Text>
              <View style={styles.barChartContainer}>
                {(stock.dividend_history || [
                  { year: 2021, dividend: 2.50 },
                  { year: 2022, dividend: 2.75 },
                  { year: 2023, dividend: 3.00 },
                  { year: 2024, dividend: 3.25 },
                ]).map((data, index, arr) => {
                  const maxDividend = Math.max(...arr.map(d => d.dividend));
                  const heightPercent = (data.dividend / maxDividend) * 100;
                  return (
                    <View key={data.year} style={styles.barChartItem}>
                      <View style={styles.barChartBar}>
                        <View style={[
                          styles.barChartFill,
                          {
                            height: `${heightPercent}%`,
                            backgroundColor: index === arr.length - 1 ? colors.warning : colors.info
                          }
                        ]} />
                      </View>
                      <Text style={styles.barChartValueText}>KES {data.dividend.toFixed(2)}</Text>
                      <Text style={styles.barChartLabel}>{data.year}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        {/* Company Profile & Profitability */}
        <View style={styles.profitabilitySection}>
          {/* Company Profile */}
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <Text style={styles.profileTitle}>Company Profile</Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Sector</Text>
              <Text style={styles.profileValue}>{stock.sector || 'Financial Services'}</Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Industry</Text>
              <Text style={styles.profileValue}>{stock.industry || 'Commercial Banking'}</Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Employees</Text>
              <Text style={styles.profileValue}>{stock.employees?.toLocaleString() || '5,000+'}</Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Founded</Text>
              <Text style={styles.profileValue}>{stock.founded_year || '1968'}</Text>
            </View>
          </View>

          {/* Profitability Ratios */}
          <View style={styles.profitabilityCard}>
            <View style={styles.profitabilityHeader}>
              <Text style={styles.profitabilityTitle}>Profitability Ratios</Text>
            </View>
            
            {/* ROE */}
            <View style={styles.ratioRow}>
              <View style={styles.ratioLeft}>
                <Text style={styles.ratioLabel}>Return on Equity (ROE)</Text>
                <Text style={styles.ratioFormula}>Net Income ÷ Equity</Text>
              </View>
              <View style={styles.ratioRight}>
                <Text style={[
                  styles.ratioValue,
                  { color: (stock.roe || 18.5) > 15 ? colors.success : (stock.roe || 18.5) > 10 ? colors.warning : colors.error }
                ]}>
                  {(stock.roe || 18.5).toFixed(1)}%
                </Text>
                <View style={[
                  styles.ratioBadge,
                  { backgroundColor: (stock.roe || 18.5) > 15 ? colors.success + '20' : (stock.roe || 18.5) > 10 ? colors.warning + '20' : colors.error + '20' }
                ]}>
                  <Text style={[
                    styles.ratioBadgeText,
                    { color: (stock.roe || 18.5) > 15 ? colors.success : (stock.roe || 18.5) > 10 ? colors.warning : colors.error }
                  ]}>
                    {(stock.roe || 18.5) > 15 ? 'Excellent' : (stock.roe || 18.5) > 10 ? 'Good' : 'Poor'}
                  </Text>
                </View>
              </View>
            </View>

            {/* ROA */}
            <View style={styles.ratioRow}>
              <View style={styles.ratioLeft}>
                <Text style={styles.ratioLabel}>Return on Assets (ROA)</Text>
                <Text style={styles.ratioFormula}>Net Income ÷ Assets</Text>
              </View>
              <View style={styles.ratioRight}>
                <Text style={[
                  styles.ratioValue,
                  { color: (stock.roa || 12.3) > 10 ? colors.success : (stock.roa || 12.3) > 5 ? colors.warning : colors.error }
                ]}>
                  {(stock.roa || 12.3).toFixed(1)}%
                </Text>
                <View style={[
                  styles.ratioBadge,
                  { backgroundColor: (stock.roa || 12.3) > 10 ? colors.success + '20' : (stock.roa || 12.3) > 5 ? colors.warning + '20' : colors.error + '20' }
                ]}>
                  <Text style={[
                    styles.ratioBadgeText,
                    { color: (stock.roa || 12.3) > 10 ? colors.success : (stock.roa || 12.3) > 5 ? colors.warning : colors.error }
                  ]}>
                    {(stock.roa || 12.3) > 10 ? 'Strong' : (stock.roa || 12.3) > 5 ? 'Average' : 'Weak'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Profit Margin */}
            <View style={styles.ratioRow}>
              <View style={styles.ratioLeft}>
                <Text style={styles.ratioLabel}>Profit Margin</Text>
                <Text style={styles.ratioFormula}>Net Profit ÷ Revenue</Text>
              </View>
              <View style={styles.ratioRight}>
                <Text style={[
                  styles.ratioValue,
                  { color: (stock.profit_margin || 24.5) > 20 ? colors.success : colors.warning }
                ]}>
                  {(stock.profit_margin || 24.5).toFixed(1)}%
                </Text>
              </View>
            </View>

            {/* Revenue Growth */}
            <View style={styles.ratioRow}>
              <View style={styles.ratioLeft}>
                <Text style={styles.ratioLabel}>Revenue Growth (YoY)</Text>
                <Text style={styles.ratioFormula}>Year-over-Year</Text>
              </View>
              <View style={styles.ratioRight}>
                <Text style={[
                  styles.ratioValue,
                  { color: (stock.revenue_growth || 15.2) > 10 ? colors.success : colors.warning }
                ]}>
                  +{(stock.revenue_growth || 15.2).toFixed(1)}%
                </Text>
              </View>
            </View>
          </View>

          {/* Market Context */}
          <View style={styles.marketCard}>
            <View style={styles.marketHeader}>
              <Text style={styles.marketTitle}>Market Analysis</Text>
            </View>
            
            <View style={styles.marketGrid}>
              <View style={styles.marketGridItem}>
                <Text style={styles.marketGridLabel}>Kenya Market (NSE)</Text>
                <View style={[
                  styles.marketTrendBadge,
                  { backgroundColor: colors.success + '20', borderColor: colors.success }
                ]}>
                  <Text style={[styles.marketTrendText, { color: colors.success }]}>
                    {stock.kenya_market_trend || 'Bullish'}
                  </Text>
                </View>
                <Text style={styles.marketGridDesc}>NSE 20 Index: +2.3% MTD</Text>
                <Text style={styles.marketGridDesc}>Banking sector: Strong performance</Text>
              </View>
              
              <View style={styles.marketGridDivider} />
              
              <View style={styles.marketGridItem}>
                <Text style={styles.marketGridLabel}>Global Outlook</Text>
                <View style={[
                  styles.marketTrendBadge,
                  { backgroundColor: colors.warning + '20', borderColor: colors.warning }
                ]}>
                  <Text style={[styles.marketTrendText, { color: colors.warning }]}>
                    {stock.market_sentiment || 'Neutral'}
                  </Text>
                </View>
                <Text style={styles.marketGridDesc}>USD/KES: Stable at 130</Text>
                <Text style={styles.marketGridDesc}>
                  {stock.global_market_impact || 'Moderate positive correlation'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        
        <View style={styles.infoCard}>
          <View style={styles.cardContent}>
            <View style={styles.cardTextSection}>
              <Text style={styles.cardLabel}>COMPANY INFO</Text>
              <Text style={styles.cardTitle}>About {stock.name}</Text>
              <Text style={styles.cardDescription}>{stock.about}</Text>
            </View>
            <View style={styles.cardImage}>
              <Text style={styles.imageEmoji}>CORP</Text>
            </View>
          </View>
        </View>

        
        <View style={styles.infoCard}>
          <View style={styles.cardContent}>
            <View style={styles.cardTextSection}>
              <Text style={styles.cardLabel}>NEWS FEED</Text>
              <Text style={styles.cardTitle}>{stock.symbol} Expansion Plans Announced</Text>
              <Text style={styles.cardDescription}>{stock.news}</Text>
            </View>
            <View style={styles.cardImage}>
              <Text style={styles.imageEmoji}>NEWS</Text>
            </View>
          </View>
        </View>

        
        <TouchableOpacity
          style={styles.orderBookToggle}
          onPress={() => setShowOrderBook(!showOrderBook)}
          activeOpacity={0.7}
        >
          <View style={styles.orderBookToggleHeader}>
            <View style={styles.orderBookToggleLeft}>
              <Ionicons name="list" size={20} color={colors.primary.main} />
              <Text style={styles.orderBookToggleTitle}>Order Book</Text>
              {orderBook && (
                <View style={styles.spreadBadge}>
                  <Text style={styles.spreadBadgeText}>
                    Spread: {orderBook.spreadPercent.toFixed(2)}%
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.orderBookToggleArrow}>{showOrderBook ? '' : ''}</Text>
          </View>
        </TouchableOpacity>

        {showOrderBook && orderBook && (
          <View style={styles.orderBookContainer}>
            {/* Spread Info */}
            <View style={styles.orderBookSpreadInfo}>
              <Text style={styles.orderBookSpreadLabel}>Best Bid-Ask Spread</Text>
              <Text style={styles.orderBookSpreadValue}>
                KES {orderBook.spread.toFixed(2)} ({orderBook.spreadPercent.toFixed(3)}%)
              </Text>
            </View>

            {/* Order Book Table */}
            <View style={styles.orderBookTable}>
              {/* Headers */}
              <View style={styles.orderBookRow}>
                <View style={styles.orderBookCol}>
                  <Text style={styles.orderBookHeader}>Price (KES)</Text>
                </View>
                <View style={styles.orderBookCol}>
                  <Text style={styles.orderBookHeader}>Quantity</Text>
                </View>
                <View style={styles.orderBookCol}>
                  <Text style={styles.orderBookHeader}>Total</Text>
                </View>
              </View>

              {/* Asks (Sell Orders) - Red */}
              <Text style={styles.orderBookSectionTitle}>SELL ORDERS</Text>
              {[...orderBook.asks].reverse().map((ask, index) => {
                const depthPercent = (ask.total / orderBook.asks[orderBook.asks.length - 1].total) * 100;
                return (
                  <View key={`ask-${index}`} style={styles.orderBookRow}>
                    <View style={[styles.depthBar, styles.depthBarAsk, { width: `${depthPercent}%` }]} />
                    <View style={styles.orderBookCol}>
                      <Text style={[styles.orderBookPrice, styles.orderBookPriceAsk]}>
                        {ask.price.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.orderBookCol}>
                      <Text style={styles.orderBookQty}>{ask.quantity.toLocaleString()}</Text>
                    </View>
                    <View style={styles.orderBookCol}>
                      <Text style={styles.orderBookTotal}>{ask.total.toLocaleString()}</Text>
                    </View>
                  </View>
                );
              })}

              {/* Current Price Indicator */}
              <View style={styles.orderBookCurrentPrice}>
                <Text style={[styles.orderBookCurrentPriceText, { color: isPositive ? colors.success : colors.error }]}>
                   Current: KES {stock.last_price.toFixed(2)} 
                </Text>
              </View>

              {/* Bids (Buy Orders) - Green */}
              <Text style={styles.orderBookSectionTitle}>BUY ORDERS</Text>
              {orderBook.bids.map((bid, index) => {
                const depthPercent = (bid.total / orderBook.bids[orderBook.bids.length - 1].total) * 100;
                return (
                  <View key={`bid-${index}`} style={styles.orderBookRow}>
                    <View style={[styles.depthBar, styles.depthBarBid, { width: `${depthPercent}%` }]} />
                    <View style={styles.orderBookCol}>
                      <Text style={[styles.orderBookPrice, styles.orderBookPriceBid]}>
                        {bid.price.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.orderBookCol}>
                      <Text style={styles.orderBookQty}>{bid.quantity.toLocaleString()}</Text>
                    </View>
                    <View style={styles.orderBookCol}>
                      <Text style={styles.orderBookTotal}>{bid.total.toLocaleString()}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Order Book Legend */}
            <View style={styles.orderBookLegend}>
              <View style={styles.orderBookLegendItem}>
                <View style={[styles.orderBookLegendDot, { backgroundColor: colors.error }]} />
                <Text style={styles.orderBookLegendText}>Sell Orders (Asks)</Text>
              </View>
              <View style={styles.orderBookLegendItem}>
                <View style={[styles.orderBookLegendDot, { backgroundColor: colors.success }]} />
                <Text style={styles.orderBookLegendText}>Buy Orders (Bids)</Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Integrated Trading Interface - Fixed at bottom */}
      <View style={styles.tradingPanel}>
        {/* Compact Order Form */}
        <View style={styles.compactOrderForm}>
          <View style={styles.orderTypeRow}>
            <Text style={styles.orderFormTitle}>Place Order</Text>
            <View style={styles.orderTypeToggle}>
              <TouchableOpacity 
                style={[styles.orderTypeBtn, orderType === 'market' && styles.orderTypeBtnActive]}
                onPress={() => setOrderType('market')}
              >
                <Text style={[styles.orderTypeBtnText, orderType === 'market' && styles.orderTypeBtnTextActive]}>
                  Market
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.orderTypeBtn, orderType === 'limit' && styles.orderTypeBtnActive]}
                onPress={() => setOrderType('limit')}
              >
                <Text style={[styles.orderTypeBtnText, orderType === 'limit' && styles.orderTypeBtnTextActive]}>
                  Limit
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.quantityLabel}>Quantity (Shares)</Text>
          <RNTextInput
            style={styles.quantityInputBox}
            value={quickQuantity}
            onChangeText={setQuickQuantity}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={colors.text.disabled}
          />

          {/* Quick Amount Buttons */}
          <View style={styles.quickButtonsRow}>
            {['10', '50', '100'].map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.quickBtn,
                  quickQuantity === amount && styles.quickBtnActive
                ]}
                onPress={() => setQuickQuantity(amount)}
              >
                <Text style={[
                  styles.quickBtnText,
                  quickQuantity === amount && styles.quickBtnTextActive
                ]}>
                  {amount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Est. Total and Fee */}
          <View style={styles.estimatesRow}>
            <View style={styles.estimateItem}>
              <Text style={styles.estimateLabel}>Est. Total</Text>
              <Text style={styles.estimateValue}>
                KES {((parseFloat(quickQuantity) || 0) * stock.last_price).toFixed(2)}
              </Text>
            </View>
            <View style={styles.estimateItem}>
              <Text style={styles.estimateLabel}>Fee (0.2%)</Text>
              <Text style={styles.estimateValue}>
                KES {((parseFloat(quickQuantity) || 0) * stock.last_price * 0.002).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Buy/Sell Buttons - Integrated */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity 
            style={styles.buyButton}
            onPress={() => {
              if (!quickQuantity || parseFloat(quickQuantity) <= 0) {
                Alert.alert('Enter Quantity', 'Please enter a valid quantity');
                return;
              }
              hapticFeedback.impact();
              setTradeSide('buy');
              setShowTradeModal(true);
            }}
          >
            <Text style={styles.buyButtonText}>Buy {stock.symbol}</Text>
            <Text style={styles.buttonSubtext}>Long / Spot</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.sellButton}
            onPress={() => {
              if (!quickQuantity || parseFloat(quickQuantity) <= 0) {
                Alert.alert('Enter Quantity', 'Please enter a valid quantity');
                return;
              }
              hapticFeedback.impact();
              setTradeSide('sell');
              setShowTradeModal(true);
            }}
          >
            <Text style={styles.sellButtonText}>Sell {stock.symbol}</Text>
            <Text style={styles.buttonSubtext}>Short / Exit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Trade Order Modal - For advanced options */}
      {showTradeModal && (
        <TradeOrder
          symbol={symbol}
          side={tradeSide}
          currentPrice={stock.last_price}
          onBack={() => setShowTradeModal(false)}
          onReview={(orderData) => {
            setCurrentOrder(orderData);
            setShowTradeModal(false);
            setShowReviewModal(true);
          }}
        />
      )}

      {/* Review Order Modal */}
      <Modal
        visible={showReviewModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowReviewModal(false)}
      >
        {currentOrder && (
          <ReviewOrder
            order={currentOrder}
            onBack={() => setShowReviewModal(false)}
            onEdit={() => {
              setShowReviewModal(false);
              setShowTradeModal(true);
            }}
            onConfirm={() => {
              setShowReviewModal(false);
              setCurrentOrder(null);
              Alert.alert(
                'Order Placed',
                'Your order has been placed successfully!',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            }}
          />
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary + 'CC',
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: colors.text.primary,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  watchlistButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  watchlistIcon: {
    fontSize: 28,
    color: colors.text.disabled,
  },
  watchlistIconActive: {
    color: colors.warning,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  priceSection: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  sentimentPositive: {
    backgroundColor: colors.success + '10',
  },
  sentimentNegative: {
    backgroundColor: colors.error + '10',
  },
  priceInfo: {
    marginBottom: spacing.lg,
  },
  stockLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  stockPrice: {
    fontSize: 36,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: 4,
    marginBottom: spacing.xs,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 4,
  },
  todayLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  changePercent: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  positiveText: {
    color: colors.success,
  },
  negativeText: {
    color: colors.error,
  },
  infoCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
  },
  cardContent: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cardTextSection: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 1,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: 4,
    marginBottom: spacing.xs,
  },
  cardDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  cardImage: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageEmoji: {
    fontSize: 48,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background.primary + 'CC',
  },
  tradeButton: {
    width: '100%',
    height: 48,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tradeButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.contrast,
  },
  errorText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    textAlign: 'center',
    margin: spacing['2xl'],
  },
  // Metrics Card Styles
  metricsCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  metricsTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metricItem: {
    width: '47%',
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
  },
  metricLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  metricValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  // Risk Profile Styles
  riskCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  riskTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  riskRating: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  riskBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  riskBadgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  riskMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  riskMetricItem: {
    width: '47%',
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
  },
  riskMetricLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  riskMetricValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  riskMetricHint: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  riskInfo: {
    backgroundColor: colors.background.secondary,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.main,
  },
  riskInfoText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  // AI Recommendation Styles
  aiSection: {
    backgroundColor: colors.background.card,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  aiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  aiTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  recommendationBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  recommendationBuy: {
    backgroundColor: colors.success + '20',
    borderWidth: 1,
    borderColor: colors.success,
  },
  recommendationSell: {
    backgroundColor: colors.error + '20',
    borderWidth: 1,
    borderColor: colors.error,
  },
  recommendationHold: {
    backgroundColor: colors.warning + '20',
    borderWidth: 1,
    borderColor: colors.warning,
  },
  recommendationText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  aiMetrics: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  aiMetricItem: {
    flex: 1,
  },
  aiMetricLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  aiMetricValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  aiAnalysis: {
    marginBottom: spacing.md,
  },
  aiSubtitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  reasonItem: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
    paddingRight: spacing.sm,
  },
  reasonBullet: {
    fontSize: typography.fontSize.base,
    color: colors.primary.main,
    marginRight: spacing.xs,
    fontWeight: typography.fontWeight.bold,
  },
  reasonText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  signalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light + '40',
  },
  signalIndicator: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    flex: 1,
  },
  signalValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    marginHorizontal: spacing.sm,
  },
  signalLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.tertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background.secondary,
  },
  signalBullish: {
    color: colors.success,
    backgroundColor: colors.success + '20',
  },
  signalBearish: {
    color: colors.error,
    backgroundColor: colors.error + '20',
  },
  factorItem: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  factorBullet: {
    fontSize: typography.fontSize.base,
    color: colors.success,
    marginRight: spacing.xs,
  },
  factorText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  riskItem: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  riskBullet: {
    fontSize: typography.fontSize.base,
    color: colors.warning,
    marginRight: spacing.xs,
    fontWeight: typography.fontWeight.bold,
  },
  riskText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  aiDisclaimer: {
    fontSize: typography.fontSize.xs,
    color: colors.text.disabled,
    fontStyle: 'italic',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  // Integrated Trading Panel
  tradingPanel: {
    flexDirection: 'column',
    padding: spacing.md,
    backgroundColor: colors.background.card,
    borderTopWidth: 1,
    borderTopColor: colors.border.main,
    paddingBottom: spacing.md + 10,
  },
  compactOrderForm: {
    marginBottom: spacing.md,
  },
  orderTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  orderFormTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  orderTypeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.xs / 2,
  },
  orderTypeBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  orderTypeBtnActive: {
    backgroundColor: colors.success,
  },
  orderTypeBtnText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  orderTypeBtnTextActive: {
    color: colors.primary.contrast,
  },
  quantityLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  quantityInputBox: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  quickButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  quickBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBtnActive: {
    backgroundColor: colors.success + '30',
    borderWidth: 1,
    borderColor: colors.success,
  },
  quickBtnText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.success,
  },
  quickBtnTextActive: {
    color: colors.success,
  },
  estimatesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  estimateItem: {
    flex: 1,
  },
  estimateLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  estimateValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  buyButton: {
    flex: 1,
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.contrast,
    marginBottom: 2,
  },
  sellButton: {
    flex: 1,
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.contrast,
    marginBottom: 2,
  },
  buttonSubtext: {
    fontSize: typography.fontSize.xs,
    color: colors.primary.contrast,
    opacity: 0.8,
  },
  // Order Book Styles
  orderBookSection: {
    backgroundColor: colors.background.card,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.main,
    overflow: 'hidden',
  },
  orderBookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  orderBookTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  orderBookTabs: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  orderBookTab: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  orderBookTabActive: {
    color: colors.primary.main,
    fontWeight: typography.fontWeight.semibold,
  },
  orderBookContent: {
    padding: spacing.md,
  },
  orderBookColumn: {
    marginBottom: spacing.md,
  },
  orderBookColumnTitle: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  orderBookRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  orderPrice: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    flex: 1,
  },
  sellPrice: {
    color: colors.error,
  },
  buyPrice: {
    color: colors.success,
  },
  orderAmount: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    flex: 1,
    textAlign: 'center',
  },
  orderTotal: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    flex: 1,
    textAlign: 'right',
  },
  spreadIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.sm,
    marginVertical: spacing.sm,
  },
  spreadLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  spreadValue: {
    fontSize: typography.fontSize.xs,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  // Trading Controls Styles
  tradingControls: {
    backgroundColor: colors.background.card,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.main,
    overflow: 'hidden',
  },
  tradingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  tradingTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  orderTypeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.sm,
    padding: 2,
  },
  orderTypeButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  orderTypeButtonActive: {
    backgroundColor: colors.primary.main,
  },
  orderTypeText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  orderTypeTextActive: {
    color: colors.primary.contrast,
    fontWeight: typography.fontWeight.semibold,
  },
  orderForm: {
    padding: spacing.md,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  formLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    fontWeight: typography.fontWeight.medium,
  },
  inputContainer: {
    position: 'relative',
  },
  formInput: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  quickAmountBtn: {
    flex: 1,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary.main,
    fontWeight: typography.fontWeight.semibold,
  },
  orderSummary: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  orderBookToggle: {
    backgroundColor: colors.background.secondary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  orderBookToggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  orderBookToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  orderBookToggleIcon: {
    fontSize: 20,
  },
  orderBookToggleTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  spreadBadge: {
    backgroundColor: colors.info + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  spreadBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.info,
    fontWeight: typography.fontWeight.semibold,
  },
  orderBookToggleArrow: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  orderBookContainer: {
    backgroundColor: colors.background.secondary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.main,
    padding: spacing.md,
  },
  orderBookSpreadInfo: {
    backgroundColor: colors.background.tertiary,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  orderBookSpreadLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: 2,
  },
  orderBookSpreadValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  orderBookTable: {
    marginTop: spacing.sm,
  },
  orderBookRow: {
    flexDirection: 'row',
    paddingVertical: spacing.xs,
    position: 'relative',
  },
  orderBookCol: {
    flex: 1,
    alignItems: 'flex-end',
  },
  orderBookHeader: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.semibold,
  },
  orderBookSectionTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  orderBookPrice: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  orderBookPriceAsk: {
    color: colors.error,
  },
  orderBookPriceBid: {
    color: colors.success,
  },
  orderBookQty: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  orderBookTotal: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  depthBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    opacity: 0.15,
  },
  depthBarAsk: {
    backgroundColor: colors.error,
  },
  depthBarBid: {
    backgroundColor: colors.success,
  },
  orderBookCurrentPrice: {
    backgroundColor: colors.background.tertiary,
    padding: spacing.sm,
    marginVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  orderBookCurrentPriceText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  orderBookLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.main,
  },
  orderBookLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  orderBookLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  orderBookLegendText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  // Company Fundamentals Styles
  fundamentalsWrapper: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionMainTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  fundamentalCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.main,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  fundamentalHeader: {
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main,
  },
  fundamentalHeaderText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  fundamentalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main + '20',
  },
  fundamentalLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  fundamentalValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main + '20',
  },
  metricLeft: {
    flex: 1,
  },
  metricLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  metricHint: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  metricRight: {
    alignItems: 'flex-end',
  },
  metricValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  metricRating: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  marketContextContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  marketContextItem: {
    flex: 1,
    alignItems: 'center',
  },
  marketContextLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
    fontWeight: typography.fontWeight.medium,
  },
  marketContextBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  marketContextValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  marketContextDesc: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  marketContextDivider: {
    width: 1,
    height: '100%',
    backgroundColor: colors.border.main,
  },
  historicalSection: {
    marginBottom: spacing.lg,
  },
  historicalTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 120,
    gap: spacing.sm,
  },
  barChartItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barChartBar: {
    width: '100%',
    height: '70%',
    justifyContent: 'flex-end',
  },
  barChartFill: {
    width: '100%',
    borderTopLeftRadius: borderRadius.xs,
    borderTopRightRadius: borderRadius.xs,
  },
  barChartValueText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: 2,
  },
  barChartGrowth: {
    fontSize: typography.fontSize.xs - 1,
    fontWeight: typography.fontWeight.medium,
  },
  barChartLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  // Duplicate section styles (to be cleaned later)
  profitabilitySection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  profileCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.main,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  profileHeader: {
    marginBottom: spacing.sm,
  },
  profileTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  profileLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  profileValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  profitabilityCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.main,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  profitabilityHeader: {
    marginBottom: spacing.md,
  },
  profitabilityTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  ratioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main + '20',
  },
  ratioLeft: {
    flex: 1,
  },
  ratioLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: 2,
  },
  ratioFormula: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  ratioRight: {
    alignItems: 'flex-end',
  },
  ratioValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  ratioBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  ratioBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  marketCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.main,
    padding: spacing.md,
  },
  marketHeader: {
    marginBottom: spacing.md,
  },
  marketTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  marketGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  marketGridItem: {
    flex: 1,
  },
  marketGridLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
    fontWeight: typography.fontWeight.medium,
  },
  marketTrendBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    marginBottom: spacing.xs,
    alignSelf: 'flex-start',
  },
  marketTrendText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  marketGridDesc: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    lineHeight: 16,
    marginTop: 2,
  },
  marketGridDivider: {
    width: 1,
    backgroundColor: colors.border.main,
  },
});