import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/types';
import { colors, typography, spacing } from '../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SplashScreenProp = StackNavigationProp<AuthStackParamList, 'Splash'>;

interface Props {
  navigation: SplashScreenProp;
}

export default function Splash({ navigation }: Props) {
  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      // Wait 2 seconds for splash effect
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      
      if (hasSeenOnboarding === 'true') {
        // User has seen onboarding, go to login
        navigation.replace('Login');
      } else {
        // First time user, show onboarding
        navigation.replace('Onboarding');
      }
    } catch (error) {
      console.error('Error checking onboarding:', error);
      navigation.replace('Onboarding');
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo placeholder - replace with actual logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>📈</Text>
      </View>
      
      <Text style={styles.title}>Stock Soko</Text>
      <Text style={styles.tagline}>Intelligent Stock Trading Platform</Text>
      <Text style={styles.subtitle}>for African Markets</Text>
      
      {/* Loading indicator */}
      <View style={styles.loadingContainer}>
        <View style={styles.loadingDot} />
        <View style={[styles.loadingDot, styles.loadingDotDelay1]} />
        <View style={[styles.loadingDot, styles.loadingDotDelay2]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  logoContainer: {
    marginBottom: spacing.xl,
  },
  logoText: {
    fontSize: 80,
  },
  title: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  tagline: {
    fontSize: typography.fontSize.lg,
    color: colors.primary.main,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    marginTop: spacing['3xl'],
    gap: spacing.sm,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.main,
  },
  loadingDotDelay1: {
    opacity: 0.6,
  },
  loadingDotDelay2: {
    opacity: 0.3,
  },
});
