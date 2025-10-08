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
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: colors.tabBar.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.main,
        },
        headerTintColor: colors.text.primary,
        tabBarStyle: {
          backgroundColor: colors.tabBar.background,
          borderTopWidth: 1,
          borderTopColor: colors.border.main,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarActiveTintColor: colors.tabBar.active,
        tabBarInactiveTintColor: colors.tabBar.inactive,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'MarketsTab') {
            iconName = focused ? 'trending-up' : 'trending-up-outline';
          } else if (route.name === 'PortfolioTab') {
            iconName = focused ? 'pie-chart' : 'pie-chart-outline';
          } else if (route.name === 'NewsTab') {
            iconName = focused ? 'newspaper' : 'newspaper-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={Home}
        options={{ 
          title: 'Home',
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="MarketsTab" 
        component={TradeStack}
        options={{ 
          title: 'Markets',
          tabBarLabel: 'Markets',
          headerShown: false, // Stack handles its own headers
        }}
      />
      <Tab.Screen 
        name="PortfolioTab" 
        component={PortfolioStack}
        options={{ 
          title: 'Portfolio',
          tabBarLabel: 'Portfolio',
          headerShown: false, // Stack handles its own headers
        }}
      />
      <Tab.Screen 
        name="NewsTab" 
        component={NewsStack}
        options={{ 
          title: 'News',
          tabBarLabel: 'News',
          headerShown: false, // Stack handles its own headers
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileStack}
        options={{ 
          title: 'Profile',
          tabBarLabel: 'Profile',
          headerShown: false, // Stack handles its own headers
        }}
      />
    </Tab.Navigator>
  );
}

