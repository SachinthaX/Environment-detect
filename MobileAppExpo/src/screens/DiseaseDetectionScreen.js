// src/screens/DiseaseDetectionScreen.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { pingBackend, predictDiseaseFromImage } from '../services/api';

const DiseaseDetectionScreen = () => {
  const [imageUri, setImageUri] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('Checking...');

  // Helper to support both old (MediaTypeOptions) and new (MediaType) APIs
  const getImagesMediaType = () => {
    if (ImagePicker.MediaType) {
      // new API
      return ImagePicker.MediaType.Images;
    }
    // fallback for older versions
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

  // Pick from gallery
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

  // Capture with camera
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
      Alert.alert(
        'Error',
        e.message || 'Failed to open camera.'
      );
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Mushroom Disease Detection</Text>

      <Text style={styles.status}>
        Backend status: {backendStatus}
      </Text>

      <View style={styles.imageBox}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Text style={styles.placeholder}>No image selected</Text>
        )}
      </View>

      <View style={styles.buttonsRow}>
        <View style={styles.buttonWrapper}>
          <Button title="Choose Image" onPress={pickImage} />
        </View>
        <View style={styles.buttonWrapper}>
          <Button title="Capture Image" onPress={takePhoto} />
        </View>
      </View>

      <View style={styles.buttonSingleWrapper}>
        <Button title="Predict Disease" onPress={handlePredict} />
      </View>

      {loading && (
        <ActivityIndicator style={{ marginTop: 20 }} />
      )}

    {prediction && (
  prediction.label === 'invalid_image' ? (
    <View style={styles.resultBox}>
      <Text style={styles.resultLabel}>Result</Text>
      <Text style={styles.resultText}>Invalid image</Text>
      <Text style={styles.resultConf}>
        Please capture or choose a clear image of a mushroom cultivation bag
        showing healthy mycelium or disease.
      </Text>
    </View>
  ) : (
    <View style={styles.resultBox}>
      <Text style={styles.resultLabel}>Prediction</Text>
      <Text style={styles.resultText}>
        {prediction.label}
      </Text>
      <Text style={styles.resultConf}>
        Confidence: {(prediction.confidence * 100).toFixed(1)}%
      </Text>
    </View>
  )
)}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  status: {
    marginBottom: 16,
  },
  imageBox: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    color: '#777',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  buttonSingleWrapper: {
    marginVertical: 8,
  },
  resultBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f2f2f2',
  },
  resultLabel: {
    fontWeight: '600',
    marginBottom: 4,
  },
  resultText: {
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  resultConf: {
    marginTop: 4,
  },
});

export default DiseaseDetectionScreen;
