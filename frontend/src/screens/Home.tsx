import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../api/client';
import { colors, typography, spacing, borderRadius } from '../theme';
import { LoadingState, FloatingAIButton } from '../components';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PortfolioData {
  value: number;
  change: number;
  changePercent: number;
}

const { width } = Dimensions.get('window');

export default function Home() {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('Trader');
  const [portfolio, setPortfolio] = useState<PortfolioData>({
    value: 12345.67,
    change: 276.45,
    changePercent: 2.3,
  });
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
      const email = await AsyncStorage.getItem('userEmail');
      if (email) {
        const name = email.split('@')[0];
        setUserName(name.charAt(0).toUpperCase() + name.slice(1));
      }

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
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>SS</Text>
        </View>
        <Text style={styles.headerTitle}>Stock Soko</Text>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Profile', { screen: 'NotificationCenter' })}
        >
          <Text style={styles.bellIcon}>○</Text>
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
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back, {userName}</Text>
        </View>

        <View style={styles.portfolioCard}>
          <View style={styles.portfolioInfo}>
            <Text style={styles.portfolioLabel}>Portfolio Value</Text>
            <Text style={styles.portfolioValue}>
              Ksh {portfolio.value.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <View style={styles.portfolioChange}>
              <Text style={[styles.changeText, portfolio.changePercent >= 0 ? styles.changePositive : styles.changeNegative]}>
                {portfolio.changePercent >= 0 ? '+' : ''}{portfolio.changePercent.toFixed(1)}% Today
              </Text>
            </View>
          </View>
          <View style={styles.chartPlaceholder}>
            <View style={styles.miniChart}>
              <Text style={styles.chartLabel}>Chart</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AI Recommendations</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Profile', { screen: 'AIAssistant' })}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.recommendationsGrid}>
            <TouchableOpacity 
              style={styles.recommendationCard}
              onPress={() => navigation.navigate('Profile', { screen: 'AIAssistant' })}
            >
              <View style={[styles.recommendationIcon, {backgroundColor: colors.primary.main + '20'}]}>
                <Text style={[styles.recommendationEmoji, {color: colors.primary.main}]}>★</Text>
              </View>
              <Text style={styles.recommendationTitle}>Top Picks</Text>
              <Text style={styles.recommendationSubtitle}>AI selected</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.recommendationCard}
              onPress={() => navigation.navigate('Markets', { screen: 'Markets' })}
            >
              <View style={[styles.recommendationIcon, {backgroundColor: colors.success + '20'}]}>
                <Text style={[styles.recommendationEmoji, {color: colors.success}]}>▲</Text>
              </View>
              <Text style={styles.recommendationTitle}>Trending</Text>
              <Text style={styles.recommendationSubtitle}>Movers</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.recommendationCard}
              onPress={() => navigation.navigate('Markets', { screen: 'Markets' })}
            >
              <View style={[styles.recommendationIcon, {backgroundColor: colors.warning + '20'}]}>
                <Text style={[styles.recommendationEmoji, {color: colors.warning}]}>◆</Text>
              </View>
              <Text style={styles.recommendationTitle}>Value</Text>
              <Text style={styles.recommendationSubtitle}>Undervalued</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionButtonPrimary}
              onPress={() => navigation.navigate('Markets', { screen: 'Markets' })}
            >
              <View style={styles.actionIconContainerPrimary}>
                <Text style={styles.actionIconPrimary}>↕</Text>
              </View>
              <Text style={styles.actionTextPrimary}>Trade</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButtonSecondary}
              onPress={() => navigation.navigate('Profile', { screen: 'Wallet' })}
            >
              <View style={styles.actionIconContainerSecondary}>
                <Text style={styles.actionIconSecondary}>+</Text>
              </View>
              <Text style={styles.actionTextSecondary}>Deposit</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButtonSecondary}
              onPress={() => navigation.navigate('Profile', { screen: 'EducationalContent' })}
            >
              <View style={styles.actionIconContainerSecondary}>
                <Text style={styles.actionIconSecondary}>?</Text>
              </View>
              <Text style={styles.actionTextSecondary}>Learn</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary + 'CC',
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
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
  bellIcon: {
    fontSize: 20,
    color: colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 120,
  },
  welcomeSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  portfolioCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.primary.main + '20',
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  portfolioInfo: {
    flex: 1,
  },
  portfolioLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  portfolioValue: {
    fontSize: 24,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  portfolioChange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  changeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  changePositive: {
    color: colors.success,
  },
  changeNegative: {
    color: colors.error,
  },
  chartPlaceholder: {
    width: 80,
    height: 64,
    marginLeft: spacing.sm,
  },
  miniChart: {
    flex: 1,
    backgroundColor: colors.success + '20',
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.success + '40',
  },
  chartLabel: {
    fontSize: 10,
    color: colors.success,
    fontWeight: typography.fontWeight.medium,
  },
  chartIcon: {
    fontSize: 32,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  seeAllText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary.main,
    fontWeight: typography.fontWeight.medium,
  },
  recommendationsGrid: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  recommendationCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  recommendationIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  recommendationEmoji: {
    fontSize: 24,
  },
  recommendationTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: 2,
    textAlign: 'center',
  },
  recommendationSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  actionButtonPrimary: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.md,
  },
  actionIconContainerPrimary: {
    marginBottom: spacing.xs,
  },
  actionIconPrimary: {
    fontSize: 28,
  },
  actionTextPrimary: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.contrast,
  },
  actionButtonSecondary: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  actionIconContainerSecondary: {
    marginBottom: spacing.xs,
  },
  actionIconSecondary: {
    fontSize: 28,
  },
  actionTextSecondary: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
});
