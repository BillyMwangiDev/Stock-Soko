import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme';
import { Card, Button, Badge, LoadingState } from '../components';
import { api } from '../api/client';

interface StockDetailProps {
  symbol: string;
  onBack: () => void;
  onTrade: (symbol: string, side: 'buy' | 'sell') => void;
}

interface StockData {
  symbol: string;
  name: string;
  last_price: number;
  change_pct: number;
  volume?: number;
  market_cap?: number;
  pe_ratio?: number;
  dividend_yield?: number;
}

export default function StockDetail({ symbol, onBack, onTrade }: StockDetailProps) {
  const [stock, setStock] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'fundamentals' | 'news'>('overview');
  const [timeframe, setTimeframe] = useState('1D');
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    loadStockData();
  }, [symbol]);

  const loadStockData = async () => {
    try {
      // In production, this would fetch detailed stock data
      const res = await api.get('/markets');
      const stockData = res.data.instruments?.find((s: any) => s.symbol === symbol);
      
      if (stockData) {
        setStock({
          ...stockData,
          market_cap: Math.random() * 100000000000,
          pe_ratio: Math.random() * 30,
          dividend_yield: Math.random() * 5,
        });
      }
    } catch (error) {
      console.error('Failed to load stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = async () => {
    try {
      if (inWatchlist) {
        await api.delete(`/watchlist/${encodeURIComponent(symbol)}`);
        setInWatchlist(false);
        Alert.alert('Removed', `${symbol} removed from watchlist`);
      } else {
        await api.post('/watchlist', { symbol });
        setInWatchlist(true);
        Alert.alert('Added', `${symbol} added to watchlist`);
      }
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.detail || 'Failed to update watchlist');
    }
  };

  const handleSetAlert = () => {
    Alert.alert('Set Alert', 'Alert feature coming soon!');
  };

  if (loading) {
    return <LoadingState message="Loading stock details..." />;
  }

  if (!stock) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Stock not found</Text>
        <Button title="Go Back" onPress={onBack} variant="primary" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.symbolText}>{stock.symbol}</Text>
          <Text style={styles.companyName} numberOfLines={1}>{stock.name}</Text>
        </View>

        <TouchableOpacity onPress={handleAddToWatchlist} style={styles.iconButton}>
          <Ionicons 
            name={inWatchlist ? 'star' : 'star-outline'} 
            size={24} 
            color={inWatchlist ? colors.warning : colors.text.primary} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Price Card */}
        <Card variant="elevated" style={styles.priceCard}>
          <View style={styles.priceHeader}>
            <View>
              <Text style={styles.price}>KES {stock.last_price.toFixed(2)}</Text>
              <Badge
                text={`${stock.change_pct >= 0 ? '+' : ''}${stock.change_pct.toFixed(2)}%`}
                variant={stock.change_pct >= 0 ? 'success' : 'error'}
              />
            </View>
          </View>
        </Card>

        {/* Chart Placeholder */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Price Chart</Text>
          
          {/* Timeframe selector */}
          <View style={styles.timeframeContainer}>
            {['1D', '1W', '1M', '1Y'].map((tf) => (
              <TouchableOpacity
                key={tf}
                style={[
                  styles.timeframeButton,
                  timeframe === tf && styles.timeframeButtonActive,
                ]}
                onPress={() => setTimeframe(tf)}
              >
                <Text
                  style={[
                    styles.timeframeText,
                    timeframe === tf && styles.timeframeTextActive,
                  ]}
                >
                  {tf}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Chart placeholder */}
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartPlaceholderText}>
              📈 Chart visualization for {timeframe} timeframe
            </Text>
            <Text style={styles.chartPlaceholderSubtext}>
              Victory-native charts will be integrated here
            </Text>
          </View>
        </Card>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {(['overview', 'fundamentals', 'news'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <Card>
            <Text style={styles.sectionTitle}>Key Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Volume</Text>
                <Text style={styles.statValue}>
                  {stock.volume?.toLocaleString() || 'N/A'}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Market Cap</Text>
                <Text style={styles.statValue}>
                  {stock.market_cap ? `KES ${(stock.market_cap / 1e9).toFixed(2)}B` : 'N/A'}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {activeTab === 'fundamentals' && (
          <Card>
            <Text style={styles.sectionTitle}>Fundamental Analysis</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>P/E Ratio</Text>
                <Text style={styles.statValue}>
                  {stock.pe_ratio?.toFixed(2) || 'N/A'}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Dividend Yield</Text>
                <Text style={styles.statValue}>
                  {stock.dividend_yield ? `${stock.dividend_yield.toFixed(2)}%` : 'N/A'}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {activeTab === 'news' && (
          <Card>
            <Text style={styles.sectionTitle}>Related News</Text>
            <Text style={styles.emptyText}>No recent news for {stock.symbol}</Text>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            title="Set Alert"
            onPress={handleSetAlert}
            variant="outline"
            style={styles.actionButton}
          />
        </View>
      </ScrollView>

      {/* Bottom Trading Buttons */}
      <View style={styles.footer}>
        <Button
          title="Buy"
          onPress={() => onTrade(symbol, 'buy')}
          variant="success"
          style={styles.tradeButton}
        />
        <Button
          title="Sell"
          onPress={() => onTrade(symbol, 'sell')}
          variant="error"
          style={styles.tradeButton}
        />
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
    padding: spacing.base,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  symbolText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  companyName: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  iconButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
    padding: spacing.base,
  },
  priceCard: {
    marginBottom: spacing.md,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  price: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  chartCard: {
    marginBottom: spacing.md,
  },
  chartTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  timeframeContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  timeframeButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background.tertiary,
  },
  timeframeButtonActive: {
    backgroundColor: colors.primary.main,
  },
  timeframeText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.medium,
  },
  timeframeTextActive: {
    color: colors.primary.contrast,
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  chartPlaceholderText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  chartPlaceholderSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary.main,
  },
  tabText: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.medium,
  },
  tabTextActive: {
    color: colors.primary.main,
    fontWeight: typography.fontWeight.semibold,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  statItem: {
    width: '50%',
    padding: spacing.xs,
    marginBottom: spacing.md,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  actionsContainer: {
    marginTop: spacing.md,
    marginBottom: spacing['2xl'],
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.base,
    backgroundColor: colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border.main,
    gap: spacing.md,
  },
  tradeButton: {
    flex: 1,
  },
  errorText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    textAlign: 'center',
    margin: spacing['2xl'],
  },
});

