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
    boxShadow: `0 4px 20px ${colors.primary.main}66`,
    elevation: 8,
  },
  icon: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary.contrast,
    letterSpacing: 1,
  },
});