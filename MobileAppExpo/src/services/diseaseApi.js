// src/services/diseaseApi.js

import { BACKEND_URL } from './api';

export async function predictDisease(sampleId = 'test-1') {
  // Debug: see exactly what URL is used
  console.log('Disease BACKEND_URL =', BACKEND_URL);

  const response = await fetch(`${BACKEND_URL}/api/v1/disease/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sample_id: sampleId }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.log('Disease API error body:', text);
    throw new Error(`Disease API returned ${response.status}`);
  }

  return response.json();
}
