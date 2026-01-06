// src/services/api.js
import { Platform } from "react-native";

/**
 * Web runs on your PC browser, so it should call backend via localhost.
 * Mobile (Expo Go) must call backend via your PC LAN IP.
 *
 * Change MOBILE_LAN_IP if your PC IP changes.
 */
const MOBILE_LAN_IP = "192.168.1.47";

export const BACKEND_URL =
  Platform.OS === "web"
    ? "http://127.0.0.1:8000"
    : `http://${MOBILE_LAN_IP}:8000`;

export function getBackendUrl() {
  return BACKEND_URL;
}

export function buildUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${BACKEND_URL}${p}`;
}

/**
 * GET /ping
 */
export async function pingBackend() {
  const response = await fetch(buildUrl("/ping"));
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Bad response from /ping (${response.status}) ${text}`);
  }
  return response.json();
}

/**
 * OPTIONAL: POST /predict (dummy endpoint)
 * Keep this only if some screen still calls /predict.
 */
export async function predictDummy(value) {
  const response = await fetch(buildUrl("/predict"), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ value }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Bad response from /predict (${response.status}) ${text}`);
  }

  return response.json();
}

/**
 * POST /api/v1/disease/predict
 * Send an image file to the backend and get disease prediction
 */
export async function predictDiseaseFromImage(imageUri) {
  const formData = new FormData();

  formData.append("file", {
    uri: imageUri,
    name: "mushroom.jpg",
    type: "image/jpeg",
  });

  const response = await fetch(`${BACKEND_URL}/api/v1/disease/predict`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      // Do NOT set 'Content-Type' here; RN will set correct multipart boundary
    },
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Backend error (${response.status}): ${text}`);
  }

  return response.json(); // { label, confidence }
}

/**
 * POST /type/predict (Mushroom Type Classification)
 * Upload image using multipart/form-data
 */
export async function predictMushroomType(imageUri) {
  const url = buildUrl("/type/predict");

  // WEB: need real File/Blob
  if (Platform.OS === "web") {
    const imgRes = await fetch(imageUri);
    const blob = await imgRes.blob();

    const formData = new FormData();
    formData.append("file", blob, "mushroom.jpg");

    const response = await fetch(url, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData,
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const msg =
        data?.detail || `Bad response from /type/predict (${response.status})`;
      throw new Error(msg);
    }
    return data;
  }

  // MOBILE (Expo Go / Android / iOS)
  const formData = new FormData();
  formData.append("file", {
    uri: imageUri,
    name: "mushroom.jpg",
    type: "image/jpeg",
  });

  const response = await fetch(url, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: formData,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const msg =
      data?.detail || `Bad response from /type/predict (${response.status})`;
    throw new Error(msg);
  }

  return data;
}
