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
              <Text style={styles.arrowUp}>↑</Text>
              <Text style={styles.changeText}>+{portfolio.changePercent.toFixed(1)}% Today</Text>
            </View>
          </View>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartIcon}>▲</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Recommendations</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            <TouchableOpacity 
              style={styles.recommendationCard}
              onPress={() => navigation.navigate('Profile', { screen: 'AIAssistant' })}
            >
              <View style={styles.recommendationImage}>
                <Text style={styles.recommendationIcon}>★</Text>
              </View>
              <Text style={styles.recommendationTitle}>Top Picks</Text>
              <Text style={styles.recommendationSubtitle}>AI recommendations</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.recommendationCard}
              onPress={() => navigation.navigate('Markets', { screen: 'Markets' })}
            >
              <View style={styles.recommendationImage}>
                <Text style={styles.recommendationIcon}>≡</Text>
              </View>
              <Text style={styles.recommendationTitle}>Diversify</Text>
              <Text style={styles.recommendationSubtitle}>New opportunities</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.recommendationCard}
              onPress={() => navigation.navigate('Markets', { screen: 'Markets' })}
            >
              <View style={[styles.recommendationImage, styles.recommendationImageAlt]}>
                <Text style={styles.recommendationIcon}>↗</Text>
              </View>
              <Text style={styles.recommendationTitle}>Market Movers</Text>
              <Text style={styles.recommendationSubtitle}>Trending stocks</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionButtonPrimary}
              onPress={() => navigation.navigate('Markets', { screen: 'Markets' })}
            >
              <Text style={styles.actionIconPrimary}>↕</Text>
              <Text style={styles.actionTextPrimary}>Trade</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButtonSecondary}
              onPress={() => navigation.navigate('Profile', { screen: 'Wallet' })}
            >
              <Text style={styles.actionIconSecondary}>+</Text>
              <Text style={styles.actionTextSecondary}>Deposit</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButtonSecondary}
              onPress={() => navigation.navigate('Profile', { screen: 'EducationalContent' })}
            >
              <Text style={styles.actionIconSecondary}>?</Text>
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
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellIcon: {
    fontSize: 24,
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
  },
  arrowUp: {
    fontSize: 16,
    color: colors.success,
    marginRight: 4,
  },
  changeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.success,
  },
  chartPlaceholder: {
    width: 96,
    height: 64,
    backgroundColor: colors.background.card + '40',
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartIcon: {
    fontSize: 32,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  horizontalScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  recommendationCard: {
    width: 192,
  },
  recommendationImage: {
    width: 192,
    height: 128,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.card,
    marginBottom: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationImageAlt: {
    backgroundColor: colors.primary.main + '20',
  },
  recommendationIcon: {
    fontSize: 48,
    color: colors.primary.main,
  },
  recommendationTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  recommendationSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
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
    paddingVertical: spacing.md,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  actionIconPrimary: {
    fontSize: 24,
  },
  actionTextPrimary: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary.contrast,
  },
  actionButtonSecondary: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.primary.main + '20',
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  actionIconSecondary: {
    fontSize: 24,
  },
  actionTextSecondary: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary.main,
  },
});
