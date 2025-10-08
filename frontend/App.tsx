import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1117" />
      <View style={styles.content}>
        <Text style={styles.title}>🚀 Stock Soko</Text>
        <Text style={styles.subtitle}>Intelligent Stock Trading Platform</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>✓ Server Running</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#EAECEF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#B7BDC6',
    marginBottom: 32,
    textAlign: 'center',
  },
  badge: {
    backgroundColor: '#1E4620',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2EA043',
  },
  badgeText: {
    color: '#3FB950',
    fontSize: 14,
    fontWeight: '600',
  },
});
