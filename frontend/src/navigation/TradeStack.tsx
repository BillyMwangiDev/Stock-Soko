/**
 * Trade Stack Navigator
 * Handles trading flow: Markets  StockDetail  TradeOrder  ReviewOrder  OrderStatus
 */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TradeStackParamList } from './types';
import { colors } from '../theme';

import Markets from '../screens/Markets';
import StockDetail from '../screens/StockDetail';
import TradeOrder from '../screens/TradeOrder';
import ReviewOrder from '../screens/ReviewOrder';
import OrderStatus from '../screens/OrderStatus';
import Watchlist from '../screens/Watchlist';

const Stack = createStackNavigator<TradeStackParamList>();

export default function TradeStack() {
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
        name="Markets" 
        component={Markets}
        options={{ 
          headerShown: false, // Using tab navigator header
        }}
      />
      <Stack.Screen 
        name="StockDetail" 
        component={StockDetail}
        options={({ route }) => ({ 
          title: route.params.symbol,
          headerShown: true,
        })}
      />
      <Stack.Screen 
        name="TradeOrder" 
        component={TradeOrder}
        options={({ route }) => ({ 
          title: `${route.params.side === 'buy' ? 'Buy' : 'Sell'} ${route.params.symbol}`,
          headerShown: true,
        })}
      />
      <Stack.Screen 
        name="ReviewOrder" 
        component={ReviewOrder}
        options={{ 
          title: 'Review Order',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="OrderStatus" 
        component={OrderStatus}
        options={{ 
          title: 'Order Status',
          headerShown: true,
          headerLeft: () => null, // Prevent going back
        }}
      />
      <Stack.Screen 
        name="Watchlist" 
        component={Watchlist}
        options={{ 
          title: 'Watchlist',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
}