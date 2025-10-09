import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api/client';
import { colors, typography, spacing, borderRadius } from '../theme';
import { Card, LoadingState } from '../components';
import { hapticFeedback } from '../utils/haptics';

interface Instrument {
  symbol: string;
  name: string;
  last_price: number;
  change_pct: number;
  volume?: number;
  high?: number;
  low?: number;
  market_cap?: number;
}

interface MarketSummary {
  nse20: number;
  nse20Change: number;
  volume: number;
  totalGainers: number;
  totalLosers: number;
}

export default function Markets() {
  const navigation = useNavigation();
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [filteredInstruments, setFilteredInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'gainers' | 'losers'>('all');
  const [marketSummary, setMarketSummary] = useState<MarketSummary>({
    nse20: 1842.50,
    nse20Change: 2.3,
    volume: 28500000,
    totalGainers: 0,
    totalLosers: 0,
  });

  useEffect(() => {
    loadMarkets();
  }, []);

  useEffect(() => {
    filterInstruments();
  }, [searchQuery, activeTab, instruments]);

  const loadMarkets = async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      console.log('[Markets] Fetching from /markets endpoint...');
      const res = await api.get('/markets');
      console.log('[Markets] Response received:', res.data);
      
      const stocks = res.data.instruments || [];
      console.log('[Markets] Total stocks loaded:', stocks.length);
      
      setInstruments(stocks);
      
      // Calculate market summary
      const gainers = stocks.filter((i: Instrument) => i.change_pct > 0);
      const losers = stocks.filter((i: Instrument) => i.change_pct < 0);
      const totalVolume = stocks.reduce((sum: number, i: Instrument) => sum + (i.volume || 0), 0);
      
      setMarketSummary(prev => ({
        ...prev,
        volume: totalVolume,
        totalGainers: gainers.length,
        totalLosers: losers.length,
      }));
      
      console.log('[Markets] Market summary updated:', { totalStocks: stocks.length, gainers: gainers.length, losers: losers.length });
    } catch (error: any) {
      console.error('[Markets] Error loading markets:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config?.url
      });
      if (!isRefreshing) {
        Alert.alert(
          'Connection Error', 
          `Failed to load market data. Make sure the backend server is running on port 5000.\n\nError: ${error.message}`
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadMarkets(true);
  };

  const filterInstruments = () => {
    let filtered = [...instruments];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        i =>
          i.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply tab filter
    if (activeTab === 'gainers') {
      filtered = filtered.filter(i => i.change_pct > 0).sort((a, b) => b.change_pct - a.change_pct);
    } else if (activeTab === 'losers') {
      filtered = filtered.filter(i => i.change_pct < 0).sort((a, b) => a.change_pct - b.change_pct);
    } else {
      filtered = filtered.sort((a, b) => Math.abs(b.change_pct) - Math.abs(a.change_pct));
    }

    setFilteredInstruments(filtered);
  };

  if (loading) {
    return <LoadingState message="Loading markets..." />;
  }

  return (
    <View style={styles.container}>      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Markets</Text>
          <Text style={styles.subtitle}>Nairobi Securities Exchange</Text>
        </View>
      </View>

      
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={colors.text.tertiary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search stocks..."
          placeholderTextColor={colors.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => {
            hapticFeedback.light();
            setActiveTab('all');
          }}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All Stocks
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'gainers' && styles.activeTab]}
          onPress={() => {
            hapticFeedback.light();
            setActiveTab('gainers');
          }}
        >
          <Ionicons 
            name="trending-up" 
            size={16} 
            color={activeTab === 'gainers' ? colors.primary.contrast : colors.text.tertiary} 
          />
          <Text style={[styles.tabText, activeTab === 'gainers' && styles.activeTabText]}>
            Gainers
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'losers' && styles.activeTab]}
          onPress={() => {
            hapticFeedback.light();
            setActiveTab('losers');
          }}
        >
          <Ionicons 
            name="trending-down" 
            size={16} 
            color={activeTab === 'losers' ? colors.primary.contrast : colors.text.tertiary} 
          />
          <Text style={[styles.tabText, activeTab === 'losers' && styles.activeTabText]}>
            Losers
          </Text>
        </TouchableOpacity>
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
        {/* Market Overview */}
        <Card variant="glass" style={styles.marketOverview}>
          <Text style={styles.overviewTitle}>Market Overview</Text>
          <View style={styles.overviewRow}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>NSE 20</Text>
              <Text style={styles.overviewValue}>{marketSummary.nse20.toFixed(2)}</Text>
              <Text style={[styles.overviewChange, { color: marketSummary.nse20Change >= 0 ? colors.success : colors.error }]}>
                {marketSummary.nse20Change >= 0 ? '+' : ''}{marketSummary.nse20Change.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Volume</Text>
              <Text style={styles.overviewValue}>
                {(marketSummary.volume / 1000000).toFixed(1)}M
              </Text>
              <Text style={styles.overviewSubtext}>shares traded</Text>
            </View>
          </View>
        </Card>

        {/* Stock List */}
        {filteredInstruments.map((stock) => (
          <TouchableOpacity
            key={stock.symbol}
            style={styles.stockCard}
            onPress={() => {
              hapticFeedback.impact();
              navigation.navigate('StockDetail' as never, { symbol: stock.symbol } as never);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.stockIconContainer}>
              <View style={[
                styles.stockIcon,
                { backgroundColor: stock.change_pct >= 0 ? colors.success + '20' : colors.error + '20' }
              ]}>
                <Text style={[
                  styles.stockIconText,
                  { color: stock.change_pct >= 0 ? colors.success : colors.error }
                ]}>
                  {stock.symbol.charAt(0)}
                </Text>
              </View>
            </View>

            <View style={styles.stockInfo}>
              <Text style={styles.stockSymbol}>{stock.symbol}</Text>
              <Text style={styles.stockName} numberOfLines={1}>{stock.name}</Text>
            </View>

            <View style={styles.stockPriceContainer}>
              <Text style={styles.stockPrice}>KES {stock.last_price.toFixed(2)}</Text>
              <View style={styles.stockChangeContainer}>
                <Ionicons 
                  name={stock.change_pct >= 0 ? 'trending-up' : 'trending-down'} 
                  size={12} 
                  color={stock.change_pct >= 0 ? colors.success : colors.error} 
                />
                <Text style={[
                  styles.stockChange,
                  { color: stock.change_pct >= 0 ? colors.success : colors.error }
                ]}>
                  {stock.change_pct >= 0 ? '+' : ''}{stock.change_pct.toFixed(2)}%
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {filteredInstruments.length === 0 && (
          <Card variant="outline" style={styles.emptyState}>
            <Ionicons name="search-outline" size={40} color={colors.text.tertiary} />
            <Text style={styles.emptyText}>No stocks found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filter</Text>
          </Card>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.main,
    gap: 4,
  },
  activeTab: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.medium,
  },
  activeTabText: {
    color: colors.primary.contrast,
    fontWeight: typography.fontWeight.semibold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
  },
  marketOverview: {
    marginBottom: spacing.md,
  },
  overviewTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overviewItem: {
    flex: 1,
  },
  overviewLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  overviewValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  overviewChange: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  overviewSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockIconText: {
    fontSize: 18,
    fontWeight: typography.fontWeight.bold,
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
    paddingVertical: spacing['3xl'],
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.sm,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
});
