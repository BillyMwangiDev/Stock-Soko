/**
 * OTP Verification Screen
 * Verify phone number with 6-digit code
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TextInput } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/types';
import { Button } from '../../components';
import { colors, typography, spacing } from '../../theme';
import { api } from '../../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

type OTPScreenProp = StackNavigationProp<AuthStackParamList, 'OTPVerification'>;
type OTPRouteProp = RouteProp<AuthStackParamList, 'OTPVerification'>;

interface Props {
  navigation: OTPScreenProp;
  route: OTPRouteProp;
}

export default function OTPVerification({ navigation, route }: Props) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { phone } = route.params;

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a 6-digit code');
      return;
    }

    try {
      setLoading(true);
      
      await api.post('/auth/otp/verify', {
        phone_number: phone,
        otp_code: otp,
      });
      
      Alert.alert(
        'Success', 
        'Phone verified! You can now sign in.',
        [
          { 
            text: 'OK', 
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Verification Failed', error?.response?.data?.detail || 'Invalid OTP code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      
      const res = await api.post('/auth/otp/request', {
        phone_number: phone,
      });
      
      Alert.alert('OTP Sent', 'A new verification code has been sent to your phone');
      
      // In sandbox mode, show OTP
      if (res.data.otp_code) {
        Alert.alert('Sandbox Mode', `Your OTP is: ${res.data.otp_code}`);
      }
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.detail || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verify Phone Number</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to{'\n'}
          {phone}
        </Text>

        <View style={styles.otpContainer}>
          <TextInput
            style={styles.otpInput}
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="000000"
            placeholderTextColor={colors.text.tertiary}
          />
        </View>

        <Button
          title="Verify"
          onPress={handleVerify}
          loading={loading}
          variant="primary"
          size="lg"
        />

        <Button
          title="Resend Code"
          onPress={handleResend}
          loading={resending}
          variant="secondary"
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    gap: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  otpContainer: {
    alignItems: 'center',
  },
  otpInput: {
    width: '80%',
    height: 60,
    backgroundColor: colors.background.secondary,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.main,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    letterSpacing: 10,
  },
});