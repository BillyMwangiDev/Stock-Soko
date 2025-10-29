/**
 * Portfolio Screen
 * Current holdings, P/L summary, tax summary, and performance
 */
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';
import { colors, typography, spacing, borderRadius } from '../theme';
import { LoadingState, Card, PortfolioChart } from '../components';
import { hapticFeedback } from '../utils/haptics';

interface Holding {
  symbol: string;
  quantity: number;
  avg_price: number;
  current_price: number;
  total_value: number;
  profit_loss: number;
  profit_loss_percent: number;
  name?: string;
}

interface PortfolioSummary {
  total_value: number;
  total_profit_loss: number;
  total_profit_loss_percent: number;
  total_invested: number;
  cash_balance: number;
}

export default function Portfolio() {
  const navigation = useNavigation();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary>({
    total_value: 0,
    total_profit_loss: 0,
    total_profit_loss_percent: 0,
    total_invested: 0,
    cash_balance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load portfolio positions
      const positionsRes = await api.get('/ledger/positions');
      const positions = positionsRes.data.positions || [];
      
      // Load wallet balance
      const balanceRes = await api.get('/ledger/balance');
      const cashBalance = balanceRes.data.available_balance || 0;
      
      // If user has no positions, use demo data for better UX
      if (positions.length === 0 && cashBalance === 0) {
        console.log('[Portfolio] Empty portfolio detected - using demo data for better UX');
        
        const mockHoldings: Holding[] = [
          { symbol: 'KCB', name: 'KCB Group', quantity: 100, avg_price: 32.50, current_price: 35.20, total_value: 3520, profit_loss: 270, profit_loss_percent: 8.31 },
          { symbol: 'SCOM', name: 'Safaricom PLC', quantity: 200, avg_price: 28.00, current_price: 29.50, total_value: 5900, profit_loss: 300, profit_loss_percent: 5.36 },
          { symbol: 'EQTY', name: 'Equity Group Holdings', quantity: 150, avg_price: 48.00, current_price: 46.50, total_value: 6975, profit_loss: -225, profit_loss_percent: -3.13 },
        ];
        
        setHoldings(mockHoldings);
        
        const totalVal = mockHoldings.reduce((sum, h) => sum + h.total_value, 0);
        const totalPL = mockHoldings.reduce((sum, h) => sum + h.profit_loss, 0);
        const totalInv = mockHoldings.reduce((sum, h) => sum + (h.avg_price * h.quantity), 0);
        const cashBal = 50000;
        
        setPortfolioSummary({
          total_value: totalVal + cashBal,
          total_profit_loss: totalPL,
          total_profit_loss_percent: totalInv > 0 ? (totalPL / totalInv) * 100 : 0,
          total_invested: totalInv,
          cash_balance: cashBal,
        });
        
        console.log('[Portfolio] Demo portfolio data loaded');
        return;
      }
      
      // User has real positions, calculate metrics
      let totalValue = 0;
      let totalInvested = 0;
      let totalProfitLoss = 0;
      
      const processedHoldings: Holding[] = await Promise.all(
        positions.map(async (position: any) => {
          try {
            // Fetch current stock price
            const stockRes = await api.get(`/markets/stocks/${position.symbol}`);
            const currentPrice = stockRes.data.last_price || 0;
            const stockName = stockRes.data.name || position.symbol;
            
            const totalVal = position.quantity * currentPrice;
            const avgCost = position.avg_price * position.quantity;
            const profitLoss = totalVal - avgCost;
            const profitLossPct = avgCost > 0 ? (profitLoss / avgCost) * 100 : 0;
            
            totalValue += totalVal;
            totalInvested += avgCost;
            totalProfitLoss += profitLoss;
            
            return {
              symbol: position.symbol,
              name: stockName,
              quantity: position.quantity,
              avg_price: position.avg_price,
              current_price: currentPrice,
              total_value: totalVal,
              profit_loss: profitLoss,
              profit_loss_percent: profitLossPct,
            };
          } catch (err) {
            console.error(`Failed to load price for ${position.symbol}:`, err);
            return null;
          }
        })
      );
      
      // Filter out failed positions
      const validHoldings = processedHoldings.filter(h => h !== null) as Holding[];
      setHoldings(validHoldings);
      
      const totalProfitLossPct = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;
      
      setPortfolioSummary({
        total_value: totalValue + cashBalance,
        total_profit_loss: totalProfitLoss,
        total_profit_loss_percent: totalProfitLossPct,
        total_invested: totalInvested,
        cash_balance: cashBalance,
      });
    } catch (error: any) {
      console.error('Failed to load portfolio:', error);
      
      // In demo mode (401), load demo positions from AsyncStorage
      if (error.response?.status === 401) {
        try {
          const demoPositionsStr = await AsyncStorage.getItem('demo_positions');
          const demoPositions = demoPositionsStr ? JSON.parse(demoPositionsStr) : [];
          
          if (demoPositions.length > 0) {
            console.log('[Portfolio] Loading demo positions:', demoPositions);
            
            let totalValue = 0;
            let totalInvested = 0;
            let totalProfitLoss = 0;
            
            const processedHoldings: Holding[] = await Promise.all(
              demoPositions.map(async (position: any) => {
                try {
                  // Fetch current stock price
                  const stockRes = await api.get(`/markets/stocks/${position.symbol}`);
                  const currentPrice = stockRes.data.last_price || 0;
                  const stockName = stockRes.data.name || position.symbol;
                  
                  const totalVal = position.quantity * currentPrice;
                  const avgCost = position.avg_price * position.quantity;
                  const profitLoss = totalVal - avgCost;
                  const profitLossPct = avgCost > 0 ? (profitLoss / avgCost) * 100 : 0;
                  
                  totalValue += totalVal;
                  totalInvested += avgCost;
                  totalProfitLoss += profitLoss;
                  
                  return {
                    symbol: position.symbol,
                    name: stockName,
                    quantity: position.quantity,
                    avg_price: position.avg_price,
                    current_price: currentPrice,
                    total_value: totalVal,
                    profit_loss: profitLoss,
                    profit_loss_percent: profitLossPct,
                  };
                } catch (err) {
                  console.error(`Failed to load price for ${position.symbol}:`, err);
                  return null;
                }
              })
            );
            
            const validHoldings = processedHoldings.filter(h => h !== null) as Holding[];
            setHoldings(validHoldings);
            
            const totalProfitLossPct = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;
            const demoCash = 100000; // Demo starting cash
            
            setPortfolioSummary({
              total_value: totalValue + demoCash,
              total_profit_loss: totalProfitLoss,
              total_profit_loss_percent: totalProfitLossPct,
              total_invested: totalInvested,
              cash_balance: demoCash,
            });
            
            setLoading(false);
            setRefreshing(false);
            return;
          }
        } catch (storageError) {
          console.error('[Portfolio] Failed to load demo positions from storage:', storageError);
        }
      }
      
      // Fallback to mock data
      const mockHoldings: Holding[] = [
        {
          symbol: 'KCB',
          name: 'KCB Group',
          quantity: 100,
          avg_price: 32.50,
          current_price: 35.20,
          total_value: 3520,
          profit_loss: 270,
          profit_loss_percent: 8.31,
        },
        {
          symbol: 'SCOM',
          name: 'Safaricom',
          quantity: 200,
          avg_price: 28.00,
          current_price: 29.50,
          total_value: 5900,
          profit_loss: 300,
          profit_loss_percent: 5.36,
        },
        {
          symbol: 'EQTY',
          name: 'Equity Group',
          quantity: 150,
          avg_price: 48.00,
          current_price: 46.50,
          total_value: 6975,
          profit_loss: -225,
          profit_loss_percent: -3.125,
        },
      ];
      
      setHoldings(mockHoldings);
      
      const totalVal = mockHoldings.reduce((sum, h) => sum + h.total_value, 0);
      const totalPL = mockHoldings.reduce((sum, h) => sum + h.profit_loss, 0);
      const totalInv = mockHoldings.reduce((sum, h) => sum + (h.avg_price * h.quantity), 0);
      const cashBal = 50000;
      
      setPortfolioSummary({
        total_value: totalVal + cashBal,
        total_profit_loss: totalPL,
        total_profit_loss_percent: totalInv > 0 ? (totalPL / totalInv) * 100 : 0,
        total_invested: totalInv,
        cash_balance: cashBal,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return <LoadingState message="Loading portfolio..." />;
  }

  return (
    <View style={styles.container}>      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Portfolio</Text>
          <Text style={styles.subtitle}>Your investments</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <TouchableOpacity
            onPress={() => {
              hapticFeedback.light();
              (navigation as any).navigate('DividendTracker');
            }}
          >
            <Ionicons name="cash-outline" size={24} color={colors.primary.main} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => {
              hapticFeedback.impact();
              (navigation as any).navigate('TradeHistory');
            }}
          >
            <Ionicons name="receipt-outline" size={24} color={colors.primary.main} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary.main}
            colors={[colors.primary.main]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        
        <Card variant="elevated" style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Portfolio Value</Text>
          <Text style={styles.summaryValue}>
            KES {portfolioSummary.total_value.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <View style={styles.changeContainer}>
            <Ionicons 
              name={portfolioSummary.total_profit_loss >= 0 ? 'trending-up' : 'trending-down'} 
              size={16} 
              color={portfolioSummary.total_profit_loss >= 0 ? colors.success : colors.error} 
            />
            <Text style={[styles.changeText, portfolioSummary.total_profit_loss >= 0 ? styles.profitText : styles.lossText]}>
              {portfolioSummary.total_profit_loss >= 0 ? '+' : ''}
              {portfolioSummary.total_profit_loss_percent.toFixed(2)}%
            </Text>
            <Text style={styles.changePeriod}>Overall</Text>
          </View>
          <Text style={[styles.changeAmount, portfolioSummary.total_profit_loss >= 0 ? styles.profitText : styles.lossText]}>
            {portfolioSummary.total_profit_loss >= 0 ? '+' : ''}KES {portfolioSummary.total_profit_loss.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
          </Text>
          
          {/* Breakdown */}
          <View style={styles.breakdown}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Cash</Text>
              <Text style={styles.breakdownValue}>
                KES {portfolioSummary.cash_balance.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Invested</Text>
              <Text style={styles.breakdownValue}>
                KES {portfolioSummary.total_invested.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </Card>

        {/* Performance Chart */}
        <Card variant="glass" style={styles.chartCard}>
          <PortfolioChart currentValue={portfolioSummary.total_value} />
        </Card>

        
        <Text style={styles.sectionTitle}>Holdings</Text>

        {holdings.length === 0 ? (
          <Card variant="outline" style={styles.emptyState}>
            <Ionicons name="pie-chart-outline" size={40} color={colors.text.tertiary} />
            <Text style={styles.emptyText}>No holdings yet</Text>
            <Text style={styles.emptySubtext}>Start trading to build your portfolio</Text>
          </Card>
        ) : (
          holdings.map((holding) => {
            const isPositive = holding.profit_loss >= 0;
            const changeColor = isPositive ? colors.success : colors.error;

            return (
              <TouchableOpacity
                key={holding.symbol}
                onPress={() => {
                  hapticFeedback.impact();
                  navigation.navigate('Markets', { 
                    screen: 'StockDetail', 
                    params: { symbol: holding.symbol } 
                  } as never);
                }}
                activeOpacity={0.7}
              >
                <Card variant="glass" style={styles.holdingCard}>
                  <View style={styles.holdingHeader}>
                    <View style={styles.holdingInfo}>
                      <Text style={styles.holdingTicker}>{holding.symbol}</Text>
                      <Text style={styles.holdingName}>{holding.name}</Text>
                    </View>
                    <View style={styles.holdingValue}>
                      <Text style={styles.holdingPrice}>
                        KES {holding.total_value.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                      </Text>
                      <View style={styles.holdingChangeContainer}>
                        <Ionicons 
                          name={isPositive ? 'trending-up' : 'trending-down'} 
                          size={14} 
                          color={changeColor} 
                        />
                        <Text style={[styles.holdingChange, { color: changeColor }]}>
                          {isPositive ? '+' : ''}
                          {holding.profit_loss_percent.toFixed(2)}%
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.holdingDetails}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Quantity</Text>
                      <Text style={styles.detailValue}>{holding.quantity}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Avg. Buy</Text>
                      <Text style={styles.detailValue}>
                        KES {holding.avg_price.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Gain/Loss</Text>
                      <Text style={[styles.detailValue, { color: changeColor }]}>
                        {isPositive ? '+' : ''}KES {holding.profit_loss.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })
        )}

        {/* Tax Estimate */}
        {portfolioSummary.total_profit_loss > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tax Estimate</Text>
              <TouchableOpacity
                onPress={() => {
                  hapticFeedback.impact();
                  (navigation as any).navigate('TaxReports');
                }}
              >
                <Text style={styles.seeAllText}>Full Report</Text>
              </TouchableOpacity>
            </View>
            <Card variant="glass" style={styles.taxCard}>
              <View style={styles.taxRow}>
                <Text style={styles.taxLabel}>Capital Gains Tax (5%)</Text>
                <Text style={styles.taxValue}>
                  KES {(portfolioSummary.total_profit_loss * 0.05).toFixed(2)}
                </Text>
              </View>
              <Text style={styles.taxNote}>
                Note: Tax applies only on realized gains when you sell
              </Text>
              <TouchableOpacity
                style={styles.viewReportButton}
                onPress={() => {
                  hapticFeedback.impact();
                  (navigation as any).navigate('TaxReports');
                }}
              >
                <Ionicons name="document-text-outline" size={16} color={colors.primary.main} />
                <Text style={styles.viewReportText}>View Detailed Tax Report</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.primary.main} />
              </TouchableOpacity>
            </Card>
          </>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary + 'CC',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main + '80',
  },
  historyButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.full,
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  section: {
    marginBottom: spacing.xl,
  },
  chartCard: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  seeAllText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary.main,
    fontWeight: typography.fontWeight.medium,
  },
  holdingsContainer: {
    gap: spacing.md,
  },
  holdingCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  holdingInfo: {
    flex: 1,
  },
  holdingDetails: {
    flex: 1,
    gap: 4,
  },
  holdingType: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  holdingName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  holdingQuantity: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  holdingValue: {
    marginTop: spacing.md,
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  valueText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  holdingImage: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  holdingEmoji: {
    fontSize: 16,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
  },
  summaryCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  summaryContent: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryDetails: {
    gap: 4,
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  summarySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  profitBadge: {
    marginTop: spacing.md,
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  profitBadgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.success,
  },
  summaryImage: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryEmoji: {
    fontSize: 32,
    color: colors.success,
  },
  taxCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  viewReportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.main + '40',
  },
  viewReportText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary.main,
    fontWeight: typography.fontWeight.semibold,
  },
  taxContent: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  taxInfo: {
    flex: 1,
  },
  taxDetails: {
    gap: 4,
  },
  taxLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  taxValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  taxSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  taxBadge: {
    marginTop: spacing.md,
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  taxBadgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  taxImage: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taxEmoji: {
    fontSize: 32,
    fontWeight: typography.fontWeight.bold,
    color: colors.warning,
  },
  performanceCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  performanceLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  performanceValue: {
    fontSize: 32,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  performanceChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  performanceChangeLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  performanceChangeValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.success,
  },
  chartContainer: {
    marginTop: spacing.md,
  },
  chartArea: {
    height: 150,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  chartEmoji: {
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.disabled,
    opacity: 0.5,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  chartLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  // New styles for real data UI
  summarySection: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  totalValueContainer: {
    marginBottom: spacing.md,
  },
  totalValueLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  totalValueAmount: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  profitLossContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  profitContainer: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  lossContainer: {
    backgroundColor: colors.error + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  profitLossText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  profitLossPctText: {
    fontSize: typography.fontSize.sm,
  },
  profitText: {
    color: colors.success,
  },
  lossText: {
    color: colors.error,
  },
  balanceBreakdown: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  breakdownItem: {
    flex: 1,
  },
  breakdownLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  breakdownValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  emptyState: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  holdingIconContainer: {
    marginRight: spacing.sm,
  },
  holdingIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  holdingIconGreen: {
    backgroundColor: colors.success + '20',
  },
  holdingIconRed: {
    backgroundColor: colors.error + '20',
  },
  holdingIconText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  holdingTextInfo: {
    flex: 1,
  },
  holdingSymbol: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  holdingProfitLoss: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  holdingProfitLossPct: {
    fontSize: typography.fontSize.xs,
  },
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  taxNote: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
    lineHeight: 16,
  },
});