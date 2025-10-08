import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { api } from '../api/client';
import { setAccessToken, getAccessToken } from '../store/auth';
import { colors, typography, spacing, borderRadius } from '../theme';
import { Card, Button, Input, Badge } from '../components';

interface UserBalance {
  available: number;
  reserved: number;
  total: number;
}

export default function Profile() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('100');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [balance, setBalance] = useState<UserBalance | null>(null);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    const token = await getAccessToken();
    setIsLoggedIn(!!token);
    if (token) {
      loadBalance();
    }
  };

  const loadBalance = async () => {
    try {
      const res = await api.get('/ledger/balance');
      setBalance(res.data);
    } catch (error) {
      console.error('Failed to load balance:', error);
    }
  };

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/register', { email, password });
      Alert.alert('Success', 'Account created successfully! You can now login.');
    } catch (error: any) {
      Alert.alert('Registration Failed', error?.response?.data?.detail || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

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
      
      setAccessToken(res.data.access_token);
      setIsLoggedIn(true);
      await loadBalance();
      Alert.alert('Success', 'Logged in successfully!');
    } catch (error: any) {
      Alert.alert('Login Failed', error?.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAccessToken('');
    setIsLoggedIn(false);
    setBalance(null);
    setEmail('');
    setPassword('');
    Alert.alert('Logged Out', 'You have been logged out successfully');
  };

  const handleDeposit = async () => {
    if (!phone || !amount) {
      Alert.alert('Error', 'Please enter phone number and amount');
      return;
    }

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/payments/mpesa/deposit', {
        phone_number: phone,
        amount: depositAmount,
      });
      Alert.alert('Deposit Initiated', res.data.message || 'Check your phone for STK push prompt');
    } catch (error: any) {
      Alert.alert('Deposit Failed', error?.response?.data?.detail || 'Failed to initiate deposit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={true}
      bounces={true}
      scrollEventThrottle={16}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Profile & Account</Text>
      </View>

      {isLoggedIn ? (
        <>
          {/* Balance Card */}
          <Card variant="elevated" style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceValue}>
              KES {balance?.available.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </Text>
            
            {balance && balance.reserved > 0 && (
              <View style={styles.reservedContainer}>
                <Text style={styles.reservedLabel}>Reserved</Text>
                <Text style={styles.reservedValue}>
                  KES {balance.reserved.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
            )}

            <TouchableOpacity onPress={loadBalance} style={styles.refreshButton}>
              <Text style={styles.refreshText}>Refresh Balance</Text>
            </TouchableOpacity>
          </Card>

          {/* Deposit Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Deposit Funds (M-Pesa)</Text>
            <Card>
              <Input
                label="Phone Number"
                placeholder="+254..."
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <Input
                label="Amount (KES)"
                placeholder="Enter amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
              <Button
                title={loading ? 'Processing...' : 'Initiate Deposit'}
                onPress={handleDeposit}
                variant="primary"
                disabled={loading}
                fullWidth
              />
              <Text style={styles.helperText}>
                Sandbox test number: 254708374149
              </Text>
            </Card>
          </View>

          {/* Account Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            <Card>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{email}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status</Text>
                <Badge text="Active" variant="success" />
              </View>
            </Card>
          </View>

          {/* Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <Card padding="sm">
              <TouchableOpacity style={styles.settingItem}>
                <Text style={styles.settingText}>Notifications</Text>
                <Text style={styles.settingChevron}>›</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingItem}>
                <Text style={styles.settingText}>Security</Text>
                <Text style={styles.settingChevron}>›</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingItem}>
                <Text style={styles.settingText}>Documents</Text>
                <Text style={styles.settingChevron}>›</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingItem}>
                <Text style={styles.settingText}>Help & Support</Text>
                <Text style={styles.settingChevron}>›</Text>
              </TouchableOpacity>
            </Card>
          </View>

          {/* Logout Button */}
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            fullWidth
            style={styles.logoutButton}
          />
        </>
      ) : (
        <>
          {/* Login/Register Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sign In to Your Account</Text>
            <Card>
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
              <View style={styles.buttonGroup}>
                <Button
                  title={loading ? 'Loading...' : 'Login'}
                  onPress={handleLogin}
                  variant="primary"
                  disabled={loading}
                  fullWidth
                  style={{ marginBottom: spacing.sm }}
                />
                <Button
                  title="Create Account"
                  onPress={handleRegister}
                  variant="outline"
                  disabled={loading}
                  fullWidth
                />
              </View>
            </Card>
          </View>

          {/* Info Card */}
          <Card variant="outlined" style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Why Create an Account?</Text>
            <Text style={styles.infoCardText}>
              Access AI-powered stock recommendations{'\n'}
              Trade stocks with low fees{'\n'}
              Track your portfolio in real-time{'\n'}
              Get personalized market insights{'\n'}
              Secure M-Pesa deposit & withdrawal
            </Text>
          </Card>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: spacing.base,
    paddingBottom: 120,
    minHeight: 1000,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  balanceCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  balanceLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceValue: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  reservedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.main,
    marginBottom: spacing.md,
  },
  reservedLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  reservedValue: {
    fontSize: typography.fontSize.sm,
    color: colors.warning,
    fontWeight: typography.fontWeight.semibold,
  },
  refreshButton: {
    paddingVertical: spacing.xs,
  },
  refreshText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary.main,
    fontWeight: typography.fontWeight.medium,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  helperText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main,
  },
  infoLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main,
  },
  settingText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  settingChevron: {
    fontSize: typography.fontSize.xl,
    color: colors.text.tertiary,
  },
  logoutButton: {
    marginTop: spacing.base,
  },
  buttonGroup: {
    marginTop: spacing.sm,
  },
  infoCard: {
    marginTop: spacing.base,
  },
  infoCardTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  infoCardText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    lineHeight: 20,
  },
});
