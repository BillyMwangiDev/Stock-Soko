import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api/client';
import { colors, typography, spacing, borderRadius } from '../theme';
import { LoadingState, FloatingAIButton, Card } from '../components';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PortfolioData {
  value: number;
  change: number;
  changePercent: number;
}

interface StockData {
  symbol: string;
  name: string;
  last_price: number;
  change_pct: number;
  volume: number;
}

export default function Home() {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('Trader');
  const [portfolio, setPortfolio] = useState<PortfolioData>({
    value: 12345.67,
    change: 276.45,
    changePercent: 2.3,
  });
  const [topGainers, setTopGainers] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      // Load user name
      const email = await AsyncStorage.getItem('userEmail');
      if (email) {
        const name = email.split('@')[0];
        setUserName(name.charAt(0).toUpperCase() + name.slice(1));
      }

      // Load portfolio data
      const balanceRes = await api.get('/ledger/balance');
      const positionsRes = await api.get('/ledger/positions');
      
      const balance = balanceRes.data.total || 0;
      const positions = positionsRes.data.positions || [];
      
      const totalValue = balance + positions.reduce((sum: number, p: any) => sum + (p.market_value || 0), 0);
      const totalGain = positions.reduce((sum: number, p: any) => sum + (p.unrealized_pl || 0), 0);
      const changePercent = totalValue > 0 ? (totalGain / totalValue) * 100 : 0;

      setPortfolio({
        value: totalValue,
        change: totalGain,
        changePercent,
      });

      // Load top gainers
      const marketsRes = await api.get('/markets');
      const instruments = marketsRes.data.instruments || [];
      const gainers = instruments
        .filter((stock: any) => stock.change_pct > 0)
        .sort((a: any, b: any) => b.change_pct - a.change_pct)
        .slice(0, 3)
        .map((stock: any) => ({
          symbol: stock.symbol,
          name: stock.name,
          last_price: stock.last_price,
          change_pct: stock.change_pct,
          volume: stock.volume || 0,
        }));
      setTopGainers(gainers);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadData(true);
  };

  if (loading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  return (
    <View style={styles.container}>
      {/* Enhanced Header with Logo */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>SS</Text>
        </View>
        <Text style={styles.headerTitle}>Stock Soko</Text>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Profile', { screen: 'NotificationCenter' })}
        >
          <Ionicons name="notifications-outline" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
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
        {/* Personalized Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>Karibu, {userName} 👋</Text>
          <Text style={styles.subtitle}>Welcome to Stock Soko</Text>
        </View>

        {/* Enhanced Portfolio Summary Card */}
        <Card variant="elevated" style={styles.portfolioCard}>
          <View style={styles.portfolioHeader}>
            <Text style={styles.portfolioLabel}>Portfolio Value</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Portfolio', { screen: 'Portfolio' })}>
              <Ionicons name="arrow-forward" size={20} color={colors.primary.main} />
            </TouchableOpacity>
          </View>
          <Text style={styles.portfolioValue}>
            KES {portfolio.value.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <View style={styles.portfolioChange}>
            <Ionicons 
              name={portfolio.changePercent >= 0 ? 'trending-up' : 'trending-down'} 
              size={16} 
              color={portfolio.changePercent >= 0 ? colors.success : colors.error} 
            />
            <Text style={[styles.changeText, portfolio.changePercent >= 0 ? styles.changePositive : styles.changeNegative]}>
              {portfolio.changePercent >= 0 ? '+' : ''}{portfolio.changePercent.toFixed(2)}%
            </Text>
            <Text style={styles.changePeriod}>Today</Text>
          </View>
          <Text style={[styles.changeAmount, portfolio.change >= 0 ? styles.changePositive : styles.changeNegative]}>
            {portfolio.change >= 0 ? '+' : ''}KES {portfolio.change.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </Card>

        {/* Quick Actions */}
        <Card variant="glass" style={styles.quickActionsCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Markets', { screen: 'Markets' })}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="trending-up" size={24} color={colors.primary.main} />
              </View>
              <Text style={styles.actionText}>Trade</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Profile', { screen: 'Wallet' })}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="wallet-outline" size={24} color={colors.primary.main} />
              </View>
              <Text style={styles.actionText}>Deposit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Profile', { screen: 'EducationalContent' })}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="school-outline" size={24} color={colors.primary.main} />
              </View>
              <Text style={styles.actionText}>Learn</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* AI Recommendations */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="sparkles" size={20} color={colors.primary.main} />
            <Text style={styles.sectionTitle}>AI Recommendations</Text>
          </View>
        </View>
        <Card variant="glass" style={styles.aiCard}>
          <Text style={styles.aiTitle}>Market Opportunity</Text>
          <Text style={styles.aiText}>
            Based on your portfolio, consider diversifying into the banking sector. 
            Strong fundamentals detected with positive momentum indicators.
          </Text>
          <TouchableOpacity 
            style={styles.aiButton}
            onPress={() => navigation.navigate('Profile', { screen: 'AIAssistant' })}
          >
            <Text style={styles.aiButtonText}>View Analysis</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.primary.main} />
          </TouchableOpacity>
        </Card>

        {/* Top Gainers */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Gainers Today</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Markets', { screen: 'Markets' })}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {topGainers.length > 0 ? (
          topGainers.map((stock, index) => (
            <TouchableOpacity
              key={stock.symbol}
              style={styles.stockCard}
              onPress={() => navigation.navigate('Markets', { 
                screen: 'StockDetail', 
                params: { symbol: stock.symbol } 
              })}
            >
              <View style={styles.stockIconContainer}>
                <View style={styles.stockIcon}>
                  <Text style={styles.stockIconText}>{stock.symbol.charAt(0)}</Text>
                </View>
              </View>
              <View style={styles.stockInfo}>
                <Text style={styles.stockSymbol}>{stock.symbol}</Text>
                <Text style={styles.stockName} numberOfLines={1}>{stock.name}</Text>
              </View>
              <View style={styles.stockPriceContainer}>
                <Text style={styles.stockPrice}>
                  KES {stock.last_price.toFixed(2)}
                </Text>
                <View style={styles.stockChangeContainer}>
                  <Ionicons name="trending-up" size={12} color={colors.success} />
                  <Text style={[styles.stockChange, { color: colors.success }]}>
                    +{stock.change_pct.toFixed(2)}%
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Card variant="outline" style={styles.emptyState}>
            <Ionicons name="trending-up-outline" size={40} color={colors.text.tertiary} />
            <Text style={styles.emptyStateText}>No gainers available</Text>
          </Card>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <FloatingAIButton />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main + '40',
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.contrast,
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 140,
  },
  greetingSection: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  greeting: {
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  portfolioCard: {
    marginBottom: spacing.lg,
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  portfolioLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  portfolioValue: {
    fontSize: 32,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  portfolioChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.xs,
  },
  changeText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  changePeriod: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginLeft: spacing.xs,
  },
  changeAmount: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  changePositive: {
    color: colors.success,
  },
  changeNegative: {
    color: colors.error,
  },
  quickActionsCard: {
    marginBottom: spacing.lg,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
  },
  actionButton: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  seeAllText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary.main,
    fontWeight: typography.fontWeight.medium,
  },
  aiCard: {
    marginBottom: spacing.lg,
  },
  aiTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  aiText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
  aiButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary.main,
    fontWeight: typography.fontWeight.semibold,
  },
  stockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.main,
    marginBottom: spacing.sm,
  },
  stockIconContainer: {
    marginRight: spacing.md,
  },
  stockIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockIconText: {
    fontSize: 18,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
  },
  stockInfo: {
    flex: 1,
  },
  stockSymbol: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  stockName: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  stockPriceContainer: {
    alignItems: 'flex-end',
  },
  stockPrice: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  stockChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  stockChange: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyStateText: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
  },
});
