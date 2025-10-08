/**
 * Risk Profile Assessment Screen
 * Questionnaire to determine user investment risk tolerance
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/types';
import { Button } from '../components';
import { colors, typography, spacing, borderRadius } from '../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RiskProfileScreenProp = StackNavigationProp<AuthStackParamList, 'RiskProfile'>;

interface Props {
  navigation: RiskProfileScreenProp;
}

interface Question {
  id: string;
  question: string;
  emoji: string;
  options: { label: string; score: number }[];
}

const questions: Question[] = [
  {
    id: 'q1',
    question: "What's your investment goal?",
    emoji: '',
    options: [
      { label: 'Short-term (less than 1 year)', score: 1 },
      { label: 'Medium-term (1-5 years)', score: 2 },
      { label: 'Long-term (more than 5 years)', score: 3 },
    ],
  },
  {
    id: 'q2',
    question: "What's your investment experience?",
    emoji: '',
    options: [
      { label: 'Beginner - New to investing', score: 1 },
      { label: 'Intermediate - Some experience', score: 2 },
      { label: 'Advanced - Active trader', score: 3 },
    ],
  },
  {
    id: 'q3',
    question: 'How would you react to a 20% portfolio drop?',
    emoji: '',
    options: [
      { label: 'Sell immediately to prevent losses', score: 1 },
      { label: 'Hold and wait for recovery', score: 2 },
      { label: 'Buy more at the lower price', score: 3 },
    ],
  },
  {
    id: 'q4',
    question: 'What percentage of savings will you invest?',
    emoji: '',
    options: [
      { label: 'Less than 10%', score: 1 },
      { label: '10-30%', score: 2 },
      { label: 'More than 30%', score: 3 },
    ],
  },
  {
    id: 'q5',
    question: 'What return do you expect annually?',
    emoji: '',
    options: [
      { label: 'Conservative (5-10%)', score: 1 },
      { label: 'Moderate (10-20%)', score: 2 },
      { label: 'Aggressive (20%+)', score: 3 },
    ],
  },
];

export default function RiskProfile({ navigation }: Props) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const handleAnswer = (questionId: string, score: number) => {
    const newAnswers = { ...answers, [questionId]: score };
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (!answers[question.id]) {
      Alert.alert('Select an Answer', 'Please choose an option before continuing');
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleComplete();
    }
  };

  const calculateRiskProfile = (): string => {
    const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
    const avgScore = totalScore / questions.length;

    if (avgScore <= 1.5) return 'conservative';
    if (avgScore <= 2.5) return 'moderate';
    return 'aggressive';
  };

  const handleComplete = async () => {
    const riskProfile = calculateRiskProfile();
    await AsyncStorage.setItem('riskProfile', riskProfile);

    Alert.alert(
      'Assessment Complete',
      `Your risk profile: ${riskProfile.toUpperCase()}\n\nWe'll personalize your investment recommendations.`,
      [
        {
          text: 'Continue',
          onPress: () => navigation.navigate('ChooseBroker' as any),
        },
      ]
    );
  };

  const handleSkip = () => {
    navigation.navigate('ChooseBroker' as any);
  };

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <View style={styles.container}>
      {/* Header with Skip/Close */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContent}>
          {/* Progress Indicator */}
          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>
              Question {currentQuestion + 1}/{questions.length}
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>

          {/* Question Title */}
          <Text style={styles.questionTitle}>
            {question.question}
          </Text>

          {/* Answer Options */}
          <View style={styles.optionsContainer}>
            {question.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionCard,
                  answers[question.id] === option.score && styles.optionCardSelected,
                ]}
                onPress={() => handleAnswer(question.id, option.score)}
                activeOpacity={0.7}
              >
                <Text style={styles.optionText}>{option.label}</Text>
                <View style={[
                  styles.radio,
                  answers[question.id] === option.score && styles.radioSelected
                ]}>
                  {answers[question.id] === option.score && (
                    <View style={styles.radioDot} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Footer with Next Button */}
      <View style={styles.footer}>
        <Button
          title={currentQuestion === questions.length - 1 ? "Complete" : "Next"}
          onPress={handleNext}
          variant="primary"
          size="lg"
          fullWidth
          disabled={!answers[question.id]}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerSpacer: {
    width: 40,
  },
  skipButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipText: {
    fontSize: 24,
    color: colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  mainContent: {
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  progressSection: {
    marginBottom: spacing['2xl'],
  },
  progressLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.full,
  },
  questionTitle: {
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
    lineHeight: 36,
  },
  optionsContainer: {
    gap: spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.main,
    backgroundColor: colors.background.card,
  },
  optionCardSelected: {
    borderColor: colors.primary.main,
    borderWidth: 2,
    backgroundColor: colors.primary.main + '08',
  },
  optionText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginLeft: spacing.md,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border.main,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  radioSelected: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.contrast,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.main,
    backgroundColor: colors.background.primary,
  },
});

