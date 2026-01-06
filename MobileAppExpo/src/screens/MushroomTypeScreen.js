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

  const canPredict = useMemo(
    () => !!imageUri && !loadingPredict,
    [imageUri, loadingPredict]
  );

  useEffect(() => {
    doPing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doPing = async () => {
    setLoadingPing(true);
    setError("");

    try {
      const data = await pingBackend(); // FIXED: was pingServer()
      setServerOk(true);
      setServerMsg(data?.message || "pong");
    } catch (e) {
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
      setError(e.message || "Prediction failed");
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

            <Text style={styles.resultTitle}>Top Predictions</Text>
            {(result.top_k || []).map((item, idx) => (
              <Text key={`${item.label}-${idx}`} style={styles.resultLine}>
                {idx + 1}. {item.label} — {formatPct(item.confidence)}
              </Text>
            ))}

            {result.message ? (
              <Text style={styles.note}>{result.message}</Text>
            ) : null}
          </View>
        ) : (
          <Text style={styles.hint}>Run prediction to see results.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, paddingBottom: 28 },
  title: { fontSize: 22, fontWeight: "700" },
  subTitle: { marginTop: -6, fontSize: 14, opacity: 0.75 },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  row: { flexDirection: "row", gap: 10 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  btn: {
    flex: 1,
    backgroundColor: "#222",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  smallBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  smallBtnText: { fontWeight: "600", fontSize: 12 },
  image: { width: "100%", height: 220, borderRadius: 12 },
  status: { fontWeight: "700" },
  ok: { color: "green" },
  bad: { color: "red" },
  hint: { fontSize: 12, opacity: 0.75 },
  error: { color: "red", fontWeight: "600" },
  resultBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    gap: 6,
  },
  resultTitle: { fontWeight: "700", marginTop: 6 },
  resultMain: { fontSize: 18, fontWeight: "800" },
  resultLine: { fontSize: 13 },
  note: { marginTop: 8, fontStyle: "italic", opacity: 0.8 },
});
