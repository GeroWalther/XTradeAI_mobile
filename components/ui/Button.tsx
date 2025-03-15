import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  TouchableOpacityProps,
} from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  icon,
  style,
  ...rest
}: ButtonProps) => {
  const COLORS = useTheme();

  // Determine button style based on variant
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles(COLORS).secondaryButton;
      case 'danger':
        return styles(COLORS).dangerButton;
      case 'success':
        return styles(COLORS).successButton;
      case 'primary':
      default:
        return styles(COLORS).primaryButton;
    }
  };

  // Determine button size
  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return styles(COLORS).smallButton;
      case 'large':
        return styles(COLORS).largeButton;
      case 'medium':
      default:
        return styles(COLORS).mediumButton;
    }
  };

  // Determine text style based on variant
  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles(COLORS).secondaryText;
      default:
        return styles(COLORS).buttonText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles(COLORS).button,
        getButtonStyle(),
        getButtonSize(),
        disabled || isLoading ? styles(COLORS).disabledButton : null,
        fullWidth ? styles(COLORS).fullWidth : null,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      {...rest}>
      {isLoading ? (
        <ActivityIndicator
          size='small'
          color={variant === 'secondary' ? COLORS.accent : COLORS.white}
        />
      ) : (
        <View style={styles(COLORS).buttonContent}>
          {icon && <View style={styles(COLORS).iconContainer}>{icon}</View>}
          <Text style={[styles(COLORS).buttonText, getTextStyle()]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = (COLORS: any) =>
  StyleSheet.create({
    button: {
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    },
    primaryButton: {
      backgroundColor: COLORS.buttonPrimary,
    },
    secondaryButton: {
      backgroundColor: COLORS.transparent,
      borderWidth: 1,
      borderColor: COLORS.accent,
    },
    dangerButton: {
      backgroundColor: COLORS.error,
    },
    successButton: {
      backgroundColor: COLORS.success,
    },
    smallButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    mediumButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
    },
    largeButton: {
      paddingVertical: 16,
      paddingHorizontal: 32,
    },
    disabledButton: {
      backgroundColor: COLORS.buttonDisabled,
      borderColor: COLORS.buttonDisabled,
    },
    fullWidth: {
      width: '100%',
    },
    buttonText: {
      color: COLORS.white,
      fontWeight: 'bold',
      fontSize: 16,
      textAlign: 'center',
    },
    secondaryText: {
      color: COLORS.accent,
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconContainer: {
      marginRight: 8,
    },
  });
