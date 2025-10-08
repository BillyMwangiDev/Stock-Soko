import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme';
import { Card, Button, Input, Badge, LoadingState } from '../components';
import { api } from '../api/client';
import { hapticFeedback } from '../utils/haptics';

interface Transaction {
  id: string;
  date: string;
  type: 'deposit' | 'withdrawal' | 'trade';
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  description: string;
}

type WalletTab = 'overview' | 'deposit' | 'withdrawal' | 'history';

export default function Wallet() {
  const [activeTab, setActiveTab] = useState<WalletTab>('overview');
  const [balance, setBalance] = useState({ available: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositPhone, setDepositPhone] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawDestination, setWithdrawDestination] = useState('mpesa');
  const [processing, setProcessing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      const [balanceRes] = await Promise.all([
        api.get('/ledger/balance'),
      ]);
      
      setBalance(balanceRes.data);
      
      // Mock transactions
      setTransactions([
        {
          id: '1',
          date: new Date().toISOString(),
          type: 'deposit',
          status: 'completed',
          amount: 5000,
          description: 'M-Pesa Deposit',
        },
        {
          id: '2',
          date: new Date(Date.now() - 86400000).toISOString(),
          type: 'trade',
          status: 'completed',
          amount: -1500,
          description: 'Buy SCOM (10 shares)',
        },
      ]);
    } catch (error) {
      console.error('Failed to load wallet:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || !depositPhone) {
      hapticFeedback.error();
      Alert.alert('Error', 'Please enter amount and phone number');
      return;
    }

    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      hapticFeedback.error();
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      setProcessing(true);
      const res = await api.post('/payments/mpesa/deposit', {
        phone_number: depositPhone,
        amount,
      });
      hapticFeedback.success();
      Alert.alert('Success', res.data.message || 'Deposit initiated. Check your phone for STK push.');
      setDepositAmount('');
      setDepositPhone('');
      setActiveTab('overview');
      loadWalletData(); // Refresh balance
    } catch (error: any) {
      hapticFeedback.error();
      Alert.alert('Error', error?.response?.data?.detail || 'Failed to initiate deposit');
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount) {
      hapticFeedback.error();
      Alert.alert('Error', 'Please enter withdrawal amount');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      hapticFeedback.error();
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (amount > balance.available) {
      hapticFeedback.warning();
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    Alert.alert(
      'Confirm Withdrawal',
      `Withdraw KES ${amount.toFixed(2)} to ${withdrawDestination === 'mpesa' ? 'M-Pesa' : 'Bank Account'}?`,
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => hapticFeedback.light()
        },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              setProcessing(true);
              // In production, call withdrawal API
              await new Promise(resolve => setTimeout(resolve, 1500));
              hapticFeedback.success();
              Alert.alert('Success', 'Withdrawal request submitted. Funds will be transferred within 1-3 business days.');
              setWithdrawAmount('');
              setActiveTab('overview');
              loadWalletData(); // Refresh balance
            } catch (error) {
              hapticFeedback.error();
              Alert.alert('Error', 'Failed to process withdrawal');
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWalletData();
  };

  if (loading) {
    return <LoadingState message="Loading wallet..." />;
  }

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        {(['overview', 'deposit', 'withdrawal', 'history'] as WalletTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => {
              hapticFeedback.selection();
              setActiveTab(tab);
            }}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.main} />
        }
      >
        {activeTab === 'overview' && (
          <>
            {/* Balance Card */}
            <Card variant="elevated" style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceValue}>
                KES {balance.available.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
              
              {balance.pending > 0 && (
                <View style={styles.pendingContainer}>
                  <Text style={styles.pendingLabel}>Pending</Text>
                  <Text style={styles.pendingValue}>
                    KES {balance.pending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              )}
            </Card>

            {/* Quick Actions */}
            <View style={styles.actionsGrid}>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => setActiveTab('deposit')}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.success + '20' }]}>
                  <Ionicons name="add" size={28} color={colors.success} />
                </View>
                <Text style={styles.actionText}>Deposit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => setActiveTab('withdrawal')}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.warning + '20' }]}>
                  <Ionicons name="remove" size={28} color={colors.warning} />
                </View>
                <Text style={styles.actionText}>Withdraw</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => setActiveTab('history')}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.info + '20' }]}>
                  <Ionicons name="time" size={28} color={colors.info} />
                </View>
                <Text style={styles.actionText}>History</Text>
              </TouchableOpacity>
            </View>

            {/* Recent Transactions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              <Card padding="sm">
                {transactions.slice(0, 3).map((tx) => (
                  <View key={tx.id} style={styles.transactionItem}>
                    <View style={[
                      styles.transactionIcon,
                      { backgroundColor: tx.type === 'deposit' ? colors.success + '20' : colors.error + '20' }
                    ]}>
                      <Ionicons
                        name={tx.type === 'deposit' ? 'arrow-down' : 'arrow-up'}
                        size={20}
                        color={tx.type === 'deposit' ? colors.success : colors.error}
                      />
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionDescription}>{tx.description}</Text>
                      <Text style={styles.transactionDate}>
                        {new Date(tx.date).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={[
                      styles.transactionAmount,
                      { color: tx.amount >= 0 ? colors.success : colors.error }
                    ]}>
                      {tx.amount >= 0 ? '+' : ''}KES {Math.abs(tx.amount).toLocaleString()}
                    </Text>
                  </View>
                ))}
              </Card>
            </View>
          </>
        )}

        {activeTab === 'deposit' && (
          <>
            <Card variant="elevated" style={styles.formCard}>
              <Text style={styles.formTitle}>Deposit via M-Pesa</Text>
              <Text style={styles.formSubtitle}>
                Add funds to your trading account using M-Pesa STK Push
              </Text>

              <Input
                label="Phone Number"
                placeholder="+254..."
                value={depositPhone}
                onChangeText={setDepositPhone}
                keyboardType="phone-pad"
              />

              <Input
                label="Amount (KES)"
                placeholder="Enter amount"
                value={depositAmount}
                onChangeText={setDepositAmount}
                keyboardType="numeric"
              />

              <Button
                title={processing ? 'Processing...' : 'Initiate Deposit'}
                onPress={handleDeposit}
                variant="success"
                disabled={processing}
                loading={processing}
                fullWidth
              />

              <Text style={styles.helperText}>
                Note: Test with sandbox number: 254708374149
              </Text>
            </Card>
          </>
        )}

        {activeTab === 'withdrawal' && (
          <>
            <Card variant="elevated" style={styles.formCard}>
              <Text style={styles.formTitle}>Withdraw Funds</Text>
              <Text style={styles.formSubtitle}>
                Available Balance: KES {balance.available.toLocaleString()}
              </Text>

              <Input
                label="Amount (KES)"
                placeholder="Enter amount"
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Destination</Text>
              <View style={styles.destinationContainer}>
                <TouchableOpacity
                  style={[
                    styles.destinationOption,
                    withdrawDestination === 'mpesa' && styles.destinationActive,
                  ]}
                  onPress={() => setWithdrawDestination('mpesa')}
                >
                  <Text style={styles.destinationText}>M-Pesa</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.destinationOption,
                    withdrawDestination === 'bank' && styles.destinationActive,
                  ]}
                  onPress={() => setWithdrawDestination('bank')}
                >
                  <Text style={styles.destinationText}>Bank Account</Text>
                </TouchableOpacity>
              </View>

              <Button
                title={processing ? 'Processing...' : 'Request Withdrawal'}
                onPress={handleWithdraw}
                variant="secondary"
                disabled={processing}
                loading={processing}
                fullWidth
              />

              <Text style={styles.helperText}>
                Note: Withdrawals may take 1-3 business days to process
              </Text>
            </Card>
          </>
        )}

        {activeTab === 'history' && (
          <>
            <View style={styles.filterContainer}>
              <TouchableOpacity style={styles.filterChip}>
                <Text style={styles.filterText}>Last 7 days</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterChip}>
                <Text style={styles.filterText}>Last 30 days</Text>
              </TouchableOpacity>
            </View>

            <Card padding="sm">
              {transactions.map((tx) => (
                <View key={tx.id} style={styles.transactionItem}>
                  <View style={[
                    styles.transactionIcon,
                    { backgroundColor: tx.amount >= 0 ? colors.success + '20' : colors.error + '20' }
                  ]}>
                    <Ionicons
                      name={tx.amount >= 0 ? 'arrow-down' : 'arrow-up'}
                      size={20}
                      color={tx.amount >= 0 ? colors.success : colors.error}
                    />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionDescription}>{tx.description}</Text>
                    <View style={styles.transactionMeta}>
                      <Text style={styles.transactionDate}>
                        {new Date(tx.date).toLocaleString()}
                      </Text>
                      <Badge
                        text={tx.status}
                        variant={
                          tx.status === 'completed' ? 'success' :
                          tx.status === 'pending' ? 'warning' : 'error'
                        }
                      />
                    </View>
                  </View>
                  <Text style={[
                    styles.transactionAmount,
                    { color: tx.amount >= 0 ? colors.success : colors.error }
                  ]}>
                    {tx.amount >= 0 ? '+' : ''}KES {Math.abs(tx.amount).toLocaleString()}
                  </Text>
                </View>
              ))}
            </Card>
          </>
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary.main,
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.medium,
  },
  tabTextActive: {
    color: colors.primary.main,
    fontWeight: typography.fontWeight.semibold,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.base,
  },
  balanceCard: {
    marginBottom: spacing.lg,
    alignItems: 'center',
    padding: spacing.xl,
  },
  balanceLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceValue: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  pendingContainer: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  pendingLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  pendingValue: {
    fontSize: typography.fontSize.sm,
    color: colors.warning,
    fontWeight: typography.fontWeight.semibold,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  transactionDate: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  transactionMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  transactionAmount: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  formCard: {
    marginBottom: spacing.lg,
  },
  formTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  formSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.lg,
  },
  helperText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.sm,
  },
  destinationContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  destinationOption: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.tertiary,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  destinationActive: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main + '20',
  },
  destinationText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  filterText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
});

