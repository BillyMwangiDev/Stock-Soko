import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { ProfileStackParamList } from '../navigation/types';
import { colors, typography, spacing, borderRadius } from '../theme';
import { mockNotifications, Notification, NotificationType } from '../mocks';

type NotificationCenterScreenProp = StackNavigationProp<ProfileStackParamList, 'NotificationCenter'>;

interface Props {
  navigation: NotificationCenterScreenProp;
}

type FilterType = 'all' | NotificationType;

export default function NotificationCenter({ navigation }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setNotifications(mockNotifications);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleNotificationAction = (notification: Notification) => {
    markAsRead(notification.id);

    console.log('[Notification] Handling action:', notification.actionLabel || 'default', 'for type:', notification.type);

    // Get the tab navigator (parent of this stack)
    const tabNavigator = navigation.getParent();
    
    if (!tabNavigator) {
      console.warn('[Notification] Tab navigator not found');
      return;
    }

    // Navigate based on action label
    switch (notification.actionLabel) {
      case 'View Portfolio':
        console.log('[Notification] Navigating to PortfolioTab → Portfolio');
        tabNavigator.navigate('PortfolioTab', { screen: 'Portfolio' });
        break;
      
      case 'View Wallet':
        console.log('[Notification] Navigating to Wallet');
        navigation.navigate('Wallet');
        break;
      
      case 'View Stock':
      case 'View Details':
        if (notification.ticker) {
          console.log('[Notification] Navigating to MarketsTab → StockDetail for', notification.ticker);
          tabNavigator.navigate('MarketsTab', { 
            screen: 'StockDetail', 
            params: { symbol: notification.ticker }
          });
        } else {
          console.log('[Notification] Navigating to PortfolioTab → TradeHistory');
          tabNavigator.navigate('PortfolioTab', { screen: 'TradeHistory' });
        }
        break;
      
      case 'Read More':
      case 'Learn More':
        console.log('[Notification] Navigating to NewsTab');
        tabNavigator.navigate('NewsTab');
        break;
      
      case 'Start Trading':
        console.log('[Notification] Navigating to MarketsTab → Markets');
        tabNavigator.navigate('MarketsTab', { screen: 'Markets' });
        break;
      
      default:
        // If no specific action, navigate based on notification type
        console.log('[Notification] No specific action, navigating by type:', notification.type);
        if (notification.type === 'trade') {
          if (notification.ticker) {
            console.log('[Notification] Trade notification → StockDetail for', notification.ticker);
            tabNavigator.navigate('MarketsTab', { 
              screen: 'StockDetail', 
              params: { symbol: notification.ticker }
            });
          } else {
            console.log('[Notification] Trade notification → Portfolio');
            tabNavigator.navigate('PortfolioTab', { screen: 'Portfolio' });
          }
        } else if (notification.type === 'news') {
          console.log('[Notification] News notification → NewsTab');
          tabNavigator.navigate('NewsTab');
        } else if (notification.type === 'account') {
          console.log('[Notification] Account notification → Profile');
          navigation.navigate('Profile');
        }
        break;
    }
  };

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeIcon = (type: NotificationType): string => {
    switch (type) {
      case 'trade':
        return 'trending-up';
      case 'news':
        return 'newspaper';
      case 'account':
        return 'person';
    }
  };

  const getTypeColor = (type: NotificationType): string => {
    switch (type) {
      case 'trade':
        return colors.text.primary;
      case 'news':
        return colors.text.secondary;
      case 'account':
        return colors.primary.main;
    }
  };

  const getPriorityStyle = (priority?: string) => {
    if (priority === 'high') {
      return { borderLeftColor: colors.error, borderLeftWidth: 4 };
    }
    return {};
  };

  const FilterButton = ({ label, count, active, onPress, icon, color }: {
    label: string;
    count: number;
    active: boolean;
    onPress: () => void;
    icon?: string;
    color?: string;
  }) => (
    <TouchableOpacity
      style={[styles.filterButton, active && styles.filterButtonActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && (
        <Ionicons
          name={icon as any}
          color={active ? colors.background.primary : color || colors.text.tertiary}
          size={16}
        />
      )}
      <Text style={[styles.filterText, active && styles.filterTextActive]}>
        {label}
      </Text>
      <View style={[styles.countBadge, active && styles.countBadgeActive]}>
        <Text style={[styles.countText, active && styles.countTextActive]}>
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.headerButton}>
            <Ionicons name="checkmark" color={colors.text.primary} size={20} />
            <Text style={styles.headerButtonText}>Mark All Read</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <FilterButton
            label="All"
            count={notifications.length}
            active={filter === 'all'}
            onPress={() => setFilter('all')}
          />
          <FilterButton
            label="Trade"
            count={notifications.filter(n => n.type === 'trade').length}
            active={filter === 'trade'}
            onPress={() => setFilter('trade')}
            icon="trending-up"
            color={colors.text.primary}
          />
          <FilterButton
            label="News"
            count={notifications.filter(n => n.type === 'news').length}
            active={filter === 'news'}
            onPress={() => setFilter('news')}
            icon="newspaper"
            color={colors.status.info}
          />
          <FilterButton
            label="Account"
            count={notifications.filter(n => n.type === 'account').length}
            active={filter === 'account'}
            onPress={() => setFilter('account')}
            icon="person"
            color={colors.primary.main}
          />
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off" color={colors.text.tertiary} size={64} />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyMessage}>
              You're all caught up! Check back later for updates.
            </Text>
          </View>
        ) : (
          filteredNotifications.map((notification) => {
            const typeIcon = getTypeIcon(notification.type);
            const typeColor = getTypeColor(notification.type);

            return (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationCard,
                  !notification.read && styles.unreadCard,
                  getPriorityStyle(notification.priority),
                ]}
                onPress={() => handleNotificationAction(notification)}
                activeOpacity={0.7}
              >
                <View style={styles.notificationContent}>
                  <View style={[styles.iconContainer, { backgroundColor: typeColor + '20' }]}>
                    <Ionicons name={typeIcon as any} color={typeColor} size={20} />
                  </View>

                  <View style={styles.textContainer}>
                    <View style={styles.headerRow}>
                      <Text style={[styles.title, !notification.read && styles.unreadTitle]}>
                        {notification.title}
                      </Text>
                      {!notification.read && <View style={styles.unreadDot} />}
                    </View>

                    {notification.ticker && (
                      <View style={styles.tickerBadge}>
                        <Text style={styles.tickerText}>{notification.ticker}</Text>
                      </View>
                    )}

                    <Text style={styles.message}>{notification.message}</Text>

                    <View style={styles.footer}>
                      <Text style={styles.timestamp}>{notification.timestamp}</Text>
                      {notification.actionLabel && (
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleNotificationAction(notification)}
                        >
                          <Text style={styles.actionText}>{notification.actionLabel}</Text>
                          <Ionicons name="chevron-forward" color={colors.text.primary} size={14} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteNotification(notification.id)}
                  >
                    <Ionicons name="close" color={colors.text.tertiary} size={18} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
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
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  filterContainer: {
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main,
    paddingVertical: 12,
  },
  filterScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.input.background,
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  filterButtonActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  filterText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.semibold,
  },
  filterTextActive: {
    color: colors.background.primary,
  },
  countBadge: {
    backgroundColor: colors.border.main,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  countBadgeActive: {
    backgroundColor: colors.background.primary + '40',
  },
  countText: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.bold,
  },
  countTextActive: {
    color: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: 12,
  },
  notificationCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: spacing.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  unreadCard: {
    backgroundColor: colors.background.secondary + 'CC',
    borderColor: colors.primary.main + '60',
  },
  notificationContent: {
    flexDirection: 'row',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: typography.fontWeight.bold,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.main,
  },
  tickerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary.main + '40',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  tickerText: {
    fontSize: 11,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
  },
  message: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  deleteButton: {
    padding: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  emptyMessage: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});