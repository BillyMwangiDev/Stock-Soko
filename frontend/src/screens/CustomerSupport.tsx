/**
 * Customer Support Screen
 * Chat, FAQs, and Contact information
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Linking } from 'react-native';
import { colors, typography, spacing, borderRadius, touchTarget } from '../theme';
import { hapticFeedback } from '../utils/haptics';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export default function CustomerSupport() {
  const [activeTab, setActiveTab] = useState<'chat' | 'faq' | 'contact'>('faq');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'How do I buy stocks?',
      answer: 'Navigate to Markets, search for a stock, tap on it to view details, then tap the "Buy" button. Enter the quantity you want to purchase and review your order before confirming.',
    },
    {
      id: '2',
      question: 'What are the trading fees?',
      answer: 'Stock Soko charges a competitive 0.12% brokerage fee on all transactions. This fee is displayed before you confirm any order.',
    },
    {
      id: '3',
      question: 'How long does KYC verification take?',
      answer: 'KYC verification typically takes 1-2 business days. You\'ll receive a notification once your documents have been reviewed. Ensure all documents are clear and valid.',
    },
    {
      id: '4',
      question: 'How do I deposit funds?',
      answer: 'Go to your Wallet, tap "Deposit," and follow the M-Pesa prompts. Funds are usually available in your account within minutes.',
    },
    {
      id: '5',
      question: 'Can I sell my shares anytime?',
      answer: 'Yes, you can place sell orders during market hours (NSE: 9:00 AM - 3:00 PM EAT, Monday-Friday). Orders placed outside market hours will be queued for the next trading session.',
    },
    {
      id: '6',
      question: 'What is fractional share trading?',
      answer: 'Fractional shares allow you to buy a portion of a share instead of a whole share. This makes expensive stocks more accessible. Enable "Allow Fractional" when placing an order.',
    },
    {
      id: '7',
      question: 'How do I withdraw my funds?',
      answer: 'Navigate to Wallet  Withdraw, enter the amount, and confirm. Funds will be sent to your linked M-Pesa account within 1 business day.',
    },
    {
      id: '8',
      question: 'Is my money safe?',
      answer: 'Yes. Stock Soko is regulated by the Capital Markets Authority (CMA) of Kenya. Your funds are held in segregated accounts, and all transactions are encrypted.',
    },
  ];

  const handleTabChange = (tab: 'chat' | 'faq' | 'contact') => {
    hapticFeedback.selection();
    setActiveTab(tab);
  };

  const toggleFAQ = (id: string) => {
    hapticFeedback.light();
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleCall = () => {
    hapticFeedback.medium();
    Linking.openURL('tel:+254700000000');
  };

  const handleEmail = () => {
    hapticFeedback.medium();
    Linking.openURL('mailto:support@stocksoko.co.ke');
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      hapticFeedback.success();
      hapticFeedback.impact();
      (navigation as any).navigate('LiveChat');
      setChatMessage('');
    }
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'faq' && styles.tabActive]}
          onPress={() => handleTabChange('faq')}
        >
          <Text style={[styles.tabText, activeTab === 'faq' && styles.tabTextActive]}>
            FAQs
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'chat' && styles.tabActive]}
          onPress={() => handleTabChange('chat')}
        >
          <Text style={[styles.tabText, activeTab === 'chat' && styles.tabTextActive]}>
            Chat
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'contact' && styles.tabActive]}
          onPress={() => handleTabChange('contact')}
        >
          <Text style={[styles.tabText, activeTab === 'contact' && styles.tabTextActive]}>
            Contact
          </Text>
        </TouchableOpacity>
      </View>      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'faq' && (
          <View style={styles.faqContainer}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            <Text style={styles.sectionSubtitle}>
              Find answers to common questions about trading and using Stock Soko
            </Text>

            {faqs.map((faq) => (
              <TouchableOpacity
                key={faq.id}
                style={styles.faqItem}
                onPress={() => toggleFAQ(faq.id)}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Text style={styles.faqIcon}>
                    {expandedFAQ === faq.id ? '−' : '+'}
                  </Text>
                </View>
                {expandedFAQ === faq.id && (
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'chat' && (
          <View style={styles.chatContainer}>
            <Text style={styles.sectionTitle}>Live Chat Support</Text>
            <Text style={styles.sectionSubtitle}>
              Chat with our support team (Available 9 AM - 5 PM EAT)
            </Text>

            <View style={styles.chatPlaceholder}>
              <Text style={styles.placeholderIcon}></Text>
              <Text style={styles.placeholderText}>Chat Coming Soon</Text>
              <Text style={styles.placeholderSubtext}>
                We're working on bringing you real-time chat support. For now, please use email or phone support.
              </Text>
            </View>

            <View style={styles.chatInputContainer}>
              <TextInput
                style={styles.chatInput}
                placeholder="Type your message..."
                placeholderTextColor={colors.text.disabled}
                value={chatMessage}
                onChangeText={setChatMessage}
                multiline
                editable={false}
              />
              <TouchableOpacity
                style={[styles.sendButton, !chatMessage.trim() && styles.sendButtonDisabled]}
                onPress={handleSendMessage}
                disabled={!chatMessage.trim()}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'contact' && (
          <View style={styles.contactContainer}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <Text style={styles.sectionSubtitle}>
              Reach out to us through any of these channels
            </Text>

            <View style={styles.contactCard}>
              <Text style={styles.contactIcon}>P</Text>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Phone Support</Text>
                <Text style={styles.contactValue}>+254 700 000 000</Text>
                <Text style={styles.contactHours}>Mon-Fri, 9 AM - 5 PM EAT</Text>
              </View>
              <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
                <Text style={styles.contactButtonText}>Call</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.contactCard}>
              <Text style={styles.contactIcon}>@</Text>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Email Support</Text>
                <Text style={styles.contactValue}>support@stocksoko.co.ke</Text>
                <Text style={styles.contactHours}>Response within 24 hours</Text>
              </View>
              <TouchableOpacity style={styles.contactButton} onPress={handleEmail}>
                <Text style={styles.contactButtonText}>Email</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.contactCard}>
              <Text style={styles.contactIcon}>L</Text>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Office Location</Text>
                <Text style={styles.contactValue}>Nairobi, Kenya</Text>
                <Text style={styles.contactHours}>Visit by appointment only</Text>
              </View>
            </View>

            <View style={styles.contactCard}>
              <Text style={styles.contactIcon}>H</Text>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Support Hours</Text>
                <Text style={styles.contactValue}>Monday - Friday</Text>
                <Text style={styles.contactHours}>9:00 AM - 5:00 PM EAT</Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary.main,
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.primary.main,
    fontWeight: typography.fontWeight.bold,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  // FAQ Styles
  faqContainer: {
    gap: spacing.sm,
  },
  faqItem: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  faqQuestion: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginRight: spacing.md,
  },
  faqIcon: {
    fontSize: 24,
    color: colors.primary.main,
    fontWeight: typography.fontWeight.bold,
  },
  faqAnswer: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  // Chat Styles
  chatContainer: {
    flex: 1,
  },
  chatPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  placeholderText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  placeholderSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  chatInputContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chatInput: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.main,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    minHeight: touchTarget.comfortable,
    maxHeight: 120,
  },
  sendButton: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: touchTarget.comfortable,
  },
  sendButtonDisabled: {
    backgroundColor: colors.background.secondary,
  },
  sendButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.contrast,
  },
  // Contact Styles
  contactContainer: {
    gap: spacing.md,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  contactIcon: {
    fontSize: 32,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  contactHours: {
    fontSize: typography.fontSize.xs,
    color: colors.text.disabled,
  },
  contactButton: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  contactButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.contrast,
  },
});