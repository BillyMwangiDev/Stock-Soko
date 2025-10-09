/**
 * Floating AI Assistant Button
 * Global floating action button to access AI Assistant
 */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, touchTarget } from '../theme';
import { hapticFeedback } from '../utils/haptics';

export default function FloatingAIButton() {
  const navigation = useNavigation();

  const handlePress = () => {
    hapticFeedback.light();
    navigation.navigate('Profile' as never, { screen: 'AIAssistant' } as never);
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Text style={styles.icon}>AI</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 80 : 90, // Account for tab bar
    right: spacing.base,
    width: touchTarget.large,
    height: touchTarget.large,
    borderRadius: touchTarget.large / 2,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary.main,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: `0 4px 20px ${colors.primary.main}66`,
      },
    }),
  },
  icon: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary.contrast,
    letterSpacing: 1,
  },
});