/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * Provides graceful error handling and recovery options
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { colors, spacing, typography } from '../theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
  enableRetry?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log error with more context
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      retryCount: this.retryCount,
    };

    console.error('[ERROR] ErrorBoundary caught error:', errorDetails);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to send this to an error reporting service
    if (!__DEV__) {
      // Example: Sentry.captureException(error, { extra: errorDetails });
    }
  }

  handleReset = () => {
    this.retryCount++;

    if (this.retryCount >= this.maxRetries) {
      // After max retries, show a different message
      Alert.alert(
        'Unable to recover',
        'The app encountered repeated errors. Please restart the app or contact support.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  handleReportError = () => {
    const { error, errorId } = this.state;

    Alert.alert(
      'Report Error',
      'Would you like to report this error to help us improve the app?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            // In a real app, you would send the error report here
            Alert.alert('Thank you!', 'Error report sent. We appreciate your help!');
          }
        }
      ]
    );
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorId } = this.state;
      const showDetails = __DEV__ && this.props.showErrorDetails !== false;
      const enableRetry = this.props.enableRetry !== false;

      return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.errorIcon}>!</Text>
          </View>

          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            We're experiencing technical difficulties. Please try again or restart the app.
          </Text>

          {errorId && (
            <Text style={styles.errorId}>Error ID: {errorId}</Text>
          )}

          {showDetails && error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>Error Details (Development)</Text>
              <Text style={styles.errorText}>{error.message}</Text>
              {error.stack && (
                <Text style={styles.stackText}>{error.stack}</Text>
              )}
            </View>
          )}

          <View style={styles.buttonContainer}>
            {enableRetry && this.retryCount < this.maxRetries && (
              <TouchableOpacity
                style={styles.button}
                onPress={this.handleReset}
              >
                <Text style={styles.buttonText}>
                  {this.retryCount > 0 ? `Try Again (${this.retryCount}/${this.maxRetries})` : 'Try Again'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={this.handleReportError}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                Report Error
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  errorIcon: {
    fontSize: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
    maxWidth: 300,
  },
  errorId: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
    fontFamily: 'monospace',
  },
  errorBox: {
    backgroundColor: colors.background.surface,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.main,
    marginBottom: spacing.lg,
    width: '100%',
    maxWidth: 350,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: 12,
    color: colors.status.error,
    fontFamily: 'monospace',
    marginBottom: spacing.sm,
  },
  stackText: {
    fontSize: 10,
    color: colors.text.tertiary,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    gap: spacing.md,
  },
  button: {
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.primary.contrast,
    fontSize: 16,
    fontWeight: typography.fontWeight.semibold,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  secondaryButtonText: {
    color: colors.text.primary,
  },
});

