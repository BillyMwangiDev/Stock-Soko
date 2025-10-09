/**
 * News Screen
 * Financial news feed with category filters
 */
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';
import { api } from '../api/client';

interface NewsArticle {
  id: string;
  category: string;
  title: string;
  description: string;
  source?: string;
  published_at?: string;
  url?: string;
  aiSummary?: string;
  sentiment?: 'Bullish' | 'Bearish' | 'Neutral';
  impactStocks?: string[];
  impactDirection?: 'positive' | 'negative' | 'neutral';
}

export default function News() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<NewsArticle[]>([]);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'markets', label: 'Markets' },
    { id: 'stocks', label: 'Stocks' },
    { id: 'economy', label: 'Economy' },
    { id: 'technology', label: 'Tech' },
  ];

  useEffect(() => {
    loadNews();
  }, [activeCategory]);

  const generateAISummary = (title: string, description: string): string => {
    // In production, call AI API. For now, intelligent extraction
    const words = description.split(' ').slice(0, 20).join(' ');
    return words.length < description.length ? words + '...' : words;
  };

  const detectSentiment = (title: string, description: string): 'Bullish' | 'Bearish' | 'Neutral' => {
    const text = (title + ' ' + description).toLowerCase();
    const bullishWords = ['gains', 'growth', 'surge', 'positive', 'up', 'rise', 'strong', 'profit'];
    const bearishWords = ['loss', 'decline', 'drop', 'negative', 'down', 'fall', 'weak', 'concern'];
    
    const bullishCount = bullishWords.filter(word => text.includes(word)).length;
    const bearishCount = bearishWords.filter(word => text.includes(word)).length;
    
    if (bullishCount > bearishCount) return 'Bullish';
    if (bearishCount > bullishCount) return 'Bearish';
    return 'Neutral';
  };

  const extractImpactStocks = (title: string, description: string): string[] => {
    const text = title + ' ' + description;
    const stockSymbols = ['SCOM', 'KCB', 'EQTY', 'EABL', 'SBIC', 'BAT', 'COOP', 'NBK'];
    return stockSymbols.filter(symbol => text.includes(symbol));
  };

  const loadNews = async () => {
    try {
      const params = activeCategory !== 'all' ? { category: activeCategory } : {};
      const response = await api.get('/news', { params });
      
      const newsData = response.data.news || response.data.articles || [];
      setArticles(newsData.map((item: any) => {
        const title = item.title || '';
        const description = item.description || item.summary || item.content || '';
        const sentiment = detectSentiment(title, description);
        const impactStocks = extractImpactStocks(title, description);
        
        return {
          id: item.id || item.article_id || Math.random().toString(),
          category: item.category || 'Markets',
          title,
          description,
          source: item.source || 'Stock Soko',
          published_at: item.published_at || item.date || new Date().toISOString(),
          url: item.url || '',
          aiSummary: generateAISummary(title, description),
          sentiment,
          impactStocks: impactStocks.length > 0 ? impactStocks : undefined,
          impactDirection: sentiment === 'Bullish' ? 'positive' : sentiment === 'Bearish' ? 'negative' : 'neutral',
        };
      }));
    } catch (error) {
      console.error('Failed to load news:', error);
      // Fallback to mock data if API fails
      setArticles([
        {
          id: '1',
          category: 'Markets',
          title: 'Connect to News API for live updates',
          description: 'Real-time market news will appear here once the backend /news endpoint is configured with a news data provider.',
          source: 'Stock Soko',
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNews();
  };

  const filteredArticles = articles;

  return (
    <View style={styles.container}>      <View style={styles.header}>
        <Text style={styles.headerTitle}>News</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Text style={styles.settingsIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.tab,
                activeCategory === category.id && styles.tabActive,
              ]}
              onPress={() => setActiveCategory(category.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeCategory === category.id && styles.tabTextActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* News Feed */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading news...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.main} />}
          showsVerticalScrollIndicator={false}
        >
        {filteredArticles.map((article, index) => (
          <View key={article.id}>
            <TouchableOpacity
              style={styles.articleCard}
              activeOpacity={0.7}
            >
              <View style={styles.articleContent}>
                <View style={styles.articleHeader}>
                  <Text style={styles.categoryLabel}>{article.category.toUpperCase()}</Text>
                  {article.sentiment && (
                    <View style={[
                      styles.sentimentBadge,
                      { backgroundColor: article.sentiment === 'Bullish' ? colors.success + '20' : 
                                        article.sentiment === 'Bearish' ? colors.error + '20' : 
                                        colors.text.tertiary + '20' }
                    ]}>
                      <Text style={[
                        styles.sentimentText,
                        { color: article.sentiment === 'Bullish' ? colors.success : 
                                 article.sentiment === 'Bearish' ? colors.error : 
                                 colors.text.tertiary }
                      ]}>
                        {article.sentiment}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.articleTitle}>{article.title}</Text>
                {article.aiSummary && (
                  <View style={styles.aiSummaryContainer}>
                    <Text style={styles.aiSummaryLabel}>AI Summary:</Text>
                    <Text style={styles.aiSummaryText} numberOfLines={2}>
                      {article.aiSummary}
                    </Text>
                  </View>
                )}
                {article.impactStocks && article.impactStocks.length > 0 && (
                  <View style={styles.impactStocks}>
                    <Text style={styles.impactLabel}>Impact: </Text>
                    {article.impactStocks.slice(0, 3).map((stock, idx) => (
                      <View key={stock} style={[
                        styles.impactStockBadge,
                        { backgroundColor: article.impactDirection === 'positive' ? colors.success + '20' : 
                                           article.impactDirection === 'negative' ? colors.error + '20' : 
                                           colors.text.tertiary + '20' }
                      ]}>
                        <Text style={[
                          styles.impactStockText,
                          { color: article.impactDirection === 'positive' ? colors.success : 
                                   article.impactDirection === 'negative' ? colors.error : 
                                   colors.text.tertiary }
                        ]}>
                          {stock}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
              
              <View style={styles.articleImage}>
                <Text style={styles.categoryIcon}>{article.category[0]}</Text>
              </View>
            </TouchableOpacity>
            
            {index < filteredArticles.length - 1 && <View style={styles.divider} />}
          </View>
        ))}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary + 'CC',
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 24,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main,
  },
  tabsContent: {
    paddingHorizontal: spacing.md,
  },
  tab: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary.main,
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  tabTextActive: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  articleCard: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  articleContent: {
    flex: 2,
  },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 1.2,
    color: colors.primary.main,
  },
  sentimentBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  sentimentText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  articleTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    lineHeight: 24,
    marginBottom: spacing.xs,
  },
  articleDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  aiSummaryContainer: {
    backgroundColor: colors.primary.main + '10',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: colors.primary.main,
  },
  aiSummaryLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.main,
    marginBottom: 2,
  },
  aiSummaryText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  impactStocks: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  impactLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.medium,
  },
  impactStockBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  impactStockText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  articleImage: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 32,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.main,
    marginVertical: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
});
