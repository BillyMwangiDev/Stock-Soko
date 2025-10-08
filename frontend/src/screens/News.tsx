import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Linking } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';
import { Card, Badge, LoadingState, EmptyState } from '../components';

interface NewsArticle {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  url: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  relatedSymbols?: string[];
}

export default function News() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    setLoading(true);
    // Simulated news data - in production, this would come from your backend
    const mockArticles: NewsArticle[] = [
      {
        id: '1',
        title: 'NSE 20-Share Index Gains 0.5% on Banking Sector Rally',
        source: 'Business Daily',
        publishedAt: new Date().toISOString(),
        url: 'https://example.com',
        sentiment: 'positive',
        relatedSymbols: ['KCB', 'EQTY'],
      },
      {
        id: '2',
        title: 'Safaricom Reports Strong Q3 Earnings Amid M-Pesa Growth',
        source: 'The Standard',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        url: 'https://example.com',
        sentiment: 'positive',
        relatedSymbols: ['SCOM'],
      },
      {
        id: '3',
        title: 'Market Volatility Expected Following CMA Regulatory Changes',
        source: 'Capital FM',
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        url: 'https://example.com',
        sentiment: 'neutral',
        relatedSymbols: [],
      },
      {
        id: '4',
        title: 'Manufacturing Sector Faces Headwinds Amid Rising Input Costs',
        source: 'Nation',
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        url: 'https://example.com',
        sentiment: 'negative',
        relatedSymbols: ['BAT', 'EABL'],
      },
      {
        id: '5',
        title: 'KenGen Announces New Renewable Energy Project Worth KES 5B',
        source: 'Reuters',
        publishedAt: new Date(Date.now() - 14400000).toISOString(),
        url: 'https://example.com',
        sentiment: 'positive',
        relatedSymbols: ['KEGN'],
      },
    ];

    setTimeout(() => {
      setArticles(mockArticles);
      setLoading(false);
      setRefreshing(false);
    }, 1000);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNews();
  };

  const openArticle = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date().getTime();
    const published = new Date(dateString).getTime();
    const diffMinutes = Math.floor((now - published) / 60000);

    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  const filteredArticles = filter === 'all' 
    ? articles 
    : articles.filter(a => a.sentiment === filter);

  if (loading && articles.length === 0) {
    return <LoadingState message="Loading news..." />;
  }

  return (
    <View style={styles.container}>
      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterChipText, filter === 'all' && styles.filterChipTextActive]}>
              All News
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'positive' && styles.filterChipActive]}
            onPress={() => setFilter('positive')}
          >
            <Text style={[styles.filterChipText, filter === 'positive' && styles.filterChipTextActive]}>
              Positive 📈
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'negative' && styles.filterChipActive]}
            onPress={() => setFilter('negative')}
          >
            <Text style={[styles.filterChipText, filter === 'negative' && styles.filterChipTextActive]}>
              Negative 📉
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'neutral' && styles.filterChipActive]}
            onPress={() => setFilter('neutral')}
          >
            <Text style={[styles.filterChipText, filter === 'neutral' && styles.filterChipTextActive]}>
              Neutral
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.main} />
        }
      >
        {filteredArticles.length === 0 ? (
          <EmptyState
            title="No News"
            message="No articles available for this filter"
            actionLabel="Show All"
            onAction={() => setFilter('all')}
          />
        ) : (
          filteredArticles.map(article => (
            <TouchableOpacity
              key={article.id}
              onPress={() => openArticle(article.url)}
              activeOpacity={0.7}
            >
              <Card style={styles.articleCard} padding="md">
                {/* Article Header */}
                <View style={styles.articleHeader}>
                  <Text style={styles.articleSource}>{article.source}</Text>
                  <View style={styles.articleMeta}>
                    {article.sentiment && (
                      <Badge
                        text={article.sentiment}
                        variant={
                          article.sentiment === 'positive' ? 'success' :
                          article.sentiment === 'negative' ? 'error' : 'neutral'
                        }
                        style={{ marginRight: spacing.xs }}
                      />
                    )}
                    <Text style={styles.articleTime}>{getTimeAgo(article.publishedAt)}</Text>
                  </View>
                </View>

                {/* Article Title */}
                <Text style={styles.articleTitle}>{article.title}</Text>

                {/* Related Symbols */}
                {article.relatedSymbols && article.relatedSymbols.length > 0 && (
                  <View style={styles.symbolsContainer}>
                    {article.relatedSymbols.map(symbol => (
                      <View key={symbol} style={styles.symbolChip}>
                        <Text style={styles.symbolText}>{symbol}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Read More Indicator */}
                <View style={styles.readMore}>
                  <Text style={styles.readMoreText}>Read more →</Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}

        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerText}>
            📰 News articles are sourced from various publishers. Stock Soko does not guarantee the accuracy of third-party content.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  filterBar: {
    backgroundColor: colors.background.secondary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main,
  },
  filterChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  filterChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.medium,
  },
  filterChipTextActive: {
    color: colors.primary.contrast,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.base,
  },
  articleCard: {
    marginBottom: spacing.md,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  articleSource: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  articleTime: {
    fontSize: typography.fontSize.xs,
    color: colors.text.disabled,
  },
  articleTitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  symbolsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  symbolChip: {
    backgroundColor: colors.background.primary,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  symbolText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary.main,
    fontWeight: typography.fontWeight.semibold,
  },
  readMore: {
    marginTop: spacing.xs,
  },
  readMoreText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary.main,
    fontWeight: typography.fontWeight.medium,
  },
  disclaimerCard: {
    backgroundColor: colors.background.tertiary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginTop: spacing.base,
  },
  disclaimerText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    lineHeight: 16,
  },
});
