// src/screens/DiseaseDetectionScreen.js

import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { predictDisease } from '../services/diseaseApi';

export default function DiseaseDetectionScreen() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        setResult(null);

        const data = await predictDisease('sample-1');
        console.log('Disease result:', data);
        setResult(data);
      } catch (err) {
        console.log('Disease error:', err);
        setError('Failed to load disease prediction');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Disease Detection</Text>

        {loading && <ActivityIndicator />}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {result && (
          <View style={styles.card}>
            <Text style={styles.cardText}>
              Disease: {result.disease_name}
            </Text>
            <Text style={styles.cardText}>
              Confidence: {result.confidence}
            </Text>
            <Text style={styles.cardText}>
              Severity: {result.severity}
            </Text>
            <Text style={styles.cardText}>
              Treatment: {result.treatment}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  container: { flex: 1, paddingHorizontal: 24, paddingVertical: 32 },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e5e7eb',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  cardText: {
    color: '#d1d5db',
    fontSize: 14,
    marginBottom: 4,
  },
  error: { color: '#f97373', marginTop: 16 },
});
