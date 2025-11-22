import { BACKEND_URL } from './api';

export async function fetchEnvironmentStatus() {
  const res = await fetch(`${BACKEND_URL}/api/v1/environment/status`);
  if (!res.ok) throw new Error('Failed to fetch environment status');
  return res.json();
}

export async function fetchEnvironmentRecommendation() {
  const res = await fetch(`${BACKEND_URL}/api/v1/environment/recommendation`);
  if (!res.ok) throw new Error('Failed to fetch environment recommendation');
  return res.json();
}
