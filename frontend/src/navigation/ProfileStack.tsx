/**
 * Profile Stack Navigator
 * Handles profile flow: Profile  Settings  Wallet  KYC  AIAssistant
 */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileStackParamList } from './types';
import { colors } from '../theme';

// Import screens
import Profile from '../screens/Profile';
import Dashboard from '../screens/Dashboard';
import Settings from '../screens/Settings';
import Wallet from '../screens/Wallet';
import KYCUpload from '../screens/KYCUpload';
import AIAssistant from '../screens/AIAssistant';
import EducationalContent from '../screens/EducationalContent';
import LessonDetail from '../screens/LessonDetail';
import NotificationCenter from '../screens/NotificationCenter';
import FractionalShares from '../screens/FractionalShares';
import CustomerSupport from '../screens/CustomerSupport';
import PriceAlerts from '../screens/PriceAlerts';
import ChooseBroker from '../screens/ChooseBroker';
import EditProfile from '../screens/EditProfile';
import ChangePassword from '../screens/ChangePassword';
import TwoFactorSetup from '../screens/TwoFactorSetup';
import PaymentMethods from '../screens/PaymentMethods';
import PrivacyPolicy from '../screens/PrivacyPolicy';
import TermsConditions from '../screens/TermsConditions';
import LanguageSelection from '../screens/LanguageSelection';
import DeleteAccount from '../screens/DeleteAccount';
import LiveChat from '../screens/LiveChat';

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
      <Stack.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          title: 'Investment Dashboard',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="EducationalContent"
        component={EducationalContent}
        options={{
          title: 'Learning Center',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="LessonDetail"
        component={LessonDetail}
        options={{
          title: 'Lesson',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="NotificationCenter"
        component={NotificationCenter}
        options={{
          title: 'Notifications',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="FractionalShares"
        component={FractionalShares}
        options={{
          title: 'Fractional Shares',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="CustomerSupport"
        component={CustomerSupport}
        options={{
          title: 'Customer Support',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="PriceAlerts"
        component={PriceAlerts}
        options={{
          title: 'Price Alerts',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ChooseBroker"
        component={ChooseBroker}
        options={{
          title: 'Change Broker',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={{
          title: 'Edit Profile',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePassword}
        options={{
          title: 'Change Password',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="TwoFactorSetup"
        component={TwoFactorSetup}
        options={{
          title: 'Two-Factor Authentication',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PaymentMethods"
        component={PaymentMethods}
        options={{
          title: 'Payment Methods',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicy}
        options={{
          title: 'Privacy Policy',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="TermsConditions"
        component={TermsConditions}
        options={{
          title: 'Terms & Conditions',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="LanguageSelection"
        component={LanguageSelection}
        options={{
          title: 'Language',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="DeleteAccount"
        component={DeleteAccount}
        options={{
          title: 'Delete Account',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="LiveChat"
        component={LiveChat}
        options={{
          title: 'Live Chat',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

