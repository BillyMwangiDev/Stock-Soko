import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput as RNTextInput, Alert, Dimensions } from 'react-native';
import { api } from '../api/client';
import { colors, typography, spacing, borderRadius } from '../theme';
import { Card, Button, Input, Badge, LoadingState } from '../components';

interface Instrument {
  symbol: string;
  name: string;
  last_price: number;
  change_pct: number;
  volume?: number;
}

const { width } = Dimensions.get('window');

export default function Markets() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [filteredInstruments, setFilteredInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'gainers' | 'losers'>('all');
  const [recommendations, setRecommendations] = useState<Record<string, string>>({});
  const [savingWatchlist, setSavingWatchlist] = useState<string | null>(null);
  const [orderQuantities, setOrderQuantities] = useState<Record<string, string>>({});
  const [placingOrder, setPlacingOrder] = useState<string | null>(null);

  useEffect(() => {
    loadMarkets();
  }, []);

  useEffect(() => {
    filterInstruments();
  }, [searchQuery, filterType, instruments]);

  const loadMarkets = async () => {
    try {
      const res = await api.get('/markets');
      setInstruments(res.data.instruments || []);
    } catch (error) {
      console.error('Failed to load markets:', error);
      Alert.alert('Error', 'Failed to load market data');
    } finally {
      setLoading(false);
    }
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
      filtered = filtered.filter(i => i.change_pct > 0);
    } else if (filterType === 'losers') {
      filtered = filtered.filter(i => i.change_pct < 0);
    }

    setFilteredInstruments(filtered);
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
              <View style={styles.stockTitleSection}>
                <Text style={styles.stockSymbol}>{stock.symbol}</Text>
                <Text style={styles.stockName} numberOfLines={1}>{stock.name}</Text>
              </View>
              
              <View style={styles.stockPriceSection}>
                <Text style={styles.stockPrice}>KES {stock.last_price.toFixed(2)}</Text>
                <Badge
                  text={`${stock.change_pct >= 0 ? '+' : ''}${stock.change_pct.toFixed(2)}%`}
                  variant={stock.change_pct >= 0 ? 'success' : 'error'}
                />
              </View>
            </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  headerBar: {
    padding: spacing.base,
    backgroundColor: colors.background.secondary,
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
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
  },
  stockPriceSection: {
    alignItems: 'flex-end',
  },
  stockPrice: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
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
