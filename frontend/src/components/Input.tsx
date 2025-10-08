import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { colors, typography, spacing, borderRadius, touchTarget } from '../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  id?: string;
  name?: string;
}

export function Input({ label, error, containerStyle, style, id, name, ...props }: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={colors.text.disabled}
        nativeID={id}
        accessibilityLabel={label}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.base, // Increased for mobile readability
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.input.background,
    borderWidth: 1,
    borderColor: colors.input.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,   // Increased vertical padding
    paddingHorizontal: spacing.base, // More horizontal space
    minHeight: touchTarget.comfortable, // 48pt minimum for easy tapping
    color: colors.text.primary,
    fontSize: typography.fontSize.base, // 16px prevents zoom on iOS
  },
  inputError: {
    borderColor: colors.error,  // #EF4444
  },
  error: {
    color: colors.error,
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
});

