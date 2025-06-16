import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSubscription } from '../providers/SubscriptionProvider';
import HomeScreen from '../screens/HomeScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

const Stack = createNativeStackNavigator();

const RootNavigation = () => {
  const { activePaidUser } = useSubscription();
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={
          // for testing purposes, we are not using the onboarding screen
          // activePaidUser ?
          'Home'
          //  :
          //   'Onboarding'
        }>
        <Stack.Screen
          name='Home'
          component={HomeScreen}
          options={{
            headerShown: false,
            title: 'XTradeAI',
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
