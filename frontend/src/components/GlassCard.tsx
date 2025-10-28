import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius } from '../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'light' | 'dark';
  blur?: 'light' | 'medium' | 'strong';
}

export function GlassCard({ 
  children, 
  style, 
  variant = 'default',
  blur = 'medium'
}: GlassCardProps) {
  const cardStyles: ViewStyle[] = [
    styles.base,
    styles[variant],
    styles[`blur_${blur}`],
    style,
  ];

  return (
    <View style={cardStyles}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    // Glassmorphic border with subtle opacity
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    // Soft shadow for depth
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 4,
    // Backdrop blur simulation
    overflow: 'hidden',
  },
  
  // Variants
  default: {
    backgroundColor: 'rgba(30, 35, 41, 0.6)', // Semi-transparent card background
  },
  light: {
    backgroundColor: 'rgba(43, 49, 57, 0.5)', // Lighter semi-transparent
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  dark: {
    backgroundColor: 'rgba(11, 14, 17, 0.7)', // Darker semi-transparent
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  
  // Blur intensity (simulated with opacity variations)
  blur_light: {
    backgroundColor: 'rgba(30, 35, 41, 0.5)',
  },
  blur_medium: {
    backgroundColor: 'rgba(30, 35, 41, 0.6)',
  },
  blur_strong: {
    backgroundColor: 'rgba(30, 35, 41, 0.75)',
  },
});

export default GlassCard;