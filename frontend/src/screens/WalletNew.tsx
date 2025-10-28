import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, RefreshControl, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme';
import { Card, Button, Input, Badge, LoadingState } from '../components';
import { api } from '../api/client';
import { getBrokerAccounts, initiateDeposit, type BrokerAccount } from '../api/broker';
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

export default function WalletNew() {
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
  
  // Broker accounts state
  const [brokerAccounts, setBrokerAccounts] = useState<BrokerAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [showAccountSelector, setShowAccountSelector] = useState(false);

  useEffect(() => {
    loadWalletData();
    loadBrokerAccounts();
  }, []);

  const loadBrokerAccounts = async () => {
    try {
      const accounts = await getBrokerAccounts();
      setBrokerAccounts(accounts);
      
      // Auto-select primary account
      const primaryAccount = accounts.find(acc => acc.is_primary);
      if (primaryAccount && !selectedAccount) {
        setSelectedAccount(primaryAccount.account_id);
      }
    } catch (error) {
      console.error('Failed to load broker accounts:', error);
    }
  };

  const loadWalletData = async () => {
    try {
      const [balanceRes, transactionsRes] = await Promise.all([
        api.get('/ledger/balance'),
        api.get('/payments/transactions').catch(() => ({ data: { transactions: [] } })),
      ]);
      
      setBalance({
        available: balanceRes.data.available_balance || 0,
        pending: balanceRes.data.pending_balance || 0,
      });
      
      // Process transaction history
      const txns = transactionsRes.data.transactions || [];
      const processedTxns: Transaction[] = txns.map((tx: any) => ({
        id: tx.id || tx.transaction_id || Math.random().toString(),
        date: tx.created_at || tx.date || new Date().toISOString(),
        type: tx.type || 'deposit',
        status: (tx.status || 'completed').toLowerCase() as 'pending' | 'completed' | 'failed',
        amount: tx.amount || 0,
        description: tx.description || tx.notes || `${tx.type}`,
      }));
      
      setTransactions(processedTxns);
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

    if (amount < 1) {
      hapticFeedback.error();
      Alert.alert('Error', 'Minimum deposit amount is KES 1');
      return;
    }

    if (amount > 150000) {
      hapticFeedback.error();
      Alert.alert('Error', 'Maximum deposit amount is KES 150,000');
      return;
    }

    try {
      setProcessing(true);
      
      const selectedAccountData = brokerAccounts.find(acc => acc.account_id === selectedAccount);
      
      const res = await initiateDeposit({
        phone_number: depositPhone,
        amount,
        account_id: selectedAccount || undefined
      });
      
      hapticFeedback.success();
      
      const accountName = selectedAccountData?.broker_name || 'your account';
      Alert.alert(
        'Success!', 
        `${res.message}\n\nFunds will be credited to: ${accountName}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setDepositAmount('');
              setDepositPhone('');
              setActiveTab('overview');
              loadWalletData();
              loadBrokerAccounts();
            }
          }
        ]
      );
    } catch (error: any) {
      hapticFeedback.error();
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          'Failed to initiate deposit';
      Alert.alert('Error', errorMessage);
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
              const res = await api.post('/payments/mpesa/withdraw', {
                amount,
                destination: withdrawDestination,
              });
              hapticFeedback.success();
              Alert.alert('Success', res.data.message || 'Withdrawal request submitted');
              setWithdrawAmount('');
              setActiveTab('overview');
              loadWalletData();
              loadBrokerAccounts();
            } catch (error: any) {
              hapticFeedback.error();
              const errorMsg = error?.response?.data?.detail || 'Failed to process withdrawal';
              Alert.alert('Error', errorMsg);
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
    loadBrokerAccounts();
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
            {/* Broker Accounts Balance */}
            {brokerAccounts.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Broker Accounts</Text>
                {brokerAccounts.map((account) => (
                  <Card key={account.account_id} padding="md" style={styles.accountCard}>
                    <View style={styles.accountHeader}>
                      <View>
                        <Text style={styles.brokerName}>{account.broker_name}</Text>
                        {account.is_primary && (
                          <Badge variant="primary" text="Primary" style={styles.primaryBadge} />
                        )}
                      </View>
                      <Ionicons name="business" size={24} color={colors.primary.main} />
                    </View>
                    <View style={styles.balanceRow}>
                      <Text style={styles.balanceLabel}>Available</Text>
                      <Text style={styles.balanceAmount}>
                        KES {account.available_balance.toLocaleString()}
                      </Text>
                    </View>
                    {account.reserved_balance > 0 && (
                      <View style={styles.balanceRow}>
                        <Text style={styles.balanceLabel}>Reserved</Text>
                        <Text style={styles.balanceReserved}>
                          KES {account.reserved_balance.toLocaleString()}
                        </Text>
                      </View>
                    )}
                  </Card>
                ))}
              </View>
            )}

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
          </>
        )}

        {activeTab === 'deposit' && (
          <Card variant="elevated" style={styles.formCard}>
            <Text style={styles.formTitle}>Deposit via M-Pesa</Text>
            <Text style={styles.formSubtitle}>
              Add funds to your trading account using M-Pesa STK Push
            </Text>

            {/* Broker Account Selector */}
            {brokerAccounts.length > 0 && (
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Deposit To</Text>
                <TouchableOpacity 
                  style={styles.accountSelector}
                  onPress={() => {
                    hapticFeedback.light();
                    setShowAccountSelector(true);
                  }}
                >
                  <View style={styles.accountSelectorContent}>
                    <View>
                      <Text style={styles.accountSelectorLabel}>
                        {selectedAccount 
                          ? brokerAccounts.find(acc => acc.account_id === selectedAccount)?.broker_name || 'Select Account'
                          : 'Select Account'
                        }
                      </Text>
                      {selectedAccount && (
                        <Text style={styles.accountSelectorBalance}>
                          Balance: KES {(brokerAccounts.find(acc => acc.account_id === selectedAccount)?.available_balance || 0).toLocaleString()}
                        </Text>
                      )}
                    </View>
                    <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
                  </View>
                </TouchableOpacity>
              </View>
            )}

            <Input
              label="Phone Number"
              placeholder="0712 345 678"
              value={depositPhone}
              onChangeText={setDepositPhone}
              keyboardType="phone-pad"
            />

            <Input
              label="Amount (KES)"
              placeholder="Enter amount (Min: 1, Max: 150,000)"
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
              Test with sandbox number: 254708374149
            </Text>
          </Card>
        )}

        {activeTab === 'withdrawal' && (
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

            <Button
              title={processing ? 'Processing...' : 'Request Withdrawal'}
              onPress={handleWithdraw}
              variant="secondary"
              disabled={processing}
              loading={processing}
              fullWidth
            />

            <Text style={styles.helperText}>
              Withdrawals may take 1-3 business days to process
            </Text>
          </Card>
        )}

        {activeTab === 'history' && (
          <View>
            <Text style={styles.sectionTitle}>Transaction History</Text>
            {transactions.map((tx) => (
              <Card key={tx.id} padding="md" style={styles.transactionCard}>
                <View style={styles.transactionRow}>
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
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Account Selector Modal */}
      <Modal
        visible={showAccountSelector}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAccountSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Broker Account</Text>
              <TouchableOpacity onPress={() => setShowAccountSelector(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            {brokerAccounts.map((account) => (
              <TouchableOpacity
                key={account.account_id}
                style={[
                  styles.accountOption,
                  selectedAccount === account.account_id && styles.accountOptionSelected
                ]}
                onPress={() => {
                  setSelectedAccount(account.account_id);
                  setShowAccountSelector(false);
                  hapticFeedback.selection();
                }}
              >
                <View>
                  <Text style={styles.accountOptionName}>{account.broker_name}</Text>
                  <Text style={styles.accountOptionBalance}>
                    KES {account.available_balance.toLocaleString()}
                  </Text>
                </View>
                {account.is_primary && (
                  <Badge variant="primary" text="Primary" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  tab: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary.main,
  },
  tabText: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  tabTextActive: {
    ...typography.subtitle2,
    color: colors.primary.main,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h6,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  accountCard: {
    marginBottom: spacing.sm,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  brokerName: {
    ...typography.subtitle1,
    color: colors.text.primary,
  },
  primaryBadge: {
    marginTop: spacing.xs,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  balanceLabel: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  balanceAmount: {
    ...typography.subtitle1,
    color: colors.success,
  },
  balanceReserved: {
    ...typography.subtitle2,
    color: colors.warning,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  actionText: {
    ...typography.caption,
    color: colors.text.primary,
  },
  formCard: {
    marginBottom: spacing.lg,
  },
  formTitle: {
    ...typography.h6,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  formSubtitle: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.subtitle2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  accountSelector: {
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    backgroundColor: colors.background.paper,
  },
  accountSelectorContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountSelectorLabel: {
    ...typography.body1,
    color: colors.text.primary,
  },
  accountSelectorBalance: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  helperText: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  transactionCard: {
    marginBottom: spacing.sm,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    ...typography.body1,
    color: colors.text.primary,
  },
  transactionDate: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  transactionAmount: {
    ...typography.subtitle1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.paper,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.h6,
    color: colors.text.primary,
  },
  accountOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    backgroundColor: colors.background.default,
  },
  accountOptionSelected: {
    backgroundColor: colors.primary.main + '10',
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  accountOptionName: {
    ...typography.subtitle1,
    color: colors.text.primary,
  },
  accountOptionBalance: {
    ...typography.caption,
    color: colors.text.secondary,
  },
});

