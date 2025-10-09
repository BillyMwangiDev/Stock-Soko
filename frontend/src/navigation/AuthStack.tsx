/**
 * Auth Stack Navigator
 * Handles authentication flow: Splash  Onboarding  Login/Register  OTP
 */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from './types';
import { colors } from '../theme';

import Splash from '../screens/Splash';
import Onboarding from '../screens/Onboarding';
import RiskProfile from '../screens/RiskProfile';
import ChooseBroker from '../screens/ChooseBroker';
import AccountSetup from '../screens/AccountSetup';
import FeatureWalkthrough from '../screens/FeatureWalkthrough';
import Login from '../screens/auth/Login';
import Register from '../screens/auth/Register';
import OTPVerification from '../screens/auth/OTPVerification';
import ForgotPassword from '../screens/auth/ForgotPassword';

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
        name="RiskProfile" 
        component={RiskProfile}
        options={{ 
          title: 'Risk Assessment',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="ChooseBroker" 
        component={ChooseBroker}
        options={{ 
          title: 'Choose Broker',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="AccountSetup" 
        component={AccountSetup}
        options={{ 
          title: 'Account Setup',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="FeatureWalkthrough" 
        component={FeatureWalkthrough}
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
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPassword}
        options={{ 
          title: 'Reset Password',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
}