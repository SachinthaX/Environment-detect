// src/services/api.js

// Change this IP if your PC IP changes
export const BACKEND_URL = 'http://192.168.8.117:8000';

export async function pingBackend() {
  const response = await fetch(`${BACKEND_URL}/ping`);
  if (!response.ok) {
    throw new Error('Bad response from /ping');
  }
  return response.json();
}

// Send an image file to the backend and get disease prediction
export async function predictDiseaseFromImage(imageUri) {
  const formData = new FormData();

  // React Native / Expo file object
  formData.append('file', {
    uri: imageUri,
    name: 'mushroom.jpg',        // name can be anything
    type: 'image/jpeg',          // or 'image/png' if you know it
  });

  const response = await fetch(`${BACKEND_URL}/api/v1/disease/predict`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      // Do NOT set 'Content-Type' here; RN will set correct multipart boundary
    },
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Backend error (${response.status}): ${text}`);
  }

  return response.json(); // { label, confidence }
}

