// src/services/api.js
import { Platform } from "react-native";

/**
 * Web runs on your PC browser, so it should call backend via localhost.
 * Mobile (Expo Go) must call backend via your PC LAN IP.
 */
export const BACKEND_URL =
  Platform.OS === "web"
    ? "http://127.0.0.1:8000"
    : "http://192.168.1.47:8000";

export function getBackendUrl() {
  return BACKEND_URL;
}

export function buildUrl(path) {
  // ensures path starts with /
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
 * POST /predict (your existing dummy endpoint)
 * This keeps your current screens working if they still use /predict
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
 * POST /type/predict (Mushroom Type Classification)
 * Upload image using multipart/form-data
 */
export async function predictMushroomType(imageUri) {
  const url = buildUrl("/type/predict");

  // WEB: need real File/Blob
  if (Platform.OS === "web") {
    // imageUri will be a blob URL in web (like blob:http://localhost:8081/...)
    const imgRes = await fetch(imageUri);
    const blob = await imgRes.blob();

    const formData = new FormData();
    formData.append("file", blob, "mushroom.jpg");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const msg = data?.detail || `Bad response from /type/predict (${response.status})`;
      throw new Error(msg);
    }
    return data;
  }

  // MOBILE (Expo Go / Android / iOS): uri object works
  const formData = new FormData();
  formData.append("file", {
    uri: imageUri,
    name: "mushroom.jpg",
    type: "image/jpeg",
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: formData,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const msg = data?.detail || `Bad response from /type/predict (${response.status})`;
    throw new Error(msg);
  }

  return data;
}
