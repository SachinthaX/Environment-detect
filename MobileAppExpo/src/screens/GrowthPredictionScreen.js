import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function GrowthPredictionScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Growth Prediction</Text>
        <Text style={styles.subtitle}>
          This screen will predict growth stage and yield for the mushrooms.
        </Text>
        <Text style={styles.body}>
          Later you can connect this to your growth prediction model and show
          charts or timelines of expected growth stages.
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
