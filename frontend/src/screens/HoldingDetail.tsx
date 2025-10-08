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

        {/* Actions */}
        <View style={styles.actions}>
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
  actions: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
});

