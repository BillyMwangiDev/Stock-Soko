import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { colors, typography, spacing, textStyles } from '../theme';
import { GlassCard, Button } from '../components';
import { api } from '../api/client';

interface FeeStructure {
  trading: any;
  payments: any;
  settlement: any;
  regulatory: any;
  examples: any[];
}

export default function FeesDisclosure({ navigation }: any) {
  const [fees, setFees] = useState<FeeStructure | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculatorAmount, setCalculatorAmount] = useState('10000');
  const [calculatedFees, setCalculatedFees] = useState<any>(null);

  useEffect(() => {
    loadFees();
  }, []);

  const loadFees = async () => {
    try {
      const response = await api.get('/fees/all');
      setFees(response.data);
    } catch (error) {
      console.error('Failed to load fees:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateFees = async () => {
    try {
      const amount = parseFloat(calculatorAmount);
      if (isNaN(amount) || amount <= 0) return;

      const response = await api.get(`/fees/calculate?amount=${amount}&type=buy`);
      setCalculatedFees(response.data);
    } catch (error) {
      console.error('Fee calculation failed:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Loading fee structure...</Text>
      </View>
    );
  }

  if (!fees) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load fee information</Text>
        <Button title="Retry" onPress={loadFees} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Fee Disclosure</Text>
        <Text style={styles.subtitle}>
          Complete transparency on all charges
        </Text>
      </View>

      {/* Trading Fees */}
      <GlassCard style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trading Fees</Text>
          <View style={styles.totalBadge}>
            <Text style={styles.totalText}>
              {(fees.trading.total_rate * 100).toFixed(2)}% Total
            </Text>
          </View>
        </View>

        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Brokerage Commission</Text>
          <Text style={styles.feeValue}>
            {(fees.trading.commission.rate * 100).toFixed(2)}%
          </Text>
        </View>
        <Text style={styles.feeDescription}>
          {fees.trading.commission.description}
        </Text>

        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>CDS Fee</Text>
          <Text style={styles.feeValue}>
            {(fees.trading.cds_fee.rate * 100).toFixed(2)}%
          </Text>
        </View>
        <Text style={styles.feeDescription}>
          {fees.trading.cds_fee.description}
        </Text>

        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>NSE Trading Fee</Text>
          <Text style={styles.feeValue}>
            {(fees.trading.nse_fee.rate * 100).toFixed(2)}%
          </Text>
        </View>
        <Text style={styles.feeDescription}>
          {fees.trading.nse_fee.description}
        </Text>

        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Securities Clearing Fee</Text>
          <Text style={styles.feeValue}>
            {(fees.trading.scfee.rate * 100).toFixed(2)}%
          </Text>
        </View>
        <Text style={styles.feeDescription}>
          {fees.trading.scfee.description}
        </Text>

        <View style={styles.divider} />
        <Text style={styles.note}>{fees.trading.description}</Text>
      </GlassCard>

      {/* Fee Calculator */}
      <GlassCard style={styles.card}>
        <Text style={styles.sectionTitle}>Fee Calculator</Text>
        <Text style={styles.subtitle}>Calculate fees for your trade</Text>

        <View style={styles.calculatorInput}>
          <Text style={styles.inputLabel}>Trade Amount (KES)</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currencyPrefix}>KES</Text>
            <TextInput
              style={styles.input}
              value={calculatorAmount}
              onChangeText={setCalculatorAmount}
              keyboardType="numeric"
              placeholder="10000"
              placeholderTextColor={colors.text.secondary}
            />
          </View>
          <TouchableOpacity style={styles.calculateButton} onPress={calculateFees}>
            <Text style={styles.calculateButtonText}>Calculate</Text>
          </TouchableOpacity>
        </View>

        {calculatedFees && (
          <View style={styles.calculatedResult}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Trade Value</Text>
              <Text style={styles.resultValue}>KES {calculatedFees.trade_value.toLocaleString()}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Commission</Text>
              <Text style={styles.resultValue}>KES {calculatedFees.commission.toLocaleString()}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Other Fees</Text>
              <Text style={styles.resultValue}>
                KES {(calculatedFees.cds_fee + calculatedFees.nse_fee + calculatedFees.scfee).toLocaleString()}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.resultRow}>
              <Text style={styles.resultLabelBold}>Total Cost</Text>
              <Text style={styles.resultValueBold}>KES {calculatedFees.total_cost.toLocaleString()}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Total Fees</Text>
              <Text style={[styles.resultValue, { color: colors.error }]}>
                KES {calculatedFees.total_fees.toLocaleString()} ({calculatedFees.fee_percentage}%)
              </Text>
            </View>
          </View>
        )}
      </GlassCard>

      {/* M-Pesa Fees */}
      <GlassCard style={styles.card}>
        <Text style={styles.sectionTitle}>M-Pesa Fees</Text>

        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Deposits</Text>
          <View style={styles.freeBadge}>
            <Text style={styles.freeText}>FREE</Text>
          </View>
        </View>
        <Text style={styles.feeDescription}>
          {fees.payments.mpesa.deposit.description}
        </Text>

        <View style={styles.spacer} />

        <Text style={styles.feeLabel}>Withdrawal Fees</Text>
        <Text style={styles.feeDescription}>
          {fees.payments.mpesa.description}
        </Text>

        <View style={styles.withdrawalTiers}>
          {fees.payments.mpesa.withdrawal_tiers.slice(0, 8).map((tier: any, index: number) => (
            <View key={index} style={styles.tierRow}>
              <Text style={styles.tierRange}>
                KES {tier.min.toLocaleString()} - {tier.max.toLocaleString()}
              </Text>
              <Text style={styles.tierFee}>
                {tier.fee === 0 ? 'FREE' : `KES ${tier.fee}`}
              </Text>
            </View>
          ))}
          <Text style={styles.smallText}>+ More tiers up to KES 150,000</Text>
        </View>
      </GlassCard>

      {/* Settlement */}
      <GlassCard style={styles.card}>
        <Text style={styles.sectionTitle}>Settlement Timeline</Text>
        <View style={styles.settlementBadge}>
          <Text style={styles.settlementText}>{fees.settlement.timeline}</Text>
        </View>
        <Text style={styles.feeDescription}>{fees.settlement.description}</Text>

        <View style={styles.spacer} />
        
        {Object.entries(fees.settlement.details).map(([key, value]: [string, any]) => (
          <View key={key} style={styles.timelineRow}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineDay}>{key}</Text>
              <Text style={styles.timelineDesc}>{value}</Text>
            </View>
          </View>
        ))}
      </GlassCard>

      {/* Regulatory */}
      <GlassCard style={styles.card}>
        <Text style={styles.sectionTitle}>Regulatory Information</Text>

        {fees.regulatory.licenses.map((license: any, index: number) => (
          <View key={index} style={styles.licenseRow}>
            <Text style={styles.licenseAuthority}>{license.authority}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{license.status}</Text>
            </View>
          </View>
        ))}

        <View style={styles.spacer} />
        <Text style={styles.sectionSubtitle}>Disclosures</Text>
        {fees.regulatory.disclosures.map((disclosure: string, index: number) => (
          <View key={index} style={styles.disclosureRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.disclosureText}>{disclosure}</Text>
          </View>
        ))}
      </GlassCard>

      {/* Examples */}
      <GlassCard style={styles.card}>
        <Text style={styles.sectionTitle}>Fee Examples</Text>
        <Text style={styles.subtitle}>See how fees apply to different trade sizes</Text>

        {fees.examples.map((example: any, index: number) => (
          <View key={index} style={styles.exampleRow}>
            <Text style={styles.exampleAmount}>
              Trade: KES {example.trade_value.toLocaleString()}
            </Text>
            <Text style={styles.exampleFees}>
              Fees: KES {example.fees.total.toLocaleString()}
            </Text>
            <Text style={styles.exampleTotal}>
              Total: KES {example.total_cost.toLocaleString()}
            </Text>
          </View>
        ))}
      </GlassCard>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          All fees are disclosed upfront before trade execution
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  loadingText: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    padding: spacing.xl,
  },
  errorText: {
    ...textStyles.body,
    color: colors.error,
    marginBottom: spacing.lg,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: {
    ...textStyles.h1,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...textStyles.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    ...textStyles.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  totalBadge: {
    backgroundColor: colors.primary.main + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  totalText: {
    ...textStyles.caption,
    color: colors.primary.main,
    fontWeight: '600',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  feeLabel: {
    ...textStyles.body,
    color: colors.text.primary,
  },
  feeValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
  },
  feeDescription: {
    ...textStyles.caption,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.main,
    marginVertical: spacing.md,
  },
  note: {
    ...textStyles.caption,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  calculatorInput: {
    marginTop: spacing.md,
  },
  inputLabel: {
    ...textStyles.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.main,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  currencyPrefix: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...textStyles.body,
    color: colors.text.primary,
    paddingVertical: spacing.md,
  },
  calculateButton: {
    backgroundColor: colors.primary.main,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  calculateButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.background.primary,
  },
  calculatedResult: {
    marginTop: spacing.lg,
    backgroundColor: colors.background.surface,
    borderRadius: 12,
    padding: spacing.md,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  resultLabel: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  resultValue: {
    ...textStyles.body,
    color: colors.text.primary,
  },
  resultLabelBold: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  resultValueBold: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
  },
  freeBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  freeText: {
    ...textStyles.caption,
    color: colors.success,
    fontWeight: '600',
  },
  spacer: {
    height: spacing.md,
  },
  withdrawalTiers: {
    marginTop: spacing.sm,
  },
  tierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main + '30',
  },
  tierRange: {
    ...textStyles.caption,
    color: colors.text.primary,
  },
  tierFee: {
    ...textStyles.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  smallText: {
    ...textStyles.caption,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  settlementBadge: {
    backgroundColor: colors.warning + '20',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  settlementText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.warning,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary.main,
    marginRight: spacing.md,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineDay: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  timelineDesc: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  licenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main + '30',
  },
  licenseAuthority: {
    ...textStyles.body,
    color: colors.text.primary,
    flex: 1,
  },
  statusBadge: {
    backgroundColor: colors.info + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  statusText: {
    ...textStyles.caption,
    color: colors.info,
    fontSize: 10,
  },
  disclosureRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  bullet: {
    ...textStyles.body,
    color: colors.primary.main,
    marginRight: spacing.sm,
  },
  disclosureText: {
    ...textStyles.caption,
    color: colors.text.secondary,
    flex: 1,
  },
  exampleRow: {
    backgroundColor: colors.background.surface,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  exampleAmount: {
    ...textStyles.body,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  exampleFees: {
    ...textStyles.caption,
    color: colors.error,
    marginBottom: spacing.xs,
  },
  exampleTotal: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
  },
  footer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    ...textStyles.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

