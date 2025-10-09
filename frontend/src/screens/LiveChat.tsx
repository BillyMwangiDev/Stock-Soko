import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { ProfileStackParamList } from '../navigation/types';
import { Card } from '../components';
import { colors, typography, spacing } from '../theme';
import { api } from '../api/client';
import { hapticFeedback } from '../utils/haptics';

type LiveChatScreenProp = StackNavigationProp<ProfileStackParamList, 'LiveChat'>;

interface Props {
  navigation: LiveChatScreenProp;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'agent' | 'system';
  timestamp: string;
  agentName?: string;
  status?: 'sending' | 'sent' | 'failed';
}

export default function LiveChat({ navigation }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [agentInfo, setAgentInfo] = useState({ name: '', status: 'offline' as 'online' | 'offline' | 'away' });
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    initializeChat();
    
    return () => {
      disconnectChat();
    };
  }, []);

  const initializeChat = async () => {
    try {
      const res = await api.post('/support/chat/init');
      
      setIsConnected(true);
      setAgentInfo({
        name: res.data.agent_name || 'Support Agent',
        status: res.data.agent_status || 'online',
      });

      const welcomeMessage: ChatMessage = {
        id: '1',
        text: `Hello! I'm ${res.data.agent_name || 'Sarah'}, your Stock Soko support agent. How can I help you today?`,
        sender: 'agent',
        timestamp: new Date().toISOString(),
        agentName: res.data.agent_name || 'Sarah',
        status: 'sent',
      };
      
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      
      setIsConnected(false);
      const offlineMessage: ChatMessage = {
        id: '1',
        text: 'We are currently offline. Please leave a message and we will get back to you via email, or contact us at support@stocksoko.com',
        sender: 'system',
        timestamp: new Date().toISOString(),
        status: 'sent',
      };
      setMessages([offlineMessage]);
    }
  };

  const disconnectChat = async () => {
    try {
      await api.post('/support/chat/disconnect');
    } catch (error) {
      console.error('Failed to disconnect chat:', error);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
      status: 'sending',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    
    scrollViewRef.current?.scrollToEnd({ animated: true });

    try {
      hapticFeedback.light();
      
      const res = await api.post('/support/chat/message', {
        message: userMessage.text,
      });

      setMessages(prev => prev.map(m => 
        m.id === userMessage.id ? { ...m, status: 'sent' as const } : m
      ));

      if (res.data.typing) {
        setIsTyping(true);
      }

      if (res.data.reply) {
        setTimeout(() => {
          const agentReply: ChatMessage = {
            id: (Date.now() + 1).toString(),
            text: res.data.reply,
            sender: 'agent',
            timestamp: new Date().toISOString(),
            agentName: agentInfo.name,
            status: 'sent',
          };
          
          setMessages(prev => [...prev, agentReply]);
          setIsTyping(false);
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      setMessages(prev => prev.map(m => 
        m.id === userMessage.id ? { ...m, status: 'failed' as const } : m
      ));

      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        text: 'Failed to send message. Please check your connection and try again.',
        sender: 'system',
        timestamp: new Date().toISOString(),
        status: 'sent',
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Live Support</Text>
          <View style={styles.statusRow}>
            <View style={[
              styles.statusDot,
              { backgroundColor: agentInfo.status === 'online' ? colors.success : 
                                agentInfo.status === 'away' ? colors.warning : 
                                colors.text.disabled }
            ]} />
            <Text style={styles.statusText}>
              {isConnected ? agentInfo.name : 'Offline'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageWrapper,
              message.sender === 'user' && styles.userMessageWrapper,
            ]}
          >
            {message.sender === 'agent' && (
              <View style={styles.agentAvatar}>
                <Ionicons name="headset-outline" size={16} color={colors.primary.contrast} />
              </View>
            )}

            <View
              style={[
                styles.messageBubble,
                message.sender === 'user' && styles.userBubble,
                message.sender === 'agent' && styles.agentBubble,
                message.sender === 'system' && styles.systemBubble,
              ]}
            >
              {message.sender === 'agent' && message.agentName && (
                <Text style={styles.agentName}>{message.agentName}</Text>
              )}
              
              <Text
                style={[
                  styles.messageText,
                  message.sender === 'user' && styles.userMessageText,
                ]}
              >
                {message.text}
              </Text>
              
              <View style={styles.messageFooter}>
                <Text style={[
                  styles.messageTime,
                  message.sender === 'user' && styles.userMessageTime
                ]}>
                  {formatTime(message.timestamp)}
                </Text>
                
                {message.sender === 'user' && message.status && (
                  <Ionicons 
                    name={
                      message.status === 'sent' ? 'checkmark-done' :
                      message.status === 'sending' ? 'time-outline' :
                      'alert-circle-outline'
                    }
                    size={14}
                    color={message.status === 'failed' ? colors.error : colors.primary.contrast + '80'}
                  />
                )}
              </View>
            </View>

            {message.sender === 'user' && (
              <View style={styles.userAvatar}>
                <Ionicons name="person" size={16} color={colors.primary.contrast} />
              </View>
            )}
          </View>
        ))}

        {isTyping && (
          <View style={styles.typingIndicator}>
            <View style={styles.agentAvatar}>
              <Ionicons name="headset-outline" size={16} color={colors.primary.contrast} />
            </View>
            <View style={styles.typingBubble}>
              <View style={styles.typingDots}>
                <View style={styles.typingDot} />
                <View style={styles.typingDot} />
                <View style={styles.typingDot} />
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            placeholderTextColor={colors.text.tertiary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={inputText.trim() ? colors.primary.contrast : colors.text.disabled} 
            />
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main,
    backgroundColor: colors.background.card,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  messagesContent: {
    padding: spacing.md,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    maxWidth: '85%',
    gap: spacing.xs,
  },
  userMessageWrapper: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  messageBubble: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 16,
  },
  agentBubble: {
    backgroundColor: colors.background.card,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: colors.primary.main,
    borderBottomRightRadius: 4,
  },
  systemBubble: {
    backgroundColor: colors.warning + '15',
    borderWidth: 1,
    borderColor: colors.warning + '30',
    alignSelf: 'center',
    maxWidth: '90%',
  },
  agentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentName: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.main,
    marginBottom: 4,
  },
  messageText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    lineHeight: 20,
  },
  userMessageText: {
    color: colors.primary.contrast,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  messageTime: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  userMessageTime: {
    color: colors.primary.contrast + '80',
  },
  typingIndicator: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    maxWidth: '85%',
    gap: spacing.xs,
  },
  typingBubble: {
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.background.card,
    borderBottomLeftRadius: 4,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.text.tertiary,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border.main,
    backgroundColor: colors.background.card,
    padding: spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderRadius: 24,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    maxHeight: 100,
    paddingVertical: spacing.sm,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.text.disabled,
  },
});

