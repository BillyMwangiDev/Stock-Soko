import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { ProfileStackParamList } from '../navigation/types';
import { Button, Input, Card } from '../components';
import { colors, typography, spacing } from '../theme';
import { api } from '../api/client';
import { hapticFeedback } from '../utils/haptics';

type TwoFactorSetupScreenProp = StackNavigationProp<ProfileStackParamList, 'TwoFactorSetup'>;

interface Props {
  navigation: TwoFactorSetupScreenProp;
}

export default function TwoFactorSetup({ navigation }: Props) {
  const [step, setStep] = useState<'info' | 'setup' | 'verify'>('info');
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const handleStartSetup = async () => {
    try {
      setLoading(true);
      
      const res = await api.post('/auth/2fa/setup');
      
      setQrCodeUrl(res.data.qr_code_url);
      setSecret(res.data.secret);
      setBackupCodes(res.data.backup_codes || []);
      setStep('setup');
    } catch (error: any) {
      console.error('Failed to setup 2FA:', error);
      Alert.alert('Error', error?.response?.data?.detail || 'Failed to initialize 2FA setup');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter a 6-digit code');
      return;
    }

    try {
      setLoading(true);
      
      await api.post('/auth/2fa/verify', {
        code: verificationCode,
        secret,
      });

      hapticFeedback.success();
      setStep('verify');
    } catch (error: any) {
      console.error('Failed to verify 2FA:', error);
      hapticFeedback.error();
      Alert.alert('Verification Failed', 'Invalid code. Please try again.');
      setVerificationCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    Alert.alert(
      'Success',
      'Two-factor authentication has been enabled successfully!',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const renderInfoStep = () => (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
      <Card variant="glass" style={styles.card}>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark" size={64} color={colors.primary.main} />
        </View>
        
        <Text style={styles.cardTitle}>Secure Your Account</Text>
        <Text style={styles.cardDescription}>
          Two-factor authentication adds an extra layer of security to your account by requiring a verification code in addition to your password.
        </Text>

        <View style={styles.benefitsList}>
          <BenefitItem 
            icon="lock-closed-outline" 
            text="Protect against unauthorized access"
          />
          <BenefitItem 
            icon="shield-outline" 
            text="Secure your trades and funds"
          />
          <BenefitItem 
            icon="key-outline" 
            text="Compatible with Google Authenticator, Authy, etc."
          />
        </View>
      </Card>

      <Button
        title="Enable Two-Factor Authentication"
        onPress={handleStartSetup}
        loading={loading}
        variant="primary"
        size="lg"
        fullWidth
      />

      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelText}>Maybe Later</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderSetupStep = () => (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
      <Card variant="glass" style={styles.card}>
        <Text style={styles.stepTitle}>Step 1: Scan QR Code</Text>
        <Text style={styles.stepDescription}>
          Open your authenticator app (Google Authenticator, Authy, etc.) and scan this QR code:
        </Text>

        {qrCodeUrl && (
          <View style={styles.qrContainer}>
            <Image 
              source={{ uri: qrCodeUrl }} 
              style={styles.qrCode}
              resizeMode="contain"
            />
          </View>
        )}

        <Text style={styles.manualEntryLabel}>Or enter this code manually:</Text>
        <View style={styles.secretContainer}>
          <Text style={styles.secretText}>{secret}</Text>
          <TouchableOpacity onPress={() => {
            hapticFeedback.light();
            Alert.alert('Copied', 'Secret key copied to clipboard');
          }}>
            <Ionicons name="copy-outline" size={20} color={colors.primary.main} />
          </TouchableOpacity>
        </View>
      </Card>

      <Card variant="glass" style={styles.card}>
        <Text style={styles.stepTitle}>Step 2: Enter Verification Code</Text>
        <Text style={styles.stepDescription}>
          Enter the 6-digit code from your authenticator app:
        </Text>

        <Input
          placeholder="000000"
          value={verificationCode}
          onChangeText={(text) => setVerificationCode(text.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          maxLength={6}
          style={styles.codeInput}
        />
      </Card>

      <Button
        title="Verify & Enable 2FA"
        onPress={handleVerify}
        loading={loading}
        variant="primary"
        size="lg"
        fullWidth
        disabled={verificationCode.length !== 6}
      />

      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderVerifyStep = () => (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
      <Card variant="glass" style={styles.successCard}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={80} color={colors.success} />
        </View>
        <Text style={styles.successTitle}>2FA Enabled Successfully!</Text>
        <Text style={styles.successDescription}>
          Your account is now protected with two-factor authentication.
        </Text>
      </Card>

      <Card variant="glass" style={styles.card}>
        <View style={styles.backupCodesHeader}>
          <Ionicons name="key-outline" size={24} color={colors.warning} />
          <Text style={styles.backupCodesTitle}>Backup Codes</Text>
        </View>
        <Text style={styles.backupCodesDescription}>
          Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
        </Text>

        <View style={styles.backupCodesList}>
          {backupCodes.map((code, index) => (
            <View key={index} style={styles.backupCodeItem}>
              <Text style={styles.backupCodeNumber}>{index + 1}.</Text>
              <Text style={styles.backupCode}>{code}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.copyButton}
          onPress={() => {
            hapticFeedback.light();
            Alert.alert('Copied', 'Backup codes copied to clipboard');
          }}
        >
          <Ionicons name="copy-outline" size={18} color={colors.primary.main} />
          <Text style={styles.copyButtonText}>Copy All Codes</Text>
        </TouchableOpacity>
      </Card>

      <Button
        title="Done"
        onPress={handleComplete}
        variant="primary"
        size="lg"
        fullWidth
      />
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Two-Factor Authentication</Text>
      </View>

      {step === 'info' && renderInfoStep()}
      {step === 'setup' && renderSetupStep()}
      {step === 'verify' && renderVerifyStep()}
    </View>
  );
}

function BenefitItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.benefitItem}>
      <View style={styles.benefitIconContainer}>
        <Ionicons name={icon as any} size={20} color={colors.primary.main} />
      </View>
      <Text style={styles.benefitText}>{text}</Text>
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
  card: {
    marginBottom: spacing.lg,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  cardDescription: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  benefitsList: {
    gap: spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  benefitIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.main + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  cancelButton: {
    marginTop: spacing.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
  },
  stepTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  stepDescription: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  qrContainer: {
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  qrCode: {
    width: 200,
    height: 200,
  },
  manualEntryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  secretContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: 8,
    gap: spacing.sm,
  },
  secretText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: 'monospace',
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  codeInput: {
    textAlign: 'center',
    fontSize: typography.fontSize['2xl'],
    letterSpacing: 8,
    fontFamily: 'monospace',
  },
  successCard: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  successIcon: {
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  successDescription: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  backupCodesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  backupCodesTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  backupCodesDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  backupCodesList: {
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: 8,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  backupCodeItem: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  backupCodeNumber: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontFamily: 'monospace',
    width: 24,
  },
  backupCode: {
    fontSize: typography.fontSize.sm,
    fontFamily: 'monospace',
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  copyButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary.main,
    fontWeight: typography.fontWeight.medium,
  },
  buttonContainer: {
    gap: spacing.md,
  },
});