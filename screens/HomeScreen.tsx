import React from 'react';
import { StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { AIAnalysis } from '../components/AIAnalysis';
import { useTheme } from '../providers/ThemeProvider';
import { useSubscription } from '../providers/SubscriptionProvider';
import { useNavigation } from '@react-navigation/native';
export default function HomeScreen() {
  const COLORS = useTheme();

  const { activePaidUser } = useSubscription();
  const navigation = useNavigation<any>();
  // Temporarily disabled for testing OpenAI integration
  // if (!activePaidUser) {
  //   navigation.navigate('Onboarding');
  // }

  return (
    <SafeAreaView style={styles(COLORS).container}>
      <ScrollView contentContainerStyle={styles(COLORS).scrollContent}>
        <AIAnalysis />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (COLORS: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    scrollContent: {
      flexGrow: 1,
    },
  });
