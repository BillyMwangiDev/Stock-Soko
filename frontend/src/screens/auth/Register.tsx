/**
 * Register Screen
 * New user registration
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { Button, Input } from '../../components';
import { colors, typography, spacing } from '../../theme';
import { api } from '../../api/client';

type RegisterScreenProp = StackNavigationProp<AuthStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenProp;
}

export default function Register({ navigation }: Props) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; phone?: string; password?: string; confirmPassword?: string }>({});

  const validate = (): boolean => {
    const nextErrors: typeof errors = {};

    if (!fullName.trim()) {
      nextErrors.fullName = 'Full name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address';
    }

    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 9) {
      nextErrors.phone = 'Enter a valid phone number';
    }

    const hasMinLen = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const withinBcrypt = new TextEncoder().encode(password).length <= 72;

    if (!hasMinLen || !hasUpper || !hasLower || !hasDigit || !hasSpecial) {
      nextErrors.password = 'Use 8+ chars with upper, lower, number and special';
    } else if (!withinBcrypt) {
      nextErrors.password = 'Password must be 72 bytes or less';
    }

    if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      
      await api.post('/auth/register', {
        full_name: fullName,
        email,
        phone,
        password,
      });
      
      Alert.alert(
        'Success', 
        'Account created! Please verify your phone number.',
        [
          { 
            text: 'OK', 
            onPress: () => navigation.navigate('OTPVerification', { phone })
          }
        ]
      );
    } catch (error: any) {
      console.error('Registration error:', error);
      const detail: string | undefined = error?.response?.data?.detail;
      if (typeof detail === 'string') {
        if (/exists/i.test(detail) && /email/i.test(detail)) {
          setErrors((e) => ({ ...e, email: 'Email already registered' }));
        } else if (/password/i.test(detail)) {
          setErrors((e) => ({ ...e, password: detail }));
        } else if (/email/i.test(detail)) {
          setErrors((e) => ({ ...e, email: detail }));
        } else if (/phone/i.test(detail)) {
          setErrors((e) => ({ ...e, phone: detail }));
        } else {
          Alert.alert('Registration Failed', detail);
        }
      } else {
        Alert.alert('Registration Failed', 'Unable to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        bounces={true}
      >
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join Stock Soko and start trading</Text>

        <View style={styles.form}>
        <Input
          id="fullName"
          name="fullName"
          label="Full Name"
          placeholder="Enter your full name"
          value={fullName}
          onChangeText={setFullName}
          error={errors.fullName}
        />
        
        <Input
          id="email"
          name="email"
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        <Input
          id="phone"
          name="phone"
          label="Phone Number"
          placeholder="+254..."
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          error={errors.phone}
        />
        
        <Input
          id="password"
          name="password"
          label="Password"
          placeholder="Minimum 8 characters"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={errors.password}
        />

        <Input
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          placeholder="Re-enter password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          error={errors.confirmPassword}
        />

        <Button
          title="Create Account"
          onPress={handleRegister}
          loading={loading}
          variant="primary"
          size="lg"
          fullWidth
        />

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
        </View>
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
    padding: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: 80,
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
  form: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  loginText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  loginLink: {
    fontSize: typography.fontSize.base,
    color: colors.primary.main,
    fontWeight: typography.fontWeight.semibold,
  },
});

