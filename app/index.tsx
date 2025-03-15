import { StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { AIAnalysis } from '../components/AIAnalysis';
import { useTheme } from '../providers/ThemeProvider';

export default function HomeScreen() {
  const COLORS = useTheme();

  return (
    <SafeAreaView style={styles(COLORS).container}>
      <ScrollView>
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
  });
