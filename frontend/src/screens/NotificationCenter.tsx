/**
 * Enhanced Notification Center Screen
 * Priority-based notifications with categories and actions
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { ProfileStackParamList } from '../navigation/types';
import { colors, typography, spacing, borderRadius } from '../theme';
import { Card } from '../components';
import { useNavigation } from '@react-navigation/native';

type NotificationCenterScreenProp = StackNavigationProp<ProfileStackParamList, 'NotificationCenter'>;

interface Props {
  navigation: NotificationCenterScreenProp;
}

interface Notification {
  id: string;
  category: 'Trade' | 'Alert' | 'News' | 'Account';
  priority: 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  actionLabel?: string;
  actionTarget?: string;
  actionSymbol?: string;
  icon: string;
  iconColor: string;
}

export default function NotificationCenter({ navigation }: Props) {
  const nav = useNavigation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'All' | 'Trade' | 'Alert' | 'News' | 'Account'>('All');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    // In production, fetch from API: await api.get('/notifications');
    // For now, using enhanced mock data
    const mockData: Notification[] = [
      {
        id: '1',
        category: 'Alert',
        priority: 'High',
        title: 'Price Alert Triggered',
        description: 'SCOM reached your target price of KES 45.00',
        timestamp: new Date().toISOString(),
        isRead: false,
        actionLabel: 'View Stock',
        actionTarget: 'StockDetail',
        actionSymbol: 'SCOM',
        icon: 'alarm',
        iconColor: colors.error,
      },
      {
        id: '2',
        category: 'Trade',
        priority: 'High',
        title: 'Order Executed',
        description: 'Your buy order for 10 shares of KCB at KES 32.50 was executed successfully',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        isRead: false,
        actionLabel: 'View Portfolio',
        icon: 'checkmark-circle',
        iconColor: colors.success,
      },
      {
        id: '3',
        category: 'News',
        priority: 'Medium',
        title: 'Market Update',
        description: 'NSE 20-Share Index gains 1.2% on banking sector strength',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        isRead: false,
        actionLabel: 'Read More',
        icon: 'newspaper',
        iconColor: colors.info,
      },
      {
        id: '4',
        category: 'Alert',
        priority: 'Medium',
        title: 'Volume Spike Detected',
        description: 'EQTY trading volume increased by 150% above average',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        isRead: true,
        actionLabel: 'Analyze',
        actionTarget: 'StockDetail',
        actionSymbol: 'EQTY',
        icon: 'pulse',
        iconColor: colors.warning,
      },
      {
        id: '5',
        category: 'Account',
        priority: 'Low',
        title: 'M-Pesa Deposit Confirmed',
        description: 'KES 5,000 successfully added to your wallet',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        isRead: true,
        actionLabel: 'View Wallet',
        icon: 'wallet',
        iconColor: colors.success,
      },
      {
        id: '6',
        category: 'Trade',
        priority: 'Low',
        title: 'Order Pending',
        description: 'Your limit order for EABL is pending execution',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        isRead: true,
        icon: 'time',
        iconColor: colors.text.tertiary,
      },
    ];

    setNotifications(mockData);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleMarkAsRead = (notifId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notifId ? { ...n, isRead: true } : n))
    );
  };

  const handleNotificationAction = (notification: Notification) => {
    handleMarkAsRead(notification.id);

    if (notification.actionTarget === 'StockDetail' && notification.actionSymbol) {
      (nav as any).navigate('Markets', {
        screen: 'StockDetail',
        params: { symbol: notification.actionSymbol },
      });
    } else if (notification.actionLabel === 'View Portfolio') {
      (nav as any).navigate('Portfolio');
    } else if (notification.actionLabel === 'View Wallet') {
      navigation.navigate('Wallet');
    }
  };

  const filteredNotifications = notifications.filter(n =>
    filter === 'All' ? true : n.category === filter
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return colors.error;
      case 'Medium':
        return colors.warning;
      case 'Low':
        return colors.info;
      default:
        return colors.text.tertiary;
    }
  };

  const getRelativeTime = (timestamp: string) => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = now - time;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {['All', 'Trade', 'Alert', 'News', 'Account'].map((category) => (
          <TouchableOpacity
            key={category}
            style={[styles.filterTab, filter === category && styles.filterTabActive]}
            onPress={() => setFilter(category as any)}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === category && styles.filterTabTextActive,
              ]}
            >
              {category}
            </Text>
            {category === 'All' && unreadCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Notifications List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary.main}
            colors={[colors.primary.main]}
          />
        }
      >
        {filteredNotifications.length === 0 ? (
          <Card variant="outline" style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={48} color={colors.text.tertiary} />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyText}>
              {filter === 'All' ? 'You\'re all caught up!' : `No ${filter.toLowerCase()} notifications`}
            </Text>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              onPress={() => handleMarkAsRead(notification.id)}
              activeOpacity={0.7}
            >
              <Card
                variant={notification.isRead ? 'glass' : 'elevated'}
                style={[
                  styles.notificationCard,
                  !notification.isRead && styles.notificationCardUnread,
                ]}
              >
                {/* Header */}
                <View style={styles.notificationHeader}>
                  <View style={styles.notificationLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: notification.iconColor + '20' }]}>
                      <Ionicons name={notification.icon as any} size={20} color={notification.iconColor} />
                    </View>
                    <View style={styles.notificationInfo}>
                      <View style={styles.titleRow}>
                        <Text style={styles.notificationTitle}>{notification.title}</Text>
                        {!notification.isRead && <View style={styles.unreadDot} />}
                      </View>
                      <View style={styles.metaRow}>
                        <View
                          style={[
                            styles.categoryBadge,
                            { backgroundColor: getPriorityColor(notification.priority) + '20' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.categoryText,
                              { color: getPriorityColor(notification.priority) },
                            ]}
                          >
                            {notification.category}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.priorityBadge,
                            { borderColor: getPriorityColor(notification.priority) },
                          ]}
                        >
                          <Text
                            style={[
                              styles.priorityText,
                              { color: getPriorityColor(notification.priority) },
                            ]}
                          >
                            {notification.priority}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.timestamp}>{getRelativeTime(notification.timestamp)}</Text>
                </View>

                {/* Description */}
                <Text style={styles.notificationDescription}>{notification.description}</Text>

                {/* Action Button */}
                {notification.actionLabel && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleNotificationAction(notification)}
                  >
                    <Text style={styles.actionButtonText}>{notification.actionLabel}</Text>
                    <Ionicons name="arrow-forward" size={16} color={colors.primary.main} />
                  </TouchableOpacity>
                )}
              </Card>
            </TouchableOpacity>
          ))
        )}

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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  unreadBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.inverse,
  },
  filterScroll: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main,
  },
  filterContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.secondary,
    gap: spacing.xs,
  },
  filterTabActive: {
    backgroundColor: colors.primary.main,
  },
  filterTabText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  filterTabTextActive: {
    color: colors.primary.contrast,
    fontWeight: typography.fontWeight.bold,
  },
  filterBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.full,
    minWidth: 18,
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: typography.fontSize.xs - 1,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.inverse,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  notificationCard: {
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  notificationCardUnread: {
    borderLeftColor: colors.primary.main,
    backgroundColor: colors.background.secondary + 'ee',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  notificationLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  notificationInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  notificationTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.main,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  priorityText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  timestamp: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginLeft: spacing.sm,
  },
  notificationDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.main + '40',
  },
  actionButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.main,
  },
});
