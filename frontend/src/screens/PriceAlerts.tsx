/**
 * Price Alerts Screen
 * Manage price alerts for stocks
 */
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { ProfileStackParamList } from '../navigation/types';
import { colors, typography, spacing, borderRadius } from '../theme';
import { Card, Button, LoadingState } from '../components';
import { api } from '../api/client';

type PriceAlertsScreenProp = StackNavigationProp<ProfileStackParamList, 'PriceAlerts'>;

interface Props {
  navigation: PriceAlertsScreenProp;
}

interface PriceAlert {
  id: string;
  symbol: string;
  name: string;
  alertType: 'above' | 'below' | 'change_pct' | 'volume';
  targetValue: number;
  currentPrice?: number;
  isActive: boolean;
  createdAt: string;
}

export default function PriceAlerts({ navigation }: Props) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [popularStocks, setPopularStocks] = useState<any[]>([]);

  // Create alert form state
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [alertType, setAlertType] = useState<'above' | 'below' | 'change_pct' | 'volume'>('above');
  const [targetValue, setTargetValue] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadAlerts();
    loadPopularStocks();
  }, []);

  const loadAlerts = async () => {
    try {
      // For now, using mock data. Replace with API call when backend is ready
      // const res = await api.get('/alerts');
      // setAlerts(res.data.alerts);
      
      // Mock data for demonstration
      const mockAlerts: PriceAlert[] = [
        {
          id: '1',
          symbol: 'SCOM',
          name: 'Safaricom',
          alertType: 'above',
          targetValue: 45.0,
          currentPrice: 42.5,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          symbol: 'KCB',
          name: 'KCB Group',
          alertType: 'below',
          targetValue: 30.0,
          currentPrice: 32.5,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ];
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPopularStocks = async () => {
    try {
      const res = await api.get('/markets/stocks');
      const stocks = (res.data.stocks || []).map((s: any) => ({
        ...s,
        change_pct: s.change_percent
      }));
      setPopularStocks(stocks.slice(0, 6));
    } catch (error) {
      console.error('Failed to load stocks:', error);
    }
  };

  const handleCreateAlert = async () => {
    if (!selectedSymbol || !targetValue) {
      Alert.alert('Error', 'Please select a stock and enter a target value');
      return;
    }

    const value = parseFloat(targetValue);
    if (isNaN(value) || value <= 0) {
      Alert.alert('Error', 'Please enter a valid target value');
      return;
    }

    try {
      setCreating(true);
      // API call when backend is ready
      // await api.post('/alerts', {
      //   symbol: selectedSymbol,
      //   alert_type: alertType,
      //   target_value: value,
      // });

      // Mock success
      const newAlert: PriceAlert = {
        id: Date.now().toString(),
        symbol: selectedSymbol,
        name: selectedName,
        alertType,
        targetValue: value,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      setAlerts(prev => [newAlert, ...prev]);
      setShowCreateModal(false);
      resetForm();
      Alert.alert('Success', 'Price alert created! You\'ll be notified when conditions are met.');
    } catch (error: any) {
      console.error('Failed to create alert:', error);
      Alert.alert('Error', error?.response?.data?.detail || 'Failed to create alert');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAlert = (alertId: string) => {
    Alert.alert(
      'Delete Alert',
      'Are you sure you want to delete this alert?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // await api.delete(`/alerts/${alertId}`);
              setAlerts(prev => prev.filter(a => a.id !== alertId));
            } catch (error) {
              console.error('Failed to delete alert:', error);
              Alert.alert('Error', 'Failed to delete alert');
            }
          },
        },
      ]
    );
  };

  const handleToggleAlert = async (alertId: string, currentStatus: boolean) => {
    try {
      // await api.patch(`/alerts/${alertId}`, { is_active: !currentStatus });
      setAlerts(prev =>
        prev.map(alert =>
          alert.id === alertId ? { ...alert, isActive: !currentStatus } : alert
        )
      );
    } catch (error) {
      console.error('Failed to toggle alert:', error);
      Alert.alert('Error', 'Failed to update alert');
    }
  };

  const resetForm = () => {
    setSelectedSymbol('');
    setSelectedName('');
    setAlertType('above');
    setTargetValue('');
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'above': return 'arrow-up-circle';
      case 'below': return 'arrow-down-circle';
      case 'change_pct': return 'trending-up';
      case 'volume': return 'pulse';
      default: return 'notifications';
    }
  };

  const getAlertDescription = (alert: PriceAlert) => {
    switch (alert.alertType) {
      case 'above':
        return `Alert when price goes above KES ${alert.targetValue}`;
      case 'below':
        return `Alert when price drops below KES ${alert.targetValue}`;
      case 'change_pct':
        return `Alert when price changes by ${alert.targetValue}%`;
      case 'volume':
        return `Alert when volume exceeds ${alert.targetValue}M shares`;
      default:
        return 'Custom alert';
    }
  };

  if (loading) {
    return <LoadingState message="Loading alerts..." />;
  }

  return (
    <View style={styles.container}>      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Price Alerts</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowCreateModal(true)}>
          <Ionicons name="add-circle" size={28} color={colors.primary.main} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Active Alerts Count */}
        <Card variant="glass" style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Ionicons name="notifications" size={24} color={colors.primary.main} />
              <Text style={styles.summaryValue}>{alerts.filter(a => a.isActive).length}</Text>
              <Text style={styles.summaryLabel}>Active Alerts</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Ionicons name="time" size={24} color={colors.text.tertiary} />
              <Text style={styles.summaryValue}>{alerts.length}</Text>
              <Text style={styles.summaryLabel}>Total Created</Text>
            </View>
          </View>
        </Card>

        {/* Info Banner */}
        <Card variant="outline" style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color={colors.info} />
          <Text style={styles.infoText}>
            You'll receive push notifications when your alert conditions are met.
          </Text>
        </Card>

        {/* Alerts List */}
        {alerts.length === 0 ? (
          <Card variant="outline" style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={48} color={colors.text.tertiary} />
            <Text style={styles.emptyTitle}>No Price Alerts</Text>
            <Text style={styles.emptyText}>
              Create alerts to get notified about price changes
            </Text>
            <Button
              title="Create First Alert"
              onPress={() => setShowCreateModal(true)}
              variant="primary"
              style={styles.emptyButton}
            />
          </Card>
        ) : (
          alerts.map((alert) => (
            <Card key={alert.id} variant="glass" style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <View style={styles.alertInfo}>
                  <View style={styles.alertIconContainer}>
                    <Ionicons
                      name={getAlertIcon(alert.alertType) as any}
                      size={24}
                      color={alert.alertType === 'above' ? colors.success : colors.error}
                    />
                  </View>
                  <View style={styles.alertDetails}>
                    <Text style={styles.alertSymbol}>{alert.symbol}</Text>
                    <Text style={styles.alertName}>{alert.name}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.toggleButton}
                  onPress={() => handleToggleAlert(alert.id, alert.isActive)}
                >
                  <Ionicons
                    name={alert.isActive ? 'toggle' : 'toggle-outline'}
                    size={32}
                    color={alert.isActive ? colors.success : colors.text.disabled}
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.alertDescription}>{getAlertDescription(alert)}</Text>

              {alert.currentPrice && (
                <View style={styles.alertPriceRow}>
                  <Text style={styles.alertPriceLabel}>Current Price:</Text>
                  <Text style={styles.alertPriceValue}>KES {alert.currentPrice.toFixed(2)}</Text>
                </View>
              )}

              <View style={styles.alertFooter}>
                <Text style={styles.alertDate}>
                  Created {new Date(alert.createdAt).toLocaleDateString()}
                </Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteAlert(alert.id)}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Create Alert Modal */}
      <Modal
        visible={showCreateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Price Alert</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Stock Selection */}
              <Text style={styles.formLabel}>Select Stock</Text>
              <View style={styles.stockGrid}>
                {popularStocks.map((stock) => (
                  <TouchableOpacity
                    key={stock.symbol}
                    style={[
                      styles.stockChip,
                      selectedSymbol === stock.symbol && styles.stockChipSelected,
                    ]}
                    onPress={() => {
                      setSelectedSymbol(stock.symbol);
                      setSelectedName(stock.name);
                    }}
                  >
                    <Text
                      style={[
                        styles.stockChipText,
                        selectedSymbol === stock.symbol && styles.stockChipTextSelected,
                      ]}
                    >
                      {stock.symbol}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Alert Type */}
              <Text style={styles.formLabel}>Alert Type</Text>
              <View style={styles.alertTypeRow}>
                <TouchableOpacity
                  style={[styles.alertTypeChip, alertType === 'above' && styles.alertTypeChipSelected]}
                  onPress={() => setAlertType('above')}
                >
                  <Ionicons name="arrow-up" size={16} color={alertType === 'above' ? colors.success : colors.text.secondary} />
                  <Text style={[styles.alertTypeText, alertType === 'above' && styles.alertTypeTextSelected]}>
                    Above
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.alertTypeChip, alertType === 'below' && styles.alertTypeChipSelected]}
                  onPress={() => setAlertType('below')}
                >
                  <Ionicons name="arrow-down" size={16} color={alertType === 'below' ? colors.error : colors.text.secondary} />
                  <Text style={[styles.alertTypeText, alertType === 'below' && styles.alertTypeTextSelected]}>
                    Below
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.alertTypeChip, alertType === 'change_pct' && styles.alertTypeChipSelected]}
                  onPress={() => setAlertType('change_pct')}
                >
                  <Ionicons name="trending-up" size={16} color={alertType === 'change_pct' ? colors.primary.main : colors.text.secondary} />
                  <Text style={[styles.alertTypeText, alertType === 'change_pct' && styles.alertTypeTextSelected]}>
                    Change %
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Target Value */}
              <Text style={styles.formLabel}>
                {alertType === 'change_pct' ? 'Percentage Change' : 'Target Price (KES)'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={alertType === 'change_pct' ? 'e.g. 5' : 'e.g. 45.00'}
                placeholderTextColor={colors.text.disabled}
                value={targetValue}
                onChangeText={setTargetValue}
                keyboardType="decimal-pad"
              />

              {selectedSymbol && (
                <View style={styles.previewBox}>
                  <Text style={styles.previewText}>
                    Alert: {selectedSymbol} price{' '}
                    {alertType === 'above' ? 'goes above' : alertType === 'below' ? 'drops below' : 'changes by'}{' '}
                    {alertType === 'change_pct' ? `${targetValue}%` : `KES ${targetValue}`}
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setShowCreateModal(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title={creating ? 'Creating...' : 'Create Alert'}
                onPress={handleCreateAlert}
                variant="primary"
                style={styles.modalButton}
                disabled={creating || !selectedSymbol || !targetValue}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  summaryCard: {
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  summaryDivider: {
    width: 1,
    height: 60,
    backgroundColor: colors.border.main,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyButton: {
    minWidth: 200,
  },
  alertCard: {
    marginBottom: spacing.md,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  alertInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  alertDetails: {
    flex: 1,
  },
  alertSymbol: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  alertName: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  toggleButton: {
    padding: spacing.xs,
  },
  alertDescription: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  alertPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.main + '40',
    marginBottom: spacing.sm,
  },
  alertPriceLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  alertPriceValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertDate: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deleteText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    fontWeight: typography.fontWeight.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  modalScroll: {
    maxHeight: 500,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  formLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  stockGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  stockChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.main,
    backgroundColor: colors.background.secondary,
  },
  stockChipSelected: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main + '20',
  },
  stockChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  stockChipTextSelected: {
    color: colors.primary.main,
    fontWeight: typography.fontWeight.bold,
  },
  alertTypeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  alertTypeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.main,
    backgroundColor: colors.background.secondary,
  },
  alertTypeChipSelected: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main + '20',
  },
  alertTypeText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  alertTypeTextSelected: {
    color: colors.primary.main,
    fontWeight: typography.fontWeight.bold,
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.main,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  previewBox: {
    backgroundColor: colors.background.tertiary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.main,
  },
  previewText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.main,
  },
  modalButton: {
    flex: 1,
  },
});