import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { ProfileStackParamList } from '../navigation/types';
import { colors, typography, spacing, borderRadius } from '../theme';
import { mockMarketEvents, MarketEvent } from '../mocks';
import { hapticFeedback } from '../utils/haptics';

type MarketCalendarScreenProp = StackNavigationProp<ProfileStackParamList, 'MarketCalendar'>;

interface Props {
  navigation: MarketCalendarScreenProp;
}

type FilterType = 'all' | 'earnings' | 'dividend' | 'ipo' | 'holiday' | 'economic';

export default function MarketCalendar({ navigation }: Props) {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');

  const filteredEvents = useMemo(() => {
    if (selectedFilter === 'all') return mockMarketEvents;
    return mockMarketEvents.filter(event => event.type === selectedFilter);
  }, [selectedFilter]);

  const upcomingEvents = useMemo(() => {
    return filteredEvents.filter(event => event.status === 'upcoming');
  }, [filteredEvents]);

  const completedEvents = useMemo(() => {
    return filteredEvents.filter(event => event.status === 'completed');
  }, [filteredEvents]);

  const getEventIcon = (type: MarketEvent['type']): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'earnings':
        return 'trending-up';
      case 'dividend':
        return 'cash-outline';
      case 'ipo':
        return 'business-outline';
      case 'holiday':
        return 'calendar-outline';
      case 'economic':
        return 'alert-circle-outline';
    }
  };

  const getImpactColor = (impact: MarketEvent['impact']) => {
    switch (impact) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.text.secondary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const filters: { type: FilterType; label: string }[] = [
    { type: 'all', label: 'All' },
    { type: 'earnings', label: 'Earnings' },
    { type: 'dividend', label: 'Dividends' },
    { type: 'ipo', label: 'IPOs' },
    { type: 'holiday', label: 'Holidays' },
    { type: 'economic', label: 'Economic' },
  ];

  const renderEventCard = (event: MarketEvent) => (
    <TouchableOpacity
      key={event.id}
      style={styles.eventCard}
      onPress={() => {
        hapticFeedback.light();
        if (event.stockId) {
          navigation.navigate('Markets' as never, {
            screen: 'StockDetail',
            params: { symbol: event.stockId }
          } as never);
        }
      }}
      activeOpacity={0.7}
    >
      <View style={styles.eventHeader}>
        <View style={styles.eventIconContainer}>
          <Ionicons name={getEventIcon(event.type)} size={20} color={colors.text.primary} />
        </View>
        <View style={styles.eventInfo}>
          <View style={styles.eventTitleRow}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            {event.stockTicker && (
              <View style={styles.tickerBadge}>
                <Text style={styles.tickerText}>{event.stockTicker}</Text>
              </View>
            )}
          </View>
          <Text style={styles.eventDescription}>{event.description}</Text>
        </View>
      </View>

      <View style={styles.eventFooter}>
        <View style={styles.eventDateContainer}>
          <Ionicons name="calendar-outline" size={14} color={colors.text.secondary} />
          <Text style={styles.eventDate}>{formatDate(event.date)}</Text>
          {event.time && <Text style={styles.eventTime}>{event.time}</Text>}
        </View>
        <View style={[styles.impactBadge, { backgroundColor: getImpactColor(event.impact) + '20' }]}>
          <Text style={[styles.impactText, { color: getImpactColor(event.impact) }]}>
            {event.impact.toUpperCase()}
          </Text>
        </View>
      </View>

      {event.stockId && (
        <View style={styles.viewStockButton}>
          <Text style={styles.viewStockText}>View Stock</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary.main} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Market Events</Text>
          <Text style={styles.headerSubtitle}>
            Stay updated with important market events and dates
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.type}
              style={[
                styles.filterButton,
                selectedFilter === filter.type && styles.filterButtonActive,
              ]}
              onPress={() => {
                hapticFeedback.selection();
                setSelectedFilter(filter.type);
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter.type && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {upcomingEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            {upcomingEvents.map(renderEventCard)}
          </View>
        )}

        {completedEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Past Events</Text>
            {completedEvents.map(renderEventCard)}
          </View>
        )}

        {filteredEvents.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={colors.text.secondary} />
            <Text style={styles.emptyStateTitle}>No Events Found</Text>
            <Text style={styles.emptyStateText}>
              There are no {selectedFilter !== 'all' ? selectedFilter : ''} events at this time
            </Text>
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  filtersContainer: {
    marginBottom: spacing.xxl,
  },
  filtersContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  filterButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  filterText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  filterTextActive: {
    color: colors.text.inverse,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  eventCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eventHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  eventIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.main + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  eventTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    flex: 1,
  },
  tickerBadge: {
    backgroundColor: colors.primary.main + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  tickerText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
  },
  eventDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  eventDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventDate: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  eventTime: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  impactBadge: {
    paddingHorizontal: 10,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  impactText: {
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
  },
  viewStockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 4,
  },
  viewStockText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.main,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

