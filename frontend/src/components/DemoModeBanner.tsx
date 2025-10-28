/**
 * Demo Mode Banner Component
 * Displays a persistent banner indicating the app is in demo/paper trading mode
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme';

interface Props {
  onInfoPress?: () => void;
  variant?: 'banner' | 'badge' | 'full';
}

export default function DemoModeBanner({ onInfoPress, variant = 'banner' }: Props) {
  if (variant === 'badge') {
    return (
      <View style={styles.badge}>
        <Ionicons name="school-outline" size={12} color={colors.warning} />
        <Text style={styles.badgeText}>DEMO</Text>
      </View>
    );
  }

  if (variant === 'full') {
    return (
      <View style={styles.fullBanner}>
        <View style={styles.iconContainer}>
          <Ionicons name="school" size={24} color={colors.warning} />
        </View>
        <View style={styles.fullContent}>
          <Text style={styles.fullTitle}>📚 Paper Trading Mode</Text>
          <Text style={styles.fullText}>
            You're using virtual money to practice trading. All trades are simulated and no real money is involved.
          </Text>
          <Text style={styles.fullSubtext}>
            Starting Balance: $10,000 virtual • Reset anytime
          </Text>
        </View>
      </View>
    );
  }

  // Default banner variant
  return (
    <View style={styles.banner}>
      <View style={styles.content}>
        <Ionicons name="school-outline" size={16} color={colors.warning} />
        <Text style={styles.text}>DEMO MODE - Virtual Money</Text>
      </View>
      {onInfoPress && (
        <TouchableOpacity onPress={onInfoPress} style={styles.infoButton}>
          <Ionicons name="information-circle-outline" size={18} color={colors.warning} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Banner variant (top of screen)
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.warning + '15',
    borderBottomWidth: 1,
    borderBottomColor: colors.warning + '40',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  text: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.warning,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoButton: {
    padding: spacing.xs,
  },

  // Badge variant (small inline badge)
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.warning + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.warning + '40',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.warning,
    letterSpacing: 0.5,
  },

  // Full banner variant (informational card)
  fullBanner: {
    flexDirection: 'row',
    backgroundColor: colors.warning + '10',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    margin: spacing.md,
    borderWidth: 1,
    borderColor: colors.warning + '30',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.warning + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  fullContent: {
    flex: 1,
  },
  fullTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  fullText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  fullSubtext: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
});

