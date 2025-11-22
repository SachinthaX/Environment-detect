// src/services/api.js

// Change this IP if your PC IP changes
export const BACKEND_URL = 'http://192.168.8.137:8000';

export async function pingBackend() {
  const response = await fetch(`${BACKEND_URL}/ping`);
  if (!response.ok) {
    throw new Error('Bad response from /ping');
  }
  return response.json();
}

export async function predictDummy(value) {
  const response = await fetch(`${BACKEND_URL}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ value }),
  });

  if (!response.ok) {
    throw new Error('Bad response from /predict');
  }
  return response.json();
}
