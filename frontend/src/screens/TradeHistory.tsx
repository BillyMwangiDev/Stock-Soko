/**
 * Trade History Screen
 * Complete log of all executed trades with P/L tracking
 */
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { PortfolioStackParamList } from '../navigation/types';
import { colors, typography, spacing, borderRadius } from '../theme';
import { Card, LoadingState } from '../components';
import { api } from '../api/client';
import { useNavigation } from '@react-navigation/native';

type TradeHistoryScreenProp = StackNavigationProp<PortfolioStackParamList, 'TradeHistory'>;

interface Props {
  navigation: TradeHistoryScreenProp;
}

interface Trade {
  id: string;
  symbol: string;
  name: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  total: number;
  fees: number;
  profit_loss?: number;
  profit_loss_percent?: number;
  order_type: string;
  status: 'executed' | 'pending' | 'cancelled';
  executed_at: string;
}

export default function TradeHistory({ navigation }: Props) {
  const nav = useNavigation();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all');
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  useEffect(() => {
    loadTrades();
  }, []);

  const loadTrades = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // In production: const res = await api.get('/trades/history');
      // For now, using mock data
      const mockTrades: Trade[] = [
        {
          id: '1',
          symbol: 'SCOM',
          name: 'Safaricom',
          side: 'buy',
          quantity: 100,
          price: 42.50,
          total: 4250.00,
          fees: 8.50,
          order_type: 'market',
          status: 'executed',
          executed_at: new Date().toISOString(),
        },
        {
          id: '2',
          symbol: 'KCB',
          name: 'KCB Group',
          side: 'buy',
          quantity: 50,
          price: 32.00,
          total: 1600.00,
          fees: 3.20,
          profit_loss: 125.00,
          profit_loss_percent: 7.8,
          order_type: 'limit',
          status: 'executed',
          executed_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          id: '3',
          symbol: 'EQTY',
          name: 'Equity Group',
          side: 'sell',
          quantity: 30,
          price: 55.00,
          total: 1650.00,
          fees: 3.30,
          profit_loss: 90.00,
          profit_loss_percent: 5.5,
          order_type: 'market',
          status: 'executed',
          executed_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        },
        {
          id: '4',
          symbol: 'EABL',
          name: 'EABL',
          side: 'buy',
          quantity: 75,
          price: 180.00,
          total: 13500.00,
          fees: 27.00,
          order_type: 'stop',
          status: 'pending',
          executed_at: new Date(Date.now() - 3600000).toISOString(),
        },
      ];

      setTrades(mockTrades);
    } catch (error) {
      console.error('Failed to load trades:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadTrades(true);
  };

  const filteredTrades = trades.filter(trade => {
    const matchesFilter = filter === 'all' || trade.side === filter;
    const matchesSymbol = !selectedSymbol || trade.symbol === selectedSymbol;
    return matchesFilter && matchesSymbol;
  });

  // Get unique symbols for filter
  const uniqueSymbols = Array.from(new Set(trades.map(t => t.symbol)));

  // Calculate summary stats
  const totalTrades = trades.filter(t => t.status === 'executed').length;
  const totalProfitLoss = trades
    .filter(t => t.profit_loss !== undefined)
    .reduce((sum, t) => sum + (t.profit_loss || 0), 0);
  const winRate = trades.filter(t => t.profit_loss && t.profit_loss > 0).length / 
                   Math.max(trades.filter(t => t.profit_loss !== undefined).length, 1) * 100;

  const getRelativeTime = (timestamp: string) => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = now - time;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  if (loading) {
    return <LoadingState message="Loading trade history..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trade History</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Summary Stats */}
      <Card variant="glass" style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Ionicons name="receipt" size={20} color={colors.primary.main} />
            <Text style={styles.summaryValue}>{totalTrades}</Text>
            <Text style={styles.summaryLabel}>Total Trades</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Ionicons 
              name={totalProfitLoss >= 0 ? 'trending-up' : 'trending-down'} 
              size={20} 
              color={totalProfitLoss >= 0 ? colors.success : colors.error} 
            />
            <Text style={[
              styles.summaryValue,
              { color: totalProfitLoss >= 0 ? colors.success : colors.error }
            ]}>
              {totalProfitLoss >= 0 ? '+' : ''}KES {totalProfitLoss.toFixed(0)}
            </Text>
            <Text style={styles.summaryLabel}>Total P/L</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Ionicons name="stats-chart" size={20} color={colors.info} />
            <Text style={styles.summaryValue}>{winRate.toFixed(0)}%</Text>
            <Text style={styles.summaryLabel}>Win Rate</Text>
          </View>
        </View>
      </Card>

      {/* Filters */}
      <View style={styles.filterContainer}>
        {/* Side Filter */}
        <View style={styles.filterRow}>
          {(['all', 'buy', 'sell'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterButton, filter === f && styles.filterButtonActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterButtonText, filter === f && styles.filterButtonTextActive]}>
                {f === 'all' ? 'All' : f === 'buy' ? 'Buys' : 'Sells'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Symbol Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.symbolFilterScroll}
          contentContainerStyle={styles.symbolFilterContent}
        >
          <TouchableOpacity
            style={[styles.symbolChip, !selectedSymbol && styles.symbolChipActive]}
            onPress={() => setSelectedSymbol(null)}
          >
            <Text style={[styles.symbolChipText, !selectedSymbol && styles.symbolChipTextActive]}>
              All Stocks
            </Text>
          </TouchableOpacity>
          {uniqueSymbols.map((sym) => (
            <TouchableOpacity
              key={sym}
              style={[styles.symbolChip, selectedSymbol === sym && styles.symbolChipActive]}
              onPress={() => setSelectedSymbol(sym)}
            >
              <Text style={[styles.symbolChipText, selectedSymbol === sym && styles.symbolChipTextActive]}>
                {sym}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Trade List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary.main}
            colors={[colors.primary.main]}
          />
        }
      >
        {filteredTrades.length === 0 ? (
          <Card variant="outline" style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={colors.text.tertiary} />
            <Text style={styles.emptyTitle}>No Trades Found</Text>
            <Text style={styles.emptyText}>
              {selectedSymbol ? `No trades for ${selectedSymbol}` : 'Your trade history will appear here'}
            </Text>
          </Card>
        ) : (
          filteredTrades.map((trade) => {
            const isProfit = trade.profit_loss !== undefined && trade.profit_loss > 0;
            const hasProfit = trade.profit_loss !== undefined;

            return (
              <TouchableOpacity
                key={trade.id}
                onPress={() => {
                  (nav as any).navigate('Markets', {
                    screen: 'StockDetail',
                    params: { symbol: trade.symbol },
                  });
                }}
                activeOpacity={0.7}
              >
                <Card variant="glass" style={styles.tradeCard}>
                  {/* Header */}
                  <View style={styles.tradeHeader}>
                    <View style={styles.tradeHeaderLeft}>
                      <View style={[
                        styles.tradeSideBadge,
                        { backgroundColor: trade.side === 'buy' ? colors.success + '20' : colors.error + '20' }
                      ]}>
                        <Ionicons 
                          name={trade.side === 'buy' ? 'arrow-down' : 'arrow-up'} 
                          size={14} 
                          color={trade.side === 'buy' ? colors.success : colors.error} 
                        />
                        <Text style={[
                          styles.tradeSideText,
                          { color: trade.side === 'buy' ? colors.success : colors.error }
                        ]}>
                          {trade.side.toUpperCase()}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.tradeSymbol}>{trade.symbol}</Text>
                        <Text style={styles.tradeName}>{trade.name}</Text>
                      </View>
                    </View>
                    <View style={styles.tradeHeaderRight}>
                      <View style={[
                        styles.tradeStatusBadge,
                        { 
                          backgroundColor: trade.status === 'executed' ? colors.success + '20' : 
                                         trade.status === 'pending' ? colors.warning + '20' : 
                                         colors.error + '20'
                        }
                      ]}>
                        <Text style={[
                          styles.tradeStatusText,
                          { 
                            color: trade.status === 'executed' ? colors.success : 
                                   trade.status === 'pending' ? colors.warning : 
                                   colors.error
                          }
                        ]}>
                          {trade.status}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Trade Details */}
                  <View style={styles.tradeDetails}>
                    <View style={styles.tradeDetailRow}>
                      <Text style={styles.tradeDetailLabel}>Quantity</Text>
                      <Text style={styles.tradeDetailValue}>{trade.quantity} shares</Text>
                    </View>
                    <View style={styles.tradeDetailRow}>
                      <Text style={styles.tradeDetailLabel}>Price</Text>
                      <Text style={styles.tradeDetailValue}>KES {trade.price.toFixed(2)}</Text>
                    </View>
                    <View style={styles.tradeDetailRow}>
                      <Text style={styles.tradeDetailLabel}>Total</Text>
                      <Text style={styles.tradeDetailValue}>KES {trade.total.toFixed(2)}</Text>
                    </View>
                    <View style={styles.tradeDetailRow}>
                      <Text style={styles.tradeDetailLabel}>Fees</Text>
                      <Text style={styles.tradeDetailValue}>KES {trade.fees.toFixed(2)}</Text>
                    </View>
                    {hasProfit && (
                      <View style={[styles.tradeDetailRow, styles.profitLossRow]}>
                        <Text style={styles.tradeDetailLabel}>P/L</Text>
                        <View style={styles.profitLossContainer}>
                          <Text style={[
                            styles.profitLossValue,
                            { color: isProfit ? colors.success : colors.error }
                          ]}>
                            {isProfit ? '+' : ''}KES {trade.profit_loss?.toFixed(2)}
                          </Text>
                          <Text style={[
                            styles.profitLossPercent,
                            { color: isProfit ? colors.success : colors.error }
                          ]}>
                            ({isProfit ? '+' : ''}{trade.profit_loss_percent?.toFixed(2)}%)
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Footer */}
                  <View style={styles.tradeFooter}>
                    <View style={styles.tradeFooterLeft}>
                      <Ionicons name="time-outline" size={12} color={colors.text.tertiary} />
                      <Text style={styles.tradeTime}>{getRelativeTime(trade.executed_at)}</Text>
                    </View>
                    <Text style={styles.tradeType}>{trade.order_type}</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  headerSpacer: {
    width: 40,
  },
  summaryCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  summaryLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 50,
    backgroundColor: colors.border.main,
  },
  filterContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.main,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  filterButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  filterButtonTextActive: {
    color: colors.primary.contrast,
    fontWeight: typography.fontWeight.bold,
  },
  symbolFilterScroll: {
    marginTop: spacing.sm,
  },
  symbolFilterContent: {
    gap: spacing.sm,
  },
  symbolChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  symbolChipActive: {
    backgroundColor: colors.primary.main + '20',
    borderColor: colors.primary.main,
  },
  symbolChipText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  symbolChipTextActive: {
    color: colors.primary.main,
    fontWeight: typography.fontWeight.bold,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  tradeCard: {
    marginBottom: spacing.md,
  },
  tradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  tradeHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tradeSideBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  tradeSideText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  tradeSymbol: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  tradeName: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  tradeHeaderRight: {
    alignItems: 'flex-end',
  },
  tradeStatusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  tradeStatusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'capitalize',
  },
  tradeDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.border.main + '40',
    paddingTop: spacing.sm,
  },
  tradeDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  tradeDetailLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  tradeDetailValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  profitLossRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border.main + '40',
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
  },
  profitLossContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  profitLossValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  profitLossPercent: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  tradeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.main + '40',
  },
  tradeFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tradeTime: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  tradeType: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
    textTransform: 'uppercase',
  },
});

