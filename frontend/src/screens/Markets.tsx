import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput as RNTextInput, Alert, Dimensions, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../api/client';
import { colors, typography, spacing, borderRadius } from '../theme';
import { Card, Button, Input, Badge, LoadingState, FloatingAIButton } from '../components';
import { hapticFeedback } from '../utils/haptics';

interface Instrument {
  symbol: string;
  name: string;
  last_price: number;
  change_pct: number;
  volume?: number;
  high?: number;
  low?: number;
  market_cap?: number;
}

interface MarketSummary {
  totalGainers: number;
  totalLosers: number;
  avgChange: number;
  topGainer: Instrument | null;
  topLoser: Instrument | null;
}

const { width } = Dimensions.get('window');

export default function Markets() {
  const navigation = useNavigation();
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [filteredInstruments, setFilteredInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'gainers' | 'losers'>('all');
  const [recommendations, setRecommendations] = useState<Record<string, string>>({});
  const [savingWatchlist, setSavingWatchlist] = useState<string | null>(null);
  const [orderQuantities, setOrderQuantities] = useState<Record<string, string>>({});
  const [placingOrder, setPlacingOrder] = useState<string | null>(null);
  const [marketSummary, setMarketSummary] = useState<MarketSummary>({
    totalGainers: 0,
    totalLosers: 0,
    avgChange: 0,
    topGainer: null,
    topLoser: null,
  });

  useEffect(() => {
    loadMarkets();
  }, []);

  useEffect(() => {
    filterInstruments();
    calculateMarketSummary();
  }, [searchQuery, filterType, instruments]);

  const loadMarkets = async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const res = await api.get('/markets');
      setInstruments(res.data.instruments || []);
    } catch (error) {
      console.error('Failed to load markets:', error);
      if (!isRefreshing) {
        Alert.alert('Error', 'Failed to load market data');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadMarkets(true);
  };

  const filterInstruments = () => {
    let filtered = [...instruments];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        i =>
          i.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType === 'gainers') {
      filtered = filtered.filter(i => i.change_pct > 0).sort((a, b) => b.change_pct - a.change_pct);
    } else if (filterType === 'losers') {
      filtered = filtered.filter(i => i.change_pct < 0).sort((a, b) => a.change_pct - b.change_pct);
    } else {
      filtered = filtered.sort((a, b) => Math.abs(b.change_pct) - Math.abs(a.change_pct));
    }

    setFilteredInstruments(filtered);
  };

  const calculateMarketSummary = () => {
    const gainers = instruments.filter(i => i.change_pct > 0);
    const losers = instruments.filter(i => i.change_pct < 0);
    const avgChange = instruments.length > 0 
      ? instruments.reduce((sum, i) => sum + i.change_pct, 0) / instruments.length 
      : 0;
    
    const topGainer = gainers.length > 0 
      ? gainers.reduce((max, i) => i.change_pct > max.change_pct ? i : max, gainers[0])
      : null;
    
    const topLoser = losers.length > 0 
      ? losers.reduce((min, i) => i.change_pct < min.change_pct ? i : min, losers[0])
      : null;

    setMarketSummary({
      totalGainers: gainers.length,
      totalLosers: losers.length,
      avgChange,
      topGainer,
      topLoser,
    });
  };

  const getRecommendation = async (symbol: string) => {
    try {
      const res = await api.post('/markets/recommendation', { symbol });
      setRecommendations(prev => ({ ...prev, [symbol]: res.data.recommendation }));
    } catch (error) {
      console.error('Failed to get recommendation:', error);
    }
  };

  const addToWatchlist = async (symbol: string) => {
    try {
      setSavingWatchlist(symbol);
      await api.post('/watchlist', { symbol });
      Alert.alert('Success', `${symbol} added to watchlist`);
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.detail || 'Failed to add to watchlist');
    } finally {
      setSavingWatchlist(null);
    }
  };

  const placeOrder = async (symbol: string, side: 'buy' | 'sell') => {
    try {
      const quantity = parseInt(orderQuantities[symbol] || '0', 10);
      if (!quantity || quantity <= 0) {
        Alert.alert('Invalid Quantity', 'Please enter a valid quantity');
        return;
      }

      setPlacingOrder(`${symbol}_${side}`);
      const res = await api.post('/trades/orders', {
        symbol,
        side,
        quantity,
        order_type: 'market',
      });
      Alert.alert('Order Placed', `${res.data.status}: ${res.data.message}`);
      setOrderQuantities(prev => ({ ...prev, [symbol]: '' }));
    } catch (error: any) {
      Alert.alert('Order Failed', error?.response?.data?.detail || 'Failed to place order');
    } finally {
      setPlacingOrder(null);
    }
  };

  if (loading) {
    return <LoadingState message="Loading markets..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header with Watchlist Button */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Markets</Text>
        <TouchableOpacity 
          style={styles.watchlistHeaderButton}
          onPress={() => {
            hapticFeedback.light();
            navigation.navigate('Watchlist' as never);
          }}
        >
          <Text style={styles.watchlistHeaderIcon}>◆</Text>
          <Text style={styles.watchlistHeaderText}>Watchlist</Text>
        </TouchableOpacity>
      </View>

      {/* Market Summary Cards */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.summaryScroll}
        contentContainerStyle={styles.summaryContent}
      >
        <View style={[styles.summaryCard, styles.summaryCardPrimary]}>
          <Text style={styles.summaryLabel}>Market Trend</Text>
          <Text style={[styles.summaryValue, marketSummary.avgChange >= 0 ? styles.positiveText : styles.negativeText]}>
            {marketSummary.avgChange >= 0 ? '↗' : '↘'} {Math.abs(marketSummary.avgChange).toFixed(2)}%
          </Text>
          <Text style={styles.summarySubtext}>{marketSummary.avgChange >= 0 ? 'Bullish' : 'Bearish'}</Text>
        </View>

        <View style={[styles.summaryCard, styles.summaryCardSuccess]}>
          <Text style={styles.summaryLabel}>Top Gainer</Text>
          <Text style={styles.summaryValue}>
            {marketSummary.topGainer ? marketSummary.topGainer.symbol : 'N/A'}
          </Text>
          <Text style={styles.summarySubtext}>
            {marketSummary.topGainer ? `+${marketSummary.topGainer.change_pct.toFixed(2)}%` : '0.00%'}
          </Text>
        </View>

        <View style={[styles.summaryCard, styles.summaryCardError]}>
          <Text style={styles.summaryLabel}>Top Loser</Text>
          <Text style={styles.summaryValue}>
            {marketSummary.topLoser ? marketSummary.topLoser.symbol : 'N/A'}
          </Text>
          <Text style={styles.summarySubtext}>
            {marketSummary.topLoser ? `${marketSummary.topLoser.change_pct.toFixed(2)}%` : '0.00%'}
          </Text>
        </View>

        <View style={[styles.summaryCard, styles.summaryCardInfo]}>
          <Text style={styles.summaryLabel}>Gainers/Losers</Text>
          <Text style={styles.summaryValue}>{marketSummary.totalGainers}/{marketSummary.totalLosers}</Text>
          <Text style={styles.summarySubtext}>{instruments.length} stocks</Text>
        </View>
      </ScrollView>

      {/* Search and Filter Bar */}
      <View style={styles.headerBar}>
        <View style={styles.searchContainer}>
          <RNTextInput
            style={styles.searchInput}
            placeholder="Search stocks..."
            placeholderTextColor={colors.text.disabled}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'all' && styles.filterChipActive]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[styles.filterChipText, filterType === 'all' && styles.filterChipTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'gainers' && styles.filterChipActive]}
            onPress={() => setFilterType('gainers')}
          >
            <Text style={[styles.filterChipText, filterType === 'gainers' && styles.filterChipTextActive]}>
              Gainers
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'losers' && styles.filterChipActive]}
            onPress={() => setFilterType('losers')}
          >
            <Text style={[styles.filterChipText, filterType === 'losers' && styles.filterChipTextActive]}>
              Losers
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        bounces={true}
        scrollEventThrottle={16}
      >
        <Text style={styles.resultsText}>
          {filteredInstruments.length} {filteredInstruments.length === 1 ? 'result' : 'results'}
        </Text>

        {filteredInstruments.map(stock => (
          <Card key={stock.symbol} style={styles.stockCard} padding="md">
            {/* Stock Header */}
            <View style={styles.stockHeader}>
              <View style={styles.stockIconContainer}>
                <View style={[styles.stockIcon, stock.change_pct >= 0 ? styles.stockIconGreen : styles.stockIconRed]}>
                  <Text style={styles.stockIconText}>{stock.symbol[0]}</Text>
                </View>
              </View>
              
              <View style={styles.stockTitleSection}>
                <Text style={styles.stockSymbol}>{stock.symbol}</Text>
                <Text style={styles.stockName} numberOfLines={1}>{stock.name}</Text>
                {stock.volume && (
                  <Text style={styles.stockVolume}>Vol: {(stock.volume / 1000).toFixed(1)}K</Text>
                )}
              </View>
              
              <View style={styles.stockPriceSection}>
                <Text style={styles.stockPrice}>KES {stock.last_price.toFixed(2)}</Text>
                <View style={[styles.changeBadge, stock.change_pct >= 0 ? styles.changeBadgeGreen : styles.changeBadgeRed]}>
                  <Text style={[styles.changeText, stock.change_pct >= 0 ? styles.changeTextGreen : styles.changeTextRed]}>
                    {stock.change_pct >= 0 ? '▲' : '▼'} {Math.abs(stock.change_pct).toFixed(2)}%
                  </Text>
                </View>
              </View>
            </View>

            {/* Mini Price Range Bar */}
            {stock.high && stock.low && (
              <View style={styles.priceRangeContainer}>
                <Text style={styles.priceRangeLabel}>Day Range</Text>
                <View style={styles.priceRangeBar}>
                  <View 
                    style={[
                      styles.priceRangeFill, 
                      { width: `${((stock.last_price - stock.low) / (stock.high - stock.low)) * 100}%` }
                    ]} 
                  />
                </View>
                <View style={styles.priceRangeValues}>
                  <Text style={styles.priceRangeText}>L: {stock.low.toFixed(2)}</Text>
                  <Text style={styles.priceRangeText}>H: {stock.high.toFixed(2)}</Text>
                </View>
              </View>
            )}

            {/* AI Recommendation */}
            {recommendations[stock.symbol] && (
              <View style={styles.recommendationBanner}>
                <Text style={styles.recommendationText}>
                  AI Recommendation: <Text style={styles.recommendationValue}>
                    {recommendations[stock.symbol].toUpperCase()}
                  </Text>
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <Button
                title="AI Insight"
                onPress={() => getRecommendation(stock.symbol)}
                variant="ghost"
                size="sm"
                style={styles.actionButton}
              />
              <Button
                title={savingWatchlist === stock.symbol ? 'Adding...' : 'Watchlist'}
                onPress={() => addToWatchlist(stock.symbol)}
                variant="outline"
                size="sm"
                disabled={savingWatchlist === stock.symbol}
                style={styles.actionButton}
              />
            </View>

            {/* Quick Trade Panel */}
            <View style={styles.tradePanel}>
              <Text style={styles.tradePanelTitle}>Quick Trade</Text>
              <View style={styles.tradeRow}>
                <Input
                  placeholder="Quantity"
                  value={orderQuantities[stock.symbol] || ''}
                  onChangeText={text =>
                    setOrderQuantities(prev => ({ ...prev, [stock.symbol]: text }))
                  }
                  keyboardType="numeric"
                  containerStyle={styles.qtyInput}
                  style={styles.qtyInputField}
                />
                
                <Button
                  title={placingOrder === `${stock.symbol}_buy` ? '...' : 'Buy'}
                  onPress={() => placeOrder(stock.symbol, 'buy')}
                  variant="success"
                  size="md"
                  disabled={!!placingOrder}
                  style={styles.tradeButton}
                />
                
                <Button
                  title={placingOrder === `${stock.symbol}_sell` ? '...' : 'Sell'}
                  onPress={() => placeOrder(stock.symbol, 'sell')}
                  variant="error"
                  size="md"
                  disabled={!!placingOrder}
                  style={styles.tradeButton}
                />
              </View>
            </View>
          </Card>
        ))}

        {filteredInstruments.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No stocks found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filter</Text>
          </View>
        )}
      </ScrollView>

      <FloatingAIButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  watchlistHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  watchlistHeaderIcon: {
    fontSize: 16,
    color: colors.warning,
  },
  watchlistHeaderText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  summaryScroll: {
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main,
  },
  summaryContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  summaryCard: {
    minWidth: 140,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  summaryCardPrimary: {
    backgroundColor: colors.primary.main,
  },
  summaryCardSuccess: {
    backgroundColor: colors.success + '20',
    borderWidth: 1,
    borderColor: colors.success,
  },
  summaryCardError: {
    backgroundColor: colors.error + '20',
    borderWidth: 1,
    borderColor: colors.error,
  },
  summaryCardInfo: {
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  summaryLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    fontWeight: typography.fontWeight.semibold,
  },
  summaryValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  summarySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  positiveText: {
    color: colors.success,
  },
  negativeText: {
    color: colors.error,
  },
  headerBar: {
    padding: spacing.base,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main,
  },
  searchContainer: {
    marginBottom: spacing.sm,
  },
  searchInput: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  filterChipActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  filterChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.medium,
  },
  filterChipTextActive: {
    color: colors.primary.contrast,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.base,
    paddingBottom: 100,
    minHeight: 1200,
  },
  resultsText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
  },
  stockCard: {
    marginBottom: spacing.md,
  },
  stockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  stockIconContainer: {
    marginRight: spacing.sm,
  },
  stockIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockIconGreen: {
    backgroundColor: colors.success + '20',
    borderWidth: 2,
    borderColor: colors.success,
  },
  stockIconRed: {
    backgroundColor: colors.error + '20',
    borderWidth: 2,
    borderColor: colors.error,
  },
  stockIconText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  stockTitleSection: {
    flex: 1,
  },
  stockSymbol: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  stockName: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: 2,
  },
  stockVolume: {
    fontSize: typography.fontSize.xs,
    color: colors.text.disabled,
  },
  stockPriceSection: {
    alignItems: 'flex-end',
  },
  stockPrice: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  changeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  changeBadgeGreen: {
    backgroundColor: colors.success + '20',
  },
  changeBadgeRed: {
    backgroundColor: colors.error + '20',
  },
  changeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  changeTextGreen: {
    color: colors.success,
  },
  changeTextRed: {
    color: colors.error,
  },
  priceRangeContainer: {
    marginBottom: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.main,
  },
  priceRangeLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.disabled,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  priceRangeBar: {
    height: 6,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  priceRangeFill: {
    height: '100%',
    backgroundColor: colors.primary.main,
  },
  priceRangeValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceRangeText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  recommendationBanner: {
    backgroundColor: colors.background.primary,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  recommendationText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  recommendationValue: {
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  tradePanel: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  tradePanelTitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
    fontWeight: typography.fontWeight.medium,
  },
  tradeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  qtyInput: {
    flex: 1,
    marginBottom: 0,
  },
  qtyInputField: {
    paddingVertical: spacing.sm,
  },
  tradeButton: {
    paddingHorizontal: spacing.base,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
});
