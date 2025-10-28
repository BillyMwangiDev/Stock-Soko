/**
 * KYC Upload Screen
 * Upload ID documents for verification
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { ProfileStackParamList } from '../navigation/types';
import { Button } from '../components';
import { colors, typography, spacing, borderRadius } from '../theme';
import { api } from '../api/client';

type KYCUploadScreenProp = StackNavigationProp<ProfileStackParamList, 'KYCUpload'>;

interface Props {
  navigation: KYCUploadScreenProp;
}

interface Document {
  id: string;
  title: string;
  description: string;
  emoji: string;
  uploaded: boolean;
}

export default function KYCUpload({ navigation }: Props) {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 'national_id',
      title: 'National ID',
      description: 'Upload a clear photo of your National ID card or document.',
      emoji: 'ID',
      uploaded: false,
    },
    {
      id: 'proof_of_residence',
      title: 'Proof of Address',
      description: 'Upload a recent utility bill or bank statement.',
      emoji: 'DOC',
      uploaded: false,
    },
    {
      id: 'signature',
      title: 'Signature',
      description: 'Upload or sign a signature document.',
      emoji: 'PIC',
      uploaded: false,
    },
  ]);

  const [currentStep, setCurrentStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [kycStatus, setKycStatus] = useState<any>(null);
  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    loadKYCStatus();
  }, []);

  const loadKYCStatus = async () => {
    try {
      const response = await api.get('/kyc/status');
      setKycStatus(response.data);
      
      // Mark documents as uploaded based on status
      const uploadedDocs = response.data.documents || {};
      setDocuments(prev => prev.map(doc => ({
        ...doc,
        uploaded: doc.id in uploadedDocs
      })));
      
      // Update progress
      const uploadedCount = Object.keys(uploadedDocs).length;
      setCurrentStep(Math.min(uploadedCount + 1, totalSteps));
    } catch (error) {
      console.error('Failed to load KYC status:', error);
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const handleUpload = async (docId: string) => {
    try {
      setUploading(true);
      
      // Pick document
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.type === 'cancel') {
        setUploading(false);
        return;
      }

      // Validate file size (max 10MB)
      const fileInfo = await FileSystem.getInfoAsync(result.uri);
      if (fileInfo.exists && fileInfo.size && fileInfo.size > 10 * 1024 * 1024) {
        Alert.alert('File Too Large', 'Maximum file size is 10MB');
        setUploading(false);
        return;
      }

      // Create FormData
      const formData = new FormData();
      formData.append('file', {
        uri: result.uri,
        name: result.name,
        type: result.mimeType || 'image/jpeg',
      } as any);
      formData.append('document_type', docId);

      // Upload to backend
      const response = await api.post('/kyc/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status === 'success') {
        // Mark as uploaded
        setDocuments(prev =>
          prev.map(doc => (doc.id === docId ? { ...doc, uploaded: true } : doc))
        );
        
        if (currentStep < totalSteps) {
          setCurrentStep(currentStep + 1);
        }

        Alert.alert(
          'Success',
          `${result.name} uploaded successfully (${response.data.file_size_mb.toFixed(2)} MB)`
        );
        
        // Reload status
        await loadKYCStatus();
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      Alert.alert(
        'Upload Failed',
        error.response?.data?.detail || 'Failed to upload document. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleContinue = async () => {
    const allUploaded = documents.every(doc => doc.uploaded);
    
    if (!allUploaded) {
      Alert.alert('Incomplete', 'Please upload all required documents');
      return;
    }

    Alert.alert(
      'Documents Submitted',
      'Your KYC verification is under review. We will notify you once approved.',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeIcon}></Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify your identity</Text>
        <View style={styles.headerSpacer} />
      </View>

      
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Step {currentStep} of {totalSteps}</Text>
          <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* Document Upload List */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.documentsContainer}>
          {documents.map((doc) => (
            <TouchableOpacity
              key={doc.id}
              style={[
                styles.documentCard,
                doc.uploaded && styles.documentCardUploaded,
              ]}
              onPress={() => handleUpload(doc.id)}
              activeOpacity={0.7}
              disabled={uploading}
            >
              <View style={styles.documentIcon}>
                <Text style={styles.documentEmoji}>{doc.emoji}</Text>
              </View>
              
              <View style={styles.documentInfo}>
                <Text style={styles.documentTitle}>{doc.title}</Text>
                <Text style={styles.documentDescription}>{doc.description}</Text>
                {uploading && (
                  <ActivityIndicator size="small" color={colors.primary.main} style={{ marginTop: 8 }} />
                )}
              </View>

              {doc.uploaded && (
                <View style={styles.uploadedBadge}>
                  <Text style={styles.checkmark}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          variant="primary"
          size="lg"
          fullWidth
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.full,
  },
  closeIcon: {
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
  progressSection: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  progressPercent: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  progressBar: {
    height: 8,
    width: '100%',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.full,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  documentsContainer: {
    gap: spacing.md,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    gap: spacing.md,
  },
  documentCardUploaded: {
    backgroundColor: colors.success + '10',
    borderWidth: 1,
    borderColor: colors.success + '40',
  },
  documentIcon: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentEmoji: {
    fontSize: 24,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  documentDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  uploadedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 20,
    color: colors.primary.contrast,
    fontWeight: typography.fontWeight.bold,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.main + '20',
    backgroundColor: colors.background.primary,
  },
});