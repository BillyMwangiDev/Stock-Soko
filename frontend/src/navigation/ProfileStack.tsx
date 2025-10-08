/**
 * Profile Stack Navigator
 * Handles profile flow: Profile → Settings → Wallet → KYC → AIAssistant
 */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileStackParamList } from './types';
import { colors } from '../theme';

// Import screens
import Profile from '../screens/Profile';
import Settings from '../screens/Settings';
import Wallet from '../screens/Wallet';
import KYCUpload from '../screens/KYCUpload';
import AIAssistant from '../screens/AIAssistant';

const Stack = createStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
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
        name="Profile" 
        component={Profile}
        options={{ 
          headerShown: false, // Using tab navigator header
        }}
      />
      <Stack.Screen 
        name="Settings" 
        component={Settings}
        options={{ 
          title: 'Settings',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="Wallet" 
        component={Wallet}
        options={{ 
          title: 'Wallet',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="KYCUpload" 
        component={KYCUpload}
        options={{ 
          title: 'KYC Verification',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="AIAssistant" 
        component={AIAssistant}
        options={{ 
          title: 'AI Assistant',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
}

