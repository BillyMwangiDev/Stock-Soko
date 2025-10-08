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
}

const coursesByCategory = {
  'Trading Basics': [
    {
      id: '1',
      lessonNumber: 'Lesson 1',
      title: 'Introduction to Stock Trading',
      description: 'Learn the fundamentals of stock trading.',
      category: 'Trading Basics',
      emoji: '01',
    },
    {
      id: '2',
      lessonNumber: 'Lesson 2',
      title: 'Understanding Market Trends',
      description: 'Explore how to analyze market trends.',
      category: 'Trading Basics',
      emoji: '02',
    },
  ],
  'NSE 101': [
    {
      id: '3',
      lessonNumber: 'Lesson 3',
      title: 'Navigating the NSE',
      description: 'Get acquainted with the Nairobi Stock Exchange.',
      category: 'NSE 101',
      emoji: '03',
    },
    {
      id: '4',
      lessonNumber: 'Lesson 4',
      title: 'Investing in Kenyan Stocks',
      description: 'Discover strategies for investing in Kenyan stocks.',
      category: 'NSE 101',
      emoji: '04',
    },
  ],
  'Advanced AI Insights': [
    {
      id: '5',
      lessonNumber: 'Lesson 5',
      title: 'AI-Powered Trading Strategies',
      description: 'Leverage AI for smarter trading decisions.',
      category: 'Advanced AI Insights',
      emoji: '05',
    },
  ],
};

export default function EducationalContent({ navigation }: Props) {
  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Learn</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(coursesByCategory).map(([category, courses]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category}</Text>
            
            <View style={styles.coursesContainer}>
              {courses.map((course) => (
                <TouchableOpacity key={course.id} style={styles.courseCard}>
                  <View style={styles.courseImage}>
                    <View style={styles.playOverlay}>
                      <View style={styles.playButton}>
                        <Text style={styles.playIcon}>▶</Text>
                      </View>
                    </View>
                    <Text style={styles.courseEmoji}>{course.emoji}</Text>
                  </View>
                  
                  <View style={styles.courseInfo}>
                    <Text style={styles.lessonNumber}>{course.lessonNumber}</Text>
                    <Text style={styles.courseTitle}>{course.title}</Text>
                    <Text style={styles.courseDescription}>{course.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

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

