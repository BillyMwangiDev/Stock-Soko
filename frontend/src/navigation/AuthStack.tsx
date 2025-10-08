/**
 * Auth Stack Navigator
 * Handles authentication flow: Splash → Onboarding → Login/Register → OTP
 */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from './types';
import { colors } from '../theme';

// Import screens
import Splash from '../screens/Splash';
import Onboarding from '../screens/Onboarding';
import Login from '../screens/auth/Login';
import Register from '../screens/auth/Register';
import OTPVerification from '../screens/auth/OTPVerification';

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthStack() {
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
        name="Splash" 
        component={Splash}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Onboarding" 
        component={Onboarding}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Login" 
        component={Login}
        options={{ 
          title: 'Sign In',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="Register" 
        component={Register}
        options={{ 
          title: 'Create Account',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="OTPVerification" 
        component={OTPVerification}
        options={{ 
          title: 'Verify Phone',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
}

