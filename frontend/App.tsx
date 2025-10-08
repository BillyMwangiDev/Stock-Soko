/**
 * Stock Soko Main App
 * Root navigation with authentication flow and error boundary
 */
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ErrorBoundary } from './src/components';
import { RootNavigator } from './src/navigation';

export default function App() {
  return (
    <ErrorBoundary>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </ErrorBoundary>
  );
}
