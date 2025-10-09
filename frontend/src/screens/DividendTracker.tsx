import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { PortfolioStackParamList } from '../navigation/types';
import { colors, typography, spacing, borderRadius } from '../theme';
import { mockDividends, mockDividendPayments, Dividend, DividendPayment } from '../mocks';

type DividendTrackerScreenProp = StackNavigationProp<PortfolioStackParamList, 'DividendTracker'>;

interface Props {
  navigation: DividendTrackerScreenProp;
}

type TabType = 'upcoming' | 'history';

export default function DividendTracker({ navigation }: Props) {
  const [selectedTab, setSelectedTab] = useState<TabType>('upcoming');

  const upcomingDividends = useMemo(() => {
    return mockDividends.filter(d => d.status === 'declared' || d.status === 'upcoming');
  }, []);

  const paidDividends = useMemo(() => {
    return mockDividends.filter(d => d.status === 'paid');
  }, []);

  const upcomingPayments = useMemo(() => {
    return mockDividendPayments.filter(p => p.status === 'pending');
  }, []);

  const paidPayments = useMemo(() => {
    return mockDividendPayments.filter(p => p.status === 'paid');
  }, []);

  const totalUpcomingAmount = useMemo(() => {
    return upcomingPayments.reduce((sum, p) => sum + p.totalAmount, 0);
  }, [upcomingPayments]);

  const totalPaidAmount = useMemo(() => {
    return paidPayments.reduce((sum, p) => sum + p.totalAmount, 0);
  }, [paidPayments]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getFrequencyColor = (frequency: Dividend['frequency']) => {
    switch (frequency) {
      case 'monthly':
        return colors.info;
      case 'quarterly':
        return colors.accent.purple;
      case 'semi-annual':
        return colors.accent.gold;
      case 'annual':
        return colors.success;
    }
  };

  const renderDividendCard = (dividend: Dividend) => (
    <View key={dividend.id} style={styles.dividendCard}>
      <View style={styles.dividendHeader}>
        <View style={styles.stockInfo}>
          <View style={styles.tickerBadge}>
            <Text style={styles.tickerText}>{dividend.stockTicker}</Text>
          </View>
          <Text style={styles.stockName}>{dividend.stockName}</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Per Share</Text>
          <Text style={styles.amount}>KES {dividend.amount.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.dividendDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={14} color={colors.text.secondary} />
            <Text style={styles.detailLabel}>Ex-Date</Text>
            <Text style={styles.detailValue}>{formatDate(dividend.exDividendDate)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="cash-outline" size={14} color={colors.text.secondary} />
            <Text style={styles.detailLabel}>Payment</Text>
            <Text style={styles.detailValue}>{formatDate(dividend.paymentDate)}</Text>
          </View>
        </View>

        <View style={styles.dividendFooter}>
          <View style={[styles.frequencyBadge, { backgroundColor: getFrequencyColor(dividend.frequency) + '20' }]}>
            <Text style={[styles.frequencyText, { color: getFrequencyColor(dividend.frequency) }]}>
              {dividend.frequency.toUpperCase()}
            </Text>
          </View>
          <View style={styles.yieldContainer}>
            <Ionicons name="trending-up" size={14} color={colors.success} />
            <Text style={styles.yieldText}>{dividend.yield.toFixed(1)}% Yield</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderPaymentCard = (payment: DividendPayment) => (
    <View key={payment.id} style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <View style={styles.paymentIcon}>
          {payment.status === 'paid' ? (
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          ) : (
            <Ionicons name="time-outline" size={20} color={colors.accent.gold} />
          )}
        </View>
        <View style={styles.paymentInfo}>
          <View style={styles.paymentTitleRow}>
            <Text style={styles.paymentTicker}>{payment.stockTicker}</Text>
            <Text style={styles.paymentAmount}>KES {payment.totalAmount.toFixed(2)}</Text>
          </View>
          <Text style={styles.paymentStockName}>{payment.stockName}</Text>
        </View>
      </View>

      <View style={styles.paymentDetails}>
        <View style={styles.paymentDetailRow}>
          <Text style={styles.paymentDetailLabel}>Shares</Text>
          <Text style={styles.paymentDetailValue}>{payment.shares.toLocaleString()}</Text>
        </View>
        <View style={styles.paymentDetailRow}>
          <Text style={styles.paymentDetailLabel}>Per Share</Text>
          <Text style={styles.paymentDetailValue}>KES {payment.amountPerShare.toFixed(2)}</Text>
        </View>
        <View style={styles.paymentDetailRow}>
          <Text style={styles.paymentDetailLabel}>Payment Date</Text>
          <Text style={styles.paymentDetailValue}>{formatDate(payment.paymentDate)}</Text>
        </View>
      </View>

      <View style={[styles.statusBadge, payment.status === 'paid' ? styles.statusPaid : styles.statusPending]}>
        <Text style={[styles.statusText, payment.status === 'paid' ? styles.statusTextPaid : styles.statusTextPending]}>
          {payment.status === 'paid' ? 'PAID' : 'PENDING'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dividend Income</Text>
          <Text style={styles.headerSubtitle}>
            Track your dividend payments and upcoming distributions
          </Text>
        </View>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIconContainer}>
              <Ionicons name="time-outline" size={24} color={colors.accent.gold} />
            </View>
            <Text style={styles.summaryLabel}>Upcoming</Text>
            <Text style={styles.summaryAmount}>KES {totalUpcomingAmount.toFixed(2)}</Text>
            <Text style={styles.summaryCount}>{upcomingPayments.length} payments</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryIconContainer}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            </View>
            <Text style={styles.summaryLabel}>Received</Text>
            <Text style={styles.summaryAmount}>KES {totalPaidAmount.toFixed(2)}</Text>
            <Text style={styles.summaryCount}>{paidPayments.length} payments</Text>
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'upcoming' && styles.tabActive]}
            onPress={() => setSelectedTab('upcoming')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, selectedTab === 'upcoming' && styles.tabTextActive]}>
              Upcoming
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'history' && styles.tabActive]}
            onPress={() => setSelectedTab('history')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, selectedTab === 'history' && styles.tabTextActive]}>
              History
            </Text>
          </TouchableOpacity>
        </View>

        {selectedTab === 'upcoming' ? (
          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Upcoming Payments</Text>
              {upcomingPayments.map(renderPaymentCard)}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>All Upcoming Dividends</Text>
              {upcomingDividends.map(renderDividendCard)}
            </View>
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment History</Text>
              {paidPayments.map(renderPaymentCard)}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Past Dividends</Text>
              {paidDividends.map(renderDividendCard)}
            </View>
          </View>
        )}

        {((selectedTab === 'upcoming' && upcomingPayments.length === 0) ||
          (selectedTab === 'history' && paidPayments.length === 0)) && (
          <View style={styles.emptyState}>
            <Ionicons name="alert-circle-outline" size={64} color={colors.text.secondary} />
            <Text style={styles.emptyStateTitle}>No Dividends Found</Text>
            <Text style={styles.emptyStateText}>
              {selectedTab === 'upcoming'
                ? 'You have no upcoming dividend payments'
                : 'You have no dividend payment history'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: typography.sizes.h2,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  summaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  summaryLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  summaryAmount: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  summaryCount: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  tabText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.text.inverse,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  dividendCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dividendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  stockInfo: {
    flex: 1,
  },
  tickerBadge: {
    backgroundColor: colors.primary.main + '20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  tickerText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
  },
  stockName: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  amount: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
  },
  dividendDetails: {
    gap: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  detailValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  dividendFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  frequencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  frequencyText: {
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
  },
  yieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  yieldText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.success,
  },
  paymentCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paymentHeader: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  paymentTicker: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  paymentAmount: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
  },
  paymentStockName: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  paymentDetails: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  paymentDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentDetailLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  paymentDetailValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  statusBadge: {
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  statusPaid: {
    backgroundColor: colors.success + '20',
  },
  statusPending: {
    backgroundColor: colors.accent.gold + '20',
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.fontWeight.bold,
  },
  statusTextPaid: {
    color: colors.success,
  },
  statusTextPending: {
    color: colors.accent.gold,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

