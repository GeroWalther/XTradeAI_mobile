import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSubscription } from '../providers/SubscriptionProvider';
import { useTheme } from '../providers/ThemeProvider';
import HomeScreen from '../screens/HomeScreen';
import StockValuationScreen from '../screens/StockValuationScreen';
import AssetComparisonScreen from '../screens/AssetComparisonScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator for the main app
const MainTabNavigator = () => {
  const COLORS = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          paddingTop: 8,
          paddingBottom: 8,
          height: 70,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          paddingBottom: 4,
        },
        tabBarItemStyle: {
          backgroundColor: 'transparent',
        },
        tabBarActiveBackgroundColor: COLORS.surfaceLight,
      }}>
      <Tab.Screen
        name='AIAnalysis'
        component={HomeScreen}
        options={{
          title: 'AI Analysis',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🤖</Text>
          ),
        }}
      />
      <Tab.Screen
        name='StockValuation'
        component={StockValuationScreen}
        options={{
          title: 'Stock Valuation',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📊</Text>
          ),
        }}
      />
      <Tab.Screen
        name='AssetComparison'
        component={AssetComparisonScreen}
        options={{
          title: 'Asset Compare',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>⚖️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const RootNavigation = () => {
  const { activePaidUser } = useSubscription();

  return (
    <NavigationContainer>
      <Stack.Navigator
        //activePaidUser ? 'MainTabs' : 'Onboarding'
        initialRouteName={'MainTabs'}
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen
          name='MainTabs'
          component={MainTabNavigator}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name='Onboarding'
          component={OnboardingScreen}
          options={{
            headerShown: false,
            title: 'Onboarding',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigation;
