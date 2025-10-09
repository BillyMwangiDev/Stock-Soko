import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { ProfileStackParamList } from '../navigation/types';
import { Card } from '../components';
import { colors, typography, spacing } from '../theme';

type PrivacyPolicyScreenProp = StackNavigationProp<ProfileStackParamList, 'PrivacyPolicy'>;

interface Props {
  navigation: PrivacyPolicyScreenProp;
}

export default function PrivacyPolicy({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Card variant="glass" style={styles.card}>
          <Text style={styles.lastUpdated}>Last Updated: October 9, 2025</Text>
          
          <Text style={styles.intro}>
            Stock Soko ("we", "our", or "us") is committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your 
            information when you use our mobile application and services.
          </Text>

          <Section
            title="1. Information We Collect"
            content={`We collect information that you provide directly to us, including:

• Personal Information: Name, email address, phone number, date of birth
• Financial Information: Trading activity, portfolio holdings, transaction history
• Identity Verification: KYC documents, ID verification data
• Payment Information: M-Pesa number, bank account details
• Usage Data: App interactions, preferences, device information`}
          />

          <Section
            title="2. How We Use Your Information"
            content={`We use the information we collect to:

• Provide and maintain our trading services
• Process your trades and transactions
• Verify your identity and comply with KYC/AML regulations
• Send you transaction confirmations and account updates
• Provide customer support
• Improve our services and develop new features
• Detect and prevent fraud and security threats
• Comply with legal obligations`}
          />

          <Section
            title="3. Information Sharing and Disclosure"
            content={`We do not sell your personal information. We may share your information with:

• Service Providers: Payment processors (M-Pesa), KYC verification services
• Regulatory Authorities: Capital Markets Authority (CMA), Central Bank of Kenya
• Legal Compliance: When required by law or to protect rights and safety
• Business Transfers: In case of merger, acquisition, or asset sale (with notice)`}
          />

          <Section
            title="4. Data Security"
            content={`We implement industry-standard security measures to protect your data:

• Encryption of data in transit (TLS/SSL) and at rest
• Secure authentication with optional two-factor authentication
• Regular security audits and penetration testing
• Restricted access to personal information on need-to-know basis
• Secure data centers with physical and digital safeguards`}
          />

          <Section
            title="5. Your Rights and Choices"
            content={`You have the right to:

• Access your personal information
• Correct inaccurate or incomplete data
• Request deletion of your data (subject to legal requirements)
• Opt-out of marketing communications
• Export your data in a portable format
• Withdraw consent for data processing`}
          />

          <Section
            title="6. Data Retention"
            content={`We retain your information for as long as your account is active or as needed to:

• Provide our services
• Comply with legal obligations (financial records: 7 years)
• Resolve disputes and enforce our agreements
• Prevent fraud and abuse`}
          />

          <Section
            title="7. Children's Privacy"
            content={`Stock Soko is not intended for users under 18 years of age. We do not knowingly collect information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.`}
          />

          <Section
            title="8. International Data Transfers"
            content={`Your information may be transferred to and processed in countries other than Kenya. We ensure appropriate safeguards are in place for such transfers in compliance with data protection laws.`}
          />

          <Section
            title="9. Changes to This Privacy Policy"
            content={`We may update this Privacy Policy from time to time. We will notify you of any material changes by:

• Posting the new Privacy Policy in the app
• Sending you an email notification
• Displaying an in-app notification

Your continued use of the app after changes constitutes acceptance.`}
          />

          <Section
            title="10. Contact Us"
            content={`If you have questions about this Privacy Policy or our data practices, contact us at:

Email: privacy@stocksoko.com
Phone: +254 700 000 000
Address: Nairobi, Kenya

For data protection inquiries, contact our Data Protection Officer at: dpo@stocksoko.com`}
          />
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
});

