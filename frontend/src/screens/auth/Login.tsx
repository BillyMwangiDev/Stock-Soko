/**
 * Login Screen
 * Email/password authentication
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { Button, Input } from '../../components';
import { colors, typography, spacing } from '../../theme';
import { api } from '../../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LoginScreenProp = StackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenProp;
}

export default function Login({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    try {
      setLoading(true);
      const form = new FormData();
      form.append('username', email);
      form.append('password', password);
      
      const res = await api.post('/auth/login', form, {
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
      });
      
      // Save token
      await AsyncStorage.setItem('accessToken', res.data.access_token);
      await AsyncStorage.setItem('userEmail', email);
      
      // Navigate to main app
      Alert.alert('Success', 'Logged in successfully!', [
        { text: 'OK', onPress: () => {
          // App.tsx will handle navigation to Main stack
        }}
      ]);
    } catch (error: any) {
      Alert.alert('Login Failed', error?.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        bounces={true}
      >
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue trading</Text>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity 
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPassword' as any)}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            variant="primary"
            size="lg"
            fullWidth
          />

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    padding: spacing.xl,
    paddingTop: spacing['3xl'],
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
    marginBottom: spacing['2xl'],
  },
  form: {
    gap: spacing.lg,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -spacing.sm,
  },
  forgotPasswordText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary.main,
    fontWeight: typography.fontWeight.semibold,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  signupText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  signupLink: {
    fontSize: typography.fontSize.base,
    color: colors.primary.main,
    fontWeight: typography.fontWeight.semibold,
  },
});

