/**
 * Profile Screen
 * User profile, account settings, and logout
 */
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileStackParamList } from '../navigation/types';
import { api } from '../api/client';
import { setAccessToken, getAccessToken } from '../store/auth';
import { colors, typography, spacing, borderRadius } from '../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ProfileScreenProp = StackNavigationProp<ProfileStackParamList, 'Profile'>;

interface Props {
  navigation: ProfileScreenProp;
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
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userName[0]}</Text>
            </View>
          </View>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userHandle}>{userHandle}</Text>
          <Text style={styles.joinedText}>Joined {joinedYear}</Text>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          <View style={styles.menuGroup}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => Alert.alert('Edit Info', 'Coming soon')}
            >
              <Text style={styles.menuText}>Edit Info</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleNavigation('KYCUpload')}
            >
              <Text style={styles.menuText}>View KYC</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => Alert.alert('Linked Broker', 'Broker management coming soon')}
            >
              <Text style={styles.menuText}>Linked Broker</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PREFERENCES</Text>
          <View style={styles.menuGroup}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleNavigation('Settings')}
            >
              <Text style={styles.menuText}>Settings</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleNavigation('NotificationCenter')}
            >
              <Text style={styles.menuText}>Notifications</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleNavigation('Wallet')}
            >
              <Text style={styles.menuText}>Wallet & Payments</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Learning & Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>LEARNING & SUPPORT</Text>
          <View style={styles.menuGroup}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleNavigation('AIAssistant')}
            >
              <Text style={styles.menuText}>AI Assistant</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleNavigation('EducationalContent')}
            >
              <Text style={styles.menuText}>Learning Center</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleNavigation('CustomerSupport')}
            >
              <Text style={styles.menuText}>Customer Support</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SECURITY</Text>
          <View style={styles.menuGroup}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => Alert.alert('Change Password', 'Password change coming soon')}
            >
              <Text style={styles.menuText}>Change Password</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Logout</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary.main + '20',
    borderWidth: 2,
    borderColor: colors.primary.main + '40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
  },
  userName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  userHandle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  joinedText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 1,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  menuGroup: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  menuText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  logoutText: {
    fontSize: typography.fontSize.base,
    color: colors.error,
  },
  chevron: {
    fontSize: 24,
    color: colors.text.disabled,
  },
});
