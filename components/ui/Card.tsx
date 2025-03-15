import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'primary' | 'secondary' | 'dark';
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  contentStyle?: ViewStyle;
}

export const Card = ({
  children,
  title,
  subtitle,
  variant = 'primary',
  style,
  titleStyle,
  subtitleStyle,
  contentStyle,
}: CardProps) => {
  const COLORS = useTheme();

  // Determine card style based on variant
  const getCardStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles(COLORS).secondaryCard;
      case 'dark':
        return styles(COLORS).darkCard;
      case 'primary':
      default:
        return styles(COLORS).primaryCard;
    }
  };

  return (
    <View style={[styles(COLORS).card, getCardStyle(), style]}>
      {(title || subtitle) && (
        <View style={styles(COLORS).header}>
          {title && (
            <Text style={[styles(COLORS).title, titleStyle]}>{title}</Text>
          )}
          {subtitle && (
            <Text style={[styles(COLORS).subtitle, subtitleStyle]}>
              {subtitle}
            </Text>
          )}
        </View>
      )}
      <View style={[styles(COLORS).content, contentStyle]}>{children}</View>
    </View>
  );
};

const styles = (COLORS: any) =>
  StyleSheet.create({
    card: {
      borderRadius: 12,
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      overflow: 'hidden',
      marginBottom: 16,
    },
    primaryCard: {
      backgroundColor: COLORS.primary,
    },
    secondaryCard: {
      backgroundColor: COLORS.primaryLight,
    },
    darkCard: {
      backgroundColor: COLORS.primaryDark,
    },
    header: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: COLORS.accent,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: COLORS.textMuted,
    },
    content: {
      padding: 16,
    },
  });
