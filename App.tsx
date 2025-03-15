import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryProvider } from './providers/QueryProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import HomeScreen from './screens/HomeScreen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        <ThemeProvider>
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen
                name='Home'
                component={HomeScreen}
                options={{
                  headerShown: false,
                  title: 'XTradeAI',
                }}
              />
            </Stack.Navigator>
            <StatusBar style='light' />
          </NavigationContainer>
        </ThemeProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
