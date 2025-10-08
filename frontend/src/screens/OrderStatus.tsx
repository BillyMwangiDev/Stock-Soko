import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';
import { Card, Button } from '../components';
import type { OrderData } from './TradeOrder';

interface OrderStatusProps {
  order: OrderData;
  status: 'pending' | 'executed' | 'failed';
  message?: string;
  onViewHistory: () => void;
  onBackToPortfolio: () => void;
  onRetry?: () => void;
}

export default function OrderStatus({
  order,
  status,
  message,
  onViewHistory,
  onBackToPortfolio,
  onRetry,
}: OrderStatusProps) {

  const getStatusConfig = () => {
    switch (status) {
      case 'executed':
        return {
          icon: 'checkmark-circle',
          color: colors.success,
          title: 'Order Executed Successfully!',
          subtitle: message || 'Your order has been processed and executed.',
        };
      case 'failed':
        return {
          icon: 'close-circle',
          color: colors.error,
          title: 'Order Failed',
          subtitle: message || 'Your order could not be processed. Please try again.',
        };
      case 'pending':
      default:
        return {
          icon: 'time',
          color: colors.warning,
          title: 'Order Pending',
          subtitle: message || 'Your order is being processed. This may take a few moments.',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Status Icon */}
        <View>
          <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
            <Ionicons name={config.icon as any} size={80} color={config.color} />
          </View>
        </View>

        {/* Status Text & Content */}
        <View style={[styles.contentWrapper]}>
          <Text style={styles.title}>{config.title}</Text>
          <Text style={styles.subtitle}>{config.subtitle}</Text>

          {/* Order Summary */}
          <Card variant="elevated" style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Details</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Stock</Text>
            <Text style={styles.summaryValue}>{order.symbol}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Action</Text>
            <Text style={[
              styles.summaryValue,
              { color: order.side === 'buy' ? colors.success : colors.error }
            ]}>
              {order.side.toUpperCase()}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Quantity</Text>
            <Text style={styles.summaryValue}>{order.quantity} shares</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount</Text>
            <Text style={styles.summaryValue}>KES {order.total.toFixed(2)}</Text>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {status === 'executed' && (
            <>
              <Button
                title="View Order History"
                onPress={onViewHistory}
                variant="outline"
                fullWidth
                style={styles.actionButton}
              />
              <Button
                title="Back to Portfolio"
                onPress={onBackToPortfolio}
                variant="primary"
                fullWidth
              />
            </>
          )}

          {status === 'failed' && (
            <>
              {onRetry && (
                <Button
                  title="Retry Order"
                  onPress={onRetry}
                  variant="primary"
                  fullWidth
                  style={styles.actionButton}
                />
              )}
              <Button
                title="Back to Portfolio"
                onPress={onBackToPortfolio}
                variant="outline"
                fullWidth
              />
            </>
          )}

          {status === 'pending' && (
            <Button
              title="Back to Portfolio"
              onPress={onBackToPortfolio}
              variant="outline"
              fullWidth
            />
          )}
        </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    padding: spacing['2xl'],
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  contentWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },
  summaryCard: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  summaryTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
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
  actionsContainer: {
    width: '100%',
    gap: spacing.md,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
});

