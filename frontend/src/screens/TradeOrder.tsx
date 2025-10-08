import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';
import { Card, Input, Button } from '../components';

interface TradeOrderProps {
  symbol: string;
  side: 'buy' | 'sell';
  onBack: () => void;
  onReview: (order: OrderData) => void;
}

export interface OrderData {
  symbol: string;
  side: 'buy' | 'sell';
  orderType: 'market' | 'limit';
  quantity: number;
  limitPrice?: number;
  estimatedCost: number;
  fees: number;
  total: number;
}

export default function TradeOrder({ symbol, side, onBack, onReview }: TradeOrderProps) {
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [quantity, setQuantity] = useState('');
  const [limitPrice, setLimitPrice] = useState('');

  // Mock current price
  const currentPrice = 150.50;
  const feeRate = 0.015; // 1.5%

  const calculateCost = () => {
    const qty = parseFloat(quantity) || 0;
    const price = orderType === 'limit' ? (parseFloat(limitPrice) || 0) : currentPrice;
    const cost = qty * price;
    const fees = cost * feeRate;
    return { cost, fees, total: cost + fees };
  };

  const { cost, fees, total } = calculateCost();

  const handleReview = () => {
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity');
      return;
    }

    if (orderType === 'limit') {
      const price = parseFloat(limitPrice);
      if (!price || price <= 0) {
        Alert.alert('Invalid Price', 'Please enter a valid limit price');
        return;
      }
    }

    const orderData: OrderData = {
      symbol,
      side,
      orderType,
      quantity: qty,
      limitPrice: orderType === 'limit' ? parseFloat(limitPrice) : undefined,
      estimatedCost: cost,
      fees,
      total,
    };

    onReview(orderData);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {side === 'buy' ? 'Buy' : 'Sell'} {symbol}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Price Info */}
        <Card variant="outlined" style={styles.priceCard}>
          <Text style={styles.priceLabel}>Current Market Price</Text>
          <Text style={styles.priceValue}>KES {currentPrice.toFixed(2)}</Text>
        </Card>

        {/* Order Type Selector */}
        <Card>
          <Text style={styles.sectionTitle}>Order Type</Text>
          <View style={styles.orderTypeContainer}>
            <TouchableOpacity
              style={[
                styles.orderTypeButton,
                orderType === 'market' && styles.orderTypeButtonActive,
              ]}
              onPress={() => setOrderType('market')}
            >
              <Text
                style={[
                  styles.orderTypeText,
                  orderType === 'market' && styles.orderTypeTextActive,
                ]}
              >
                Market Order
              </Text>
              <Text style={styles.orderTypeDescription}>Execute immediately at market price</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.orderTypeButton,
                orderType === 'limit' && styles.orderTypeButtonActive,
              ]}
              onPress={() => setOrderType('limit')}
            >
              <Text
                style={[
                  styles.orderTypeText,
                  orderType === 'limit' && styles.orderTypeTextActive,
                ]}
              >
                Limit Order
              </Text>
              <Text style={styles.orderTypeDescription}>
                Execute only at specified price or better
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Order Details */}
        <Card>
          <Text style={styles.sectionTitle}>Order Details</Text>
          
          <Input
            label="Quantity (Shares)"
            placeholder="Enter number of shares"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />

          {orderType === 'limit' && (
            <Input
              label="Limit Price (KES)"
              placeholder="Enter limit price"
              value={limitPrice}
              onChangeText={setLimitPrice}
              keyboardType="numeric"
            />
          )}
        </Card>

        {/* Cost Breakdown */}
        {quantity && (
          <Card variant="elevated" style={styles.costCard}>
            <Text style={styles.sectionTitle}>Cost Breakdown</Text>
            
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Estimated Cost</Text>
              <Text style={styles.costValue}>KES {cost.toFixed(2)}</Text>
            </View>

            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Fees (1.5%)</Text>
              <Text style={styles.costValue}>KES {fees.toFixed(2)}</Text>
            </View>

            <View style={[styles.costRow, styles.costRowTotal]}>
              <Text style={styles.costTotalLabel}>Total Amount</Text>
              <Text style={styles.costTotalValue}>KES {total.toFixed(2)}</Text>
            </View>
          </Card>
        )}

        {/* Info Card */}
        <Card variant="outlined">
          <Text style={styles.infoText}>
            💡 <Text style={styles.infoTextBold}>Tip:</Text> {side === 'buy' ? 
              'Market orders are executed immediately but may have price variations. Limit orders give you price control but may not execute immediately.' :
              'Ensure you have sufficient shares in your portfolio to place this sell order.'}
          </Text>
        </Card>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.footer}>
        <Button
          title="Cancel"
          onPress={onBack}
          variant="outline"
          style={styles.footerButton}
        />
        <Button
          title="Review Order"
          onPress={handleReview}
          variant={side === 'buy' ? 'success' : 'error'}
          style={styles.footerButton}
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
    justifyContent: 'space-between',
    padding: spacing.base,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    padding: spacing.base,
  },
  priceCard: {
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  priceValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  orderTypeContainer: {
    gap: spacing.sm,
  },
  orderTypeButton: {
    padding: spacing.md,
    borderRadius: spacing.sm,
    backgroundColor: colors.background.tertiary,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  orderTypeButtonActive: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main + '20',
  },
  orderTypeText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  orderTypeTextActive: {
    color: colors.primary.main,
  },
  orderTypeDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  costCard: {
    marginVertical: spacing.md,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main,
  },
  costLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
  },
  costValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  costRowTotal: {
    paddingTop: spacing.md,
    borderBottomWidth: 0,
  },
  costTotalLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  costTotalValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    lineHeight: 20,
  },
  infoTextBold: {
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.base,
    backgroundColor: colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border.main,
    gap: spacing.md,
  },
  footerButton: {
    flex: 1,
  },
});

