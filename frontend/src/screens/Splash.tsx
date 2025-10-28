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
      
      await initializeAuth();
      
      // Check if user is logged in
      if (isAuthenticated()) {
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
      {/* Main content - No overlay needed, image has good contrast */}
      <View style={styles.content}>
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
          <View style={styles.starIcon}>
            <Text style={styles.star}>*</Text>
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
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['3xl'],
    width: '100%',
  },
  progressContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginRight: spacing.md,
  },
  progressFill: {
    width: '40%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  starIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  star: {
    color: '#FFFFFF',
    fontSize: 18,
    textShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
  },
});