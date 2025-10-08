import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { api } from '../api/client';
import { colors, typography, spacing, borderRadius } from '../theme';
import { Card, Badge, LoadingState, EmptyState } from '../components';

interface MarketStats {
  total_instruments: number;
  gainers: number;
  losers: number;
  unchanged: number;
  total_volume: number;
  total_value: number;
}

interface Instrument {
  symbol: string;
  name: string;
  last_price: number;
  change_pct: number;
  volume?: number;
}

const { width } = Dimensions.get('window');

export default function Home() {
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [topGainers, setTopGainers] = useState<Instrument[]>([]);
  const [topLosers, setTopLosers] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.get('/markets');
      const instruments: Instrument[] = res.data.instruments || [];
      
      // Calculate stats
      const gainers = instruments.filter(i => i.change_pct > 0);
      const losers = instruments.filter(i => i.change_pct < 0);
      const unchanged = instruments.filter(i => i.change_pct === 0);
      
      setStats({
        total_instruments: instruments.length,
        gainers: gainers.length,
        losers: losers.length,
        unchanged: unchanged.length,
        total_volume: instruments.reduce((sum, i) => sum + (i.volume || 0), 0),
        total_value: 0,
      });

      // Get top movers
      const sortedByGain = [...instruments].sort((a, b) => b.change_pct - a.change_pct);
      setTopGainers(sortedByGain.slice(0, 5));
      setTopLosers(sortedByGain.slice(-5).reverse());
    } catch (error) {
      console.error('Failed to load market data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading market overview..." />;
  }

  if (!stats) {
    return (
      <EmptyState
        title="No Market Data"
        message="Unable to load market data at this time"
        actionLabel="Retry"
        onAction={loadData}
      />
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Market Overview</Text>
        <Text style={styles.subtitle}>Nairobi Securities Exchange</Text>
      </View>

      {/* Market Stats Grid */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total_instruments}</Text>
          <Text style={styles.statLabel}>Instruments</Text>
        </Card>
        
        <Card style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.gain }]}>{stats.gainers}</Text>
          <Text style={styles.statLabel}>Gainers</Text>
        </Card>
        
        <Card style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.loss }]}>{stats.losers}</Text>
          <Text style={styles.statLabel}>Losers</Text>
        </Card>
        
        <Card style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.text.tertiary }]}>{stats.unchanged}</Text>
          <Text style={styles.statLabel}>Unchanged</Text>
        </Card>
      </View>

      {/* Top Gainers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Gainers 🚀</Text>
        <Card variant="default" padding="sm">
          {topGainers.length === 0 ? (
            <Text style={styles.emptyText}>No gainers today</Text>
          ) : (
            topGainers.map((stock, index) => (
              <View key={stock.symbol} style={styles.stockRow}>
                <View style={styles.stockInfo}>
                  <Text style={styles.stockRank}>{index + 1}</Text>
                  <View>
                    <Text style={styles.stockSymbol}>{stock.symbol}</Text>
                    <Text style={styles.stockName} numberOfLines={1}>{stock.name}</Text>
                  </View>
                </View>
                <View style={styles.stockRight}>
                  <Text style={styles.stockPrice}>KES {stock.last_price.toFixed(2)}</Text>
                  <Badge 
                    text={`+${stock.change_pct.toFixed(2)}%`} 
                    variant="success"
                  />
                </View>
              </View>
            ))
          )}
        </Card>
      </View>

      {/* Top Losers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Losers 📉</Text>
        <Card variant="default" padding="sm">
          {topLosers.length === 0 ? (
            <Text style={styles.emptyText}>No losers today</Text>
          ) : (
            topLosers.map((stock, index) => (
              <View key={stock.symbol} style={styles.stockRow}>
                <View style={styles.stockInfo}>
                  <Text style={styles.stockRank}>{index + 1}</Text>
                  <View>
                    <Text style={styles.stockSymbol}>{stock.symbol}</Text>
                    <Text style={styles.stockName} numberOfLines={1}>{stock.name}</Text>
                  </View>
                </View>
                <View style={styles.stockRight}>
                  <Text style={styles.stockPrice}>KES {stock.last_price.toFixed(2)}</Text>
                  <Badge 
                    text={`${stock.change_pct.toFixed(2)}%`} 
                    variant="error"
                  />
                </View>
              </View>
            ))
          )}
        </Card>
      </View>

      {/* Quick Actions */}
      <Card variant="outlined" style={styles.actionCard}>
        <Text style={styles.actionTitle}>Quick Access</Text>
        <Text style={styles.actionText}>
          • View all markets in the Markets tab{'\n'}
          • Track your investments in Portfolio{'\n'}
          • Stay updated with latest News{'\n'}
          • Manage account in Profile
        </Text>
      </Card>
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
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
    marginBottom: spacing.base,
  },
  statCard: {
    width: (width - spacing.base * 2 - spacing.xs * 2) / 2,
    margin: spacing.xs,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: spacing.base,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stockRank: {
    width: 24,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.tertiary,
    marginRight: spacing.sm,
  },
  stockSymbol: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  stockName: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 2,
    maxWidth: width * 0.35,
  },
  stockRight: {
    alignItems: 'flex-end',
  },
  stockPrice: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  emptyText: {
    color: colors.text.tertiary,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  actionCard: {
    marginBottom: spacing.base,
  },
  actionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    lineHeight: 20,
  },
});
