/**
 * News Stack Navigator
 * Handles news flow: News → NewsDetail
 */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NewsStackParamList } from './types';
import { colors } from '../theme';

// Import screens
import News from '../screens/News';

const Stack = createStackNavigator<NewsStackParamList>();

export default function NewsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background.primary,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.main,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
        cardStyle: {
          backgroundColor: colors.background.primary,
        },
      }}
    >
      <Stack.Screen 
        name="News" 
        component={News}
        options={{ 
          headerShown: false, // Using tab navigator header
        }}
      />
    </Stack.Navigator>
  );
}

