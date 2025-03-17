import React from 'react';
import { QueryProvider } from './providers/QueryProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { SubscriptionProvider } from './providers/SubscriptionProvider';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigation from './rootNav/RootNavigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        <ThemeProvider>
          <StatusBar style='light' />
          <SubscriptionProvider>
            <RootNavigation />
          </SubscriptionProvider>
        </ThemeProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
