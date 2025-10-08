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

      {/* Compact Market Summary */}
      <View style={styles.compactSummary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Trend</Text>
          <Text style={[styles.summaryValue, marketSummary.avgChange >= 0 ? styles.positiveText : styles.negativeText]}>
            {marketSummary.avgChange >= 0 ? '▲' : '▼'} {Math.abs(marketSummary.avgChange).toFixed(1)}%
          </Text>
        </View>
        
        <View style={styles.summaryDivider} />
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Gainer</Text>
          <Text style={[styles.summaryValue, styles.positiveText]}>
            {marketSummary.topGainer ? `+${marketSummary.topGainer.change_pct.toFixed(1)}%` : 'N/A'}
          </Text>
        </View>
        
        <View style={styles.summaryDivider} />
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Loser</Text>
          <Text style={[styles.summaryValue, styles.negativeText]}>
            {marketSummary.topLoser ? `${marketSummary.topLoser.change_pct.toFixed(1)}%` : 'N/A'}
          </Text>
        </View>
        
        <View style={styles.summaryDivider} />
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryValue}>{instruments.length}</Text>
        </View>
      </View>

      {/* Compact Search and Filter */}
      <View style={styles.searchFilterBar}>
        <View style={styles.searchBox}>
          <RNTextInput
            style={styles.searchInput}
            placeholder="Search stocks..."
            placeholderTextColor={colors.text.disabled}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <TouchableOpacity
          style={[styles.filterBtn, filterType === 'all' && styles.filterBtnActive]}
          onPress={() => setFilterType('all')}
        >
          <Text style={[styles.filterBtnText, filterType === 'all' && styles.filterBtnTextActive]}>All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterBtn, filterType === 'gainers' && styles.filterBtnActive]}
          onPress={() => setFilterType('gainers')}
        >
          <Text style={[styles.filterBtnText, filterType === 'gainers' && styles.filterBtnTextActive]}>▲</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterBtn, filterType === 'losers' && styles.filterBtnActive]}
          onPress={() => setFilterType('losers')}
        >
          <Text style={[styles.filterBtnText, filterType === 'losers' && styles.filterBtnTextActive]}>▼</Text>
        </TouchableOpacity>
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
          <TouchableOpacity 
            key={stock.symbol} 
            onPress={() => {
              hapticFeedback.impact();
              navigation.navigate('StockDetail' as never, { symbol: stock.symbol } as never);
            }}
            activeOpacity={0.7}
          >
            <Card style={styles.stockCard} padding="md">
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
          </TouchableOpacity>
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
  compactSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border.light,
  },
  summaryLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: 2,
    fontWeight: typography.fontWeight.medium,
  },
  summaryValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  positiveText: {
    color: colors.success,
  },
  negativeText: {
    color: colors.error,
  },
  searchFilterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
  },
  filterBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.light,
    minWidth: 44,
    alignItems: 'center',
  },
  filterBtnActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  filterBtnText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.semibold,
  },
  filterBtnTextActive: {
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
