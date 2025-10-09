/**
 * Haptic Feedback Utilities
 * Provides haptic feedback for user interactions
 * Note: Simplified version without expo-haptics dependency
 */
import { Platform } from 'react-native';

export const hapticFeedback = {
  /**
   * Light impact - for small UI interactions
   */
  light: () => {
    // Haptics disabled - expo-haptics not installed
  },

  /**
   * Medium impact - for standard button presses
   */
  medium: () => {
    // Haptics disabled - expo-haptics not installed
  },

  /**
   * Heavy impact - for important actions
   */
  heavy: () => {
    // Haptics disabled - expo-haptics not installed
  },

  /**
   * Impact - general impact feedback
   */
  impact: () => {
    // Haptics disabled - expo-haptics not installed
  },

  /**
   * Selection - for picker/tab changes
   */
  selection: () => {
    // Haptics disabled - expo-haptics not installed
  },

  /**
   * Success - for successful operations
   */
  success: () => {
    // Haptics disabled - expo-haptics not installed
  },

  /**
   * Warning - for warnings
   */
  warning: () => {
    // Haptics disabled - expo-haptics not installed
  },

  /**
   * Error - for errors
   */
  error: () => {
    // Haptics disabled - expo-haptics not installed
  },
};