import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { ProfileStackParamList } from '../navigation/types';
import { Button, Input, Card } from '../components';
import { colors, typography, spacing } from '../theme';
import { api } from '../api/client';
import { logout } from '../store/auth';
import { hapticFeedback } from '../utils/haptics';

type DeleteAccountScreenProp = StackNavigationProp<ProfileStackParamList, 'DeleteAccount'>;

interface Props {
  navigation: DeleteAccountScreenProp;
}

export default function DeleteAccount({ navigation }: Props) {
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [acknowledged, setAcknowledged] = useState({
    dataLoss: false,
    permanent: false,
    settleObligations: false,
  });

  const allAcknowledged = acknowledged.dataLoss && acknowledged.permanent && acknowledged.settleObligations;

  const handleDeleteAccount = async () => {
    if (!password) {
      Alert.alert('Error', 'Please enter your password to confirm');
      return;
    }

    if (confirmText.toUpperCase() !== 'DELETE') {
      Alert.alert('Error', 'Please type DELETE to confirm account deletion');
      return;
    }

    if (!allAcknowledged) {
      Alert.alert('Error', 'Please acknowledge all warnings before proceeding');
      return;
    }

    Alert.alert(
      'Final Confirmation',
      'This action is PERMANENT and CANNOT be undone. Are you absolutely sure you want to delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete My Account',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);

              await api.post('/auth/delete-account', {
                password,
                confirmation: 'DELETE',
              });

              hapticFeedback.success();
              
              await logout();

              Alert.alert(
                'Account Deleted',
                'Your account has been permanently deleted. We are sorry to see you go.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      if (typeof window !== 'undefined') {
                        window.location.reload();
                      }
                    }
                  }
                ]
              );
            } catch (error: any) {
              console.error('Failed to delete account:', error);
              hapticFeedback.error();
              
              const errorMessage = error?.response?.data?.detail || 'Failed to delete account';
              Alert.alert('Deletion Failed', errorMessage);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delete Account</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Card variant="glass" style={styles.warningCard}>
          <View style={styles.warningIcon}>
            <Ionicons name="warning" size={64} color={colors.error} />
          </View>
          <Text style={styles.warningTitle}>Permanent Account Deletion</Text>
          <Text style={styles.warningDescription}>
            This action is irreversible. Once your account is deleted, all your data will be permanently removed and cannot be recovered.
          </Text>
        </Card>

        <Card variant="glass" style={styles.consequencesCard}>
          <Text style={styles.consequencesTitle}>What will be deleted:</Text>
          
          <ConsequenceItem 
            icon="person-outline"
            text="Your profile and personal information"
          />
          <ConsequenceItem 
            icon="wallet-outline"
            text="All portfolio holdings and transaction history"
          />
          <ConsequenceItem 
            icon="time-outline"
            text="Trade history and tax reports"
          />
          <ConsequenceItem 
            icon="notifications-outline"
            text="Watchlist, alerts, and preferences"
          />
          <ConsequenceItem 
            icon="chatbubbles-outline"
            text="AI chat history and recommendations"
          />
          <ConsequenceItem 
            icon="school-outline"
            text="Educational progress and achievements"
          />
        </Card>

        <Card variant="glass" style={styles.checklistCard}>
          <Text style={styles.checklistTitle}>Before you proceed:</Text>
          
          <ChecklistItem
            checked={acknowledged.dataLoss}
            onToggle={() => setAcknowledged(prev => ({ ...prev, dataLoss: !prev.dataLoss }))}
            text="I understand that all my data will be permanently deleted"
          />
          <ChecklistItem
            checked={acknowledged.permanent}
            onToggle={() => setAcknowledged(prev => ({ ...prev, permanent: !prev.permanent }))}
            text="I understand this action is permanent and cannot be undone"
          />
          <ChecklistItem
            checked={acknowledged.settleObligations}
            onToggle={() => setAcknowledged(prev => ({ ...prev, settleObligations: !prev.settleObligations }))}
            text="I have settled all pending trades and withdrawn my funds"
          />
        </Card>

        <Card variant="glass" style={styles.confirmCard}>
          <Text style={styles.confirmTitle}>Confirm Account Deletion</Text>
          
          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <View style={styles.confirmTextContainer}>
            <Text style={styles.confirmLabel}>
              Type <Text style={styles.confirmKeyword}>DELETE</Text> to confirm:
            </Text>
            <Input
              placeholder="DELETE"
              value={confirmText}
              onChangeText={setConfirmText}
              autoCapitalize="characters"
              style={styles.confirmInput}
            />
          </View>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            variant="outline"
            size="lg"
            fullWidth
          />
          
          <Button
            title="Delete My Account Permanently"
            onPress={handleDeleteAccount}
            loading={loading}
            variant="error"
            size="lg"
            fullWidth
            disabled={!allAcknowledged || !password || confirmText.toUpperCase() !== 'DELETE'}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function ConsequenceItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={consequenceStyles.item}>
      <Ionicons name={icon as any} size={20} color={colors.error} />
      <Text style={consequenceStyles.text}>{text}</Text>
    </View>
  );
}

const consequenceStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  text: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});

function ChecklistItem({ checked, onToggle, text }: { checked: boolean; onToggle: () => void; text: string }) {
  return (
    <TouchableOpacity 
      style={checklistStyles.item}
      onPress={() => {
        hapticFeedback.light();
        onToggle();
      }}
      activeOpacity={0.7}
    >
      <Ionicons 
        name={checked ? 'checkbox' : 'square-outline'} 
        size={24} 
        color={checked ? colors.primary.main : colors.text.disabled} 
      />
      <Text style={checklistStyles.text}>{text}</Text>
    </TouchableOpacity>
  );
}

const checklistStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  text: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    lineHeight: 20,
  },
});

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
  warningCard: {
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.error + '30',
  },
  warningIcon: {
    marginBottom: spacing.md,
  },
  warningTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  warningDescription: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  consequencesCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  consequencesTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  checklistCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  checklistTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  confirmCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  confirmTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  confirmTextContainer: {
    gap: spacing.xs,
  },
  confirmLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  confirmKeyword: {
    fontWeight: typography.fontWeight.bold,
    color: colors.error,
    fontFamily: 'monospace',
  },
  confirmInput: {
    fontFamily: 'monospace',
    fontWeight: typography.fontWeight.bold,
  },
  buttonContainer: {
    gap: spacing.md,
  },
});