/**
 * Fractional Shares Screen
 * Explains and enables investing in fractional shares
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';
import { Button, Input } from '../components';

interface Stock {
  symbol: string;
  name: string;
  price: number;
}

const popularStocks: Stock[] = [
  { symbol: 'SCOM', name: 'Safaricom', price: 28.50 },
  { symbol: 'EQTY', name: 'Equity Bank', price: 45.00 },
  { symbol: 'KCB', name: 'KCB Group', price: 38.75 },
  { symbol: 'BAMB', name: 'Bamburi Cement', price: 22.10 },
];

export default function FractionalShares() {
  const [amount, setAmount] = useState('100');
  const [selectedStock, setSelectedStock] = useState(popularStocks[0]);

  const shares = amount ? (parseFloat(amount) / selectedStock.price).toFixed(4) : '0';
  const minInvestment = 100;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Fractional Share Trading</Text>
      <Text style={styles.subtitle}>
        Invest in expensive stocks with as little as KES {minInvestment}
      </Text>

      <View style={styles.explainerCard}>
        <Text style={styles.explainerTitle}>What are Fractional Shares?</Text>
        <Text style={styles.explainerText}>
          Fractional shares allow you to own a portion of a stock instead of buying a full share.
          This makes expensive stocks accessible to everyone, regardless of their budget.
        </Text>
      </View>

      <View style={styles.benefitsSection}>
        <Text style={styles.sectionTitle}>Benefits</Text>
        <View style={styles.benefits}>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>💰</Text>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Lower Entry Cost</Text>
              <Text style={styles.benefitText}>
                Start investing with as little as KES {minInvestment}
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>📊</Text>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Diversification</Text>
              <Text style={styles.benefitText}>
                Spread your money across multiple stocks for better risk management
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>⚡</Text>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Dollar Cost Averaging</Text>
              <Text style={styles.benefitText}>
                Invest regularly without waiting to afford full shares
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.calculatorSection}>
        <Text style={styles.sectionTitle}>Calculate Your Investment</Text>

        <Text style={styles.label}>Select Stock</Text>
        <View style={styles.stockSelector}>
          {popularStocks.map((stock) => (
            <TouchableOpacity
              key={stock.symbol}
              style={[
                styles.stockOption,
                selectedStock.symbol === stock.symbol && styles.stockOptionSelected,
              ]}
              onPress={() => setSelectedStock(stock)}
            >
              <Text style={styles.stockSymbol}>{stock.symbol}</Text>
              <Text style={styles.stockPrice}>KES {stock.price.toFixed(2)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Amount to Invest (KES)"
          placeholder="Enter amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />

        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>You will receive</Text>
          <Text style={styles.resultValue}>{shares} shares</Text>
          <Text style={styles.resultSubtext}>of {selectedStock.name}</Text>
        </View>

        <Button
          title="Start Investing"
          variant="primary"
          size="lg"
          fullWidth
          disabled={!amount || parseFloat(amount) < minInvestment}
        />

        {amount && parseFloat(amount) < minInvestment && (
          <Text style={styles.errorText}>
            Minimum investment is KES {minInvestment}
          </Text>
        )}
      </View>

      <View style={styles.faqSection}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>Do I get dividends on fractional shares?</Text>
          <Text style={styles.faqAnswer}>
            Yes! You receive dividends proportional to your fractional ownership.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>Can I sell fractional shares?</Text>
          <Text style={styles.faqAnswer}>
            Absolutely. You can sell your fractional shares at any time, just like full shares.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>Are there any extra fees?</Text>
          <Text style={styles.faqAnswer}>
            No. The same trading fees apply whether you buy full or fractional shares.
          </Text>
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
    padding: spacing.md,
    paddingBottom: 100,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  explainerCard: {
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary.main,
  },
  explainerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
    marginBottom: spacing.sm,
  },
  explainerText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    lineHeight: 20,
  },
  benefitsSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  benefits: {
    gap: spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  benefitIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  benefitText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  calculatorSection: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  stockSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  stockOption: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border.main,
    alignItems: 'center',
  },
  stockOptionSelected: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.light,
  },
  stockSymbol: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  stockPrice: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  resultCard: {
    backgroundColor: colors.success + '20',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.success,
  },
  resultLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  resultValue: {
    fontSize: 32,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
    marginBottom: spacing.xs,
  },
  resultSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  faqSection: {
    marginBottom: spacing.lg,
  },
  faqItem: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  faqQuestion: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  faqAnswer: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});

