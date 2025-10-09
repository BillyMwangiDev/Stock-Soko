/**
 * Tax Reports Screen
 * Comprehensive tax reporting with FIFO/LIFO calculations
 */
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { PortfolioStackParamList } from '../navigation/types';
import { colors, typography, spacing, borderRadius } from '../theme';
import { Card, LoadingState, Button } from '../components';
import { api } from '../api/client';

type TaxReportsScreenProp = StackNavigationProp<PortfolioStackParamList, 'TaxReports'>;

interface Props {
  navigation: TaxReportsScreenProp;
}

interface TaxSummary {
  realized_gains: number;
  unrealized_gains: number;
  capital_gains_tax: number; // 5% in Kenya
  dividend_income: number;
  dividend_withholding_tax: number; // 5% in Kenya
  total_tax_liability: number;
}

interface TaxableEvent {
  id: string;
  date: string;
  symbol: string;
  type: 'capital_gain' | 'dividend' | 'withholding';
  description: string;
  amount: number;
  tax: number;
}

export default function TaxReports({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [taxMethod, setTaxMethod] = useState<'FIFO' | 'LIFO'>('FIFO');
  const [taxYear, setTaxYear] = useState(new Date().getFullYear());
  const [taxSummary, setTaxSummary] = useState<TaxSummary>({
    realized_gains: 0,
    unrealized_gains: 0,
    capital_gains_tax: 0,
    dividend_income: 0,
    dividend_withholding_tax: 0,
    total_tax_liability: 0,
  });
  const [taxableEvents, setTaxableEvents] = useState<TaxableEvent[]>([]);

  useEffect(() => {
    loadTaxData();
  }, [taxMethod, taxYear]);

  const loadTaxData = async () => {
    setLoading(true);
    try {
      // In production: await api.get(`/portfolio/tax-report?method=${taxMethod}&year=${taxYear}`);
      // For now, generate mock data
      
      const realizedGains = 5420.50;
      const unrealizedGains = 1850.75;
      const dividendIncome = 320.00;

      const capitalGainsTax = realizedGains * 0.05; // 5% CGT in Kenya
      const dividendWithholdingTax = dividendIncome * 0.05; // 5% on dividends
      const totalTaxLiability = capitalGainsTax + dividendWithholdingTax;

      setTaxSummary({
        realized_gains: realizedGains,
        unrealized_gains: unrealizedGains,
        capital_gains_tax: capitalGainsTax,
        dividend_income: dividendIncome,
        dividend_withholding_tax: dividendWithholdingTax,
        total_tax_liability: totalTaxLiability,
      });

      // Mock taxable events
      const events: TaxableEvent[] = [
        {
          id: '1',
          date: '2025-09-15',
          symbol: 'EQTY',
          type: 'capital_gain',
          description: 'Sold 30 shares of EQTY at profit',
          amount: 1200.00,
          tax: 60.00,
        },
        {
          id: '2',
          date: '2025-08-20',
          symbol: 'KCB',
          type: 'capital_gain',
          description: 'Sold 20 shares of KCB at profit',
          amount: 850.50,
          tax: 42.53,
        },
        {
          id: '3',
          date: '2025-07-10',
          symbol: 'SCOM',
          type: 'dividend',
          description: 'Dividend payment',
          amount: 320.00,
          tax: 16.00,
        },
      ];

      setTaxableEvents(events);
    } catch (error) {
      console.error('Failed to load tax data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    Alert.alert('Export PDF', 'Tax report export feature coming soon!');
  };

  const handleExportExcel = () => {
    Alert.alert('Export Excel', 'Excel export feature coming soon!');
  };

  const fifoVsLifo = {
    FIFO: {
      gains: taxSummary.realized_gains,
      tax: taxSummary.capital_gains_tax,
    },
    LIFO: {
      gains: taxSummary.realized_gains * 1.05, // Slightly different for demo
      tax: taxSummary.capital_gains_tax * 1.05,
    },
  };

  const taxSavings = Math.abs(fifoVsLifo.FIFO.tax - fifoVsLifo.LIFO.tax);

  if (loading) {
    return <LoadingState message="Loading tax reports..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tax Reports</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Tax Year Selector */}
        <Card variant="glass" style={styles.yearSelector}>
          <Text style={styles.yearLabel}>Tax Year</Text>
          <View style={styles.yearButtons}>
            {[2023, 2024, 2025].map((year) => (
              <TouchableOpacity
                key={year}
                style={[styles.yearButton, taxYear === year && styles.yearButtonActive]}
                onPress={() => setTaxYear(year)}
              >
                <Text style={[styles.yearButtonText, taxYear === year && styles.yearButtonTextActive]}>
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Tax Summary */}
        <Card variant="elevated" style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name="document-text" size={24} color={colors.warning} />
            <Text style={styles.summaryTitle}>Tax Liability Summary ({taxYear})</Text>
          </View>

          <View style={styles.taxRow}>
            <Text style={styles.taxLabel}>Realized Gains</Text>
            <Text style={[styles.taxValue, { color: colors.success }]}>
              KES {taxSummary.realized_gains.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.taxRow}>
            <Text style={styles.taxLabel}>Capital Gains Tax (5%)</Text>
            <Text style={styles.taxValue}>
              KES {taxSummary.capital_gains_tax.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.taxRow}>
            <Text style={styles.taxLabel}>Dividend Income</Text>
            <Text style={styles.taxValue}>
              KES {taxSummary.dividend_income.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.taxRow}>
            <Text style={styles.taxLabel}>Withholding Tax (5%)</Text>
            <Text style={styles.taxValue}>
              KES {taxSummary.dividend_withholding_tax.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={[styles.taxRow, styles.taxRowTotal]}>
            <Text style={styles.taxLabelTotal}>Total Tax Liability</Text>
            <Text style={styles.taxValueTotal}>
              KES {taxSummary.total_tax_liability.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.unrealizedSection}>
            <Ionicons name="information-circle-outline" size={16} color={colors.info} />
            <Text style={styles.unrealizedText}>
              Unrealized gains: KES {taxSummary.unrealized_gains.toLocaleString('en-KE', { minimumFractionDigits: 2 })} (taxed when sold)
            </Text>
          </View>
        </Card>

        {/* FIFO vs LIFO Comparison */}
        <Card variant="glass" style={styles.comparisonCard}>
          <Text style={styles.comparisonTitle}>Cost Basis Method</Text>
          
          <View style={styles.methodButtons}>
            <TouchableOpacity
              style={[styles.methodButton, taxMethod === 'FIFO' && styles.methodButtonActive]}
              onPress={() => setTaxMethod('FIFO')}
            >
              <Text style={[styles.methodButtonText, taxMethod === 'FIFO' && styles.methodButtonTextActive]}>
                FIFO
              </Text>
              <Text style={styles.methodButtonSubtext}>First In, First Out</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.methodButton, taxMethod === 'LIFO' && styles.methodButtonActive]}
              onPress={() => setTaxMethod('LIFO')}
            >
              <Text style={[styles.methodButtonText, taxMethod === 'LIFO' && styles.methodButtonTextActive]}>
                LIFO
              </Text>
              <Text style={styles.methodButtonSubtext}>Last In, First Out</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.comparisonDetails}>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>Using {taxMethod}:</Text>
              <Text style={styles.comparisonValue}>
                Tax: KES {fifoVsLifo[taxMethod].tax.toFixed(2)}
              </Text>
            </View>
            {taxSavings > 0 && (
              <View style={styles.savingsBanner}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.savingsText}>
                  Potential savings: KES {taxSavings.toFixed(2)} vs {taxMethod === 'FIFO' ? 'LIFO' : 'FIFO'}
                </Text>
              </View>
            )}
          </View>
        </Card>

        {/* Taxable Events */}
        <Text style={styles.sectionTitle}>Taxable Events</Text>
        {taxableEvents.map((event) => (
          <Card key={event.id} variant="glass" style={styles.eventCard}>
            <View style={styles.eventHeader}>
              <View style={styles.eventLeft}>
                <View style={[
                  styles.eventIconContainer,
                  { backgroundColor: event.type === 'capital_gain' ? colors.primary.main + '20' : colors.warning + '20' }
                ]}>
                  <Ionicons
                    name={event.type === 'capital_gain' ? 'trending-up' : 'cash'}
                    size={20}
                    color={event.type === 'capital_gain' ? colors.primary.main : colors.warning}
                  />
                </View>
                <View>
                  <Text style={styles.eventSymbol}>{event.symbol}</Text>
                  <Text style={styles.eventType}>
                    {event.type === 'capital_gain' ? 'Capital Gain' : 'Dividend Income'}
                  </Text>
                </View>
              </View>
              <Text style={styles.eventDate}>
                {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </View>

            <Text style={styles.eventDescription}>{event.description}</Text>

            <View style={styles.eventFooter}>
              <View style={styles.eventAmountRow}>
                <Text style={styles.eventAmountLabel}>Amount:</Text>
                <Text style={styles.eventAmountValue}>KES {event.amount.toFixed(2)}</Text>
              </View>
              <View style={styles.eventTaxRow}>
                <Text style={styles.eventTaxLabel}>Tax:</Text>
                <Text style={styles.eventTaxValue}>KES {event.tax.toFixed(2)}</Text>
              </View>
            </View>
          </Card>
        ))}

        {/* Export Buttons */}
        <Card variant="outline" style={styles.exportCard}>
          <View style={styles.exportHeader}>
            <Ionicons name="download" size={24} color={colors.primary.main} />
            <Text style={styles.exportTitle}>Export Tax Report</Text>
          </View>
          <Text style={styles.exportSubtext}>
            Download your complete {taxYear} tax report for filing
          </Text>
          <View style={styles.exportButtons}>
            <Button
              title="Export PDF"
              onPress={handleExportPDF}
              variant="primary"
              style={styles.exportButton}
            />
            <Button
              title="Export Excel"
              onPress={handleExportExcel}
              variant="outline"
              style={styles.exportButton}
            />
          </View>
        </Card>

        {/* Tax Disclaimer */}
        <Card variant="glass" style={styles.disclaimerCard}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.warning} />
          <Text style={styles.disclaimerText}>
            This report is for informational purposes only. Please consult with a licensed tax professional for official tax filing. Tax rates and regulations may change.
          </Text>
        </Card>

        <View style={{ height: 100 }} />
      </ScrollView>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  yearSelector: {
    marginBottom: spacing.lg,
  },
  yearLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
    fontWeight: typography.fontWeight.medium,
  },
  yearButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  yearButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.main,
    alignItems: 'center',
  },
  yearButtonActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  yearButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  yearButtonTextActive: {
    color: colors.primary.contrast,
    fontWeight: typography.fontWeight.bold,
  },
  summaryCard: {
    marginBottom: spacing.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main + '40',
  },
  taxLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  taxValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  taxRowTotal: {
    borderBottomWidth: 0,
    borderTopWidth: 2,
    borderTopColor: colors.border.main,
    marginTop: spacing.sm,
    paddingTop: spacing.md,
  },
  taxLabelTotal: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  taxValueTotal: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.warning,
  },
  unrealizedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.info + '10',
    borderRadius: borderRadius.sm,
  },
  unrealizedText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  comparisonCard: {
    marginBottom: spacing.lg,
  },
  comparisonTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  methodButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  methodButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.main,
    alignItems: 'center',
  },
  methodButtonActive: {
    backgroundColor: colors.primary.main + '20',
    borderColor: colors.primary.main,
  },
  methodButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.secondary,
  },
  methodButtonTextActive: {
    color: colors.primary.main,
  },
  methodButtonSubtext: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  comparisonDetails: {
    backgroundColor: colors.background.tertiary,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  comparisonLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  comparisonValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.success + '20',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  savingsText: {
    fontSize: typography.fontSize.sm,
    color: colors.success,
    fontWeight: typography.fontWeight.semibold,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  eventCard: {
    marginBottom: spacing.md,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  eventLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  eventIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventSymbol: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  eventType: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  eventDate: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  eventDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.main + '40',
  },
  eventAmountRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  eventAmountLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  eventAmountValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.success,
  },
  eventTaxRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  eventTaxLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  eventTaxValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.warning,
  },
  exportCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  exportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  exportTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  exportSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  exportButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  exportButton: {
    flex: 1,
  },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
  },
  disclaimerText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    lineHeight: 18,
  },
});

