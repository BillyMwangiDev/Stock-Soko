import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, typography, spacing, borderRadius, touchTarget } from '../theme';
import { hapticFeedback } from '../utils/haptics';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'error';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const buttonStyles: ViewStyle[] = [
    styles.base,
    styles[size],
    styles[variant],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyles: TextStyle[] = [
    styles.text,
    styles[`text_${size}` as keyof typeof styles],
    styles[`text_${variant}` as keyof typeof styles],
  ];

  const handlePress = () => {
    // Provide haptic feedback based on button variant
    if (variant === 'error') {
      hapticFeedback.warning();
    } else if (variant === 'success') {
      hapticFeedback.success();
    } else {
      hapticFeedback.medium();
    }
    onPress();
  };

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'success' || variant === 'error' ? colors.text.primary : colors.primary.main}
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.pill, // Rounded-pill buttons (PRD spec: 20px)
    minHeight: touchTarget.min, // Ensure minimum 44pt touch target
  },
  
  // Sizes - Mobile-optimized with comfortable touch targets
  sm: {
    minHeight: touchTarget.min,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  md: {
    minHeight: touchTarget.comfortable,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  lg: {
    minHeight: touchTarget.large,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xl,
  },
  
  // Variants
  primary: {
    backgroundColor: colors.primary.main,  // #10B981
  },
  secondary: {
    backgroundColor: colors.background.secondary,  // #E5E7EB
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.main,  // #D1D5DB
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  success: {
    backgroundColor: colors.success,  // #10B981
  },
  error: {
    backgroundColor: colors.error,  // #EF4444
  },
  
  // States
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
  
  // Text styles
  text: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontWeight: typography.fontWeight.semibold,
  },
  text_sm: {
    fontSize: typography.fontSize.sm,
  },
  text_md: {
    fontSize: typography.fontSize.base,
  },
  text_lg: {
    fontSize: typography.fontSize.lg,
  },
  text_primary: {
    color: colors.primary.contrast,  // #FFFFFF on green
  },
  text_secondary: {
    color: colors.text.primary,  // #111827 on light grey
  },
  text_outline: {
    color: colors.text.primary,  // #111827
  },
  text_ghost: {
    color: colors.primary.main,  // #10B981
  },
  text_success: {
    color: colors.primary.contrast,  // #FFFFFF on green
  },
  text_error: {
    color: colors.primary.contrast,  // #FFFFFF on red
  },
});

