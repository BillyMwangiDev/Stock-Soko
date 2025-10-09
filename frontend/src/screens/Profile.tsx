/**
 * Profile Screen
 * User profile, account settings, and logout
 */
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { ProfileStackParamList } from '../navigation/types';
import { api } from '../api/client';
import { setAccessToken } from '../store/auth';
import { colors, typography, spacing, borderRadius } from '../theme';
import { Card } from '../components';
import { hapticFeedback } from '../utils/haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ProfileScreenProp = StackNavigationProp<ProfileStackParamList, 'Profile'>;

interface Props {
  navigation: ProfileScreenProp;
}

interface MenuItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  color?: string;
}

function MenuItem({ icon, title, subtitle, onPress, color = colors.primary.main }: MenuItemProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuItem}>
        <View style={[styles.menuIconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as any} size={22} color={color} />
        </View>
        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
      </View>
    </TouchableOpacity>
  );
}

export default function Profile({ navigation }: Props) {
  const [userName, setUserName] = useState('Trader');
  const [userHandle, setUserHandle] = useState('@trader');
  const [joinedYear, setJoinedYear] = useState('2024');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const email = await AsyncStorage.getItem('userEmail');
      if (email) {
        const name = email.split('@')[0];
        setUserName(name.split('.').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' '));
        setUserHandle('@' + name);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await setAccessToken('');
            await AsyncStorage.removeItem('userEmail');
            
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          },
        },
      ]
    );
  };

  const handleNavigation = (screen: keyof ProfileStackParamList) => {
    navigation.navigate(screen as any);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Card variant="elevated" style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color={colors.primary.contrast} />
            </View>
          </View>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userEmail}>{userHandle}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>Verified</Text>
              <Text style={styles.statLabel}>KYC Status</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{joinedYear}</Text>
              <Text style={styles.statLabel}>Member Since</Text>
            </View>
          </View>
        </Card>

        {/* Account Section */}
        <Text style={styles.sectionTitle}>Account</Text>
        <Card variant="glass" style={styles.menuCard}>
          <MenuItem
            icon="settings-outline"
            title="Settings"
            subtitle="App preferences and configurations"
            onPress={() => {
              hapticFeedback.light();
              handleNavigation('Settings');
            }}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="notifications-outline"
            title="Notifications"
            subtitle="Manage your alerts"
            onPress={() => {
              hapticFeedback.light();
              handleNavigation('NotificationCenter');
            }}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="alarm-outline"
            title="Price Alerts"
            subtitle="Set price notifications"
            onPress={() => {
              hapticFeedback.light();
              handleNavigation('PriceAlerts');
            }}
            color={colors.warning}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="shield-checkmark-outline"
            title="Security"
            subtitle="Password and authentication"
            onPress={() => {
              hapticFeedback.light();
              Alert.alert('Security', 'Password change coming soon');
            }}
          />
        </Card>

        {/* Wallet Section */}
        <Text style={styles.sectionTitle}>Wallet</Text>
        <Card variant="glass" style={styles.menuCard}>
          <MenuItem
            icon="wallet-outline"
            title="Wallet & Payments"
            subtitle="M-Pesa and transactions"
            onPress={() => {
              hapticFeedback.light();
              handleNavigation('Wallet');
            }}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="document-text-outline"
            title="KYC Verification"
            subtitle="View verification status"
            onPress={() => {
              hapticFeedback.light();
              handleNavigation('KYCUpload');
            }}
          />
        </Card>

        {/* Support Section */}
        <Text style={styles.sectionTitle}>Support</Text>
        <Card variant="glass" style={styles.menuCard}>
          <MenuItem
            icon="sparkles-outline"
            title="AI Assistant"
            subtitle="Chat with our AI helper"
            onPress={() => {
              hapticFeedback.light();
              handleNavigation('AIAssistant');
            }}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="school-outline"
            title="Learning Center"
            subtitle="Educational resources"
            onPress={() => {
              hapticFeedback.light();
              handleNavigation('EducationalContent');
            }}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="help-circle-outline"
            title="Help Center"
            subtitle="FAQs and support"
            onPress={() => {
              hapticFeedback.light();
              handleNavigation('CustomerSupport');
            }}
          />
        </Card>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            hapticFeedback.impact();
            handleLogout();
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Stock Soko v1.0.0</Text>
        
        <View style={{ height: 100 }} />
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.primary.main + '40',
  },
  userName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.main,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border.main,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  menuCard: {
    marginBottom: spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.main,
    marginLeft: 68,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.error,
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  logoutText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error,
  },
  version: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
