/**
 * Notification Center Screen
 * Displays real-time alerts for market movements and updates
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileStackParamList } from '../navigation/types';
import { colors, typography, spacing, borderRadius } from '../theme';

type NotificationCenterScreenProp = StackNavigationProp<ProfileStackParamList, 'NotificationCenter'>;

interface Props {
  navigation: NotificationCenterScreenProp;
}

interface Notification {
  id: string;
  type: 'trade' | 'price' | 'news';
  title: string;
  timestamp: string;
  badge: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  badgeText: string;
  hasIndicator?: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'trade',
    title: 'Trade Confirmation',
    timestamp: '9:41 AM',
    badge: 'Trade',
    icon: '√',
    iconBg: '#DBEAFE',
    iconColor: '#3B82F6',
    badgeBg: '#DBEAFE',
    badgeText: '#1E40AF',
    hasIndicator: true,
  },
  {
    id: '2',
    type: 'price',
    title: 'Price Alert: AAPL',
    timestamp: '9:30 AM',
    badge: 'Price',
    icon: '↗',
    iconBg: '#D1FAE5',
    iconColor: '#10B981',
    badgeBg: '#D1FAE5',
    badgeText: '#065F46',
  },
  {
    id: '3',
    type: 'news',
    title: 'Market News: S&P 500',
    timestamp: '8:55 AM',
    badge: 'News',
    icon: '◆',
    iconBg: '#FEF3C7',
    iconColor: '#F59E0B',
    badgeBg: '#FEF3C7',
    badgeText: '#92400E',
  },
  {
    id: '4',
    type: 'trade',
    title: 'Trade Confirmation',
    timestamp: 'Yesterday',
    badge: 'Trade',
    icon: '√',
    iconBg: '#DBEAFE',
    iconColor: '#3B82F6',
    badgeBg: '#DBEAFE',
    badgeText: '#1E40AF',
  },
  {
    id: '5',
    type: 'price',
    title: 'Price Alert: TSLA',
    timestamp: 'Yesterday',
    badge: 'Price',
    icon: '↗',
    iconBg: '#D1FAE5',
    iconColor: '#10B981',
    badgeBg: '#D1FAE5',
    badgeText: '#065F46',
  },
  {
    id: '6',
    type: 'news',
    title: 'Market News: Tech Sector',
    timestamp: '2 days ago',
    badge: 'News',
    icon: '◆',
    iconBg: '#FEF3C7',
    iconColor: '#F59E0B',
    badgeBg: '#FEF3C7',
    badgeText: '#92400E',
  },
];

export default function NotificationCenter({ navigation }: Props) {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNotificationPress = (notification: Notification) => {
    // Navigate to relevant screen or show details
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alerts</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Notification List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {notifications.map((notification, index) => (
          <TouchableOpacity
            key={notification.id}
            style={[
              styles.notificationItem,
              index !== notifications.length - 1 && styles.notificationBorder,
            ]}
            onPress={() => handleNotificationPress(notification)}
            activeOpacity={0.7}
          >
            {/* Icon with indicator */}
            <View style={styles.iconContainer}>
              <View style={[styles.iconBox, { backgroundColor: notification.iconBg }]}>
                <Text style={styles.icon}>{notification.icon}</Text>
              </View>
              {notification.hasIndicator && (
                <View style={styles.indicatorOuter}>
                  <View style={styles.indicatorInner} />
                </View>
              )}
            </View>

            {/* Content */}
            <View style={styles.notificationContent}>
              <View style={styles.contentHeader}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.timestamp}>{notification.timestamp}</Text>
              </View>
              
              <View style={styles.contentFooter}>
                <View style={[styles.badge, { backgroundColor: notification.badgeBg }]}>
                  <Text style={[styles.badgeText, { color: notification.badgeText }]}>
                    {notification.badge}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
    backgroundColor: colors.background.primary + 'CC',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: colors.text.primary,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  notificationBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main + '40',
  },
  iconContainer: {
    position: 'relative',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  indicatorOuter: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary.contrast,
  },
  notificationContent: {
    flex: 1,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  notificationTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    flex: 1,
  },
  timestamp: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  contentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  chevron: {
    fontSize: 24,
    color: colors.text.disabled,
  },
});

