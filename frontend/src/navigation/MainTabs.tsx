/**
 * Main Tab Navigator
 * Bottom tab navigation with stack navigators for each tab
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from './types';
import { colors } from '../theme';

// Import stack navigators
import Home from '../screens/Home';
import TradeStack from './TradeStack';
import PortfolioStack from './PortfolioStack';
import NewsStack from './NewsStack';
import ProfileStack from './ProfileStack';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabBar.active,
        tabBarInactiveTintColor: colors.tabBar.inactive,
        tabBarStyle: {
          backgroundColor: colors.tabBar.background,
          borderTopWidth: 1,
          borderTopColor: colors.border.main,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={Home}
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      
      <Tab.Screen
        name="MarketsTab"
        component={TradeStack}
        options={{
          title: 'Markets',
          tabBarLabel: 'Markets',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'trending-up' : 'trending-up-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      
      <Tab.Screen
        name="PortfolioTab"
        component={PortfolioStack}
        options={{
          title: 'Portfolio',
          tabBarLabel: 'Portfolio',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'pie-chart' : 'pie-chart-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      
      <Tab.Screen
        name="NewsTab"
        component={NewsStack}
        options={{
          title: 'News',
          tabBarLabel: 'News',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'newspaper' : 'newspaper-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

