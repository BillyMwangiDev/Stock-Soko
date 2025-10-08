/**
 * KYC Upload Screen
 * Upload ID documents for verification
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '../components';
import { colors, typography, spacing } from '../theme';

export default function KYCUpload() {
  const [idFront, setIdFront] = useState<string | null>(null);
  const [idBack, setIdBack] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [addressProof, setAddressProof] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = (type: 'idFront' | 'idBack' | 'selfie' | 'addressProof') => {
    // In production, use expo-image-picker
    Alert.alert('Pick Image', `Select ${type} image (Image picker integration required)`);
    
    // Mock image selection
    const mockImageUri = 'https://via.placeholder.com/300';
    switch (type) {
      case 'idFront':
        setIdFront(mockImageUri);
        break;
      case 'idBack':
        setIdBack(mockImageUri);
        break;
      case 'selfie':
        setSelfie(mockImageUri);
        break;
      case 'addressProof':
        setAddressProof(mockImageUri);
        break;
    }
  };

  const handleSubmit = async () => {
    if (!idFront || !idBack || !selfie) {
      Alert.alert('Error', 'Please upload all required documents');
      return;
    }

    try {
      setLoading(true);
      
      // In production, upload to S3 and call KYC API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Success',
        'Documents uploaded successfully! Your KYC application is under review.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to upload documents');
    } finally {
      setLoading(false);
    }
  };

  const renderUploadSection = (
    title: string,
    description: string,
    imageUri: string | null,
    onPress: () => void,
    required: boolean = true
  ) => (
    <Card>
      <View style={styles.uploadHeader}>
        <View style={styles.uploadTitleContainer}>
          <Text style={styles.uploadTitle}>{title}</Text>
          {required && <Text style={styles.requiredBadge}>Required</Text>}
        </View>
        <Text style={styles.uploadDescription}>{description}</Text>
      </View>

      <TouchableOpacity 
        style={styles.uploadBox}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {imageUri ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.uploadedImage} />
            <View style={styles.imageOverlay}>
              <Ionicons name="checkmark-circle" size={40} color={colors.success} />
            </View>
          </View>
        ) : (
          <View style={styles.uploadPlaceholder}>
            <Ionicons name="cloud-upload-outline" size={48} color={colors.text.tertiary} />
            <Text style={styles.uploadText}>Tap to upload</Text>
            <Text style={styles.uploadSubtext}>JPG, PNG • Max 10MB</Text>
          </View>
        )}
      </TouchableOpacity>
    </Card>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card variant="elevated">
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={24} color={colors.info} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>KYC Verification Required</Text>
              <Text style={styles.infoText}>
                To comply with regulations, we need to verify your identity before you can start trading.
              </Text>
            </View>
          </View>
        </Card>

        {renderUploadSection(
          'National ID - Front',
          'Upload the front side of your national ID or passport',
          idFront,
          () => pickImage('idFront')
        )}

        {renderUploadSection(
          'National ID - Back',
          'Upload the back side of your national ID',
          idBack,
          () => pickImage('idBack')
        )}

        {renderUploadSection(
          'Selfie Photo',
          'Take a clear photo of yourself holding your ID',
          selfie,
          () => pickImage('selfie')
        )}

        {renderUploadSection(
          'Proof of Address',
          'Recent utility bill or bank statement (Optional)',
          addressProof,
          () => pickImage('addressProof'),
          false
        )}

        <View style={styles.termsContainer}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.text.tertiary} />
          <Text style={styles.termsText}>
            Your documents are encrypted and stored securely. We'll only use them for verification purposes.
          </Text>
        </View>

        <Button
          title="Submit for Verification"
          onPress={handleSubmit}
          loading={loading}
          variant="primary"
          size="lg"
          disabled={!idFront || !idBack || !selfie}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  infoBox: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.info,
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  uploadHeader: {
    marginBottom: spacing.md,
  },
  uploadTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  uploadTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  requiredBadge: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    backgroundColor: colors.error + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  uploadDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  uploadBox: {
    borderRadius: spacing.sm,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border.main,
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  uploadText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  uploadSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  imageContainer: {
    position: 'relative',
  },
  uploadedImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  termsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: spacing.sm,
  },
  termsText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    lineHeight: 20,
  },
});

