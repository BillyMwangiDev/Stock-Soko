import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';

interface BadgeProps {
  text: string;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'neutral';
  style?: ViewStyle;
}

export function Badge({ text, variant = 'neutral', style }: BadgeProps) {
  return (
    <View style={[styles.base, styles[variant], style]}>
      <Text style={[styles.text, styles[`text_${variant}`]]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  success: {
    backgroundColor: colors.success + '15',  // Light green tint
  },
  error: {
    backgroundColor: colors.error + '15',  // Light red tint
  },
  warning: {
    backgroundColor: colors.warning + '15',  // Light yellow tint
  },
  info: {
    backgroundColor: colors.info + '15',  // Light blue tint
  },
  neutral: {
    backgroundColor: colors.background.secondary,  // #E5E7EB
  },
  text: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  text_success: {
    color: colors.success,  // #10B981
  },
  text_error: {
    color: colors.error,  // #EF4444
  },
  text_warning: {
    color: colors.warning,  // #FBBF24
  },
  text_info: {
    color: colors.info,  // #3B82F6
  },
  text_neutral: {
    color: colors.text.tertiary,  // #6B7280
  },
});