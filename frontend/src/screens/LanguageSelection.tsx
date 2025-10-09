import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { ProfileStackParamList } from '../navigation/types';
import { Card } from '../components';
import { colors, typography, spacing } from '../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hapticFeedback } from '../utils/haptics';

type LanguageSelectionScreenProp = StackNavigationProp<ProfileStackParamList, 'LanguageSelection'>;

interface Props {
  navigation: LanguageSelectionScreenProp;
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isAvailable: boolean;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: 'GB', isAvailable: true },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: 'KE', isAvailable: true },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: 'FR', isAvailable: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: 'SA', isAvailable: false },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: 'PT', isAvailable: false },
];

export default function LanguageSelection({ navigation }: Props) {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    loadCurrentLanguage();
  }, []);

  const loadCurrentLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem('app_language');
      if (saved) {
        setSelectedLanguage(saved);
      }
    } catch (error) {
      console.error('Failed to load language preference:', error);
    }
  };

  const handleSelectLanguage = async (languageCode: string, isAvailable: boolean) => {
    if (!isAvailable) {
      Alert.alert(
        'Coming Soon',
        'This language is not yet available. We are working on adding more languages soon!',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setLoading(true);
      setSelectedLanguage(languageCode);
      
      await AsyncStorage.setItem('app_language', languageCode);
      
      hapticFeedback.success();
      Alert.alert(
        'Language Changed',
        `Language has been changed to ${LANGUAGES.find(l => l.code === languageCode)?.name}. The app will reload to apply changes.`,
        [
          {
            text: 'OK',
            onPress: () => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              } else {
                navigation.goBack();
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Failed to save language preference:', error);
      Alert.alert('Error', 'Failed to change language. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Language</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Card variant="glass" style={styles.infoCard}>
          <Ionicons name="language-outline" size={32} color={colors.primary.main} />
          <Text style={styles.infoTitle}>Select Your Language</Text>
          <Text style={styles.infoDescription}>
            Choose your preferred language for the Stock Soko app interface.
          </Text>
        </Card>

        <View style={styles.languagesList}>
          {LANGUAGES.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageItem,
                selectedLanguage === language.code && styles.languageItemSelected,
                !language.isAvailable && styles.languageItemDisabled,
              ]}
              onPress={() => handleSelectLanguage(language.code, language.isAvailable)}
              disabled={loading}
              activeOpacity={0.7}
            >
              <View style={styles.flagContainer}>
                <Text style={styles.flagText}>{language.flag}</Text>
              </View>
              
              <View style={styles.languageInfo}>
                <Text style={[
                  styles.languageName,
                  !language.isAvailable && styles.languageNameDisabled
                ]}>
                  {language.name}
                </Text>
                <Text style={styles.languageNativeName}>{language.nativeName}</Text>
              </View>

              {language.isAvailable ? (
                selectedLanguage === language.code ? (
                  <View style={styles.selectedIndicator}>
                    <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                  </View>
                ) : (
                  <View style={styles.unselectedIndicator}>
                    <Ionicons name="ellipse-outline" size={24} color={colors.text.disabled} />
                  </View>
                )
              ) : (
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Soon</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Card variant="outline" style={styles.noteCard}>
          <Ionicons name="information-circle-outline" size={20} color={colors.info} />
          <Text style={styles.noteText}>
            Currently available: English and Swahili. More languages coming soon!
          </Text>
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  infoCard: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  infoTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  infoDescription: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  languagesList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: spacing.md,
  },
  languageItemSelected: {
    borderColor: colors.success,
    backgroundColor: colors.success + '10',
  },
  languageItemDisabled: {
    opacity: 0.5,
  },
  flagContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.main + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  languageNameDisabled: {
    color: colors.text.disabled,
  },
  languageNativeName: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
  },
  unselectedIndicator: {
    width: 24,
    height: 24,
  },
  comingSoonBadge: {
    backgroundColor: colors.warning + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  comingSoonText: {
    fontSize: typography.fontSize.xs,
    color: colors.warning,
    fontWeight: typography.fontWeight.bold,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
  },
  noteText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});