/**
 * News Screen
 * Financial news feed with category filters
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';
import { FloatingAIButton } from '../components';

interface NewsArticle {
  id: string;
  category: string;
  title: string;
  description: string;
  emoji: string;
}

const mockArticles: NewsArticle[] = [
  {
    id: '1',
    category: 'Markets',
    title: 'African markets surge as tech stocks lead the way',
    description: 'Johannesburg - African stock markets experienced a significant surge today, driven by strong performances in the technology sector...',
    emoji: '',
  },
  {
    id: '2',
    category: 'Company',
    title: 'SokoTech announces record profits for Q2',
    description: 'Lagos - SokoTech, a leading African technology firm, announced record profits for the second quarter of 2024...',
    emoji: '',
  },
  {
    id: '3',
    category: 'Economy',
    title: 'African economies show resilience despite global headwinds',
    description: 'Accra - Despite ongoing global economic challenges, many African economies have demonstrated resilience...',
    emoji: '',
  },
  {
    id: '4',
    category: 'Education',
    title: 'New financial literacy program launched for African youth',
    description: 'Cairo - A new financial literacy program aimed at empowering African youth has been launched by the African Union...',
    emoji: '',
  },
];

export default function News() {
  const [activeCategory, setActiveCategory] = useState('Markets');
  const [refreshing, setRefreshing] = useState(false);

  const categories = ['Markets', 'Company', 'Economy', 'Education'];

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const filteredArticles = activeCategory === 'Markets' 
    ? mockArticles 
    : mockArticles.filter(a => a.category === activeCategory);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
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
              key={category}
              style={[
                styles.tab,
                activeCategory === category && styles.tabActive,
              ]}
              onPress={() => setActiveCategory(category)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeCategory === category && styles.tabTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* News Feed */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {filteredArticles.map((article, index) => (
          <View key={article.id}>
            <TouchableOpacity
              style={styles.articleCard}
              activeOpacity={0.7}
            >
              <View style={styles.articleContent}>
                <Text style={styles.categoryLabel}>{article.category.toUpperCase()}</Text>
                <Text style={styles.articleTitle}>{article.title}</Text>
                <Text style={styles.articleDescription} numberOfLines={3}>
                  {article.description}
                </Text>
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
  categoryLabel: {
    fontSize: 10,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 1.2,
    color: colors.primary.main,
    marginBottom: spacing.xs,
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
});
