/**
 * AI Assistant Screen
 * Chat interface for AI-powered stock insights
 */
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileStackParamList } from '../navigation/types';
import { colors, typography, spacing, borderRadius } from '../theme';
import { api } from '../api/client';

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

const SUGGESTED_QUESTIONS = [
  "Analyze KCB stock",
  "Compare Safaricom vs Equity",
  "What to buy with 10,000 KES?",
  "Best dividend stocks",
  "Market outlook for 2025",
  "Explain P/E ratio",
  "How to diversify portfolio?",
  "Banking sector analysis",
];

const generateMockAIResponse = (input: string): string => {
  const lowerInput = input.toLowerCase();
  
  // Stock analysis responses
  if (lowerInput.includes('kcb') || lowerInput.includes('equity') || lowerInput.includes('safaricom')) {
    const stock = lowerInput.includes('kcb') ? 'KCB' : lowerInput.includes('equity') ? 'Equity' : 'Safaricom';
    const action = stock === 'Safaricom' || stock === 'KCB' ? 'BUY' : 'HOLD';
    const confidence = stock === 'Safaricom' ? '85%' : stock === 'KCB' ? '85%' : '72%';
    
    return `📈 ${stock} Stock Analysis\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n📊 CURRENT METRICS\n\n• Strong financials with solid P/E ratio\n• Consistent dividend payments\n• Market leader in its sector\n• High liquidity and trading volume\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n💡 AI RECOMMENDATION\n\n🎯 Action: ${action}\n📈 Confidence: ${confidence}\n⏰ Time Horizon: 6-12 months\n💰 Risk Level: Medium\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n✅ KEY STRENGTHS\n\n• Stable revenue growth\n• Strong market position\n• Proven management team\n• Attractive dividend yield\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n⚠️ IMPORTANT DISCLAIMER\n\nThis is AI-generated analysis for educational purposes. Always conduct your own research and consult with a financial advisor before making investment decisions.`;
  }
  
  // Portfolio/Investment amount questions
  if (lowerInput.includes('10,000') || lowerInput.includes('10000') || lowerInput.includes('invest')) {
    return `💰 Portfolio Plan for KES 10,000\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n📊 RECOMMENDED ALLOCATION\n\n🔵 40% Safaricom (SCOM)\n💵 KES 4,000\n📱 Stable telecom leader\n💎 Regular dividend payer\n\n🔵 35% KCB Group\n💵 KES 3,500\n🏦 Strong banking fundamentals\n📈 Consistent growth\n\n🔵 25% Equity Bank\n💵 KES 2,500\n🌍 Regional expansion\n💹 Growth potential\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n🎯 INVESTMENT STRATEGY\n\n✅ Diversified across sectors\n✅ Mix of growth and stability\n✅ Regular dividend income\n✅ Manageable risk level\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n💡 NEXT STEPS\n\n1. Open a CDS account\n2. Start with one stock\n3. Add others over time\n4. Rebalance quarterly\n5. Reinvest dividends\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n📌 This is a sample allocation. Adjust based on your risk tolerance and investment goals.`;
  }
  
  // Dividend questions
  if (lowerInput.includes('dividend')) {
    return `💎 Top Dividend Stocks on NSE\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n🏆 BEST DIVIDEND PAYERS\n\n🥇 SAFARICOM (SCOM)\n💰 Yield: 5-6% annually\n✅ Consistent payer\n📊 Stable company\n\n🥈 EQUITY BANK (EQTY)\n💰 Yield: 7-8% annually\n✅ Strong growth\n📊 Regional expansion\n\n🥉 KCB GROUP\n💰 Yield: 6-7% annually\n✅ Stable returns\n📊 Market leader\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n💡 PRO TIPS\n\n✓ Reinvest dividends for compound growth\n✓ Check ex-dividend dates\n✓ Consider dividend growth history\n✓ Balance yield with company stability\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n📌 Dividend investing builds long-term wealth through passive income!`;
  }
  
  // Market outlook
  if (lowerInput.includes('outlook') || lowerInput.includes('2025')) {
    return `🔮 NSE Market Outlook 2025\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n✅ POSITIVE FACTORS\n\n📈 Economic recovery post-2024\n👥 Growing middle class\n💻 Digital transformation\n🌍 Regional integration\n🏗️ Infrastructure development\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n⚠️ RISK FACTORS\n\n📊 Interest rate volatility\n💱 Currency fluctuations\n🌐 Global market trends\n🛢️ Oil price changes\n⚡ Political stability\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n🎯 SECTORS TO WATCH\n\n🏦 BANKING\n• Digital banking adoption\n• Regional expansion\n\n📱 TELECOMMUNICATIONS\n• 5G network rollout\n• Mobile money growth\n\n🏪 CONSUMER GOODS\n• Rising purchasing power\n• Retail expansion\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n💡 STRATEGY\n\nStay diversified across sectors and maintain a long-term perspective!`;
  }
  
  // Technical terms
  if (lowerInput.includes('p/e') || lowerInput.includes('ratio')) {
    return `📚 Understanding P/E Ratio\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n📖 DEFINITION\n\nPrice-to-Earnings (P/E) ratio measures how much you pay for each shilling of a company's earnings.\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n🧮 FORMULA\n\nP/E Ratio = Stock Price ÷ EPS\n\nWhere:\nEPS = Earnings Per Share\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n💡 EXAMPLE\n\n📊 Stock Price: KES 50\n💰 EPS: KES 5\n📈 P/E Ratio: 50 ÷ 5 = 10\n\nThis means you're paying 10 shillings for every 1 shilling of earnings.\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n📊 INTERPRETATION\n\n🟢 Low P/E (< 15)\n✓ Potentially undervalued\n✓ May indicate opportunity\n\n🟡 Average P/E (15-25)\n✓ Fair value range\n✓ NSE typical range: 10-15\n\n🔴 High P/E (> 25)\n✓ May be overvalued\n✓ Or high growth expected\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n💡 PRO TIP\n\nAlways compare P/E ratios within the same sector for accurate valuation insights!`;
  }
  
  // Diversification
  if (lowerInput.includes('diversif')) {
    return `🎯 Portfolio Diversification Guide\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n❓ WHY DIVERSIFY?\n\n✅ Reduce overall portfolio risk\n✅ Smooth out return volatility\n✅ Capture opportunities across sectors\n✅ Protect against sector-specific downturns\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n📊 RECOMMENDED MIX\n\n🏦 40% Banking Stocks\n• Stable and dividend-paying\n• Core portfolio holdings\n\n📱 25% Telecommunications\n• Growth and innovation\n• Digital economy plays\n\n🏪 20% Consumer Goods\n• Defensive stocks\n• Essential products\n\n💵 15% Cash/Fixed Income\n• Liquidity buffer\n• Low-risk investments\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n💼 SECTOR EXAMPLES\n\n🏦 BANKING\nKCB, Equity, Co-op, NCBA\n\n📱 TELECOM\nSafaricom\n\n🏪 CONSUMER\nEABL, BAT, Unga Group\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n📅 MAINTENANCE\n\n✓ Review portfolio monthly\n✓ Rebalance quarterly\n✓ Adjust based on goals\n✓ Stay informed on sectors\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n💡 Remember: Don't put all your eggs in one basket!`;
  }
  
  // Comparison questions
  if (lowerInput.includes('compare') || lowerInput.includes('vs')) {
    return `⚖️ Safaricom vs Equity Bank\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n📱 SAFARICOM (SCOM)\n\n💵 Price: ~KES 29.50\n🏢 Sector: Telecommunications\n⭐ Market Cap: Large\n💰 Dividend Yield: ~5-6%\n\n✅ STRENGTHS\n• Market dominance (98% mobile)\n• M-Pesa ecosystem\n• Consistent dividend payer\n• Low volatility\n\n📊 BEST FOR\nStability + Regular income\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n🏦 EQUITY BANK (EQTY)\n\n💵 Price: ~KES 46.50\n🏢 Sector: Banking\n⭐ Market Cap: Large\n💰 Dividend Yield: ~7-8%\n\n✅ STRENGTHS\n• Regional expansion (6 countries)\n• Digital banking innovation\n• Strong growth trajectory\n• Higher dividend yield\n\n📊 BEST FOR\nGrowth + Higher returns\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n🎯 RECOMMENDATION\n\nBoth are excellent blue-chip stocks. Consider holding both for optimal diversification across sectors!\n\n📈 Aggressive: 60% EQTY, 40% SCOM\n⚖️ Balanced: 50% EQTY, 50% SCOM\n🛡️ Conservative: 40% EQTY, 60% SCOM`;
  }
  
  // Banking sector
  if (lowerInput.includes('banking') || lowerInput.includes('bank')) {
    return `🏦 Banking Sector Analysis\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n🏆 TOP BANKS ON NSE\n\n1️⃣ KCB GROUP\n• Market leader\n• Strong fundamentals\n• Regional presence\n\n2️⃣ EQUITY BANK\n• Digital innovation\n• 6-country footprint\n• High growth\n\n3️⃣ CO-OPERATIVE BANK\n• SME focused\n• Stable dividends\n• Large network\n\n4️⃣ NCBA\n• Merger synergies\n• Corporate banking\n• Growing market share\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n📈 SECTOR OUTLOOK\n\n✅ OPPORTUNITIES\n\n💻 Digital banking adoption\n🌍 Regional expansion\n👥 Rising middle class\n📱 Mobile banking growth\n💳 Cashless transactions\n\n⚠️ CHALLENGES\n\n📊 Interest rate volatility\n💰 Competition pressure\n📉 NPL management\n💱 Currency risks\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n💡 INVESTMENT TAKEAWAY\n\nBanking remains a core NSE sector with steady returns and attractive dividends. Consider a mix of banks for diversification!`;
  }
  
  // Default helpful response
  return `👋 How Can I Help You?\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n🎯 I CAN ASSIST WITH\n\n📊 STOCK ANALYSIS\n✓ Individual stock recommendations\n✓ Sector comparisons\n✓ Technical indicators\n✓ Valuation metrics\n\n💰 INVESTMENT STRATEGY\n✓ Portfolio allocation\n✓ Diversification planning\n✓ Risk management\n✓ Investment goals\n\n📚 EDUCATION\n✓ Market terminology\n✓ Trading basics\n✓ Investment strategies\n✓ Financial concepts\n\n🔍 MARKET INSIGHTS\n✓ Sector analysis\n✓ Market trends\n✓ Economic outlook\n✓ Company research\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n💡 TRY ASKING\n\n"Analyze KCB stock"\n"Best dividend stocks"\n"How to diversify?"\n"Explain P/E ratio"\n\n━━━━━━━━━━━━━━━━━━━━━━\n\nWhat specific topic would you like to explore today?`;
};

