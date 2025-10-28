/**
 * Trade Order Screen (Bottom Sheet)
 * Place buy/sell orders with quantity and order type
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';
import { Button } from '../components';
import { api } from '../api/client';

export interface OrderData {
  symbol: string;
  side: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop' | 'stop-limit' | 'trailing-stop';
  quantity: number;
  price?: number;
  limitPrice?: number;
  stopPrice?: number;
  trailingPercent?: number;
  takeProfitPrice?: number;
  stopLossPrice?: number;
  estimatedCost: number;
  fees: number;
  total: number;
  allowFractional?: boolean;
  timeInForce?: 'day' | 'gtc' | 'ioc'; // Day, Good-Till-Cancelled, Immediate-or-Cancel
}

interface TradeOrderProps {
  symbol: string;
  side: 'buy' | 'sell';
  currentPrice?: number;
  onBack: () => void;
  onReview?: (orderData: OrderData) => void;
}

export default function TradeOrder({ symbol, side, currentPrice: priceFromProps, onBack, onReview }: TradeOrderProps) {
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop' | 'stop-limit' | 'trailing-stop'>('market');
  const [stopPrice, setStopPrice] = useState('');
  const [trailingPercent, setTrailingPercent] = useState('');
  const [stopLossPrice, setStopLossPrice] = useState('');
  const [takeProfitPrice, setTakeProfitPrice] = useState('');
  const [timeInForce, setTimeInForce] = useState<'day' | 'gtc' | 'ioc'>('day');
  const [allowFractional, setAllowFractional] = useState(false);
  const [loading, setLoading] = useState(true);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(priceFromProps || 0);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Try to fetch wallet balance (may fail in demo mode)
      try {
        const walletRes = await api.get('/ledger/balance');
        setAvailableBalance(walletRes.data.available_balance || 0);
      } catch (balanceError: any) {
        // Use demo balance if not authenticated
        if (balanceError.response?.status === 401) {
          console.log('[TradeOrder] Using demo balance: KES 100,000');
          setAvailableBalance(100000); // Demo balance
        }
      }

      // Fetch current stock price if not provided
      if (!priceFromProps) {
        const stockRes = await api.get(`/markets/stocks/${symbol}`);
        setCurrentPrice(stockRes.data.last_price || 0);
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
      // Set defaults for demo mode
      setAvailableBalance(100000);
      if (!priceFromProps) {
        setCurrentPrice(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const totalCost = (parseFloat(price) || currentPrice) * (parseFloat(quantity) || 0);
  const estimatedFee = totalCost * 0.002; // 0.2% brokerage fee

  const handleReviewOrder = () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity');
      return;
    }

    if (orderType !== 'market' && (!price || parseFloat(price) <= 0)) {
      Alert.alert('Invalid Price', 'Please enter a valid price for limit/stop orders');
      return;
    }

    // Check sufficient balance for buy orders
    if (side === 'buy' && (totalCost + estimatedFee) > availableBalance) {
      Alert.alert(
        'Insufficient Balance',
        `You need KES ${(totalCost + estimatedFee).toFixed(2)} but only have KES ${availableBalance.toFixed(2)}`
      );
      return;
    }

    // Prepare order data for review
    const orderData: OrderData = {
      symbol,
      side,
      orderType,
      quantity: parseFloat(quantity),
      price: orderType === 'market' ? currentPrice : parseFloat(price),
      limitPrice: orderType === 'limit' || orderType === 'stop-limit' ? parseFloat(price) : undefined,
      stopPrice: orderType === 'stop' || orderType === 'stop-limit' ? parseFloat(stopPrice) : undefined,
      trailingPercent: orderType === 'trailing-stop' ? parseFloat(trailingPercent) : undefined,
      stopLossPrice: stopLossPrice ? parseFloat(stopLossPrice) : undefined,
      takeProfitPrice: takeProfitPrice ? parseFloat(takeProfitPrice) : undefined,
      estimatedCost: totalCost,
      fees: estimatedFee,
      total: totalCost + estimatedFee,
      allowFractional,
      timeInForce,
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

  if (loading) {
    return (
      <View style={styles.overlay}>
        <View style={styles.bottomSheet}>
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.main} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.overlay}>
      <TouchableWithoutFeedback onPress={onBack}>
        <View style={styles.overlayBackground} />
      </TouchableWithoutFeedback>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.bottomSheet}
        keyboardVerticalOffset={0}
      >
            {/* Handle Bar */}
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Place {side === 'buy' ? 'Buy' : 'Sell'} Order</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onBack}>
                <Text style={styles.closeIcon}>X</Text>
              </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <ScrollView 
              style={styles.scrollContainer}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.content}>
              {/* Current Price Display */}
              <View style={styles.priceDisplay}>
                <Text style={styles.priceDisplayLabel}>Current Price</Text>
                <Text style={styles.priceDisplayValue}>KES {currentPrice.toFixed(2)}</Text>
              </View>

              {/* MAIN QUANTITY INPUT - PROMINENT */}
              <View style={styles.mainInputSection}>
                <Text style={styles.mainInputLabel}>
                  {side === 'buy' ? 'HOW MANY SHARES TO BUY?' : 'HOW MANY SHARES TO SELL?'}
                </Text>
                <TouchableWithoutFeedback onPress={() => {}}>
                  <View style={styles.quantityInputContainer}>
                    <TextInput
                      style={styles.quantityInput}
                      placeholder="0"
                      placeholderTextColor={colors.text.disabled}
                      value={quantity}
                      onChangeText={setQuantity}
                      keyboardType="decimal-pad"
                      returnKeyType="done"
                      onSubmitEditing={Keyboard.dismiss}
                      blurOnSubmit={true}
                    />
                    <Text style={styles.sharesLabel}>shares</Text>
                  </View>
                </TouchableWithoutFeedback>
                
                {/* Quick Amount Buttons */}
                <View style={styles.quickAmountRow}>
                  <TouchableOpacity 
                    style={styles.quickAmountButton}
                    onPress={() => setQuantity('5')}
                  >
                    <Text style={styles.quickAmountText}>5</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.quickAmountButton}
                    onPress={() => setQuantity('10')}
                  >
                    <Text style={styles.quickAmountText}>10</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.quickAmountButton}
                    onPress={() => setQuantity('25')}
                  >
                    <Text style={styles.quickAmountText}>25</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.quickAmountButton}
                    onPress={() => setQuantity('50')}
                  >
                    <Text style={styles.quickAmountText}>50</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.quickAmountButton}
                    onPress={() => setQuantity('100')}
                  >
                    <Text style={styles.quickAmountText}>100</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Order Type Selection */}
              <View style={styles.orderTypeSection}>
                <Text style={styles.sectionLabel}>Order Type</Text>
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
                </View>
              </View>

              {/* Limit Price Input - Only for limit orders */}
              {orderType === 'limit' && (
                <View style={styles.limitPriceSection}>
                  <Text style={styles.sectionLabel}>Limit Price</Text>
                  <View style={styles.priceInputWrapper}>
                    <Text style={styles.currencySymbol}>KES</Text>
                    <TextInput
                      style={styles.priceInput}
                      placeholder={currentPrice.toFixed(2)}
                      placeholderTextColor={colors.text.disabled}
                      value={price}
                      onChangeText={setPrice}
                      keyboardType="decimal-pad"
                      returnKeyType="done"
                      onSubmitEditing={Keyboard.dismiss}
                      blurOnSubmit={true}
                    />
                  </View>
                </View>
              )}
              </View>
            </ScrollView>

            {/* Summary - Fixed at bottom */}
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
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => {
                  Keyboard.dismiss();
                  onBack();
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.placeOrderButton} 
                onPress={() => {
                  Keyboard.dismiss();
                  handleReviewOrder();
                }}
              >
                <Text style={styles.placeOrderText}>Review Order</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 32 }} />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.md,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  mainInputSection: {
    marginVertical: spacing.lg,
  },
  mainInputLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  quantityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.primary.main,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  quantityInput: {
    fontSize: 40,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    minWidth: 100,
    textAlign: 'center',
  },
  sharesLabel: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  quickAmountRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  quickAmountButton: {
    flex: 1,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.main,
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  orderTypeSection: {
    marginTop: spacing.md,
  },
  sectionLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  limitPriceSection: {
    marginTop: spacing.md,
  },
  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.main,
    paddingHorizontal: spacing.md,
  },
  priceInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.xl,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
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
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  priceDisplay: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  priceDisplayLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  priceDisplayValue: {
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
  },
});