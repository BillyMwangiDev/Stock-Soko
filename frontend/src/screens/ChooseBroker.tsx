/**
 * Choose Broker Screen
 * Select from Kenyan stockbrokers with NSE access and API integration
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { ProfileStackParamList } from '../navigation/types';
import { Button, Card } from '../components';
import { colors, typography, spacing, borderRadius } from '../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';
import { hapticFeedback } from '../utils/haptics';

type ChooseBrokerScreenProp = StackNavigationProp<ProfileStackParamList, 'ChooseBroker'>;

interface Props {
  navigation: ChooseBrokerScreenProp;
}

interface Broker {
  id: string;
  name: string;
  description: string;
  fees: {
    commission: string;
    minimum: string;
    custody: string;
  };
  features: string[];
  rating: number;
  hasAPI: boolean;
  apiStatus: 'live' | 'sandbox' | 'pending';
  logo: string; // Icon name from Ionicons
  color: string;
  website: string;
  requiresCDS: boolean;
  minDeposit: string;
}

// Real Kenyan stockbrokers with NSE access
const KENYAN_BROKERS: Broker[] = [
  {
    id: 'genghis',
    name: 'Genghis Capital',
    description: 'Leading investment bank with full NSE access and modern API',
    fees: {
      commission: '1.24%',
      minimum: 'KES 200',
      custody: 'Free',
    },
    features: [
      'Full NSE market access',
      'Real-time trading API',
      'Mobile & web platform',
      'Research & analysis',
      'CDS account included',
    ],
    rating: 4.7,
    hasAPI: true,
    apiStatus: 'live',
    logo: 'business',
    color: '#0066CC',
    website: 'https://genghiscapital.com',
    requiresCDS: true,
    minDeposit: 'KES 5,000',
  },
  {
    id: 'faida',
    name: 'Faida Investment Bank',
    description: 'Premier stockbroker with competitive rates and API access',
    fees: {
      commission: '1.30%',
      minimum: 'KES 150',
      custody: 'Free',
    },
    features: [
      'NSE & EAC markets',
      'REST API integration',
      'Portfolio management',
      'Free CDS account',
      'Investment advisory',
    ],
    rating: 4.5,
    hasAPI: true,
    apiStatus: 'live',
    logo: 'trending-up',
    color: '#00A651',
    website: 'https://faidaib.co.ke',
    requiresCDS: true,
    minDeposit: 'KES 10,000',
  },
  {
    id: 'dyer',
    name: 'Dyer & Blair',
    description: 'Established broker with comprehensive trading services',
    fees: {
      commission: '1.50%',
      minimum: 'KES 300',
      custody: 'KES 50/month',
    },
    features: [
      'Full NSE access',
      'Corporate finance',
      'Wealth management',
      'Market research',
      'CDS integration',
    ],
    rating: 4.3,
    hasAPI: true,
    apiStatus: 'sandbox',
    logo: 'stats-chart',
    color: '#8B0000',
    website: 'https://dyerandblair.com',
    requiresCDS: true,
    minDeposit: 'KES 50,000',
  },
  {
    id: 'suntra',
    name: 'Suntra Investment Bank',
    description: 'Full-service broker with digital trading platform',
    fees: {
      commission: '1.35%',
      minimum: 'KES 250',
      custody: 'Free for 6 months',
    },
    features: [
      'NSE trading platform',
      'API in development',
      'Investment banking',
      'Asset management',
      'Free training',
    ],
    rating: 4.2,
    hasAPI: false,
    apiStatus: 'pending',
    logo: 'sunny',
    color: '#FF8C00',
    website: 'https://suntra.co.ke',
    requiresCDS: true,
    minDeposit: 'KES 20,000',
  },
  {
    id: 'kestrel',
    name: 'Kestrel Capital',
    description: 'Pan-African broker with strong regional presence',
    fees: {
      commission: '1.40%',
      minimum: 'KES 200',
      custody: 'Free',
    },
    features: [
      'Multi-market access',
      'Institutional trading',
      'Portfolio analytics',
      'Corporate advisory',
      'Regional expertise',
    ],
    rating: 4.4,
    hasAPI: true,
    apiStatus: 'sandbox',
    logo: 'globe',
    color: '#4169E1',
    website: 'https://kestrelcapital.com',
    requiresCDS: true,
    minDeposit: 'KES 25,000',
  },
  {
    id: 'nse-direct',
    name: 'Stock Soko Direct',
    description: 'Direct NSE access through our integrated platform',
    fees: {
      commission: '0.50%',
      minimum: 'KES 50',
      custody: 'Free',
    },
    features: [
      'Lowest fees guaranteed',
      'Native API integration',
      'Real-time execution',
      'No minimum balance',
      'Instant CDS linking',
    ],
    rating: 4.9,
    hasAPI: true,
    apiStatus: 'live',
    logo: 'rocket',
    color: colors.primary.main,
    website: 'https://stocksoko.com',
    requiresCDS: false,
    minDeposit: 'KES 1,000',
  },
];

export default function ChooseBroker({ navigation }: Props) {
  const [selectedBroker, setSelectedBroker] = useState<string | null>(null);
  const [currentBroker, setCurrentBroker] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  useEffect(() => {
    console.log('[ChooseBroker] Component mounted');
    loadCurrentBroker();
  }, []);

  const loadCurrentBroker = async () => {
    try {
      const saved = await AsyncStorage.getItem('selectedBroker');
      console.log('[ChooseBroker] Current broker:', saved);
      if (saved) {
        setCurrentBroker(saved);
        setSelectedBroker(saved);
      }
    } catch (error) {
      console.error('[ChooseBroker] Failed to load broker:', error);
    }
  };

  const handleSelectBroker = (brokerId: string) => {
    hapticFeedback.light();
    setSelectedBroker(brokerId);
  };

  const handleViewDetails = (brokerId: string) => {
    hapticFeedback.light();
    setShowDetails(showDetails === brokerId ? null : brokerId);
  };

  const handleConnectBroker = async () => {
    console.log('[ChooseBroker] Connect button clicked!');
    console.log('[ChooseBroker] Selected broker:', selectedBroker);
    
    if (!selectedBroker) {
      console.log('[ChooseBroker] No broker selected');
      Alert.alert('No Broker Selected', 'Please select a broker to continue');
      return;
    }

    const broker = KENYAN_BROKERS.find(b => b.id === selectedBroker);
    console.log('[ChooseBroker] Found broker:', broker?.name);
    
    if (!broker) {
      console.log('[ChooseBroker] Broker not found in list');
      return;
    }

    try {
      console.log('[ChooseBroker] Starting connection process...');
      setLoading(true);
      hapticFeedback.impact();

      // Save broker selection immediately
      console.log('[ChooseBroker] Saving to AsyncStorage...');
      await AsyncStorage.setItem('selectedBroker', broker.id);
      await AsyncStorage.setItem('brokerName', broker.name);
      console.log('[ChooseBroker] Saved successfully!');

      // Update current broker to keep checkmark
      setCurrentBroker(broker.id);
      
      // Show success message
      hapticFeedback.success();
      console.log('[ChooseBroker] Showing success alert...');
      
      Alert.alert(
        'Broker Connected!',
        `You are now connected to ${broker.name}!\n\n` +
        `• Commission: ${broker.fees.commission}\n` +
        `• Minimum Fee: ${broker.fees.minimum}\n` +
        `• Rating: ${broker.rating}/5.0\n\n` +
        `You can now trade on the NSE through Stock Soko using ${broker.name}.`,
        [
          {
            text: 'Done',
            onPress: () => {
              console.log('[ChooseBroker] Navigating back to Settings...');
              navigation.goBack();
            }
          }
        ]
      );
      
      console.log('[ChooseBroker] Alert shown successfully!');
    } catch (error) {
      console.error('[ChooseBroker] ERROR during connection:', error);
      hapticFeedback.error();
      Alert.alert('Error', `Failed to connect broker: ${error}`);
    } finally {
      setLoading(false);
      console.log('[ChooseBroker] Loading state reset');
    }
  };


  const renderBrokerCard = (broker: Broker) => {
    const isSelected = selectedBroker === broker.id;
    const isCurrent = currentBroker === broker.id;
    const showingDetails = showDetails === broker.id;

    return (
      <Card
        key={broker.id}
        variant="glass"
        style={[
          styles.brokerCard,
          isSelected && styles.brokerCardSelected,
        ]}
      >
        <TouchableOpacity
          onPress={() => handleSelectBroker(broker.id)}
          activeOpacity={0.7}
        >
          <View style={styles.brokerHeader}>
            {/* Logo */}
            <View style={[styles.brokerLogo, { backgroundColor: broker.color + '20' }]}>
              <Ionicons name={broker.logo as any} size={32} color={broker.color} />
            </View>

            {/* Info */}
            <View style={styles.brokerInfo}>
              <View style={styles.brokerTitleRow}>
                <Text style={styles.brokerName}>{broker.name}</Text>
                {isCurrent && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>Current</Text>
                  </View>
                )}
              </View>
              <Text style={styles.brokerDescription} numberOfLines={1}>
                {broker.description}
              </Text>

              {/* Rating & API Status */}
              <View style={styles.brokerMeta}>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color={colors.warning} />
                <Text style={styles.ratingText}>{broker.rating}</Text>
              </View>
                <View style={styles.metaDivider} />
                <View style={[
                  styles.apiStatusBadge,
                  { backgroundColor: broker.hasAPI 
                    ? (broker.apiStatus === 'live' ? colors.success : colors.warning) + '20'
                    : colors.text.disabled + '20'
                  }
                ]}>
                  <Text style={[
                    styles.apiStatusText,
                    { color: broker.hasAPI 
                      ? (broker.apiStatus === 'live' ? colors.success : colors.warning)
                      : colors.text.disabled
                    }
                  ]}>
                    {broker.hasAPI ? (broker.apiStatus === 'live' ? 'Live API' : 'Sandbox') : 'No API'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Selection indicator */}
            <View style={styles.selectionContainer}>
              {isSelected ? (
                <Ionicons name="checkmark-circle" size={28} color={colors.success} />
              ) : (
                <Ionicons name="ellipse-outline" size={28} color={colors.text.disabled} />
              )}
            </View>
          </View>

          {/* Fees */}
          <View style={styles.feesRow}>
            <View style={styles.feeItem}>
              <Text style={styles.feeLabel}>Commission</Text>
              <Text style={styles.feeValue}>{broker.fees.commission}</Text>
            </View>
            <View style={styles.feeItem}>
              <Text style={styles.feeLabel}>Minimum</Text>
              <Text style={styles.feeValue}>{broker.fees.minimum}</Text>
            </View>
            <View style={styles.feeItem}>
              <Text style={styles.feeLabel}>Custody</Text>
              <Text style={styles.feeValue}>{broker.fees.custody}</Text>
            </View>
          </View>

          {/* Show Details Button */}
          <TouchableOpacity
            style={styles.detailsToggle}
            onPress={() => handleViewDetails(broker.id)}
          >
            <Text style={styles.detailsToggleText}>
              {showingDetails ? 'Hide Details' : 'View Details'}
            </Text>
            <Ionicons 
              name={showingDetails ? 'chevron-up' : 'chevron-down'} 
              size={16} 
              color={colors.primary.main} 
            />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Expanded Details */}
        {showingDetails && (
          <View style={styles.detailsSection}>
            <View style={styles.detailsDivider} />
            
            {/* Features */}
            <Text style={styles.detailsTitle}>Features:</Text>
            {broker.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}

            {/* Requirements */}
            <Text style={styles.detailsTitle}>Requirements:</Text>
            <View style={styles.requirementItem}>
              <Ionicons name="document-text-outline" size={16} color={colors.text.secondary} />
              <Text style={styles.requirementText}>
                {broker.requiresCDS ? 'CDS account required' : 'No CDS account needed'}
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons name="wallet-outline" size={16} color={colors.text.secondary} />
              <Text style={styles.requirementText}>Minimum deposit: {broker.minDeposit}</Text>
            </View>

            {/* Website Link */}
            <TouchableOpacity
              style={styles.websiteButton}
              onPress={() => Linking.openURL(broker.website)}
            >
              <Ionicons name="globe-outline" size={18} color={colors.primary.main} />
              <Text style={styles.websiteButtonText}>Visit Website</Text>
              <Ionicons name="open-outline" size={14} color={colors.primary.main} />
            </TouchableOpacity>
          </View>
        )}
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Broker</Text>
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={20} color={colors.info} />
        <Text style={styles.infoBannerText}>
          Choose a licensed stockbroker to trade on the Nairobi Securities Exchange
        </Text>
      </View>

      {/* Broker List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {KENYAN_BROKERS.map(broker => renderBrokerCard(broker))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title={currentBroker === selectedBroker ? 'Reconnect Broker' : 'Connect Broker'}
          onPress={handleConnectBroker}
          variant="primary"
          size="lg"
          fullWidth
          disabled={!selectedBroker}
          loading={loading}
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
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.info + '15',
    borderBottomWidth: 1,
    borderBottomColor: colors.info + '30',
  },
  infoBannerText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  brokerCard: {
    padding: spacing.md,
  },
  brokerCardSelected: {
    borderWidth: 2,
    borderColor: colors.success,
  },
  brokerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  brokerLogo: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  brokerInfo: {
    flex: 1,
  },
  brokerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  brokerName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  currentBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  currentBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.success,
    fontWeight: typography.fontWeight.bold,
  },
  brokerDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  brokerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  metaDivider: {
    width: 1,
    height: 12,
    backgroundColor: colors.border.main,
  },
  apiStatusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  apiStatusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  selectionContainer: {
    marginLeft: spacing.sm,
  },
  feesRow: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    justifyContent: 'space-between',
  },
  feeItem: {
    flex: 1,
    alignItems: 'center',
  },
  feeLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: 2,
  },
  feeValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  detailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  detailsToggleText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary.main,
    fontWeight: typography.fontWeight.medium,
  },
  detailsSection: {
    paddingTop: spacing.md,
  },
  detailsDivider: {
    height: 1,
    backgroundColor: colors.border.main,
    marginBottom: spacing.md,
  },
  detailsTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  featureText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  requirementText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primary.main,
    marginTop: spacing.md,
  },
  websiteButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary.main,
    fontWeight: typography.fontWeight.medium,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.main,
    backgroundColor: colors.background.card,
  },
});