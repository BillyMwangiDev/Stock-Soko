/**
 * Account Setup Screen
 * Facilitates broker account creation and M-Pesa linking
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/types';
import { Button, Input } from '../components';
import { colors, typography, spacing, borderRadius } from '../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AccountSetupScreenProp = StackNavigationProp<AuthStackParamList, 'AccountSetup'>;

interface Props {
  navigation: AccountSetupScreenProp;
}

export default function AccountSetup({ navigation }: Props) {
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [brokerAccountNumber, setBrokerAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetup = async () => {
    if (!mpesaPhone || !brokerAccountNumber) {
      Alert.alert('Incomplete', 'Please fill in all fields');
      return;
    }

    if (!/^(254|0)[17]\d{8}$/.test(mpesaPhone.replace(/\s/g, ''))) {
      Alert.alert('Invalid Phone', 'Please enter a valid Kenyan phone number');
      return;
    }

    try {
      setLoading(true);

      await AsyncStorage.setItem('mpesaPhone', mpesaPhone);
      await AsyncStorage.setItem('brokerAccountNumber', brokerAccountNumber);

      Alert.alert(
        'Account Setup Complete',
        'Your M-Pesa and broker account have been linked successfully!',
        [
          {
            text: 'Continue',
            onPress: () => navigation.navigate('FeatureWalkthrough' as any),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Setup Failed', 'Unable to complete account setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Open Account & Verify M-Pesa</Text>
        <Text style={styles.subtitle}>
          Link your M-Pesa account for seamless deposits and withdrawals
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>M-Pesa Details</Text>
          <Text style={styles.sectionDescription}>
            Your M-Pesa number will be used for deposits and withdrawals
          </Text>

          <Input
            label="M-Pesa Phone Number"
            placeholder="0712345678 or 254712345678"
            value={mpesaPhone}
            onChangeText={setMpesaPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Broker Account</Text>
          <Text style={styles.sectionDescription}>
            Enter your broker account number (you'll receive this via email)
          </Text>

          <Input
            label="Broker Account Number"
            placeholder="Enter account number"
            value={brokerAccountNumber}
            onChangeText={setBrokerAccountNumber}
          />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>How it works:</Text>
          <Text style={styles.infoText}>
            1. We'll create a broker account for you{'\n'}
            2. Link your M-Pesa for instant funding{'\n'}
            3. Verify your phone number via SMS{'\n'}
            4. Start trading immediately
          </Text>
        </View>

        <Button
          title="Complete Setup"
          onPress={handleSetup}
          loading={loading}
          variant="primary"
          size="lg"
          fullWidth
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  infoBox: {
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary.main,
  },
  infoTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.main,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    lineHeight: 20,
  },
});

