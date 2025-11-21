import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

// PC IP address + backend port
// Change this IP to your machine's IPv4 from ipconfig
const BACKEND_URL = 'http://192.168.1.3:8000';

export default function App() {
  const [pingMessage, setPingMessage] = useState('');
  const [predictResult, setPredictResult] = useState(null);
  const [loadingPing, setLoadingPing] = useState(false);
  const [loadingPredict, setLoadingPredict] = useState(false);
  const [error, setError] = useState('');

  const callPing = async () => {
    try {
      setLoadingPing(true);
      setError('');
      setPingMessage('');

      const response = await fetch(`${BACKEND_URL}/ping`);
      if (!response.ok) {
        throw new Error('Bad response from server');
      }

      const data = await response.json();
      setPingMessage(data.message || 'No message');
    } catch (err) {
      console.log('Ping error:', err);
      setError('Could not reach backend /ping');
    } finally {
      setLoadingPing(false);
    }
  };

  const callPredict = async () => {
    try {
      setLoadingPredict(true);
      setError('');
      setPredictResult(null);

      const response = await fetch(`${BACKEND_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: 5 }), // test value
      });

      if (!response.ok) {
        throw new Error('Bad response from server');
      }

      const data = await response.json();
      setPredictResult(data);
    } catch (err) {
      console.log('Predict error:', err);
      setError('Could not reach backend /predict');
    } finally {
      setLoadingPredict(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Mushroom Project</Text>
        <Text style={styles.subtitle}>
          Expo + FastAPI (test connection)
        </Text>

        <TouchableOpacity
          style={[styles.button, loadingPing && styles.buttonDisabled]}
          onPress={callPing}
          disabled={loadingPing}
        >
          {loadingPing ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.buttonText}>Test /ping</Text>
          )}
        </TouchableOpacity>

        {pingMessage ? (
          <Text style={styles.responseText}>Ping: {pingMessage}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.button, loadingPredict && styles.buttonDisabled]}
          onPress={callPredict}
          disabled={loadingPredict}
        >
          {loadingPredict ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.buttonText}>Test /predict</Text>
          )}
        </TouchableOpacity>

        {predictResult && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Predict Result</Text>
            <Text style={styles.cardText}>Input: {predictResult.input}</Text>
            <Text style={styles.cardText}>
              Prediction: {predictResult.prediction}
            </Text>
            {predictResult.note && (
              <Text style={styles.cardNote}>{predictResult.note}</Text>
            )}
          </View>
        )}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#e5e7eb',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  responseText: {
    color: '#a5b4fc',
    marginBottom: 16,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  cardTitle: {
    color: '#e5e7eb',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardText: {
    color: '#d1d5db',
    fontSize: 14,
  },
  cardNote: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 6,
  },
  errorText: {
    color: '#f97373',
    marginTop: 16,
  },
});
