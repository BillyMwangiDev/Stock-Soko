/**
 * Stock Soko Main App
 * Root navigation with authentication flow and error boundary
 */
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ErrorBoundary } from './src/components';
import { RootNavigator } from './src/navigation';
import { AppProvider } from './src/contexts';

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AppProvider>
    </ErrorBoundary>
  );
}
