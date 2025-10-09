/**
 * Investment Dashboard Screen
 * Displays portfolio overview, market news, and AI recommendations
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';
import { api } from '../api/client';

interface PortfolioSummary {
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
  totalGain: number;
  totalGainPercent: number;
}

interface AIRecommendation {
  symbol: string;
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  reasoning: string;
}

export default function Dashboard() {
  const [portfolio, setPortfolio] = useState<PortfolioSummary>({
    totalValue: 0,
    dayChange: 0,
    dayChangePercent: 0,
    totalGain: 0,
    totalGainPercent: 0,
  });
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [positionsRes, balanceRes] = await Promise.all([
        api.get('/ledger/positions'),
        api.get('/ledger/balance'),
      ]);

      const positions = positionsRes.data.positions || [];
      const balance = balanceRes.data.total || 0;

      const totalValue = positions.reduce((sum: number, p: any) => sum + p.market_value, balance);
      const totalGain = positions.reduce((sum: number, p: any) => sum + p.unrealized_pl, 0);

      setPortfolio({
        totalValue,
        dayChange: totalGain * 0.1,
        dayChangePercent: totalValue > 0 ? (totalGain * 0.1 / totalValue) * 100 : 0,
        totalGain,
        totalGainPercent: totalValue > 0 ? (totalGain / totalValue) * 100 : 0,
      });

      const mockRecommendations: AIRecommendation[] = [
        {
          symbol: 'SCOM',
          action: 'buy',
          confidence: 85,
          reasoning: 'Strong quarterly earnings and positive market sentiment. Technical indicators show bullish trend.',
        },
        {
          symbol: 'EQTY',
          action: 'hold',
          confidence: 72,
          reasoning: 'Stable performance with dividend yield. Current price near fair value, best to hold.',
        },
      ];
      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'buy':
        return colors.success;
      case 'sell':
        return colors.error;
      default:
        return colors.warning;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>Investment Dashboard</Text>

      <View style={styles.portfolioCard}>
        <Text style={styles.cardTitle}>Portfolio Summary</Text>
        <Text style={styles.totalValue}>
          KES {portfolio.totalValue.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
        </Text>
        
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Today</Text>
            <Text style={[styles.statValue, portfolio.dayChange >= 0 ? styles.positive : styles.negative]}>
              {portfolio.dayChange >= 0 ? '+' : ''}
              {portfolio.dayChange.toFixed(2)} ({portfolio.dayChangePercent.toFixed(2)}%)
            </Text>
          </View>
          
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Total Gain</Text>
            <Text style={[styles.statValue, portfolio.totalGain >= 0 ? styles.positive : styles.negative]}>
              {portfolio.totalGain >= 0 ? '+' : ''}
              {portfolio.totalGain.toFixed(2)} ({portfolio.totalGainPercent.toFixed(2)}%)
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.recommendationsSection}>
        <Text style={styles.sectionTitle}>AI Recommendations</Text>
        
        {recommendations.map((rec, index) => (
          <View key={index} style={styles.recommendationCard}>
            <View style={styles.recHeader}>
              <Text style={styles.recSymbol}>{rec.symbol}</Text>
              <View style={[styles.actionBadge, { backgroundColor: getActionColor(rec.action) }]}>
                <Text style={styles.actionText}>{rec.action.toUpperCase()}</Text>
              </View>
            </View>
            
            <View style={styles.confidenceBar}>
              <View style={[styles.confidenceFill, { width: `${rec.confidence}%` }]} />
              <Text style={styles.confidenceText}>{rec.confidence}% confidence</Text>
            </View>
            
            <Text style={styles.reasoning}>
              <Text style={styles.reasoningLabel}>Analysis: </Text>
              {rec.reasoning}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>Buy Stock</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>Deposit Funds</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>View Portfolio</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>AI Assistant</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  portfolioCard: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.fontSize.base,
    color: colors.primary.contrast,
    marginBottom: spacing.sm,
    opacity: 0.9,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.contrast,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.primary.contrast,
    marginBottom: spacing.xs,
    opacity: 0.8,
  },
  statValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  positive: {
    color: '#4ADE80',
  },
  negative: {
    color: '#F87171',
  },
  recommendationsSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  recommendationCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  recHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  recSymbol: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  actionBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  actionText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.contrast,
  },
  confidenceBar: {
    height: 24,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
    position: 'relative',
    justifyContent: 'center',
  },
  confidenceFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.sm,
  },
  confidenceText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.primary,
    textAlign: 'center',
    fontWeight: typography.fontWeight.semibold,
    zIndex: 1,
  },
  reasoning: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  reasoningLabel: {
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  quickActions: {
    marginBottom: spacing.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.main,
    alignItems: 'center',
  },
  actionText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.main,
  },
});