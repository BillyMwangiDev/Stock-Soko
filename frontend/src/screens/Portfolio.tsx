/**
 * Portfolio Screen
 * Current holdings, P/L summary, tax summary, and performance
 */
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../api/client';
import { colors, typography, spacing, borderRadius } from '../theme';
import { LoadingState, FloatingAIButton } from '../components';

interface Holding {
  id: string;
  type: string;
  name: string;
  quantity: string;
  value: number;
  emoji: string;
}

export default function Portfolio() {
  const navigation = useNavigation();
  const [holdings, setHoldings] = useState<Holding[]>([
    {
      id: '1',
      type: 'Stocks',
      name: 'Stock Soko',
      quantity: '100 shares',
      value: 10000,
      emoji: 'STK',
    },
    {
      id: '2',
      type: 'Bonds',
      name: 'Government Bonds',
      quantity: '5 bonds',
      value: 5000,
      emoji: 'BND',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const totalValue = 15000;
  const totalProfit = 2500;
  const profitPercent = 25;
  const taxableIncome = 1250;
  const estimatedTax = 250;
  const performanceChange = 15;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load real data from API
      const res = await api.get('/ledger/positions');
      // Process data...
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return <LoadingState message="Loading portfolio..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Portfolio</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Holdings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Holdings</Text>
          
          <View style={styles.holdingsContainer}>
            {holdings.map((holding) => (
              <TouchableOpacity 
                key={holding.id} 
                style={styles.holdingCard}
                onPress={() => navigation.navigate('HoldingDetail', { holdingId: holding.id })}
              >
                <View style={styles.holdingInfo}>
                  <View style={styles.holdingDetails}>
                    <Text style={styles.holdingType}>{holding.type}</Text>
                    <Text style={styles.holdingName}>{holding.name}</Text>
                    <Text style={styles.holdingQuantity}>{holding.quantity}</Text>
                  </View>
                  <View style={styles.holdingValue}>
                    <Text style={styles.valueText}>KES {holding.value.toLocaleString()}</Text>
                  </View>
                </View>
                
                <View style={styles.holdingImage}>
                  <Text style={styles.holdingEmoji}>{holding.emoji}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Profit/Loss Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profit/Loss Summary</Text>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryContent}>
              <View style={styles.summaryInfo}>
                <View style={styles.summaryDetails}>
                  <Text style={styles.summaryLabel}>Total Profit</Text>
                  <Text style={styles.summaryValue}>${totalProfit.toLocaleString()}</Text>
                  <Text style={styles.summarySubtext}>Since Inception</Text>
                </View>
                <View style={styles.profitBadge}>
                  <Text style={styles.profitBadgeText}>+{profitPercent}%</Text>
                </View>
              </View>
              
              <View style={styles.summaryImage}>
                <Text style={styles.summaryEmoji}>↗</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tax Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tax Summary</Text>
          
          <View style={styles.taxCard}>
            <View style={styles.taxContent}>
              <View style={styles.taxInfo}>
                <View style={styles.taxDetails}>
                  <Text style={styles.taxLabel}>Taxable Income</Text>
                  <Text style={styles.taxValue}>${taxableIncome.toLocaleString()}</Text>
                  <Text style={styles.taxSubtext}>Year to Date</Text>
                </View>
                <View style={styles.taxBadge}>
                  <Text style={styles.taxBadgeText}>${estimatedTax}</Text>
                </View>
              </View>
              
              <View style={styles.taxImage}>
                <Text style={styles.taxEmoji}>$</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance</Text>
          
          <View style={styles.performanceCard}>
            <Text style={styles.performanceLabel}>Portfolio Value</Text>
            <Text style={styles.performanceValue}>${totalValue.toLocaleString()}</Text>
            
            <View style={styles.performanceChange}>
              <Text style={styles.performanceChangeLabel}>Last 6 Months</Text>
              <Text style={styles.performanceChangeValue}>+{performanceChange}%</Text>
            </View>

            {/* Chart Placeholder */}
            <View style={styles.chartContainer}>
          <View style={styles.chartArea}>
            <Text style={styles.chartEmoji}>CHART</Text>
          </View>
              <View style={styles.chartLabels}>
                <Text style={styles.chartLabel}>Jan</Text>
                <Text style={styles.chartLabel}>Feb</Text>
                <Text style={styles.chartLabel}>Mar</Text>
                <Text style={styles.chartLabel}>Apr</Text>
                <Text style={styles.chartLabel}>May</Text>
                <Text style={styles.chartLabel}>Jun</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <FloatingAIButton />
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary + 'CC',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main + '80',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: colors.text.primary,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  holdingsContainer: {
    gap: spacing.md,
  },
  holdingCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  holdingInfo: {
    flex: 1,
  },
  holdingDetails: {
    flex: 1,
    gap: 4,
  },
  holdingType: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  holdingName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  holdingQuantity: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  holdingValue: {
    marginTop: spacing.md,
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  valueText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  holdingImage: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  holdingEmoji: {
    fontSize: 16,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
  },
  summaryCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  summaryContent: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryDetails: {
    gap: 4,
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  summarySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  profitBadge: {
    marginTop: spacing.md,
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  profitBadgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.success,
  },
  summaryImage: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryEmoji: {
    fontSize: 32,
    color: colors.success,
  },
  taxCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  taxContent: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  taxInfo: {
    flex: 1,
  },
  taxDetails: {
    gap: 4,
  },
  taxLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  taxValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  taxSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  taxBadge: {
    marginTop: spacing.md,
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  taxBadgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  taxImage: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taxEmoji: {
    fontSize: 32,
    fontWeight: typography.fontWeight.bold,
    color: colors.warning,
  },
  performanceCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  performanceLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  performanceValue: {
    fontSize: 32,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  performanceChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  performanceChangeLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  performanceChangeValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.success,
  },
  chartContainer: {
    marginTop: spacing.md,
  },
  chartArea: {
    height: 150,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  chartEmoji: {
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.disabled,
    opacity: 0.5,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  chartLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
});
