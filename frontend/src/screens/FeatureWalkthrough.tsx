/**
 * Feature Walkthrough Screen
 * Guided tour of the app's core functionalities
 */
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/types';
import { Button } from '../components';
import { colors, typography, spacing, borderRadius } from '../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

type FeatureWalkthroughScreenProp = StackNavigationProp<AuthStackParamList, 'FeatureWalkthrough'>;

interface Props {
  navigation: FeatureWalkthroughScreenProp;
}

interface Feature {
  title: string;
  description: string;
  icon: string;
}

const features: Feature[] = [
  {
    title: 'Real-Time Market Data',
    description: 'Access live NSE stock prices, charts, and market movements at your fingertips.',
    icon: '📊',
  },
  {
    title: 'AI-Powered Insights',
    description: 'Get personalized stock recommendations based on your risk profile and market analysis.',
    icon: '🤖',
  },
  {
    title: 'Instant M-Pesa Deposits',
    description: 'Fund your trading account instantly using M-Pesa and start investing immediately.',
    icon: '💳',
  },
  {
    title: 'Portfolio Tracking',
    description: 'Monitor your investments with automated portfolio analytics and performance tracking.',
    icon: '📈',
  },
  {
    title: 'Fractional Shares',
    description: 'Invest in expensive stocks with as little as KES 100 through fractional ownership.',
    icon: '🪙',
  },
];

const { width } = Dimensions.get('window');

export default function FeatureWalkthrough({ navigation }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleNext = () => {
    if (currentIndex < features.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({ x: width * nextIndex, animated: true });
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('hasSeenWalkthrough', 'true');
    navigation.replace('Login');
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem('hasSeenWalkthrough', 'true');
    navigation.replace('Login');
  };

  const isLastSlide = currentIndex === features.length - 1;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={styles.scrollView}
      >
        {features.map((feature, index) => (
          <View key={index} style={[styles.slide, { width }]}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{feature.icon}</Text>
            </View>
            <Text style={styles.title}>{feature.title}</Text>
            <Text style={styles.description}>{feature.description}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.pagination}>
        {features.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, index === currentIndex && styles.dotActive]}
          />
        ))}
      </View>

      <View style={styles.buttonContainer}>
        {isLastSlide ? (
          <Button
            title="Get Started"
            onPress={handleGetStarted}
            variant="primary"
            size="lg"
            fullWidth
          />
        ) : (
          <Button
            title="Next"
            onPress={handleNext}
            variant="primary"
            size="lg"
            fullWidth
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: spacing.lg,
    zIndex: 10,
    padding: spacing.sm,
  },
  skipText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.semibold,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  icon: {
    fontSize: 80,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border.main,
  },
  dotActive: {
    backgroundColor: colors.primary.main,
    width: 24,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
});

