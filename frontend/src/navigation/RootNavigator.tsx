/**
 * Root Navigator
 * Switches between Auth stack and Main app based on authentication state
 * Uses improved auth store for better state management
 */
import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { RootStackParamList } from './types';
import { initializeAuth, isAuthenticated, getCurrentUser } from '../store/auth';
import { colors, spacing } from '../theme';

import AuthStack from './AuthStack';
import MainTabs from './MainTabs';

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await initializeAuth();

      // Small delay to ensure smooth transition
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setIsLoading(false);
      setAuthChecked(true);
    }
  };

  // Show loading screen while initializing
  if (isLoading || !authChecked) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        gestureEnabled: true,
      }}
    >
      {!isAuthenticated() ? (
        <Stack.Screen
          name="Auth"
          component={AuthStack}
          options={{
            animationTypeForReplace: 'push',
          }}
        />
      ) : (
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{
            animationTypeForReplace: 'push',
          }}
        />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
});