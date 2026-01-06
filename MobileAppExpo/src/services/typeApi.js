import { API_BASE_URL } from "./api";

export async function pingServer() {
  const res = await fetch(`${API_BASE_URL}/ping`);
  if (!res.ok) throw new Error("Ping failed");
  return res.json();
}

export async function predictMushroomType(imageUri) {
  const formData = new FormData();

  // Expo needs this exact structure for file uploads
  formData.append("file", {
    uri: imageUri,
    name: "mushroom.jpg",
    type: "image/jpeg",
  });

  const res = await fetch(`${API_BASE_URL}/type/predict`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      // IMPORTANT: do NOT set Content-Type manually for FormData in React Native
    },
    body: formData,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    // FastAPI errors often return { detail: "..."}
    const msg = data?.detail || "Prediction request failed";
    throw new Error(msg);
  }

  return data;
}
