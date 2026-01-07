// src/screens/DiseaseDetectionScreen.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { pingBackend, predictDiseaseFromImage } from '../services/api';

const DiseaseDetectionScreen = () => {
  const [imageUri, setImageUri] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('Checking...');

  const getImagesMediaType = () => {
    if (ImagePicker.MediaType) {
      return ImagePicker.MediaType.Images;
    }
    return ImagePicker.MediaTypeOptions.Images;
  };

  useEffect(() => {
    (async () => {
      try {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission needed',
            'We need access to your gallery to pick mushroom images.'
          );
        }
      } catch (e) {
        console.log('Permission error (gallery):', e);
      }
    })();

    (async () => {
      const res = await pingBackend();
      if (res) {
        setBackendStatus('Online');
      } else {
        setBackendStatus('Offline');
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      setPrediction(null);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: getImagesMediaType(),
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (e) {
      console.log('pickImage error:', e);
      Alert.alert(
        'Error',
        e.message || 'Failed to open image picker (gallery).'
      );
    }
  };

  const takePhoto = async () => {
    try {
      setPrediction(null);

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'We need access to your camera to capture mushroom images.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: getImagesMediaType(),
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (e) {
      console.log('takePhoto error:', e);
      Alert.alert('Error', e.message || 'Failed to open camera.');
    }
  };

  const handlePredict = async () => {
    if (!imageUri) {
      Alert.alert('No image', 'Please choose or capture a mushroom image first.');
      return;
    }

    try {
      setLoading(true);
      setPrediction(null);
      const data = await predictDiseaseFromImage(imageUri);
      setPrediction(data);
    } catch (error) {
      console.log('predictDisease error:', error);
      Alert.alert('Error', error.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setImageUri(null);
    setPrediction(null);
    setLoading(false);
  };

  const statusColor =
    backendStatus === 'Online' ? styles.statusOnline : styles.statusOffline;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Mushroom Disease Detection</Text>

        <Text style={styles.statusText}>
          Backend status: <Text style={statusColor}>{backendStatus}</Text>
        </Text>

        <View style={styles.imageBox}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <Text style={styles.placeholder}>No image selected</Text>
          )}
        </View>

        {/* Section 1: Select Image */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>Select Image</Text>
          <Text style={styles.sectionSubtitle}>
            Choose an existing photo or capture a new image.
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.secondaryButton} onPress={pickImage}>
              <Text style={styles.buttonText}>Choose Image</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={takePhoto}>
              <Text style={styles.buttonText}>Capture Image</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 2: Disease Prediction */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>Disease Prediction</Text>
          <Text style={styles.sectionSubtitle}>
            Click predict to analyze the mushroom disease.
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handlePredict}
            >
              <Text style={styles.buttonText}>Predict Disease</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading && <ActivityIndicator style={{ marginTop: 16 }} />}

        {prediction &&
          (prediction.label === 'invalid_image' ? (
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Result</Text>
              <Text style={styles.resultText}>Invalid image</Text>
              <Text style={styles.resultHint}>
                Please capture or choose a clear image of a mushroom cultivation
                bag showing healthy mycelium or disease.
              </Text>
            </View>
          ) : (
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Prediction</Text>
              <Text style={styles.resultText}>{prediction.label}</Text>
              <Text style={styles.resultConf}>
                Confidence: {(prediction.confidence * 100).toFixed(1)}%
              </Text>
            </View>
          ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#e5e7eb',
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 16,
    backgroundColor: '#ffffff',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  statusText: {
    marginBottom: 12,
    fontSize: 14,
  },
  statusOnline: {
    color: '#16a34a',
    fontWeight: '600',
  },
  statusOffline: {
    color: '#dc2626',
    fontWeight: '600',
  },
  imageBox: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: '#f9fafb',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    color: '#9ca3af',
  },
  sectionBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.6)', // very light, feels transparent
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  primaryButton: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButton: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  clearButton: {
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  clearButtonText: {
    color: '#4b5563',
    fontWeight: '600',
    fontSize: 14,
  },
  resultBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  resultLabel: {
    fontWeight: '600',
    marginBottom: 4,
    fontSize: 14,
  },
  resultText: {
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  resultConf: {
    marginTop: 4,
    fontSize: 14,
  },
  resultHint: {
    marginTop: 4,
    fontSize: 13,
    color: '#6b7280',
  },
});

export default DiseaseDetectionScreen;
