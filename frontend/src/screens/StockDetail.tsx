import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';
import { LoadingState } from '../components';
import PriceChart from '../components/PriceChart';
import { api } from '../api/client';
import { hapticFeedback } from '../utils/haptics';

interface StockDetailProps {
  symbol: string;
  onBack: () => void;
  onTrade?: (symbol: string, side: 'buy' | 'sell') => void;
}

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
  // Risk Metrics
  beta?: number;
  volatility?: number;
  sharpe_ratio?: number;
  debt_to_equity?: number;
  risk_rating?: string;
}

export default function StockDetail({ symbol, onBack, onTrade }: StockDetailProps) {
  const [stock, setStock] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('1M');
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  useEffect(() => {
    loadStockData();
    checkWatchlist();
  }, [symbol]);

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
      const res = await api.get('/markets');
      const stockData = res.data.instruments?.find((s: any) => s.symbol === symbol);
      
      if (stockData) {
        setStock({
          ...stockData,
          change_amount: (stockData.last_price * stockData.change_pct) / 100,
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
        return { backgroundColor: '#8B0000' + '20', borderColor: '#8B0000' };
      default:
        return { backgroundColor: colors.text.disabled + '20', borderColor: colors.text.disabled };
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{stock.name}</Text>
        <TouchableOpacity 
          onPress={toggleWatchlist} 
          style={styles.watchlistButton}
          disabled={watchlistLoading}
        >
          <Text style={[styles.watchlistIcon, isInWatchlist && styles.watchlistIconActive]}>
            {isInWatchlist ? '◆' : '◇'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Stock Price Section */}
        <View style={[styles.priceSection, isPositive ? styles.sentimentPositive : styles.sentimentNegative]}>
          <View style={styles.priceInfo}>
            <Text style={styles.stockLabel}>{stock.name} ({stock.symbol})</Text>
            <Text style={styles.stockPrice}>${stock.last_price.toFixed(2)}</Text>
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

        {/* Key Metrics Card */}
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

        {/* Risk Profile Card */}
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
              ℹ️ Risk assessment based on market volatility, debt levels, and historical performance.
            </Text>
          </View>
        </View>

        {/* Fundamentals Card */}
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

        {/* News Card */}
        <View style={styles.infoCard}>
          <View style={styles.cardContent}>
            <View style={styles.cardTextSection}>
              <Text style={styles.cardLabel}>NEWS FEED</Text>
              <Text style={styles.cardTitle}>{stock.symbol} Expansion Plans Announced</Text>
              <Text style={styles.cardDescription}>{stock.news}</Text>
            </View>
            <View style={styles.cardImage}>
              <Text style={styles.imageEmoji}>📰</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Trade Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.tradeButton}
          onPress={() => onTrade && onTrade(symbol, 'buy')}
        >
          <Text style={styles.tradeButtonText}>Trade</Text>
        </TouchableOpacity>
      </View>
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
});
