import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { ProfileStackParamList } from '../navigation/types';
import { Button, Input, Card } from '../components';
import { colors, typography, spacing } from '../theme';
import { api } from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hapticFeedback } from '../utils/haptics';

type EditProfileScreenProp = StackNavigationProp<ProfileStackParamList, 'EditProfile'>;

interface Props {
  navigation: EditProfileScreenProp;
}

export default function EditProfile({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Kenya');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/me');
      const user = res.data;
      
      setFullName(user.full_name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setDateOfBirth(user.date_of_birth || '');
      setAddress(user.address || '');
      setCity(user.city || '');
      setCountry(user.country || 'Kenya');
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!fullName || !email || !phone) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    if (!phone.startsWith('+254')) {
      Alert.alert('Invalid Phone', 'Phone number must be in Kenya format (+254...)');
      return;
    }

    try {
      setSaving(true);
      
      await api.put('/auth/profile', {
        full_name: fullName,
        phone,
        date_of_birth: dateOfBirth || null,
        address: address || null,
        city: city || null,
        country: country || 'Kenya',
      });

      await AsyncStorage.setItem('userName', fullName);
      
      hapticFeedback.success();
      Alert.alert(
        'Success',
        'Profile updated successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      hapticFeedback.error();
      Alert.alert(
        'Update Failed',
        error?.response?.data?.detail || 'Failed to update profile. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Card variant="glass" style={styles.formCard}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <Input
            label="Full Name *"
            placeholder="Enter your full name"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />

          <Input
            label="Email *"
            placeholder="your.email@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={false}
            style={styles.disabledInput}
          />
          <Text style={styles.helperText}>Email cannot be changed</Text>

          <Input
            label="Phone Number *"
            placeholder="+254712345678"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Input
            label="Date of Birth"
            placeholder="YYYY-MM-DD"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
          />
        </Card>

        <Card variant="glass" style={styles.formCard}>
          <Text style={styles.sectionTitle}>Address</Text>
          
          <Input
            label="Street Address"
            placeholder="Enter your address"
            value={address}
            onChangeText={setAddress}
            autoCapitalize="words"
          />

          <Input
            label="City"
            placeholder="Enter your city"
            value={city}
            onChangeText={setCity}
            autoCapitalize="words"
          />

          <Input
            label="Country"
            placeholder="Kenya"
            value={country}
            onChangeText={setCountry}
            autoCapitalize="words"
          />
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            variant="outline"
            size="lg"
            fullWidth
            style={styles.cancelButton}
          />
          
          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={saving}
            variant="primary"
            size="lg"
            fullWidth
          />
        </View>

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  formCard: {
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  disabledInput: {
    opacity: 0.6,
  },
  helperText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
    fontStyle: 'italic',
  },
  buttonContainer: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  cancelButton: {
    marginBottom: 0,
  },
});