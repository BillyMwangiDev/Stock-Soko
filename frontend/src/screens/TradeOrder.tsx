/**
 * Trade Order Screen (Bottom Sheet)
 * Place buy/sell orders with quantity and order type
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';
import { Button } from '../components';

interface TradeOrderProps {
  symbol: string;
  side: 'buy' | 'sell';
  onBack: () => void;
  onReview?: (orderData: any) => void;
}

export default function TradeOrder({ symbol, side, onBack, onReview }: TradeOrderProps) {
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop'>('market');
  const [allowFractional, setAllowFractional] = useState(false);

  const availableBalance = 3456.78;
  const currentPrice = 18.25; // Mock current price, should come from props
  const totalCost = (parseFloat(price) || currentPrice) * (parseFloat(quantity) || 0);
  const estimatedFee = totalCost * 0.0012; // 0.12% brokerage fee

  const handleReviewOrder = () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity');
      return;
    }

    if (orderType !== 'market' && (!price || parseFloat(price) <= 0)) {
      Alert.alert('Invalid Price', 'Please enter a valid price for limit/stop orders');
      return;
    }

    // Prepare order data for review
    const orderData = {
      symbol,
      side,
      orderType,
      quantity: parseFloat(quantity),
      price: orderType === 'market' ? currentPrice : parseFloat(price),
      totalCost,
      estimatedFee,
      totalAmount: totalCost + estimatedFee,
      allowFractional,
    };

    // Navigate to ReviewOrder if callback provided
    if (onReview) {
      onReview(orderData);
    } else {
      // Fallback to alert if no navigation
      Alert.alert(
        'Review Order',
        `${side === 'buy' ? 'Buy' : 'Sell'} ${quantity} shares of ${symbol}\nTotal: KES ${(totalCost + estimatedFee).toFixed(2)}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Confirm', onPress: () => onBack() },
        ]
      );
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.bottomSheet}>
        {/* Handle Bar */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Place Order</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onBack}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Price Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Price</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={colors.text.disabled}
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Quantity Input */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.inputLabel}>Quantity</Text>
              <TouchableOpacity 
                style={styles.fractionalToggle}
                onPress={() => setAllowFractional(!allowFractional)}
              >
                <View style={[styles.checkbox, allowFractional && styles.checkboxActive]}>
                  {allowFractional && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.fractionalText}>Allow Fractional</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.inputFull}
              placeholder={allowFractional ? "0.00" : "Enter whole number"}
              placeholderTextColor={colors.text.disabled}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType={allowFractional ? "decimal-pad" : "number-pad"}
            />
          </View>

          {/* Order Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Order Type</Text>
            <View style={styles.orderTypeRow}>
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
                  Market
                </Text>
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
                  Limit
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.orderTypeButton,
                  orderType === 'stop' && styles.orderTypeButtonActive,
                ]}
                onPress={() => setOrderType('stop')}
              >
                <Text
                  style={[
                    styles.orderTypeText,
                    orderType === 'stop' && styles.orderTypeTextActive,
                  ]}
                >
                  Stop
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>KES {totalCost.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Est. Fee (0.12%)</Text>
            <Text style={styles.summaryValue}>KES {estimatedFee.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryDivider]}>
            <Text style={styles.summaryLabelBold}>Total {side === 'buy' ? 'Cost' : 'Proceeds'}</Text>
            <Text style={styles.summaryValueBold}>KES {(totalCost + estimatedFee).toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryRowMuted]}>
            <Text style={styles.summaryLabelMuted}>Available Balance</Text>
            <Text style={styles.summaryValueMuted}>KES {availableBalance.toFixed(2)}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelButton} onPress={onBack}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.placeOrderButton} onPress={handleReviewOrder}>
            <Text style={styles.placeOrderText}>Review Order</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  bottomSheet: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  handle: {
    width: 40,
    height: 6,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.full,
  },
  header: {
    position: 'relative',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    left: spacing.md,
    top: 0,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 24,
    color: colors.text.primary,
  },
  form: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fractionalToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main,
  },
  checkmark: {
    fontSize: 12,
    color: colors.primary.contrast,
    fontWeight: typography.fontWeight.bold,
  },
  fractionalText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.main,
    paddingHorizontal: spacing.md,
  },
  currencySymbol: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  inputFull: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.main,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  orderTypeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  orderTypeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.main,
    backgroundColor: colors.background.card,
    alignItems: 'center',
  },
  orderTypeButtonActive: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main + '20',
  },
  orderTypeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  orderTypeTextActive: {
    color: colors.primary.main,
    fontWeight: typography.fontWeight.bold,
  },
  summary: {
    marginHorizontal: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryRowBold: {
    marginTop: spacing.xs,
  },
  summaryDivider: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.main,
  },
  summaryRowMuted: {
    marginTop: spacing.xs,
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  summaryLabelBold: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  summaryValueBold: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
  },
  summaryLabelMuted: {
    fontSize: typography.fontSize.xs,
    color: colors.text.disabled,
  },
  summaryValueMuted: {
    fontSize: typography.fontSize.xs,
    color: colors.text.disabled,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  placeOrderButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
  },
  placeOrderText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.contrast,
  },
});