export default function AIAssistant({ navigation }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      text: "👋 Welcome to Stock Soko AI!\n\n━━━━━━━━━━━━━━━━━━━━━━\n\nI'm your AI-powered investment assistant, ready to help you make smarter trading decisions.\n\n🎯 I CAN HELP YOU WITH\n\n📊 Stock analysis & recommendations\n💰 Portfolio planning & allocation\n📚 Investment education\n🔍 Market insights & trends\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n💡 Try asking me about specific stocks, investment strategies, or market concepts!\n\nWhat would you like to explore today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSuggestionPress = (question: string) => {
    setInput(question);
    setShowSuggestions(false);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: input,
    };

    const userInput = input;
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setShowSuggestions(false);
    setLoading(true);

    try {
      // Call AI chat API
      const response = await api.post('/ai/chat', {
        message: userInput,
        conversation_history: messages.map(m => ({
          role: m.type === 'user' ? 'user' : 'assistant',
          content: m.text
        }))
      });

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: response.data.response || response.data.message || 'I apologize, but I could not generate a response.',
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error: any) {
      console.error('AI chat error:', error);
      
      // Generate intelligent mock response based on user input
      const mockResponse = generateMockAIResponse(userInput);
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: mockResponse,
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}></Text>
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
                    <Text style={styles.chartEmoji}>CHART</Text>
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

        {/* Typing Indicator */}
        {loading && (
          <View style={[styles.messageRow, styles.messageRowAI]}>
            <View style={styles.aiAvatar}>
              <Text style={styles.avatarText}>AI</Text>
            </View>
            <View style={[styles.messageContainer, styles.messageContainerAI]}>
              <Text style={styles.messageLabel}>Stock Soko AI</Text>
              <View style={[styles.messageBubble, styles.messageBubbleAI, styles.typingIndicator]}>
                <Text style={styles.typingText}>Thinking...</Text>
                <ActivityIndicator size="small" color={colors.primary.main} style={{ marginLeft: 8 }} />
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Suggested Questions */}
      {showSuggestions && messages.length <= 1 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Suggested Questions:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsScroll}
          >
            {SUGGESTED_QUESTIONS.map((question, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionChip}
                onPress={() => handleSuggestionPress(question)}
              >
                <Text style={styles.suggestionText}>{question}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      
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
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!input.trim() || loading) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary.contrast} />
            ) : (
              <Text style={styles.sendIcon}>></Text>
            )}
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
  suggestionsContainer: {
    backgroundColor: colors.background.secondary + 'dd',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.main,
  },
  suggestionsTitle: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
    fontWeight: typography.fontWeight.medium,
  },
  suggestionsScroll: {
    paddingRight: spacing.lg,
  },
  suggestionChip: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  suggestionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
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
  sendButtonDisabled: {
    backgroundColor: colors.background.secondary,
    opacity: 0.5,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
});