/**
 * AI Assistant Screen
 * Chat interface for AI-powered stock insights
 */
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileStackParamList } from '../navigation/types';
import { colors, typography, spacing, borderRadius } from '../theme';

type AIAssistantScreenProp = StackNavigationProp<ProfileStackParamList, 'AIAssistant'>;

interface Props {
  navigation: AIAssistantScreenProp;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  text: string;
  hasChart?: boolean;
}

export default function AIAssistant({ navigation }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      text: "Hi there! I'm here to help you navigate the stock market. What can I assist you with today?",
    },
    {
      id: '2',
      type: 'user',
      text: "I'd like to research a specific stock.",
    },
    {
      id: '3',
      type: 'ai',
      text: "Sure, which stock are you interested in?",
    },
    {
      id: '4',
      type: 'user',
      text: "I'm looking at MTN Group.",
    },
    {
      id: '5',
      type: 'ai',
      text: "MTN Group is a leading telecommunications provider in Africa. Their stock has been performing well recently. Here's a chart showing its performance over the past year.",
      hasChart: true,
    },
    {
      id: '6',
      type: 'user',
      text: "Can you explain the recent dip in the chart?",
    },
    {
      id: '7',
      type: 'ai',
      text: "The recent dip can be attributed to market volatility due to global economic uncertainty. However, analysts predict a recovery in the coming months.",
    },
  ]);
  const [input, setInput] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: input,
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: `Based on current market analysis, I can help you with "${input}". This is a demo response showing how the AI assistant will work.`,
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stock Soko AI</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageRow,
              message.type === 'user' ? styles.messageRowUser : styles.messageRowAI,
            ]}
          >
            {message.type === 'ai' && (
              <View style={styles.aiAvatar}>
                <Text style={styles.avatarText}>AI</Text>
              </View>
            )}

            <View
              style={[
                styles.messageContainer,
                message.type === 'user' ? styles.messageContainerUser : styles.messageContainerAI,
              ]}
            >
              {message.type === 'ai' && (
                <Text style={styles.messageLabel}>Stock Soko AI</Text>
              )}
              {message.type === 'user' && (
                <Text style={styles.messageLabelUser}>You</Text>
              )}
              
              <View
                style={[
                  styles.messageBubble,
                  message.type === 'user' ? styles.messageBubbleUser : styles.messageBubbleAI,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.type === 'user' ? styles.messageTextUser : styles.messageTextAI,
                  ]}
                >
                  {message.text}
                </Text>
              </View>

              {message.hasChart && (
                <View style={styles.chartContainer}>
                  <View style={styles.chartPlaceholder}>
                    <Text style={styles.chartEmoji}>📊</Text>
                    <Text style={styles.chartText}>MTN Stock Chart</Text>
                  </View>
                </View>
              )}
            </View>

            {message.type === 'user' && (
              <View style={styles.userAvatar}>
                <Text style={styles.avatarText}>You</Text>
              </View>
            )}
          </View>
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Input Footer */}
      <View style={styles.footer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask me anything..."
            placeholderTextColor={colors.text.disabled}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={!input.trim()}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
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
    backgroundColor: colors.background.primary + 'B3',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main + '20',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: colors.text.primary,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
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
  messagesContent: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAI: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.main + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  messageContainer: {
    maxWidth: '80%',
  },
  messageContainerUser: {
    alignItems: 'flex-end',
  },
  messageContainerAI: {
    alignItems: 'flex-start',
  },
  messageLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  messageLabelUser: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  messageBubble: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  messageBubbleUser: {
    backgroundColor: colors.primary.main,
    borderTopRightRadius: 4,
  },
  messageBubbleAI: {
    backgroundColor: colors.background.card,
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: typography.fontSize.base,
    lineHeight: 22,
  },
  messageTextUser: {
    color: colors.primary.contrast,
  },
  messageTextAI: {
    color: colors.text.primary,
  },
  chartContainer: {
    marginTop: spacing.sm,
  },
  chartPlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.main,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  chartEmoji: {
    fontSize: 48,
    marginBottom: spacing.xs,
  },
  chartText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background.primary + 'B3',
    borderTopWidth: 1,
    borderTopColor: colors.border.main + '20',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    flex: 1,
    height: 48,
    paddingLeft: spacing.md,
    paddingRight: 60,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.secondary,
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sendButton: {
    position: 'absolute',
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    fontSize: 20,
    color: colors.primary.contrast,
  },
});
