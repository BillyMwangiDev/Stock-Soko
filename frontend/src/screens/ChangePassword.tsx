import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { ProfileStackParamList } from '../navigation/types';
import { Button, Input, Card } from '../components';
import { colors, typography, spacing } from '../theme';
import { api } from '../api/client';
import { hapticFeedback } from '../utils/haptics';

type ChangePasswordScreenProp = StackNavigationProp<ProfileStackParamList, 'ChangePassword'>;

interface Props {
  navigation: ChangePasswordScreenProp;
}

export default function ChangePassword({ navigation }: Props) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('At least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('One uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('One lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('One number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('One special character');
    }

    return { valid: errors.length === 0, errors };
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      Alert.alert(
        'Weak Password',
        'Password must have:\n' + validation.errors.map(e => `• ${e}`).join('\n')
      );
      return;
    }

    try {
      setLoading(true);
      
      await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });

      hapticFeedback.success();
      Alert.alert(
        'Success',
        'Your password has been changed successfully. Please login again with your new password.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Failed to change password:', error);
      hapticFeedback.error();
      
      const errorMessage = error?.response?.data?.detail || 'Failed to change password';
      Alert.alert('Change Password Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (password: string): { strength: string; color: string; percent: number } => {
    if (!password) return { strength: '', color: colors.text.disabled, percent: 0 };
    
    const validation = validatePassword(password);
    const score = 5 - validation.errors.length;
    
    if (score === 5) return { strength: 'Strong', color: colors.success, percent: 100 };
    if (score === 4) return { strength: 'Good', color: colors.info, percent: 75 };
    if (score === 3) return { strength: 'Fair', color: colors.warning, percent: 50 };
    return { strength: 'Weak', color: colors.error, percent: 25 };
  };

  const newPasswordStrength = passwordStrength(newPassword);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Card variant="glass" style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="shield-checkmark-outline" size={24} color={colors.primary.main} />
            <Text style={styles.infoTitle}>Password Security</Text>
          </View>
          <Text style={styles.infoText}>
            Choose a strong password to keep your account secure. Never share your password with anyone.
          </Text>
        </Card>

        <Card variant="glass" style={styles.formCard}>
          <Input
            label="Current Password"
            placeholder="Enter current password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry={!showCurrent}
            rightIcon={
              <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                <Ionicons 
                  name={showCurrent ? 'eye-off-outline' : 'eye-outline'} 
                  size={20} 
                  color={colors.text.tertiary} 
                />
              </TouchableOpacity>
            }
          />

          <View style={styles.divider} />

          <Input
            label="New Password"
            placeholder="Enter new password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNew}
            rightIcon={
              <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                <Ionicons 
                  name={showNew ? 'eye-off-outline' : 'eye-outline'} 
                  size={20} 
                  color={colors.text.tertiary} 
                />
              </TouchableOpacity>
            }
          />

          {newPassword.length > 0 && (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthHeader}>
                <Text style={styles.strengthLabel}>Password Strength:</Text>
                <Text style={[styles.strengthValue, { color: newPasswordStrength.color }]}>
                  {newPasswordStrength.strength}
                </Text>
              </View>
              <View style={styles.strengthBar}>
                <View 
                  style={[
                    styles.strengthFill, 
                    { 
                      width: `${newPasswordStrength.percent}%`,
                      backgroundColor: newPasswordStrength.color 
                    }
                  ]} 
                />
              </View>
              <View style={styles.requirementsList}>
                <RequirementItem text="At least 8 characters" met={newPassword.length >= 8} />
                <RequirementItem text="One uppercase letter" met={/[A-Z]/.test(newPassword)} />
                <RequirementItem text="One lowercase letter" met={/[a-z]/.test(newPassword)} />
                <RequirementItem text="One number" met={/[0-9]/.test(newPassword)} />
                <RequirementItem text="One special character" met={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)} />
              </View>
            </View>
          )}

          <Input
            label="Confirm New Password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirm}
            rightIcon={
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                <Ionicons 
                  name={showConfirm ? 'eye-off-outline' : 'eye-outline'} 
                  size={20} 
                  color={colors.text.tertiary} 
                />
              </TouchableOpacity>
            }
          />

          {confirmPassword.length > 0 && (
            <View style={styles.matchIndicator}>
              {newPassword === confirmPassword ? (
                <View style={styles.matchSuccess}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  <Text style={styles.matchText}>Passwords match</Text>
                </View>
              ) : (
                <View style={styles.matchError}>
                  <Ionicons name="close-circle" size={16} color={colors.error} />
                  <Text style={styles.matchTextError}>Passwords do not match</Text>
                </View>
              )}
            </View>
          )}
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            variant="outline"
            size="lg"
            fullWidth
            style={styles.cancelButton}
          />
          
          <Button
            title="Change Password"
            onPress={handleChangePassword}
            loading={loading}
            variant="primary"
            size="lg"
            fullWidth
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function RequirementItem({ text, met }: { text: string; met: boolean }) {
  return (
    <View style={styles.requirementItem}>
      <Ionicons 
        name={met ? 'checkmark-circle' : 'ellipse-outline'} 
        size={14} 
        color={met ? colors.success : colors.text.disabled} 
      />
      <Text style={[styles.requirementText, met && styles.requirementMet]}>{text}</Text>
    </View>
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
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
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
  infoCard: {
    marginBottom: spacing.lg,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  formCard: {
    gap: spacing.md,
  },
  disabledInput: {
    opacity: 0.6,
    backgroundColor: colors.background.secondary,
  },
  helperText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: -spacing.sm,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.main,
    marginVertical: spacing.sm,
  },
  strengthContainer: {
    gap: spacing.sm,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  strengthLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  strengthValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  strengthBar: {
    height: 6,
    backgroundColor: colors.background.secondary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 3,
    transition: 'width 0.3s ease',
  },
  requirementsList: {
    gap: spacing.xs,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  requirementText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.disabled,
  },
  requirementMet: {
    color: colors.success,
  },
  matchIndicator: {
    marginTop: -spacing.sm,
  },
  matchSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  matchError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  matchText: {
    fontSize: typography.fontSize.sm,
    color: colors.success,
  },
  matchTextError: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
  },
  buttonContainer: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  cancelButton: {
    marginBottom: 0,
  },
});