/**
 * Watchlist Screen
 * View and manage watchlist stocks
 */
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius } from '../theme';
import { LoadingState, EmptyState, Card, Button } from '../components';
import { api } from '../api/client';
import { hapticFeedback } from '../utils/haptics';

interface WatchlistItem {
  symbol: string;
  name: string;
  last_price?: number;
  change_pct?: number;
}

export default function Watchlist() {
  const navigation = useNavigation();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadWatchlist();
    
    // Auto-refresh every 30 seconds for real-time updates
    const refreshInterval = setInterval(() => {
      loadWatchlist(true);
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, []);

  const loadWatchlist = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Load watchlist
      const watchlistRes = await api.get('/watchlist');
      const watchlistItems = watchlistRes.data.items || [];

      // Load market data to get prices
      const marketsRes = await api.get('/markets');
      const instruments = marketsRes.data.instruments || [];

      // Merge watchlist with market data
      const enrichedItems = watchlistItems.map((item: any) => {
        const marketData = instruments.find((inst: any) => inst.symbol === item.symbol);
        return {
          symbol: item.symbol,
          name: item.name,
          last_price: marketData?.last_price,
          change_pct: marketData?.change_pct,
        };
      });

      setItems(enrichedItems);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load watchlist:', error);
      if (!isRefresh) {
        Alert.alert('Error', 'Failed to load watchlist. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const removeFromWatchlist = async (symbol: string) => {
    try {
      await api.delete(`/watchlist/${symbol}`);
      hapticFeedback.light();
      loadWatchlist(); // Reload the list
    } catch (error) {
      hapticFeedback.error();
      Alert.alert('Error', 'Failed to remove from watchlist');
    }
  };

  const handleStockPress = (symbol: string) => {
    hapticFeedback.light();
    navigation.navigate('Markets' as never, { 
      screen: 'StockDetail', 
      params: { symbol } 
    } as never);
  };

  const onRefresh = () => {
    loadWatchlist(true);
  };

  if (loading) {
    return <LoadingState message="Loading watchlist..." />;
  }

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="No Watchlist Items"
          message="Add stocks to your watchlist to track them easily"
          actionLabel="Browse Markets"
          onAction={() => navigation.navigate('Markets' as never)}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
        {/* Header Info */}
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Your Watchlist</Text>
          <View style={styles.headerMetadata}>
            <Text style={styles.headerSubtitle}>
              {items.length} {items.length === 1 ? 'stock' : 'stocks'} tracked
            </Text>
            <Text style={styles.lastUpdateText}>
              Last updated: {lastUpdate.toLocaleTimeString()}
            </Text>
          </View>
        </View>

        {/* Watchlist Items */}
        {items.map((item) => {
          const isPositive = (item.change_pct || 0) >= 0;
          
          return (
            <Card key={item.symbol} style={styles.stockCard} padding="md">
              <TouchableOpacity
                onPress={() => handleStockPress(item.symbol)}
                style={styles.stockContent}
              >
                <View style={styles.stockInfo}>
                  <View style={styles.stockIconContainer}>
                    <View style={[
                      styles.stockIcon, 
                      isPositive ? styles.stockIconGreen : styles.stockIconRed
                    ]}>
                      <Text style={styles.stockIconText}>{item.symbol[0]}</Text>
                    </View>
                  </View>

                  <View style={styles.stockDetails}>
                    <Text style={styles.stockSymbol}>{item.symbol}</Text>
                    <Text style={styles.stockName} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </View>
                </View>

                <View style={styles.stockPrice}>
                  {item.last_price !== undefined ? (
                    <>
                      <Text style={styles.priceText}>
                        KES {item.last_price.toFixed(2)}
                      </Text>
                      <Text style={[
                        styles.changeText,
                        isPositive ? styles.changePositive : styles.changeNegative
                      ]}>
                        {isPositive ? '+' : ''}{item.change_pct?.toFixed(2)}%
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.priceUnavailable}>Price unavailable</Text>
                  )}
                </View>
              </TouchableOpacity>

              
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => {
                  Alert.alert(
                    'Remove Stock',
                    `Remove ${item.symbol} from watchlist?`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Remove',
                        style: 'destructive',
                        onPress: () => removeFromWatchlist(item.symbol),
                      },
                    ]
                  );
                }}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </Card>
          );
        })}

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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  headerInfo: {
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  headerMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastUpdateText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.disabled,
    fontStyle: 'italic',
  },
  stockCard: {
    marginBottom: spacing.md,
    position: 'relative',
  },
  stockContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stockIconContainer: {
    marginRight: spacing.md,
  },
  stockIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockIconGreen: {
    backgroundColor: colors.success + '20',
  },
  stockIconRed: {
    backgroundColor: colors.error + '20',
  },
  stockIconText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  stockDetails: {
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
  stockPrice: {
    alignItems: 'flex-end',
    marginRight: spacing.xl,
  },
  priceText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  changeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  changePositive: {
    color: colors.success,
  },
  changeNegative: {
    color: colors.error,
  },
  priceUnavailable: {
    fontSize: typography.fontSize.sm,
    color: colors.text.disabled,
  },
  removeButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 16,
    color: colors.text.disabled,
    fontWeight: typography.fontWeight.bold,
  },
});

