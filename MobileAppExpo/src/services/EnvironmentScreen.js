import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { fetchEnvironmentStatus, fetchEnvironmentRecommendation } from '../services/environmentApi';

export default function EnvironmentScreen() {
  const [status, setStatus] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [statusData, recData] = await Promise.all([
          fetchEnvironmentStatus(),
          fetchEnvironmentRecommendation(),
        ]);
        setStatus(statusData);
        setRecommendation(recData);
      } catch (err) {
        console.log('Environment error:', err);
        setError('Failed to load environment data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Environment</Text>

        {loading && <ActivityIndicator />}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {status && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Current Readings</Text>
            <Text style={styles.text}>Temperature: {status.temperature} °C</Text>
            <Text style={styles.text}>Humidity: {status.humidity} %</Text>
            <Text style={styles.text}>CO₂: {status.co2} ppm</Text>
            <Text style={styles.text}>Ammonia: {status.ammonia} ppm</Text>
            {status.note && <Text style={styles.note}>{status.note}</Text>}
          </View>
        )}

        {recommendation && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Recommendation</Text>
            <Text style={styles.text}>{recommendation.status}</Text>
            <Text style={styles.text}>{recommendation.recommendation}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  container: { flex: 1, paddingHorizontal: 24, paddingVertical: 32 },
  title: { fontSize: 24, fontWeight: '700', color: '#e5e7eb', marginBottom: 16 },
  card: { backgroundColor: '#111827', borderRadius: 16, padding: 16, marginTop: 12 },
  cardTitle: { color: '#e5e7eb', fontSize: 16, fontWeight: '600', marginBottom: 8 },
  text: { color: '#d1d5db', fontSize: 14 },
  note: { color: '#9ca3af', fontSize: 12, marginTop: 4 },
  error: { color: '#f97373', marginTop: 16 },
});
