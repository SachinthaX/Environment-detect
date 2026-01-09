import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { pingBackend, predictMushroomType, getBackendUrl } from "../services/api";

function formatPct(x) {
  if (typeof x !== "number") return "-";
  return `${(x * 100).toFixed(1)}%`;
}

export default function MushroomTypeScreen() {
  const [serverOk, setServerOk] = useState(false);
  const [serverMsg, setServerMsg] = useState("");
  const [imageUri, setImageUri] = useState(null);

  const [loadingPing, setLoadingPing] = useState(false);
  const [loadingPredict, setLoadingPredict] = useState(false);

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Disable predict if server not connected
  const canPredict = useMemo(
    () => !!imageUri && !loadingPredict && serverOk,
    [imageUri, loadingPredict, serverOk]
  );

  useEffect(() => {
    doPing();
  }, []);

  const doPing = async () => {
    setLoadingPing(true);
    setError("");

    try {
      const data = await pingBackend();
      setServerOk(true);
      setServerMsg(data?.message || "pong");
    } catch (_e) {
      setServerOk(false);
      setServerMsg("");
      setError("Server not reachable. (Ping failed)");
    } finally {
      setLoadingPing(false);
    }
  };

  const pickFromGallery = async () => {
    setError("");
    setResult(null);

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission required", "Gallery permission is needed.");
      return;
    }

    const selected = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!selected.canceled) {
      setImageUri(selected.assets?.[0]?.uri || null);
    }
  };

  const takePhoto = async () => {
    setError("");
    setResult(null);

    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission required", "Camera permission is needed.");
      return;
    }

    const captured = await ImagePicker.launchCameraAsync({ quality: 1 });

    if (!captured.canceled) {
      setImageUri(captured.assets?.[0]?.uri || null);
    }
  };

  const runPrediction = async () => {
    if (!serverOk) {
      setError("Backend is not connected. Please recheck.");
      return;
    }
    if (!imageUri) {
      setError("Please select an image first.");
      return;
    }

    setLoadingPredict(true);
    setError("");

    try {
      const data = await predictMushroomType(imageUri);
      setResult(data);
    } catch (e) {
      setResult(null);
      setError(e?.message || "Prediction failed");
    } finally {
      setLoadingPredict(false);
    }
  };

  const clearAll = () => {
    setImageUri(null);
    setResult(null);
    setError("");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Mushroom Type Classification</Text>
      <Text style={styles.subTitle}>Oyster • Button • Milky</Text>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Backend Status</Text>
          <Pressable
            style={styles.smallBtn}
            onPress={doPing}
            disabled={loadingPing}
          >
            <Text style={styles.smallBtnText}>
              {loadingPing ? "Checking..." : "Recheck"}
            </Text>
          </Pressable>
        </View>

        <Text style={[styles.status, serverOk ? styles.ok : styles.bad]}>
          {serverOk ? `Connected (${serverMsg})` : "Not Connected"}
        </Text>

        <Text style={styles.hint}>Base URL: {getBackendUrl()}</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Select Image</Text>

        <View style={styles.row}>
          <Pressable style={styles.btn} onPress={pickFromGallery}>
            <Text style={styles.btnText}>Pick from Gallery</Text>
          </Pressable>

          <Pressable style={styles.btn} onPress={takePhoto}>
            <Text style={styles.btnText}>Take Photo</Text>
          </Pressable>
        </View>

        {imageUri ? (
          <View style={{ marginTop: 12 }}>
            <Image source={{ uri: imageUri }} style={styles.image} />
            <Pressable
              style={[styles.btn, { marginTop: 10 }]}
              onPress={clearAll}
            >
              <Text style={styles.btnText}>Clear</Text>
            </Pressable>
          </View>
        ) : (
          <Text style={styles.hint}>No image selected yet.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Prediction</Text>

        <Pressable
          style={[styles.btn, !canPredict && styles.btnDisabled]}
          onPress={runPrediction}
          disabled={!canPredict}
        >
          <Text style={styles.btnText}>
            {loadingPredict ? "Predicting..." : "Predict Mushroom Type"}
          </Text>
        </Pressable>

        {!serverOk ? (
          <Text style={styles.hint}>
            Connect to backend first (press Recheck).
          </Text>
        ) : null}

        {loadingPredict ? (
          <ActivityIndicator style={{ marginTop: 12 }} size="large" />
        ) : null}

        {result ? (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>Result</Text>

            <Text
              style={[
                styles.resultMain,
                result.ok === false ? { color: "red" } : null,
              ]}
            >
              {result.label} ({formatPct(result.confidence)})
            </Text>

            {/* When unknown, show ONLY result + message. No Top Predictions */}
            {result.message ? (
              <Text style={styles.note}>{result.message}</Text>
            ) : null}

            {/* Show Top Predictions ONLY when ok=true */}
            {result.ok === true &&
            Array.isArray(result.top_k) &&
            result.top_k.length > 0 ? (
              <>
                <Text style={styles.resultTitle}>Top Predictions</Text>
                {result.top_k.map((item, idx) => (
                  <Text key={`${item.label}-${idx}`} style={styles.resultLine}>
                    {idx + 1}. {item.label} — {formatPct(item.confidence)}
                  </Text>
                ))}
              </>
            ) : null}
          </View>
        ) : (
          <Text style={styles.hint}>Run prediction to see results.</Text>
        )}
      </View>
    </ScrollView>
  );
}


const PRIMARY_BLUE = "#2563EB";   // Blue (primary)
//const BLUE_DARK = "#1D4ED8";      // Pressed/darker
const LIGHT_BLUE = "#E0ECFF";     // Light background for outlined btn
const BORDER = "#E5E7EB";
const BG = "#F8FAFC";

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
    paddingBottom: 28,
    backgroundColor: BG,
  },

  title: { fontSize: 22, fontWeight: "700", color: "#0F172A" },
  subTitle: { marginTop: -6, fontSize: 14, opacity: 0.75, color: "#334155" },

  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },

  cardTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A" },

  row: { flexDirection: "row", gap: 10 },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // 🔵 Primary blue buttons (Choose Image / Capture Image / Predict)
  btn: {
    flex: 1,
    backgroundColor: PRIMARY_BLUE,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  btnDisabled: { opacity: 0.5 },

  btnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },

  // 🔹 Secondary button (Recheck / Clear style)
  smallBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: PRIMARY_BLUE,
    backgroundColor: LIGHT_BLUE,
  },

  smallBtnText: {
    fontWeight: "700",
    fontSize: 12,
    color: PRIMARY_BLUE,
  },

  image: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
  },

  status: { fontWeight: "700" },
  ok: { color: "#16A34A" },
  bad: { color: "#DC2626" },

  hint: { fontSize: 12, opacity: 0.75, color: "#475569" },
  error: { color: "#DC2626", fontWeight: "700" },

  resultBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    gap: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  resultTitle: { fontWeight: "800", marginTop: 6, color: "#0F172A" },
  resultMain: { fontSize: 18, fontWeight: "900", color: "#0F172A" },
  resultLine: { fontSize: 13, color: "#0F172A" },
  note: { marginTop: 8, fontStyle: "italic", opacity: 0.85, color: "#334155" },
});