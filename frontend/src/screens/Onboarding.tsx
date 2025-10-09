import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../navigation/types';
import { colors, typography, spacing, borderRadius } from '../theme';
import { Button } from '../components';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

type OnboardingScreenProp = StackNavigationProp<AuthStackParamList, 'Onboarding'>;

interface Props {
  navigation: OnboardingScreenProp;
}

interface Slide {
  id: number;
  icon: string;
  iconBg: string;
  title: string;
  description: string;
}

const slides: Slide[] = [
  {
    id: 1,
    icon: 'trending-up',
    iconBg: colors.success + '20',
    title: 'Trade Kenyan Stocks Instantly',
    description: 'Access the Nairobi Securities Exchange with minimal fees. Buy and sell stocks in real-time with our OKX-style trading interface.',
  },
  {
    id: 2,
    icon: 'sparkles',
    iconBg: colors.primary.main + '20',
    title: 'AI-Powered Insights',
    description: 'Get personalized stock recommendations, detailed market analysis, and AI chat assistance powered by advanced algorithms.',
  },
  {
    id: 3,
    icon: 'wallet',
    iconBg: colors.warning + '20',
    title: 'M-Pesa Integration',
    description: 'Seamlessly deposit and withdraw funds using M-Pesa. Fast, secure, and convenient payments at your fingertips.',
  },
  {
    id: 4,
    icon: 'pie-chart',
    iconBg: colors.info + '20',
    title: 'Real-Time Portfolio Tracking',
    description: 'Monitor your investments with live P/L calculations, tax estimates, and performance analytics. Your complete financial dashboard.',
  },
];

export default function Onboarding({ navigation }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / width);
        setCurrentIndex(index);
      },
    }
  );

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: width * (currentIndex + 1),
        animated: true,
      });
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    navigation.replace('Login');
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      {/* Skip button - only show on non-final slides */}
      <View style={styles.skipContainer}>
        {currentIndex < slides.length - 1 && (
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            <View style={styles.content}>
              {/* Icon Container */}
              <View style={[styles.iconContainer, { backgroundColor: slide.iconBg }]}>
                <Ionicons name={slide.icon as any} size={64} color={colors.text.primary} />
              </View>
              
              {/* Content */}
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.description}>{slide.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Footer with pagination and button */}
      <View style={styles.footer}>
        {/* Pagination dots */}
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Action button */}
        <View style={styles.buttonContainer}>
          <Button
            title={currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
            onPress={handleNext}
            variant="primary"
            size="lg"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  skipContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    minHeight: 56,
  },
  skipButton: {
    padding: spacing.sm,
  },
  skipText: {
    fontSize: typography.fontSize.base,
    color: colors.primary.main,
    fontWeight: typography.fontWeight.semibold,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 2,
    borderColor: colors.border.main + '40',
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 36,
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border.main,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary.main,
  },
  buttonContainer: {
    width: '100%',
  },
});
