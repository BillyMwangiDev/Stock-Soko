/**
 * Portfolio Stack Navigator
 * Handles portfolio flow: Portfolio  HoldingDetail
 */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { PortfolioStackParamList } from './types';
import { colors } from '../theme';

import Portfolio from '../screens/Portfolio';
import HoldingDetail from '../screens/HoldingDetail';
import TradeHistory from '../screens/TradeHistory';
import TaxReports from '../screens/TaxReports';
import DividendTracker from '../screens/DividendTracker';

const Stack = createStackNavigator<PortfolioStackParamList>();

export default function PortfolioStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background.primary,
          elevation: 0,
          boxShadow: 'none',
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
      <Stack.Screen 
        name="TaxReports" 
        component={TaxReports}
        options={{ 
          title: 'Tax Reports',
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="DividendTracker" 
        component={DividendTracker}
        options={{ 
          title: 'Dividend Tracker',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
}