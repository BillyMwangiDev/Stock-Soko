import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Alert, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api/client';
import { colors, typography, spacing, borderRadius } from '../theme';
import { LoadingState, Card, DemoModeBanner } from '../components';
import { useApp } from '../contexts';

interface PortfolioData {
  value: number;
  change: number;
  changePercent: number;
}

interface StockData {
  symbol: string;
  name: string;
  last_price: number;
  change_pct: number;
  volume: number;
}

interface AIRecommendation {
  id: string;
  symbol: string;
  name: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  targetPrice?: number;
  currentPrice?: number;
  reasoning: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  timeHorizon: 'Short' | 'Medium' | 'Long';
  category: 'Growth' | 'Value' | 'Dividend' | 'Momentum';
}

export default function Home() {
  const navigation = useNavigation();
  const { userName, totalPortfolioValue, totalGainLoss, gainLossPercent, refreshPortfolio } = useApp();
  const [portfolio, setPortfolio] = useState<PortfolioData>({
    value: totalPortfolioValue,
    change: totalGainLoss,
    changePercent: gainLossPercent,
  });
  const [topGainers, setTopGainers] = useState<StockData[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    loadData();
    loadAIRecommendations();
    loadNotificationCount();
  }, []);

  const loadNotificationCount = async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      setUnreadNotifications(response.data.count || 0);
    } catch (error) {
      // Set mock count for demo
      setUnreadNotifications(3);
    }
  };

  useEffect(() => {
    // Update local portfolio state when context values change
    setPortfolio({
      value: totalPortfolioValue,
      change: totalGainLoss,
      changePercent: gainLossPercent,
    });
  }, [totalPortfolioValue, totalGainLoss, gainLossPercent]);

  const loadData = async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      // Load top gainers from all 20 stocks
      const marketsRes = await api.get('/markets/stocks');
      const instruments = marketsRes.data.stocks || [];
      const gainers = instruments
        .filter((stock: any) => stock.change_percent > 0)
        .sort((a: any, b: any) => b.change_percent - a.change_percent)
        .slice(0, 3)
        .map((stock: any) => ({
          symbol: stock.symbol,
          name: stock.name,
          last_price: stock.last_price,
          change_pct: stock.change_percent,
          volume: stock.volume || 0,
        }));
      setTopGainers(gainers);
    } catch (error) {
      console.error('Failed to load data:', error);
      
      // Fallback to mock data
      setTopGainers([
        {
          symbol: 'KCB',
          name: 'KCB Group',
          last_price: 35.20,
          change_pct: 8.31,
          volume: 1250000,
        },
        {
          symbol: 'SCOM',
          name: 'Safaricom',
          last_price: 29.50,
          change_pct: 5.36,
          volume: 2800000,
        },
        {
          symbol: 'EABL',
          name: 'East African Breweries',
          last_price: 165.00,
          change_pct: 3.75,
          volume: 450000,
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadAIRecommendations = async () => {
    setLoadingAI(true);
    try {
      // Generate 3 AI recommendations with different categories
      const symbols = ['KCB', 'SCOM', 'EQTY', 'EABL', 'SBIC', 'BAT'];
      const categories: Array<'Growth' | 'Value' | 'Dividend' | 'Momentum'> = ['Growth', 'Value', 'Dividend'];
      const recommendations: AIRecommendation[] = [];

      for (let i = 0; i < 3; i++) {
        const symbol = symbols[i];
        const category = categories[i];
        
        try {
          // Try to get real recommendation from API
          const res = await api.post('/markets/recommendation', { symbol });
          const action = res.data.recommendation || 'HOLD';
          
          // Fetch current price
          const stockRes = await api.get(`/markets/stocks/${symbol}`);
          const currentPrice = stockRes.data.last_price || 0;
          const name = stockRes.data.name || symbol;
          
          // Generate confidence and other metrics
          const confidence = Math.floor(Math.random() * 20) + 75; // 75-95%
          const riskLevel: 'Low' | 'Medium' | 'High' = confidence > 85 ? 'Low' : confidence > 75 ? 'Medium' : 'High';
          const targetPrice = currentPrice * (action === 'BUY' ? 1.15 : action === 'SELL' ? 0.90 : 1.05);
          
          const reasoning = generateReasoning(action, category, symbol);
          
          recommendations.push({
            id: `${symbol}-${Date.now()}`,
            symbol,
            name,
            action: action as 'BUY' | 'SELL' | 'HOLD',
            confidence,
            targetPrice,
            currentPrice,
            reasoning,
            riskLevel,
            timeHorizon: category === 'Growth' ? 'Long' : category === 'Dividend' ? 'Medium' : 'Short',
            category,
          });
        } catch (error) {
          console.error(`Failed to load AI recommendation for ${symbol}:`, error);
          
          // Fallback to mock data for this stock
          const mockStocks = {
            'KCB': { name: 'KCB Group', price: 35.20, action: 'BUY' as const },
            'SCOM': { name: 'Safaricom PLC', price: 29.50, action: 'BUY' as const },
            'EQTY': { name: 'Equity Group', price: 46.50, action: 'HOLD' as const },
          };
          
          const mockData = mockStocks[symbol as keyof typeof mockStocks];
          if (mockData) {
            const confidence = mockData.action === 'BUY' ? 85 : 72;
            recommendations.push({
              id: `${symbol}-${Date.now()}`,
              symbol,
              name: mockData.name,
              action: mockData.action,
              confidence,
              targetPrice: mockData.price * (mockData.action === 'BUY' ? 1.15 : 1.05),
              currentPrice: mockData.price,
              reasoning: generateReasoning(mockData.action, category, symbol),
              riskLevel: 'Low',
              timeHorizon: category === 'Growth' ? 'Long' : category === 'Dividend' ? 'Medium' : 'Short',
              category,
            });
          }
        }
      }
      
      setAiRecommendations(recommendations);
    } catch (error) {
      console.error('Failed to load AI recommendations:', error);
    } finally {
      setLoadingAI(false);
    }
  };

  const generateReasoning = (action: string, category: string, symbol: string): string => {
    const reasons = {
      'BUY': {
        'Growth': `Strong growth trajectory with expanding market share. ${symbol} shows robust revenue growth and improving margins.`,
        'Value': `Trading below intrinsic value with solid fundamentals. ${symbol} offers attractive entry point for value investors.`,
        'Dividend': `Consistent dividend payout history with strong cash flow. ${symbol} provides reliable income potential.`,
        'Momentum': `Positive price momentum with increasing volume. ${symbol} breaking key resistance levels.`
      },
      'SELL': {
        'Growth': `Growth rate declining with increasing competition. ${symbol} facing headwinds in key markets.`,
        'Value': `Price approaching fair value with limited upside. ${symbol} better opportunities available elsewhere.`,
        'Dividend': `Dividend sustainability concerns with cash flow pressure. ${symbol} may reduce payout.`,
        'Momentum': `Losing momentum with weakening technical indicators. ${symbol} showing bearish signals.`
      },
      'HOLD': {
        'Growth': `Consolidating after recent gains. ${symbol} wait for clear direction before adding.`,
        'Value': `Fairly valued at current levels. ${symbol} maintain position and monitor.`,
        'Dividend': `Stable dividend but limited price appreciation. ${symbol} hold for income.`,
        'Momentum': `Trading in range, awaiting breakout. ${symbol} patience required.`
      }
    };
    
    return reasons[action as keyof typeof reasons]?.[category as keyof typeof reasons.BUY] || 
           'Market conditions suggest careful monitoring of this position.';
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refreshPortfolio(),
      loadData(true),
      loadAIRecommendations()
    ]);
    setRefreshing(false);
  };

  if (loading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Demo Mode Banner */}
      <DemoModeBanner variant="banner" />
      
      {/* Enhanced Header with Logo */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/images/homelogo.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.headerTitle}>Stock Soko</Text>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => (navigation as any).navigate('ProfileTab', { screen: 'NotificationCenter' })}
        >
          <Ionicons name="notifications-outline" size={24} color={colors.text.secondary} />
          {unreadNotifications > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary.main}
            colors={[colors.primary.main]}
          />
        }
      >
                {/* Personalized Greeting */}
                <View style={styles.greetingSection}>
                  <Text style={styles.greeting}>Welcome, {userName}</Text>
                  <Text style={styles.subtitle}>Stock Soko Trading Dashboard</Text>
                </View>

        
        <Card variant="elevated" style={styles.portfolioCard}>
          <View style={styles.portfolioHeader}>
            <Text style={styles.portfolioLabel}>Portfolio Value</Text>
            <TouchableOpacity onPress={() => (navigation as any).navigate('PortfolioTab')}>
              <Ionicons name="arrow-forward" size={20} color={colors.primary.main} />
            </TouchableOpacity>
          </View>
          <Text style={styles.portfolioValue}>
            KES {portfolio.value.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <View style={styles.portfolioChange}>
            <Ionicons 
              name={portfolio.changePercent >= 0 ? 'trending-up' : 'trending-down'} 
              size={16} 
              color={portfolio.changePercent >= 0 ? colors.success : colors.error} 
            />
            <Text style={[styles.changeText, portfolio.changePercent >= 0 ? styles.changePositive : styles.changeNegative]}>
              {portfolio.changePercent >= 0 ? '+' : ''}{portfolio.changePercent.toFixed(2)}%
            </Text>
            <Text style={styles.changePeriod}>Today</Text>
          </View>
          <Text style={[styles.changeAmount, portfolio.change >= 0 ? styles.changePositive : styles.changeNegative]}>
            {portfolio.change >= 0 ? '+' : ''}KES {portfolio.change.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </Card>

        {/* Quick Actions */}
        <Card variant="glass" style={styles.quickActionsCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => (navigation as any).navigate('MarketsTab')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="trending-up" size={24} color={colors.primary.main} />
              </View>
              <Text style={styles.actionText}>Trade</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => (navigation as any).navigate('ProfileTab', { screen: 'Wallet' })}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="wallet-outline" size={24} color={colors.primary.main} />
              </View>
              <Text style={styles.actionText}>Deposit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => (navigation as any).navigate('ProfileTab', { screen: 'EducationalContent' })}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="school-outline" size={24} color={colors.primary.main} />
              </View>
              <Text style={styles.actionText}>Learn</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* AI Recommendations */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="sparkles" size={20} color={colors.primary.main} />
            <Text style={styles.sectionTitle}>AI Recommendations</Text>
          </View>
          <TouchableOpacity onPress={() => (navigation as any).navigate('ProfileTab', { screen: 'AIAssistant' })}>
            <Text style={styles.seeAllText}>Ask AI</Text>
          </TouchableOpacity>
        </View>

        {loadingAI ? (
          <Card variant="glass" style={styles.aiLoadingCard}>
            <Text style={styles.aiLoadingText}>Analyzing markets...</Text>
          </Card>
        ) : aiRecommendations.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.aiScrollContent}
            style={styles.aiScrollView}
          >
            {aiRecommendations.map((rec) => (
              <TouchableOpacity
                key={rec.id}
                style={styles.aiRecommendationCard}
                onPress={() => (navigation as any).navigate('MarketsTab', { 
                  screen: 'StockDetail', 
                  params: { symbol: rec.symbol } 
                })}
                activeOpacity={0.7}
              >
                {/* Header with Action Badge */}
                <View style={styles.aiRecHeader}>
                  <View style={styles.aiRecSymbolContainer}>
                    <Text style={styles.aiRecSymbol}>{rec.symbol}</Text>
                    <Text style={styles.aiRecName} numberOfLines={1}>{rec.name}</Text>
                  </View>
                  <View style={[
                    styles.aiRecBadge,
                    { backgroundColor: rec.action === 'BUY' ? colors.success + '20' : 
                                       rec.action === 'SELL' ? colors.error + '20' : 
                                       colors.text.secondary + '20' }
                  ]}>
                    <Text style={[
                      styles.aiRecBadgeText,
                      { color: rec.action === 'BUY' ? colors.success : 
                               rec.action === 'SELL' ? colors.error : 
                               colors.text.primary }
                    ]}>
                      {rec.action}
                    </Text>
                  </View>
                </View>

                {/* Category & Risk */}
                <View style={styles.aiRecMetaRow}>
                  <View style={styles.aiRecMetaItem}>
                    <Ionicons name="bookmark-outline" size={14} color={colors.text.tertiary} />
                    <Text style={styles.aiRecMetaText}>{rec.category}</Text>
                  </View>
                  <View style={styles.aiRecMetaItem}>
                    <Ionicons 
                      name={rec.riskLevel === 'Low' ? 'shield-checkmark-outline' : 
                            rec.riskLevel === 'Medium' ? 'alert-circle-outline' : 
                            'warning-outline'} 
                      size={14} 
                      color={rec.riskLevel === 'Low' ? colors.success : 
                             rec.riskLevel === 'Medium' ? colors.text.secondary : 
                             colors.error} 
                    />
                    <Text style={[
                      styles.aiRecMetaText,
                      { color: rec.riskLevel === 'Low' ? colors.success : 
                               rec.riskLevel === 'Medium' ? colors.text.secondary : 
                               colors.error }
                    ]}>
                      {rec.riskLevel} Risk
                    </Text>
                  </View>
                </View>

                {/* Confidence Bar */}
                <View style={styles.aiRecConfidenceContainer}>
                  <Text style={styles.aiRecConfidenceLabel}>Confidence</Text>
                  <View style={styles.aiRecConfidenceBar}>
                    <View style={[
                      styles.aiRecConfidenceFill,
                      { 
                        width: `${rec.confidence}%`,
                        backgroundColor: rec.confidence > 85 ? colors.success : 
                                       rec.confidence > 75 ? colors.primary.main : 
                                       colors.text.secondary
                      }
                    ]} />
                  </View>
                  <Text style={styles.aiRecConfidenceValue}>{rec.confidence}%</Text>
                </View>

                {/* Price Info */}
                {rec.currentPrice && rec.targetPrice && (
                  <View style={styles.aiRecPriceRow}>
                    <View style={styles.aiRecPriceItem}>
                      <Text style={styles.aiRecPriceLabel}>Current</Text>
                      <Text style={styles.aiRecPriceValue}>KES {rec.currentPrice.toFixed(2)}</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={16} color={colors.text.tertiary} />
                    <View style={styles.aiRecPriceItem}>
                      <Text style={styles.aiRecPriceLabel}>Target</Text>
                      <Text style={[
                        styles.aiRecPriceValue,
                        { color: rec.targetPrice > rec.currentPrice ? colors.success : colors.error }
                      ]}>
                        KES {rec.targetPrice.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Reasoning */}
                <Text style={styles.aiRecReasoning} numberOfLines={3}>
                  {rec.reasoning}
                </Text>

                {/* Time Horizon */}
                <View style={styles.aiRecFooter}>
                  <Ionicons name="time-outline" size={12} color={colors.text.tertiary} />
                  <Text style={styles.aiRecTimeHorizon}>{rec.timeHorizon}-term</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <Card variant="glass" style={styles.aiCard}>
            <Text style={styles.aiTitle}>No Recommendations</Text>
            <Text style={styles.aiText}>
              Pull to refresh to get AI-powered stock recommendations.
            </Text>
          </Card>
        )}

        {/* Top Gainers */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Gainers Today</Text>
          <TouchableOpacity onPress={() => (navigation as any).navigate('MarketsTab')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {topGainers.length > 0 ? (
          topGainers.map((stock, index) => (
            <TouchableOpacity
              key={stock.symbol}
              style={styles.stockCard}
              onPress={() => (navigation as any).navigate('MarketsTab', { 
                screen: 'StockDetail', 
                params: { symbol: stock.symbol } 
              })}
            >
              <View style={styles.stockIconContainer}>
                <View style={styles.stockIcon}>
                  <Text style={styles.stockIconText}>{stock.symbol.charAt(0)}</Text>
                </View>
              </View>
              <View style={styles.stockInfo}>
                <Text style={styles.stockSymbol}>{stock.symbol}</Text>
                <Text style={styles.stockName} numberOfLines={1}>{stock.name}</Text>
              </View>
              <View style={styles.stockPriceContainer}>
                <Text style={styles.stockPrice}>
                  KES {stock.last_price.toFixed(2)}
                </Text>
                <View style={styles.stockChangeContainer}>
                  <Ionicons name="trending-up" size={12} color={colors.success} />
                  <Text style={[styles.stockChange, { color: colors.success }]}>
                    +{stock.change_pct.toFixed(2)}%
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Card variant="outline" style={styles.emptyState}>
            <Ionicons name="trending-up-outline" size={40} color={colors.text.tertiary} />
            <Text style={styles.emptyStateText}>No gainers available</Text>
          </Card>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main + '40',
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  logoImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
  notificationBadgeText: {
    color: colors.primary.contrast,
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 140,
  },
  greetingSection: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  greeting: {
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  portfolioCard: {
    marginBottom: spacing.lg,
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  portfolioLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  portfolioValue: {
    fontSize: 32,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  portfolioChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.xs,
  },
  changeText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  changePeriod: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginLeft: spacing.xs,
  },
  changeAmount: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  changePositive: {
    color: colors.success,
  },
  changeNegative: {
    color: colors.error,
  },
  quickActionsCard: {
    marginBottom: spacing.lg,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
  },
  actionButton: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  seeAllText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary.main,
    fontWeight: typography.fontWeight.medium,
  },
  aiCard: {
    marginBottom: spacing.lg,
  },
  aiTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  aiText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
  aiButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary.main,
    fontWeight: typography.fontWeight.semibold,
  },
  aiLoadingCard: {
    marginBottom: spacing.lg,
    alignItems: 'center',
    padding: spacing.xl,
  },
  aiLoadingText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  aiScrollView: {
    marginBottom: spacing.lg,
  },
  aiScrollContent: {
    paddingRight: spacing.lg,
  },
  aiRecommendationCard: {
    width: 280,
    backgroundColor: colors.background.secondary + 'dd',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.main,
    padding: spacing.md,
    marginRight: spacing.md,
  },
  aiRecHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  aiRecSymbolContainer: {
    flex: 1,
  },
  aiRecSymbol: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  aiRecName: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  aiRecBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  aiRecBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  aiRecMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  aiRecMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aiRecMetaText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  aiRecConfidenceContainer: {
    marginBottom: spacing.sm,
  },
  aiRecConfidenceLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: 4,
  },
  aiRecConfidenceBar: {
    height: 6,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: 4,
  },
  aiRecConfidenceFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  aiRecConfidenceValue: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'right',
  },
  aiRecPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border.main + '40',
  },
  aiRecPriceItem: {
    flex: 1,
  },
  aiRecPriceLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: 2,
  },
  aiRecPriceValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  aiRecReasoning: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  aiRecFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aiRecTimeHorizon: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  stockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.main,
    marginBottom: spacing.sm,
  },
  stockIconContainer: {
    marginRight: spacing.md,
  },
  stockIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockIconText: {
    fontSize: 18,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
  },
  stockInfo: {
    flex: 1,
  },
  stockSymbol: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  stockName: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  stockPriceContainer: {
    alignItems: 'flex-end',
  },
  stockPrice: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  stockChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  stockChange: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyStateText: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
  },
});