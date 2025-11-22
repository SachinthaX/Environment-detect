import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function PestDetectionScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Pest Detection</Text>
        <Text style={styles.subtitle}>
          This screen will handle image-based pest detection.
        </Text>
        <Text style={styles.body}>
          Later you can add a button here to take a photo or pick an image from
          gallery, send it to your backend model, and show the detection result.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e5e7eb',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 16,
  },
  body: {
    fontSize: 14,
    color: '#d1d5db',
  },
});
