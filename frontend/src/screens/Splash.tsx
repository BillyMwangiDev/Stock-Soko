import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/types';
import { colors, typography, spacing } from '../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isAuthenticated, initializeAuth } from '../store/auth';

type SplashScreenProp = StackNavigationProp<AuthStackParamList, 'Splash'>;

interface Props {
  navigation: SplashScreenProp;
}

export default function Splash({ navigation }: Props) {
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Wait 2 seconds for splash effect
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Initialize auth state
      await initializeAuth();
      
      // Check if user is logged in
      if (isAuthenticated()) {
        // User is logged in, should go to main app
        // But we're in Auth stack, so this will be handled by RootNavigator
        // For now, just show a message
        console.log('User already logged in, RootNavigator should show Main stack');
        return;
      }
      
      // Check if user has seen onboarding
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      
      if (hasSeenOnboarding === 'true') {
        // User has seen onboarding, go to login
        navigation.replace('Login');
      } else {
        // First time user, show onboarding
        navigation.replace('Onboarding');
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      navigation.replace('Onboarding');
    }
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/splash.png')} 
      style={styles.container}
      resizeMode="cover"
    >
      {/* Dark overlay for better text readability */}
      <View style={styles.overlay} />
      
      {/* Main content */}
      <View style={styles.content}>
        {/* App title */}
        <Text style={styles.title}>Stock Soko</Text>
        
        {/* Tagline */}
        <Text style={styles.tagline}>Trade Smarter. Invest Confidently.</Text>
        
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
          <View style={styles.starIcon}>
            <Text style={styles.star}>✦</Text>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Subtle dark overlay for text readability
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing['3xl'],
    zIndex: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4fc3f7', // Light blue
    marginBottom: spacing.sm,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: typography.fontSize.lg,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: spacing['3xl'],
    fontWeight: '300',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 40,
    left: spacing['2xl'],
    right: spacing['2xl'],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  progressBar: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(79, 195, 247, 0.3)',
    borderRadius: 1,
    marginRight: spacing.md,
  },
  progressFill: {
    width: '30%',
    height: '100%',
    backgroundColor: '#4fc3f7',
    borderRadius: 1,
  },
  starIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  star: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
