/**
 * Portfolio Stack Navigator
 * Handles portfolio flow: Portfolio → HoldingDetail
 */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { PortfolioStackParamList } from './types';
import { colors } from '../theme';

// Import screens
import Portfolio from '../screens/Portfolio';
import HoldingDetail from '../screens/HoldingDetail';
import TradeHistory from '../screens/TradeHistory';

const Stack = createStackNavigator<PortfolioStackParamList>();

export default function PortfolioStack() {
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
        name="Portfolio" 
        component={Portfolio}
        options={{ 
          headerShown: false, // Using tab navigator header
        }}
      />
      <Stack.Screen 
        name="HoldingDetail" 
        component={HoldingDetail}
        options={({ route }) => ({ 
          title: route.params.symbol,
          headerShown: true,
        })}
      />
      <Stack.Screen 
        name="TradeHistory" 
        component={TradeHistory}
        options={{ 
          title: 'Trade History',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

