import {
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { QueryProvider } from '../providers/QueryProvider';
import { ThemeProvider, useTheme } from '../providers/ThemeProvider';
import { COLORS } from '../constants/colors';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Create a custom navigation theme using our color system
const createNavigationTheme = (colors: any) => ({
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.primary,
    text: colors.textPrimary,
    border: colors.primaryLight,
    notification: colors.error,
  },
});

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryProvider>
      <ThemeProvider>
        <NavigationThemeWrapper>
          <Stack>
            <Stack.Screen name='index' options={{ headerShown: false }} />
          </Stack>
          <StatusBar style='light' />
        </NavigationThemeWrapper>
      </ThemeProvider>
    </QueryProvider>
  );
}

// Wrapper component to use the theme
function NavigationThemeWrapper({ children }: { children: React.ReactNode }) {
  const colors = useTheme();
  const navigationTheme = createNavigationTheme(colors);

  return (
    <NavigationThemeProvider value={navigationTheme}>
      {children}
    </NavigationThemeProvider>
  );
}
