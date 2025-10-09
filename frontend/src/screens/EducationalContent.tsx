/**
 * Educational Content Screen
 * Provides trading courses and investment learning materials
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileStackParamList } from '../navigation/types';
import { colors, typography, spacing, borderRadius } from '../theme';

type EducationalContentScreenProp = StackNavigationProp<ProfileStackParamList, 'EducationalContent'>;

interface Props {
  navigation: EducationalContentScreenProp;
}

interface Course {
  id: string;
  lessonNumber: string;
  title: string;
  description: string;
  category: string;
  emoji: string;
  duration?: string;
  skillLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  completed?: boolean;
  progress?: number;
}

const coursesByCategory = {
  'Beginner': [
    {
      id: '1',
      lessonNumber: 'Lesson 1',
      title: 'Introduction to Stock Trading',
      description: 'Learn the fundamentals of stock trading and how the NSE works.',
      category: 'Beginner',
      emoji: '01',
      duration: '15 min',
      skillLevel: 'Beginner' as const,
      completed: true,
      progress: 100,
    },
    {
      id: '2',
      lessonNumber: 'Lesson 2',
      title: 'Understanding Market Trends',
      description: 'Explore how to identify and analyze market trends for better decisions.',
      category: 'Beginner',
      emoji: '02',
      duration: '20 min',
      skillLevel: 'Beginner' as const,
      completed: true,
      progress: 100,
    },
    {
      id: '3',
      lessonNumber: 'Lesson 3',
      title: 'Reading Stock Charts',
      description: 'Master the basics of candlesticks and price charts.',
      category: 'Beginner',
      emoji: '03',
      duration: '25 min',
      skillLevel: 'Beginner' as const,
      completed: false,
      progress: 60,
    },
    {
      id: '8',
      lessonNumber: 'Lesson 8',
      title: 'What is Value Investing?',
      description: 'Introduction to buying stocks below their true worth using the principles of Benjamin Graham and Warren Buffett.',
      category: 'Beginner',
      emoji: '08',
      duration: '20 min',
      skillLevel: 'Beginner' as const,
      completed: false,
      progress: 0,
    },
    {
      id: '9',
      lessonNumber: 'Lesson 9',
      title: 'Margin of Safety - Your Safety Net',
      description: 'Learn to protect yourself by buying at significant discounts to intrinsic value.',
      category: 'Beginner',
      emoji: '09',
      duration: '18 min',
      skillLevel: 'Beginner' as const,
      completed: false,
      progress: 0,
    },
    {
      id: '10',
      lessonNumber: 'Lesson 10',
      title: 'Simple Stock Valuation',
      description: 'Easy methods to estimate if a stock is undervalued using P/E and P/B ratios.',
      category: 'Beginner',
      emoji: '10',
      duration: '22 min',
      skillLevel: 'Beginner' as const,
      completed: false,
      progress: 0,
    },
  ],
  'Intermediate': [
    {
      id: '4',
      lessonNumber: 'Lesson 4',
      title: 'Technical Analysis Fundamentals',
      description: 'Learn RSI, MACD, and other key indicators.',
      category: 'Intermediate',
      emoji: '04',
      duration: '30 min',
      skillLevel: 'Intermediate' as const,
      completed: false,
      progress: 0,
    },
    {
      id: '5',
      lessonNumber: 'Lesson 5',
      title: 'Portfolio Diversification Strategies',
      description: 'Build a balanced portfolio across sectors.',
      category: 'Intermediate',
      emoji: '05',
      duration: '25 min',
      skillLevel: 'Intermediate' as const,
      completed: false,
      progress: 0,
    },
    {
      id: '11',
      lessonNumber: 'Lesson 11',
      title: 'Economic Moats - Finding Competitive Advantages',
      description: 'Identify companies with durable competitive advantages that protect profits.',
      category: 'Intermediate',
      emoji: '11',
      duration: '28 min',
      skillLevel: 'Intermediate' as const,
      completed: false,
      progress: 0,
    },
    {
      id: '12',
      lessonNumber: 'Lesson 12',
      title: 'Understanding Business Models',
      description: 'Learn to analyze how a company makes money and if it is sustainable.',
      category: 'Intermediate',
      emoji: '12',
      duration: '26 min',
      skillLevel: 'Intermediate' as const,
      completed: false,
      progress: 0,
    },
    {
      id: '13',
      lessonNumber: 'Lesson 13',
      title: 'Intrinsic Value Calculation',
      description: 'Practical approaches to estimate what a business is truly worth.',
      category: 'Intermediate',
      emoji: '13',
      duration: '32 min',
      skillLevel: 'Intermediate' as const,
      completed: false,
      progress: 0,
    },
    {
      id: '14',
      lessonNumber: 'Lesson 14',
      title: 'Liquidity and Risk Analysis',
      description: 'Assess if you can actually buy and sell the stock, and identify hidden risks.',
      category: 'Intermediate',
      emoji: '14',
      duration: '24 min',
      skillLevel: 'Intermediate' as const,
      completed: false,
      progress: 0,
    },
  ],
  'Advanced': [
    {
      id: '6',
      lessonNumber: 'Lesson 6',
      title: 'AI-Powered Trading Strategies',
      description: 'Leverage AI insights for advanced trading decisions.',
      category: 'Advanced',
      emoji: '06',
      duration: '40 min',
      skillLevel: 'Advanced' as const,
      completed: false,
      progress: 0,
    },
    {
      id: '7',
      lessonNumber: 'Lesson 7',
      title: 'Risk Management & Position Sizing',
      description: 'Advanced techniques for managing risk and capital allocation.',
      category: 'Advanced',
      emoji: '07',
      duration: '35 min',
      skillLevel: 'Advanced' as const,
      completed: false,
      progress: 0,
    },
    {
      id: '15',
      lessonNumber: 'Lesson 15',
      title: 'Return on Equity Analysis & DuPont',
      description: 'Master ROE as a key quality indicator and learn to decompose it.',
      category: 'Advanced',
      emoji: '15',
      duration: '35 min',
      skillLevel: 'Advanced' as const,
      completed: false,
      progress: 0,
    },
    {
      id: '16',
      lessonNumber: 'Lesson 16',
      title: 'Sector Analysis for Value Investors',
      description: 'Understand sector dynamics to identify when entire sectors are undervalued.',
      category: 'Advanced',
      emoji: '16',
      duration: '30 min',
      skillLevel: 'Advanced' as const,
      completed: false,
      progress: 0,
    },
    {
      id: '17',
      lessonNumber: 'Lesson 17',
      title: 'Historical Analysis & Pattern Recognition',
      description: 'Use 10-year history to identify cyclical lows and assess business durability.',
      category: 'Advanced',
      emoji: '17',
      duration: '38 min',
      skillLevel: 'Advanced' as const,
      completed: false,
      progress: 0,
    },
    {
      id: '18',
      lessonNumber: 'Lesson 18',
      title: 'Market Cycles & Behavioral Investing',
      description: 'Recognize market psychology patterns to find value during fear and sell during greed.',
      category: 'Advanced',
      emoji: '18',
      duration: '34 min',
      skillLevel: 'Advanced' as const,
      completed: false,
      progress: 0,
    },
    {
      id: '19',
      lessonNumber: 'Lesson 19',
      title: 'Graham & Buffett Principles',
      description: 'Deep dive into Benjamin Graham defensive investor criteria and Buffett quality principles.',
      category: 'Advanced',
      emoji: '19',
      duration: '42 min',
      skillLevel: 'Advanced' as const,
      completed: false,
      progress: 0,
    },
    {
      id: '20',
      lessonNumber: 'Lesson 20',
      title: 'Special Situations & Value Traps',
      description: 'Learn about spin-offs, rights issues, and how to avoid value traps.',
      category: 'Advanced',
      emoji: '20',
      duration: '36 min',
      skillLevel: 'Advanced' as const,
      completed: false,
      progress: 0,
    },
  ],
};

export default function EducationalContent({ navigation }: Props) {
  const [selectedLevel, setSelectedLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');

  const handleBack = () => {
    navigation.goBack();
  };

  const allCourses = Object.values(coursesByCategory).flat();
  const completedCount = allCourses.filter(c => c.completed).length;
  const totalCount = allCourses.length;
  const overallProgress = (completedCount / totalCount) * 100;

  return (
    <View style={styles.container}>      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}></Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Learn</Text>
        <View style={styles.headerSpacer} />
      </View>      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Summary */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Your Progress</Text>
            <Text style={styles.progressStats}>{completedCount}/{totalCount} Completed</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${overallProgress}%` }]} />
          </View>
          <Text style={styles.progressPercent}>{overallProgress.toFixed(0)}% Complete</Text>
        </View>

        {/* Skill Level Tabs */}
        <View style={styles.levelTabs}>
          {(['Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
            <TouchableOpacity
              key={level}
              style={[styles.levelTab, selectedLevel === level && styles.levelTabActive]}
              onPress={() => setSelectedLevel(level)}
            >
              <Text style={[styles.levelTabText, selectedLevel === level && styles.levelTabTextActive]}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Courses for Selected Level */}
        <View style={styles.categorySection}>
          <View style={styles.coursesContainer}>
            {coursesByCategory[selectedLevel].map((course) => (
              <TouchableOpacity 
                key={course.id} 
                style={styles.courseCard}
                onPress={() => {
                  navigation.navigate('LessonDetail', {
                    lessonId: course.id,
                    title: course.title,
                    description: course.description,
                    level: course.skillLevel || 'Beginner'
                  });
                }}
                activeOpacity={0.7}
              >
                <View style={styles.courseImage}>
                  {course.completed ? (
                    <View style={styles.completedOverlay}>
                      <Text style={styles.completedIcon}></Text>
                    </View>
                  ) : course.progress && course.progress > 0 ? (
                    <View style={styles.inProgressOverlay}>
                      <Text style={styles.inProgressText}>{course.progress}%</Text>
                    </View>
                  ) : (
                    <View style={styles.playOverlay}>
                      <View style={styles.playButton}>
                        <Text style={styles.playIcon}></Text>
                      </View>
                    </View>
                  )}
                  <Text style={styles.courseEmoji}>{course.emoji}</Text>
                </View>
                
                <View style={styles.courseInfo}>
                  <View style={styles.courseHeader}>
                    <Text style={styles.lessonNumber}>{course.lessonNumber}</Text>
                    {course.duration && (
                      <Text style={styles.courseDuration}>{course.duration}</Text>
                    )}
                  </View>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <Text style={styles.courseDescription} numberOfLines={2}>{course.description}</Text>
                  {course.progress !== undefined && course.progress > 0 && !course.completed && (
                    <View style={styles.courseProgressBar}>
                      <View style={[styles.courseProgressFill, { width: `${course.progress}%` }]} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary + 'CC',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main + '20',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: colors.text.primary,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  progressCard: {
    backgroundColor: colors.background.card,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  progressStats: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: borderRadius.full,
  },
  progressPercent: {
    fontSize: typography.fontSize.sm,
    color: colors.success,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'right',
  },
  levelTabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  levelTab: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.main,
    alignItems: 'center',
  },
  levelTabActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  levelTabText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  levelTabTextActive: {
    color: colors.primary.contrast,
    fontWeight: typography.fontWeight.bold,
  },
  categorySection: {
    marginBottom: spacing.xl,
  },
  categoryTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  coursesContainer: {
    gap: spacing.md,
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: colors.primary.main + '10',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  courseImage: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  completedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.success + 'CC',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    zIndex: 1,
  },
  completedIcon: {
    fontSize: 32,
    color: colors.text.inverse,
  },
  inProgressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.warning + 'CC',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    zIndex: 1,
  },
  inProgressText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.inverse,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  courseDuration: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.medium,
  },
  courseProgressBar: {
    height: 4,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  courseProgressFill: {
    height: '100%',
    backgroundColor: colors.warning,
    borderRadius: borderRadius.full,
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 16,
    color: colors.primary.contrast,
    marginLeft: 2,
  },
  courseEmoji: {
    fontSize: 20,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
    position: 'absolute',
    zIndex: -1,
  },
  courseInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  lessonNumber: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary.main + 'CC',
    marginBottom: 4,
  },
  courseTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginTop: 4,
    marginBottom: 4,
  },
  courseDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});

