/**
 * Stock Soko Main App
 * Root navigation with authentication flow and error boundary
 */
import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './src/components';
import { RootNavigator } from './src/navigation';
import { AppProvider } from './src/contexts';
import { colors } from './src/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AppProvider>
          <StatusBar
            barStyle="light-content"
            backgroundColor={colors.background.primary}
            translucent={Platform.OS === 'android'}
          />
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </AppProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
