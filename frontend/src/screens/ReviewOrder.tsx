import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';
import { Card, Button, Badge } from '../components';
import { api } from '../api/client';
import type { OrderData } from './TradeOrder';

interface ReviewOrderProps {
  order: OrderData;
  onBack: () => void;
  onEdit: () => void;
  onConfirm: () => void;
}

export default function ReviewOrder({ order, onBack, onEdit, onConfirm }: ReviewOrderProps) {
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const orderPayload = {
        symbol: order.symbol,
        side: order.side,
        quantity: order.quantity,
        order_type: order.orderType,
        price: order.limitPrice || order.price,
      };

      await api.post('/trades', orderPayload);

      Alert.alert(
        'Order Placed',
        `Your ${order.side} order for ${order.quantity} shares of ${order.symbol} has been placed successfully.`,
        [{ text: 'OK', onPress: () => onConfirm() }]
      );
    } catch (error: any) {
      console.error('Order execution failed:', error);
      setConfirming(false);
      
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to place order';
      Alert.alert('Order Failed', errorMessage, [
        { text: 'Try Again', style: 'cancel' },
        { text: 'Edit Order', onPress: () => onEdit() },
      ]);
    }
  };

  return (
    <View style={styles.container}>      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Order</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        <Card variant="outlined" style={styles.warningCard}>
          <View style={styles.warningHeader}>
            <Ionicons name="alert-circle" size={20} color={colors.warning} />
            <Text style={styles.warningText}>Please review your order carefully</Text>
          </View>
          <Text style={styles.warningSubtext}>
            Once confirmed, this order will be submitted for execution.
          </Text>
        </Card>

        {/* Order Summary */}
        <Card variant="elevated">
          <Text style={styles.sectionTitle}>Order Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Stock</Text>
            <Text style={styles.summaryValue}>{order.symbol}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Action</Text>
            <Badge 
              text={order.side.toUpperCase()} 
              variant={order.side === 'buy' ? 'success' : 'error'} 
            />
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Order Type</Text>
            <Text style={styles.summaryValue}>
              {order.orderType === 'market' ? 'Market Order' : 'Limit Order'}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Quantity</Text>
            <Text style={styles.summaryValue}>{order.quantity} shares</Text>
          </View>

          {order.limitPrice && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Limit Price</Text>
              <Text style={styles.summaryValue}>KES {order.limitPrice.toFixed(2)}</Text>
            </View>
          )}
        </Card>

        {/* Cost Breakdown */}
        <Card variant="elevated" style={styles.costCard}>
          <Text style={styles.sectionTitle}>Cost Breakdown</Text>
          
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Estimated Cost</Text>
            <Text style={styles.costValue}>KES {order.estimatedCost.toFixed(2)}</Text>
          </View>

          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Trading Fees</Text>
            <Text style={styles.costValue}>KES {order.fees.toFixed(2)}</Text>
          </View>

          <View style={[styles.costRow, styles.costRowTotal]}>
            <Text style={styles.costTotalLabel}>Total {order.side === 'buy' ? 'Debit' : 'Credit'}</Text>
            <Text style={styles.costTotalValue}>KES {order.total.toFixed(2)}</Text>
          </View>
        </Card>

        {/* Terms & Conditions */}
        <Card variant="outlined">
          <Text style={styles.termsTitle}>Terms & Conditions</Text>
          <Text style={styles.termsText}>
            • I understand that market orders may execute at varying prices{'\n'}
            • I acknowledge that all sales are final once executed{'\n'}
            • I agree to the platform's trading terms and conditions{'\n'}
            • I confirm that I have sufficient funds/shares for this transaction
          </Text>
        </Card>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.footer}>
        <Button
          title="Edit"
          onPress={onEdit}
          variant="outline"
          style={styles.footerButton}
        />
        <Button
          title={confirming ? 'Confirming...' : 'Confirm Order'}
          onPress={handleConfirm}
          variant="primary"
          disabled={confirming}
          loading={confirming}
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
  warningCard: {
    marginBottom: spacing.md,
    borderColor: colors.warning,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  warningText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.warning,
  },
  warningSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main,
  },
  summaryLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
  },
  summaryValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
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
  termsTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  termsText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    lineHeight: 20,
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