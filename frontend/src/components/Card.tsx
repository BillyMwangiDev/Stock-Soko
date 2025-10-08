import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../theme';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: keyof typeof spacing;
  style?: ViewStyle;
  onPress?: () => void;
}

export function Card({ children, variant = 'default', padding = 'md', style }: CardProps) {
  const cardStyles: ViewStyle[] = [
    styles.base,
    styles[variant],
    { padding: spacing[padding] },
    style,
  ];

  return <View style={cardStyles}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.md,  // 12px from spec
  },
  default: {
    backgroundColor: colors.background.surface,  // #FFFFFF
  },
  elevated: {
    backgroundColor: colors.background.surface,  // #FFFFFF
    ...shadows.card,  // Card shadow from spec
    borderWidth: 1,
    borderColor: colors.border.main,  // #D1D5DB
  },
  outlined: {
    backgroundColor: colors.background.surface,  // #FFFFFF
    borderWidth: 1,
    borderColor: colors.border.main,  // #D1D5DB
  },
});

