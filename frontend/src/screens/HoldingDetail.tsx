/**
 * Holding Detail Screen
 * Detailed view of a specific stock holding
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { PortfolioStackParamList } from '../navigation/types';
import { Button, Card } from '../components';
import { colors, typography, spacing } from '../theme';

type HoldingDetailScreenProp = StackNavigationProp<PortfolioStackParamList, 'HoldingDetail'>;
type HoldingDetailRouteProp = RouteProp<PortfolioStackParamList, 'HoldingDetail'>;

interface Props {
  navigation: HoldingDetailScreenProp;
  route: HoldingDetailRouteProp;
}

export default function HoldingDetail({ navigation, route }: Props) {
  const { symbol, quantity, avgPrice } = route.params;
  const [currentPrice] = useState(avgPrice * 1.05); // Mock current price
  const marketValue = quantity * currentPrice;
  const totalCost = quantity * avgPrice;
  const unrealizedPL = marketValue - totalCost;
  const unrealizedPLPct = (unrealizedPL / totalCost) * 100;

  // Mock trade history for this symbol
  const tradeHistory = [
    { date: '2025-09-15', type: 'BUY', quantity: 50, price: avgPrice * 0.95, total: 50 * avgPrice * 0.95 },
    { date: '2025-10-01', type: 'BUY', quantity: 50, price: avgPrice * 1.05, total: 50 * avgPrice * 1.05 },
  ];

  // Mock dividend history
  const dividendHistory = [
    { date: '2025-08-01', amount: 125.00, shares: quantity, perShare: 1.25 },
    { date: '2025-05-01', amount: 125.00, shares: quantity, perShare: 1.25 },
  ];

  const handleSell = () => {
    Alert.alert(
      'Sell Position',
      `Sell ${quantity} shares of ${symbol}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sell', 
          style: 'destructive',
          onPress: () => {
            // Navigate to trade screen
            Alert.alert('Success', 'Navigating to sell order...');
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Position Summary */}
        <Card>
          <Text style={styles.sectionTitle}>Position Summary</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Quantity</Text>
            <Text style={styles.value}>{quantity.toLocaleString()} shares</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Average Price</Text>
            <Text style={styles.value}>KES {avgPrice.toFixed(2)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Current Price</Text>
            <Text style={styles.value}>KES {currentPrice.toFixed(2)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Total Cost</Text>
            <Text style={styles.value}>KES {totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Market Value</Text>
            <Text style={styles.value}>KES {marketValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Unrealized P/L</Text>
            <Text style={[styles.value, { color: unrealizedPL >= 0 ? colors.success : colors.error }]}>
              {unrealizedPL >= 0 ? '+' : ''}KES {unrealizedPL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              {' '}({unrealizedPL >= 0 ? '+' : ''}{unrealizedPLPct.toFixed(2)}%)
            </Text>
          </View>
        </Card>

        {/* Performance Chart Placeholder */}
        <Card>
          <Text style={styles.sectionTitle}>Performance</Text>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.placeholderText}>Chart coming soon</Text>
            <Text style={styles.placeholderSubtext}>
              Historical performance will be displayed here
            </Text>
          </View>
        </Card>

        {/* Position History */}
        <Card>
          <Text style={styles.sectionTitle}>Position History</Text>
          
          <View style={styles.historyItem}>
            <View>
              <Text style={styles.historyTitle}>Initial Purchase</Text>
              <Text style={styles.historyDate}>2 months ago</Text>
            </View>
            <Text style={styles.historyValue}>
              {quantity} @ KES {avgPrice.toFixed(2)}
            </Text>
          </View>

          <Text style={styles.noMoreHistory}>No additional transactions</Text>
        </Card>

        {/* Trade History for this Stock */}
        <Card style={styles.historyCard}>
          <Text style={styles.sectionTitle}>Trade History</Text>
          {tradeHistory.map((trade, index) => (
            <View key={index} style={styles.historyRow}>
              <View style={styles.historyLeft}>
                <View style={[
                  styles.historyBadge,
                  { backgroundColor: trade.type === 'BUY' ? colors.success + '20' : colors.error + '20' }
                ]}>
                  <Text style={[
                    styles.historyType,
                    { color: trade.type === 'BUY' ? colors.success : colors.error }
                  ]}>
                    {trade.type}
                  </Text>
                </View>
                <View>
                  <Text style={styles.historyQty}>{trade.quantity} shares</Text>
                  <Text style={styles.historyDate}>
                    {new Date(trade.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                </View>
              </View>
              <View style={styles.historyRight}>
                <Text style={styles.historyPrice}>KES {trade.price.toFixed(2)}</Text>
                <Text style={styles.historyTotal}>Total: KES {trade.total.toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Dividend History */}
        <Card style={styles.historyCard}>
          <Text style={styles.sectionTitle}>Dividend History</Text>
          {dividendHistory.length > 0 ? (
            <>
              <View style={styles.dividendSummary}>
                <Text style={styles.dividendSummaryLabel}>Total Dividends Received</Text>
                <Text style={styles.dividendSummaryValue}>
                  KES {dividendHistory.reduce((sum, d) => sum + d.amount, 0).toFixed(2)}
                </Text>
              </View>
              {dividendHistory.map((dividend, index) => (
                <View key={index} style={styles.dividendRow}>
                  <View>
                    <Text style={styles.dividendDate}>
                      {new Date(dividend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                    <Text style={styles.dividendShares}>{dividend.shares} shares × KES {dividend.perShare}</Text>
                  </View>
                  <Text style={styles.dividendAmount}>KES {dividend.amount.toFixed(2)}</Text>
                </View>
              ))}
            </>
          ) : (
            <Text style={styles.noDividends}>No dividend payments recorded</Text>
          )}
        </Card>        <View style={styles.actions}>
          <Button
            title="Sell Position"
            onPress={handleSell}
            variant="error"
            size="lg"
          />
          
          <Button
            title="Add to Position"
            onPress={() => Alert.alert('Buy More', 'Navigate to buy screen')}
            variant="secondary"
            size="lg"
          />
        </View>
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
    padding: spacing.lg,
    gap: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  label: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  value: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.main,
    marginVertical: spacing.md,
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: spacing.sm,
  },
  placeholderText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.semibold,
  },
  placeholderSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main,
  },
  historyTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  historyDate: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  historyValue: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  noMoreHistory: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  historyCard: {
    marginTop: spacing.md,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main + '40',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  historyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: spacing.xs,
  },
  historyType: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  historyQty: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  historyDate: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyPrice: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  historyTotal: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  dividendSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.success + '10',
    borderRadius: spacing.sm,
    marginBottom: spacing.md,
  },
  dividendSummaryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  dividendSummaryValue: {
    fontSize: typography.fontSize.base,
    color: colors.success,
    fontWeight: typography.fontWeight.bold,
  },
  dividendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main + '40',
  },
  dividendDate: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
    marginBottom: 2,
  },
  dividendShares: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  dividendAmount: {
    fontSize: typography.fontSize.base,
    color: colors.success,
    fontWeight: typography.fontWeight.bold,
  },
  noDividends: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  actions: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
});

