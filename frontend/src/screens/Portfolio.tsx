import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, RefreshControl } from 'react-native';
import { api } from '../api/client';
import { colors, typography, spacing, borderRadius } from '../theme';
import { Card, Badge, LoadingState, EmptyState, Button } from '../components';

interface WatchItem {
  symbol: string;
  note?: string;
  target_price?: number;
}

interface Position {
  symbol: string;
  quantity: number;
  avg_price: number;
  market_value: number;
  unrealized_pl: number;
}

const { width } = Dimensions.get('window');

export default function Portfolio() {
  const [watchlist, setWatchlist] = useState<WatchItem[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [watchlistRes, positionsRes] = await Promise.all([
        api.get('/watchlist'),
        api.get('/ledger/positions'),
      ]);
      
      setWatchlist(watchlistRes.data.items || []);
      setPositions(positionsRes.data.positions || []);
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const removeFromWatchlist = async (symbol: string) => {
    try {
      setRemoving(symbol);
      await api.delete(`/watchlist/${encodeURIComponent(symbol)}`);
      await loadData();
    } catch (error) {
      console.error('Failed to remove from watchlist:', error);
    } finally {
      setRemoving(null);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return <LoadingState message="Loading portfolio..." />;
  }

  const totalValue = positions.reduce((sum, p) => sum + p.market_value, 0);
  const totalUPL = positions.reduce((sum, p) => sum + p.unrealized_pl, 0);
  const uplPercentage = totalValue > 0 ? (totalUPL / (totalValue - totalUPL)) * 100 : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={true}
      bounces={true}
      scrollEventThrottle={16}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.main} />
      }
    >
      {/* Portfolio Summary Card */}
      <Card variant="elevated" style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Portfolio Value</Text>
        <Text style={styles.summaryValue}>KES {totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        
        <View style={styles.uplContainer}>
          <View style={styles.uplRow}>
            <Text style={styles.uplLabel}>Unrealized P/L</Text>
            <View style={styles.uplBadge}>
              <Badge
                text={`${totalUPL >= 0 ? '+' : ''}${totalUPL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                variant={totalUPL >= 0 ? 'success' : 'error'}
              />
              <Badge
                text={`${uplPercentage >= 0 ? '+' : ''}${uplPercentage.toFixed(2)}%`}
                variant={uplPercentage >= 0 ? 'success' : 'error'}
                style={{ marginLeft: spacing.xs }}
              />
            </View>
          </View>
        </View>
      </Card>

      {/* Positions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Holdings ({positions.length})</Text>
        
        {positions.length === 0 ? (
          <Card>
            <EmptyState
              title="No Positions"
              message="You haven't made any trades yet. Start trading in the Markets tab."
              actionLabel="Go to Markets"
              onAction={() => {}}
            />
          </Card>
        ) : (
          <>
            {positions.map(position => {
              const plPercentage = position.avg_price > 0 
                ? (position.unrealized_pl / (position.avg_price * position.quantity)) * 100 
                : 0;
              const currentPrice = position.market_value / position.quantity;

              return (
                <Card key={position.symbol} style={styles.positionCard} padding="md">
                  <View style={styles.positionHeader}>
                    <Text style={styles.positionSymbol}>{position.symbol}</Text>
                    <Badge
                      text={`${position.unrealized_pl >= 0 ? '+' : ''}${plPercentage.toFixed(2)}%`}
                      variant={position.unrealized_pl >= 0 ? 'success' : 'error'}
                    />
                  </View>

                  <View style={styles.positionGrid}>
                    <View style={styles.positionStat}>
                      <Text style={styles.positionStatLabel}>Quantity</Text>
                      <Text style={styles.positionStatValue}>{position.quantity}</Text>
                    </View>
                    
                    <View style={styles.positionStat}>
                      <Text style={styles.positionStatLabel}>Avg Price</Text>
                      <Text style={styles.positionStatValue}>
                        KES {position.avg_price.toFixed(2)}
                      </Text>
                    </View>
                    
                    <View style={styles.positionStat}>
                      <Text style={styles.positionStatLabel}>Current Price</Text>
                      <Text style={styles.positionStatValue}>
                        KES {currentPrice.toFixed(2)}
                      </Text>
                    </View>
                    
                    <View style={styles.positionStat}>
                      <Text style={styles.positionStatLabel}>Market Value</Text>
                      <Text style={styles.positionStatValue}>
                        KES {position.market_value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.positionFooter}>
                    <Text style={styles.positionPLLabel}>Unrealized P/L</Text>
                    <Text style={[
                      styles.positionPLValue,
                      { color: position.unrealized_pl >= 0 ? colors.gain : colors.loss }
                    ]}>
                      {position.unrealized_pl >= 0 ? '+' : ''}
                      KES {position.unrealized_pl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                </Card>
              );
            })}
          </>
        )}
      </View>

      {/* Watchlist Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Watchlist ({watchlist.length})</Text>
        
        {watchlist.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>
              No stocks in your watchlist. Add stocks from the Markets tab to keep track of them.
            </Text>
          </Card>
        ) : (
          <Card padding="sm">
            {watchlist.map(item => (
              <View key={item.symbol} style={styles.watchlistItem}>
                <View style={styles.watchlistInfo}>
                  <Text style={styles.watchlistSymbol}>{item.symbol}</Text>
                  {item.note && (
                    <Text style={styles.watchlistNote}>{item.note}</Text>
                  )}
                  {item.target_price && (
                    <Text style={styles.watchlistTarget}>
                      Target: KES {item.target_price.toFixed(2)}
                    </Text>
                  )}
                </View>
                
                <Button
                  title={removing === item.symbol ? 'Removing...' : 'Remove'}
                  onPress={() => removeFromWatchlist(item.symbol)}
                  variant="ghost"
                  size="sm"
                  disabled={removing === item.symbol}
                />
              </View>
            ))}
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: spacing.base,
    paddingBottom: 100,
  },
  summaryCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  uplContainer: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.main,
  },
  uplRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  uplLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  uplBadge: {
    flexDirection: 'row',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  positionCard: {
    marginBottom: spacing.sm,
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  positionSymbol: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  positionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
    marginBottom: spacing.md,
  },
  positionStat: {
    width: '50%',
    padding: spacing.xs,
    marginBottom: spacing.sm,
  },
  positionStatLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: 2,
  },
  positionStatValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  positionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.main,
  },
  positionPLLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  positionPLValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  watchlistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main,
  },
  watchlistInfo: {
    flex: 1,
  },
  watchlistSymbol: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  watchlistNote: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  watchlistTarget: {
    fontSize: typography.fontSize.xs,
    color: colors.primary.main,
    marginTop: 2,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});
