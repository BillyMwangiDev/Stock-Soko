import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { ProfileStackParamList } from '../navigation/types';
import { Button, Card } from '../components';
import { colors, typography, spacing } from '../theme';
import { api } from '../api/client';
import { hapticFeedback } from '../utils/haptics';

type PaymentMethodsScreenProp = StackNavigationProp<ProfileStackParamList, 'PaymentMethods'>;

interface Props {
  navigation: PaymentMethodsScreenProp;
}

interface PaymentMethod {
  id: string;
  type: 'mpesa' | 'bank';
  name: string;
  details: string;
  isDefault: boolean;
  isVerified: boolean;
}

export default function PaymentMethods({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [showAddMenu, setShowAddMenu] = useState(false);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payments/methods');
      setMethods(res.data.methods || []);
    } catch (error: any) {
      console.error('Failed to load payment methods:', error);
      
      const mockMethods: PaymentMethod[] = [
        {
          id: '1',
          type: 'mpesa',
          name: 'M-Pesa',
          details: '+254712345678',
          isDefault: true,
          isVerified: true,
        },
      ];
      setMethods(mockMethods);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      await api.put(`/payments/methods/${methodId}/default`);
      
      setMethods(prev => prev.map(m => ({
        ...m,
        isDefault: m.id === methodId
      })));
      
      hapticFeedback.success();
      Alert.alert('Success', 'Default payment method updated');
    } catch (error: any) {
      console.error('Failed to set default:', error);
      Alert.alert('Error', 'Failed to update default payment method');
    }
  };

  const handleRemove = async (methodId: string) => {
    Alert.alert(
      'Remove Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/payments/methods/${methodId}`);
              setMethods(prev => prev.filter(m => m.id !== methodId));
              hapticFeedback.success();
              Alert.alert('Success', 'Payment method removed');
            } catch (error: any) {
              console.error('Failed to remove:', error);
              Alert.alert('Error', 'Failed to remove payment method');
            }
          }
        }
      ]
    );
  };

  const handleAddMpesa = () => {
    setShowAddMenu(false);
    navigation.navigate('AddPaymentMethod' as any, { type: 'mpesa' });
  };

  const handleAddBank = () => {
    setShowAddMenu(false);
    navigation.navigate('AddPaymentMethod' as any, { type: 'bank' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <TouchableOpacity onPress={() => setShowAddMenu(!showAddMenu)} style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={24} color={colors.primary.main} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {showAddMenu && (
          <Card variant="glass" style={styles.addMenu}>
            <Text style={styles.addMenuTitle}>Add Payment Method</Text>
            
            <TouchableOpacity style={styles.addMenuItem} onPress={handleAddMpesa}>
              <View style={styles.addMenuIconContainer}>
                <Ionicons name="phone-portrait-outline" size={24} color={colors.success} />
              </View>
              <View style={styles.addMenuTextContainer}>
                <Text style={styles.addMenuItemTitle}>M-Pesa</Text>
                <Text style={styles.addMenuItemDescription}>Link your M-Pesa number</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.addMenuItem} onPress={handleAddBank}>
              <View style={styles.addMenuIconContainer}>
                <Ionicons name="business-outline" size={24} color={colors.info} />
              </View>
              <View style={styles.addMenuTextContainer}>
                <Text style={styles.addMenuItemTitle}>Bank Account</Text>
                <Text style={styles.addMenuItemDescription}>Link your bank account</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          </Card>
        )}

        {loading ? (
          <Card variant="glass" style={styles.loadingCard}>
            <Text style={styles.loadingText}>Loading payment methods...</Text>
          </Card>
        ) : methods.length === 0 ? (
          <Card variant="glass" style={styles.emptyState}>
            <Ionicons name="card-outline" size={60} color={colors.text.tertiary} />
            <Text style={styles.emptyTitle}>No Payment Methods</Text>
            <Text style={styles.emptyDescription}>
              Add a payment method to deposit and withdraw funds
            </Text>
            <Button
              title="Add Payment Method"
              onPress={() => setShowAddMenu(true)}
              variant="primary"
              size="md"
              style={styles.emptyButton}
            />
          </Card>
        ) : (
          methods.map((method) => (
            <Card key={method.id} variant="glass" style={styles.methodCard}>
              <View style={styles.methodHeader}>
                <View style={[
                  styles.methodIcon,
                  { backgroundColor: method.type === 'mpesa' ? colors.success + '20' : colors.info + '20' }
                ]}>
                  <Ionicons 
                    name={method.type === 'mpesa' ? 'phone-portrait' : 'business'} 
                    size={24} 
                    color={method.type === 'mpesa' ? colors.success : colors.info} 
                  />
                </View>
                <View style={styles.methodInfo}>
                  <View style={styles.methodTitleRow}>
                    <Text style={styles.methodName}>{method.name}</Text>
                    {method.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Default</Text>
                      </View>
                    )}
                    {method.isVerified && (
                      <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                    )}
                  </View>
                  <Text style={styles.methodDetails}>{method.details}</Text>
                </View>
              </View>

              <View style={styles.methodActions}>
                {!method.isDefault && (
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => {
                      hapticFeedback.light();
                      handleSetDefault(method.id);
                    }}
                  >
                    <Ionicons name="star-outline" size={18} color={colors.warning} />
                    <Text style={styles.actionButtonText}>Set as Default</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.removeButton]}
                  onPress={() => {
                    hapticFeedback.light();
                    handleRemove(method.id);
                  }}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                  <Text style={[styles.actionButtonText, styles.removeButtonText]}>Remove</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}

        <View style={{ height: 40 }} />
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main,
  },
  backButton: {
    padding: spacing.xs,
  },
  addButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  loadingCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  emptyDescription: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyButton: {
    marginTop: spacing.md,
  },
  addMenu: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  addMenuTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  addMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    gap: spacing.md,
  },
  addMenuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMenuTextContainer: {
    flex: 1,
  },
  addMenuItemTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  addMenuItemDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  methodCard: {
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  methodHeader: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  methodIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodInfo: {
    flex: 1,
  },
  methodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  methodName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  defaultBadge: {
    backgroundColor: colors.primary.main + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary.main,
    fontWeight: typography.fontWeight.bold,
  },
  methodDetails: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  methodActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.main,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
    backgroundColor: colors.background.secondary,
  },
  actionButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
  },
  removeButton: {
    backgroundColor: colors.error + '15',
  },
  removeButtonText: {
    color: colors.error,
  },
});