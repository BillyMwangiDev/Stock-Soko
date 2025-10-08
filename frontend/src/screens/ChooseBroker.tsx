/**
 * Choose Broker Screen
 * Allows users to select from integrated brokers
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/types';
import { Button } from '../components';
import { colors, typography, spacing, borderRadius } from '../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ChooseBrokerScreenProp = StackNavigationProp<AuthStackParamList, 'ChooseBroker'>;

interface Props {
  navigation: ChooseBrokerScreenProp;
}

interface Broker {
  id: string;
  name: string;
  fees: string;
  rating: number;
  initial: string;
}

const brokers: Broker[] = [
  {
    id: 'faida',
    name: 'Faida Investment Bank',
    fees: '0.12%',
    rating: 4.5,
    initial: 'F',
  },
  {
    id: 'dyer',
    name: 'Dyer & Blair',
    fees: '0.15%',
    rating: 4.2,
    initial: 'D',
  },
  {
    id: 'genghis',
    name: 'Genghis Capital',
    fees: '0.10%',
    rating: 4.8,
    initial: 'G',
  },
];

export default function ChooseBroker({ navigation }: Props) {
  const [selectedBroker, setSelectedBroker] = useState<string | null>(null);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleContinue = async () => {
    if (!selectedBroker) {
      Alert.alert('No Broker Selected', 'Please choose a broker to continue');
      return;
    }

    await AsyncStorage.setItem('selectedBroker', selectedBroker);
    navigation.navigate('AccountSetup' as any);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Broker</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Broker List */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {brokers.map((broker) => (
          <TouchableOpacity
            key={broker.id}
            style={[
              styles.brokerCard,
              selectedBroker === broker.id && styles.brokerCardSelected,
            ]}
            onPress={() => setSelectedBroker(broker.id)}
            activeOpacity={0.7}
          >
            {/* Broker Icon */}
            <View style={styles.brokerIcon}>
              <Text style={styles.brokerInitial}>{broker.initial}</Text>
            </View>

            {/* Broker Info */}
            <View style={styles.brokerInfo}>
              <Text style={styles.brokerName}>{broker.name}</Text>
              <View style={styles.brokerMeta}>
                <Text style={styles.feesText}>Fees: {broker.fees}</Text>
                <Text style={styles.separator}>|</Text>
                <View style={styles.ratingContainer}>
                  <Text style={styles.starIcon}>★</Text>
                  <Text style={styles.ratingText}>{broker.rating}</Text>
                </View>
              </View>
            </View>

            {/* Chevron */}
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Select Broker"
          onPress={handleContinue}
          variant="primary"
          size="lg"
          fullWidth
          disabled={!selectedBroker}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main + '80',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.full,
  },
  backIcon: {
    fontSize: 28,
    color: colors.text.primary,
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  brokerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  brokerCardSelected: {
    backgroundColor: colors.primary.main + '10',
    borderColor: colors.primary.main,
  },
  brokerIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary.main + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  brokerInitial: {
    fontSize: 24,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
  },
  brokerInfo: {
    flex: 1,
  },
  brokerName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  brokerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  feesText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  separator: {
    fontSize: typography.fontSize.sm,
    color: colors.text.disabled,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starIcon: {
    fontSize: 16,
    color: '#FFA500',
  },
  ratingText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  chevron: {
    fontSize: 28,
    color: colors.text.disabled,
    marginLeft: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: 'transparent',
  },
});


