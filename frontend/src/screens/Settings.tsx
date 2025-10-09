import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius } from '../theme';
import { Card, Button } from '../components';
import { setAccessToken } from '../store/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hapticFeedback } from '../utils/haptics';
import { api } from '../api/client';

export default function Settings() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [selectedBroker, setSelectedBroker] = useState<string>('Not selected');

  useEffect(() => {
    loadSettings();
    
    // Reload settings when screen comes into focus (e.g., after choosing broker)
    const unsubscribe = (navigation as any).addListener('focus', () => {
      loadSettings();
    });
    
    return unsubscribe;
  }, [navigation]);

  const loadSettings = async () => {
    try {
      // Load broker info
      const broker = await AsyncStorage.getItem('selectedBroker');
      if (broker) {
        const brokerNames: Record<string, string> = {
          'genghis': 'Genghis Capital',
          'faida': 'Faida Investment Bank',
          'dyer': 'Dyer & Blair',
          'direct': 'Stock Soko Direct',
        };
        setSelectedBroker(brokerNames[broker] || broker);
      }

      // Load preferences
      const savedNotifications = await AsyncStorage.getItem('notifications_enabled');
      if (savedNotifications !== null) {
        setNotifications(savedNotifications === 'true');
      }

      const savedBiometric = await AsyncStorage.getItem('biometric_enabled');
      if (savedBiometric !== null) {
        setBiometric(savedBiometric === 'true');
      }

      const savedDarkMode = await AsyncStorage.getItem('dark_mode_enabled');
      if (savedDarkMode !== null) {
        setDarkMode(savedDarkMode === 'true');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleChangeBroker = () => {
    try {
      hapticFeedback.impact();
      console.log('[Settings] Navigating to ChooseBroker...');
      (navigation as any).navigate('ChooseBroker');
    } catch (error) {
      console.error('[Settings] Navigation error:', error);
      Alert.alert('Error', 'Failed to open broker selection. Please check console for details.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            setAccessToken('');
            Alert.alert('Logged Out', 'You have been logged out successfully');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    hapticFeedback.impact();
    (navigation as any).navigate('DeleteAccount');
  };

  const handleNotificationsToggle = async (value: boolean) => {
    setNotifications(value);
    await AsyncStorage.setItem('notifications_enabled', value.toString());
    hapticFeedback.light();
  };

  const handleBiometricToggle = async (value: boolean) => {
    setBiometric(value);
    await AsyncStorage.setItem('biometric_enabled', value.toString());
    hapticFeedback.light();
    
    if (value) {
      Alert.alert(
        'Biometric Authentication',
        'Biometric authentication will be used for login and sensitive actions.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleDarkModeToggle = async (value: boolean) => {
    setDarkMode(value);
    await AsyncStorage.setItem('dark_mode_enabled', value.toString());
    hapticFeedback.light();
    
    Alert.alert(
      'Theme Changed',
      'Dark mode preference saved. Theme changes will be applied in a future update.',
      [{ text: 'OK' }]
    );
  };

  const handleKYCStatus = () => {
    hapticFeedback.light();
    (navigation as any).navigate('KYCUpload');
  };

  const handleHelpSupport = () => {
    hapticFeedback.light();
    (navigation as any).navigate('CustomerSupport');
  };

  const handleAbout = () => {
    hapticFeedback.light();
    Alert.alert(
      'About Stock Soko',
      'Stock Soko - Your Gateway to Kenyan Markets\n\n' +
      'Version: 1.0.0\n' +
      'Build: 2025.10.09\n\n' +
      'Trade Kenyan stocks with zero commissions, AI-powered insights, and M-Pesa integration.\n\n' +
      '© 2025 Stock Soko Ltd. All rights reserved.',
      [
        { text: 'Visit Website', onPress: () => console.log('Open website') },
        { text: 'OK', style: 'cancel' }
      ]
    );
  };

  const SettingItem = ({ icon, title, subtitle, onPress, showChevron = true }: any) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={22} color={colors.text.secondary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {showChevron && (
        <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
      )}
    </TouchableOpacity>
  );

  const ToggleItem = ({ icon, title, subtitle, value, onValueChange }: any) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={22} color={colors.text.secondary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.background.elevated, true: colors.primary.light }}
        thumbColor={value ? colors.primary.main : colors.text.disabled}
      />
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={true}
      bounces={true}
      scrollEventThrottle={16}
    >
      <Card variant="elevated" style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={colors.text.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>John Doe</Text>
            <Text style={styles.profileEmail}>john.doe@example.com</Text>
            <View style={styles.tierBadge}>
              <Text style={styles.tierText}>Free Tier</Text>
            </View>
          </View>
        </View>
        <Button
          title="Edit Profile"
          onPress={() => {
            hapticFeedback.impact();
            (navigation as any).navigate('EditProfile');
          }}
          variant="outline"
          size="sm"
          fullWidth
        />
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Card padding="sm">
          <SettingItem
            icon="business-outline"
            title="Broker"
            subtitle={selectedBroker}
            onPress={handleChangeBroker}
          />
          <SettingItem
            icon="card-outline"
            title="Payment Methods"
            subtitle="Manage M-Pesa and bank accounts"
            onPress={() => {
              hapticFeedback.impact();
              (navigation as any).navigate('PaymentMethods');
            }}
          />
          <SettingItem
            icon="document-text-outline"
            title="KYC Status"
            subtitle="Verified"
            onPress={handleKYCStatus}
          />
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <Card padding="sm">
          <SettingItem
            icon="lock-closed-outline"
            title="Change Password"
            subtitle="Update your password"
            onPress={() => {
              hapticFeedback.impact();
              (navigation as any).navigate('ChangePassword');
            }}
          />
          <ToggleItem
            icon="finger-print-outline"
            title="Biometric Authentication"
            subtitle="Use fingerprint or face ID"
            value={biometric}
            onValueChange={handleBiometricToggle}
          />
          <SettingItem
            icon="shield-checkmark-outline"
            title="Two-Factor Authentication"
            subtitle="Add an extra layer of security"
            onPress={() => {
              hapticFeedback.impact();
              (navigation as any).navigate('TwoFactorSetup');
            }}
          />
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <Card padding="sm">
          <ToggleItem
            icon="notifications-outline"
            title="Push Notifications"
            subtitle="Receive alerts and updates"
            value={notifications}
            onValueChange={handleNotificationsToggle}
          />
          <ToggleItem
            icon="moon-outline"
            title="Dark Mode"
            subtitle="Use dark theme"
            value={darkMode}
            onValueChange={handleDarkModeToggle}
          />
          <SettingItem
            icon="language-outline"
            title="Language"
            subtitle="English"
            onPress={() => {
              hapticFeedback.impact();
              (navigation as any).navigate('LanguageSelection');
            }}
          />
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support & Legal</Text>
        <Card padding="sm">
          <SettingItem
            icon="help-circle-outline"
            title="Help & Support"
            onPress={handleHelpSupport}
          />
          <SettingItem
            icon="document-text-outline"
            title="Privacy Policy"
            onPress={() => {
              hapticFeedback.impact();
              (navigation as any).navigate('PrivacyPolicy');
            }}
          />
          <SettingItem
            icon="shield-outline"
            title="Terms & Conditions"
            onPress={() => {
              hapticFeedback.impact();
              (navigation as any).navigate('TermsConditions');
            }}
          />
          <SettingItem
            icon="information-circle-outline"
            title="About Stock Soko"
            subtitle="Version 1.0.0"
            onPress={handleAbout}
          />
        </Card>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.error }]}>Danger Zone</Text>
        <Card padding="sm">
          <TouchableOpacity style={styles.dangerItem} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color={colors.error} />
            <Text style={styles.dangerText}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dangerItem} onPress={handleDeleteAccount}>
            <Ionicons name="trash-outline" size={22} color={colors.error} />
            <Text style={styles.dangerText}>Delete Account</Text>
          </TouchableOpacity>
        </Card>
      </View>

      <View style={{ height: spacing['2xl'] }} />
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
    minHeight: 1200,
  },
  profileCard: {
    marginBottom: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  profileEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  tierBadge: {
    backgroundColor: colors.primary.main + '20',
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  tierText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary.main,
    fontWeight: typography.fontWeight.semibold,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main,
  },
  settingIcon: {
    width: 40,
    marginRight: spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main,
    gap: spacing.md,
  },
  dangerText: {
    fontSize: typography.fontSize.base,
    color: colors.error,
    fontWeight: typography.fontWeight.medium,
  },
});

