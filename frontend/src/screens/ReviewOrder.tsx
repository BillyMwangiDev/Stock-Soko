import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';
import { Card, Button, Badge } from '../components';
import { api } from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OrderData } from './TradeOrder';

interface ReviewOrderProps {
  order: OrderData;
  onBack: () => void;
  onEdit: () => void;
  onConfirm: () => void;
}

export default function ReviewOrder({ order, onBack, onEdit, onConfirm }: ReviewOrderProps) {
  const [confirming, setConfirming] = useState(false);

  const updateDemoPositions = async (symbol: string, side: 'buy' | 'sell', quantity: number, price: number) => {
    try {
      // Get existing positions
      const existingPositions = await AsyncStorage.getItem('demo_positions');
      const positions = existingPositions ? JSON.parse(existingPositions) : [];
      
      // Find existing position for this symbol
      const positionIndex = positions.findIndex((p: any) => p.symbol === symbol);
      
      if (side === 'buy') {
        if (positionIndex >= 0) {
          // Update existing position
          const position = positions[positionIndex];
          const totalQuantity = position.quantity + quantity;
          const totalCost = (position.quantity * position.avg_price) + (quantity * price);
          const newAvgPrice = totalCost / totalQuantity;
          
          positions[positionIndex] = {
            ...position,
            quantity: totalQuantity,
            avg_price: newAvgPrice,
          };
        } else {
          // Create new position
          positions.push({
            symbol,
            quantity,
            avg_price: price,
          });
        }
      } else if (side === 'sell') {
        if (positionIndex >= 0) {
          const position = positions[positionIndex];
          const newQuantity = position.quantity - quantity;
          
          if (newQuantity <= 0) {
            // Remove position
            positions.splice(positionIndex, 1);
          } else {
            // Update quantity
            positions[positionIndex] = {
              ...position,
              quantity: newQuantity,
            };
          }
        }
      }
      
      // Save updated positions
      await AsyncStorage.setItem('demo_positions', JSON.stringify(positions));
      console.log('[ReviewOrder] Demo positions updated:', positions);
    } catch (error) {
      console.error('[ReviewOrder] Error updating demo positions:', error);
    }
  };

  const saveDemoTrade = async () => {
    try {
      // Get existing demo trades
      const existingTrades = await AsyncStorage.getItem('demo_trades');
      const trades = existingTrades ? JSON.parse(existingTrades) : [];
      
      // Create new trade
      const newTrade = {
        id: `demo_${Date.now()}`,
        symbol: order.symbol,
        side: order.side,
        quantity: order.quantity,
        price: order.price || 0,
        order_type: order.orderType,
        status: 'filled',
        filled_quantity: order.quantity,
        fees: order.fees,
        total: order.total,
        submitted_at: new Date().toISOString(),
        filled_at: new Date().toISOString(),
      };
      
      // Add to trades
      trades.unshift(newTrade);
      
      // Keep only last 100 trades
      const limitedTrades = trades.slice(0, 100);
      
      // Save back to storage
      await AsyncStorage.setItem('demo_trades', JSON.stringify(limitedTrades));
      
      // Update demo positions
      await updateDemoPositions(order.symbol, order.side, order.quantity, order.price || 0);
      
      console.log('[ReviewOrder] Demo trade saved:', newTrade);
      return newTrade;
    } catch (error) {
      console.error('[ReviewOrder] Failed to save demo trade:', error);
    }
  };

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

      // Try to place real order
      try {
        await api.post('/trades/order', orderPayload);
        
        Alert.alert(
          '✅ Order Placed',
          `Your ${order.side} order for ${order.quantity} shares of ${order.symbol} has been placed successfully.`,
          [{ text: 'OK', onPress: () => onConfirm() }]
        );
      } catch (apiError: any) {
        // If 401 (not authenticated), use demo mode
        if (apiError.response?.status === 401) {
          console.log('[ReviewOrder] Demo mode - saving trade locally');
          await saveDemoTrade();
          
          Alert.alert(
            '🎮 Demo Order Placed',
            `Your demo ${order.side} order for ${order.quantity} shares of ${order.symbol} has been executed!\n\n💰 Total: KES ${order.total.toFixed(2)}\n\nThis is a demo trade and won't affect real money.`,
            [{ text: 'OK', onPress: () => onConfirm() }]
          );
        } else {
          throw apiError; // Re-throw other errors
        }
      }
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
    <View style={styles.container}>
      <View style={styles.header}>
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