import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { ProfileStackParamList } from '../navigation/types';
import { Card } from '../components';
import { colors, typography, spacing } from '../theme';

type TermsConditionsScreenProp = StackNavigationProp<ProfileStackParamList, 'TermsConditions'>;

interface Props {
  navigation: TermsConditionsScreenProp;
}

export default function TermsConditions({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Card variant="glass" style={styles.card}>
          <Text style={styles.lastUpdated}>Last Updated: October 9, 2025</Text>
          
          <Text style={styles.intro}>
            Welcome to Stock Soko. By accessing or using our application, you agree to be bound 
            by these Terms and Conditions. Please read them carefully before using our services.
          </Text>

          <Section
            title="1. Acceptance of Terms"
            content={`By creating an account and using Stock Soko, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions, as well as our Privacy Policy.

If you do not agree to these terms, you must not use our services.`}
          />

          <Section
            title="2. Eligibility"
            content={`To use Stock Soko, you must:

• Be at least 18 years of age
• Be a resident of Kenya or authorized to trade in Kenyan markets
• Have the legal capacity to enter into binding contracts
• Not be prohibited from trading securities under any applicable law
• Complete our KYC (Know Your Customer) verification process`}
          />

          <Section
            title="3. Account Registration and Security"
            content={`You agree to:

• Provide accurate, current, and complete information during registration
• Maintain and promptly update your account information
• Keep your password secure and confidential
• Notify us immediately of any unauthorized account access
• Accept responsibility for all activities under your account
• Not share your account with others or create multiple accounts`}
          />

          <Section
            title="4. Trading Services"
            content={`Stock Soko provides access to the Nairobi Securities Exchange (NSE) and other markets. You acknowledge:

• Trading involves substantial risk of loss
• Past performance does not guarantee future results
• We do not provide investment advice or guarantee returns
• You are responsible for your own investment decisions
• Market data may be delayed and prices are subject to change
• Orders are executed on a best-efforts basis
• We reserve the right to reject or cancel orders in our discretion`}
          />

          <Section
            title="5. Fees and Charges"
            content={`You agree to pay all applicable fees, including:

• Trading commissions and transaction fees
• Withdrawal and deposit fees
• Currency conversion fees
• Regulatory fees and taxes
• Inactivity fees (if applicable)

All fees are disclosed before you confirm transactions. We reserve the right to modify fees with 30 days notice.`}
          />

          <Section
            title="6. Risk Disclosure"
            content={`Trading securities involves risks, including:

• Loss of principal: You may lose some or all of your invested capital
• Market risk: Prices can fluctuate significantly
• Liquidity risk: You may not be able to sell holdings quickly
• Currency risk: Exchange rate fluctuations may affect returns
• Political and economic risk: Events may impact market performance

You should only invest funds you can afford to lose and diversify your investments.`}
          />

          <Section
            title="7. Prohibited Activities"
            content={`You may not:

• Engage in market manipulation or insider trading
• Use the app for money laundering or illegal activities
• Attempt to gain unauthorized access to our systems
• Use automated trading systems without written approval
• Reverse engineer, decompile, or disassemble the app
• Violate any applicable laws or regulations
• Harass, abuse, or harm other users or our staff`}
          />

          <Section
            title="8. Intellectual Property"
            content={`All content, features, and functionality of Stock Soko, including but not limited to:

• Software, text, graphics, logos, icons, images
• Trading algorithms and data analysis tools
• Company name, trademarks, and branding

Are owned by Stock Soko and protected by copyright, trademark, and other intellectual property laws.`}
          />

          <Section
            title="9. Limitation of Liability"
            content={`To the maximum extent permitted by law:

• Stock Soko is provided "as is" without warranties of any kind
• We are not liable for trading losses or missed opportunities
• We are not responsible for market data errors or delays
• Our liability is limited to the fees you paid in the 12 months prior
• We are not liable for indirect, consequential, or punitive damages
• We do not guarantee uninterrupted or error-free service`}
          />

          <Section
            title="10. Account Termination"
            content={`We may suspend or terminate your account if you:

• Violate these Terms and Conditions
• Engage in fraudulent or illegal activities
• Fail to complete KYC verification
• Have negative account balance
• Request account closure

Upon termination, you must settle all obligations. We will return your funds according to applicable laws and after deducting any fees owed.`}
          />

          <Section
            title="11. Dispute Resolution"
            content={`In the event of a dispute:

• First contact our customer support for resolution
• If unresolved, disputes will be submitted to mediation
• Arbitration may be required for unresolved disputes
• Governing law is the laws of the Republic of Kenya
• Exclusive jurisdiction is in the courts of Nairobi, Kenya`}
          />

          <Section
            title="12. Changes to Terms"
            content={`We may modify these Terms at any time. We will notify you of material changes via:

• Email notification
• In-app notification
• Notice on our website

Continued use after changes constitutes acceptance of the new terms.`}
          />

          <Section
            title="13. Contact Information"
            content={`For questions about these Terms and Conditions:

Email: legal@stocksoko.com
Phone: +254 700 000 000
Address: Nairobi, Kenya

Customer Support: support@stocksoko.com`}
          />

          <View style={styles.acceptance}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.acceptanceText}>
              By using Stock Soko, you acknowledge that you have read and agree to these Terms and Conditions.
            </Text>
          </View>
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <View style={sectionStyles.container}>
      <Text style={sectionStyles.title}>{title}</Text>
      <Text style={sectionStyles.content}>{content}</Text>
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  content: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});

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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  card: {
    padding: spacing.lg,
  },
  lastUpdated: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    marginBottom: spacing.lg,
  },
  intro: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  acceptance: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.success + '10',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.success + '30',
    marginTop: spacing.lg,
  },
  acceptanceText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    lineHeight: 20,
  },
});