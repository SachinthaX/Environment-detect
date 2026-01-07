import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { pingBackend } from "../services/api";

export default function HomeScreen() {
  const navigation = useNavigation();

  const [loadingPing, setLoadingPing] = useState(false);
  const [serverOk, setServerOk] = useState(false);
  const [serverMsg, setServerMsg] = useState("");
  const [error, setError] = useState("");

  const statusLabel = useMemo(() => {
    if (loadingPing) return "Checking backend…";
    if (serverOk) return "Backend connected";
    if (error) return "Backend offline";
    return "Status unknown";
  }, [loadingPing, serverOk, error]);

  const handlePing = async () => {
    try {
      setLoadingPing(true);
      setError("");
      setServerMsg("");

      const data = await pingBackend();
      setServerOk(true);
      setServerMsg(data?.message || "OK");
    } catch (_e) {
      setServerOk(false);
      setError("Unable to reach backend");
    } finally {
      setLoadingPing(false);
    }
  };

  useEffect(() => {
    handlePing();
  }, []);

  const openTab = (name) => navigation.navigate(name);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Mushroom Smart Farming</Text>
          <Text style={styles.heroSub}>
            A single platform to support cultivation decisions using AI image analysis and environment monitoring.
          </Text>

          <View style={styles.statusCard}>
            <View style={styles.statusLeft}>
              <View
                style={[
                  styles.dot,
                  loadingPing ? styles.dotWarn : serverOk ? styles.dotOk : error ? styles.dotBad : styles.dotMuted,
                ]}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.statusText}>{statusLabel}</Text>
                {serverOk && !!serverMsg ? (
                  <Text style={styles.statusSub}>Server message: {serverMsg}</Text>
                ) : null}
                {!serverOk && !!error ? <Text style={styles.statusErr}>{error}</Text> : null}
              </View>
            </View>

            <Pressable
              onPress={handlePing}
              disabled={loadingPing}
              style={({ pressed }) => [
                styles.refreshBtn,
                loadingPing && styles.btnDisabled,
                pressed && styles.btnPressed,
              ]}
            >
              {loadingPing ? (
                <ActivityIndicator size="small" />
              ) : (
                <>
                  <Ionicons name="refresh" size={16} color="#0f172a" />
                  <Text style={styles.refreshText}>Refresh</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>

        {/* About */}
        <View style={styles.aboutCard}>
          <Text style={styles.sectionTitle}>About this app</Text>
          <Text style={styles.paragraph}>
            This app helps mushroom farmers and students reduce crop loss and improve yield. It combines image-based
            detection (pests, diseases, type identification) with environment tracking (temperature, humidity, CO₂),
            so you can make decisions faster with data.
          </Text>

          <View style={styles.featureRow}>
            <FeatureChip icon="camera" text="Image-based AI" />
            <FeatureChip icon="analytics" text="Predictions" />
            <FeatureChip icon="thermometer" text="IoT monitoring" />
            <FeatureChip icon="shield-checkmark" text="Prevention tips" />
          </View>
        </View>

        

        {/* Main Modules (ordered like bottom tabs) */}
        <Text style={styles.sectionTitle}>Main modules</Text>

        <ModuleItem
          title="Environment"
          subtitle="Live readings, optimal ranges, history and recommendations."
          leftIcon={<Ionicons name="thermometer" size={18} color="#0f172a" />}
          onPress={() => openTab("Environmental Monitoring")}
        />

        <ModuleItem
          title="Pests"
          subtitle="Detect pests from images and reduce damage early."
          leftIcon={<Ionicons name="bug" size={18} color="#0f172a" />}
          onPress={() => openTab("Pests")}
        />

        <ModuleItem
          title="Disease"
          subtitle="Identify diseases from mushroom images and show guidance."
          leftIcon={<Ionicons name="medkit" size={18} color="#0f172a" />}
          onPress={() => openTab("Disease")}
        />

        <ModuleItem
          title="Growth"
          subtitle="Predict stage, harvest window, and expected yield."
          leftIcon={<Ionicons name="stats-chart" size={18} color="#0f172a" />}
          onPress={() => openTab("Growth")}
        />

        <ModuleItem
          title="Type"
          subtitle="Classify mushroom type using image recognition."
          leftIcon={<MaterialCommunityIcons name="mushroom" size={18} color="#0f172a" />}
          onPress={() => openTab("Type")}
        />

        {/* How it works */}
        <View style={styles.howCard}>
          <Text style={styles.sectionTitle}>How it works</Text>

          <Step
            n="1"
            title="Capture or select an image"
            text="Use camera/gallery to provide a clear mushroom image."
          />
          <Step
            n="2"
            title="AI predicts the result"
            text="The backend model returns the detected class and confidence."
          />
          <Step
            n="3"
            title="You get guidance + monitoring"
            text="See recommended actions and keep environment within optimal range."
          />
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>Tip</Text>
          <Text style={styles.tipText}>
            For best accuracy, use good lighting and keep the mushroom centered and in focus.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ModuleItem({ title, subtitle, leftIcon, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.moduleCard, pressed && styles.pressedCard]}>
      <View style={styles.moduleLeft}>
        <View style={styles.iconBox}>{leftIcon}</View>
        <View style={{ flex: 1 }}>
          <Text style={styles.moduleTitle}>{title}</Text>
          <Text style={styles.moduleSub}>{subtitle}</Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color="#64748b" />
    </Pressable>
  );
}



function FeatureChip({ icon, text }) {
  return (
    <View style={styles.chip}>
      <Ionicons name={icon} size={14} color="#0f172a" />
      <Text style={styles.chipText}>{text}</Text>
    </View>
  );
}

function Step({ n, title, text }) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepNum}>
        <Text style={styles.stepNumText}>{n}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8fafc" },
  container: { padding: 16, paddingBottom: 28 },

  hero: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
  },
  heroTitle: { fontSize: 22, fontWeight: "900", color: "#0f172a", marginBottom: 6 },
  heroSub: { fontSize: 13, color: "#475569", lineHeight: 18 },

  statusCard: {
    marginTop: 14,
    backgroundColor: "#f1f5f9",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statusLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotOk: { backgroundColor: "#22c55e" },
  dotBad: { backgroundColor: "#ef4444" },
  dotWarn: { backgroundColor: "#f59e0b" },
  dotMuted: { backgroundColor: "#cbd5e1" },

  statusText: { fontSize: 12, fontWeight: "900", color: "#0f172a" },
  statusSub: { fontSize: 12, color: "#475569", marginTop: 2 },
  statusErr: { fontSize: 12, color: "#b91c1c", marginTop: 2 },

  refreshBtn: {
    backgroundColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  refreshText: { fontSize: 12, fontWeight: "900", color: "#0f172a" },

  aboutCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
  },
  paragraph: { fontSize: 13, color: "#475569", lineHeight: 18, marginTop: 6 },

  featureRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  chip: {
    backgroundColor: "#f1f5f9",
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chipText: { fontSize: 12, fontWeight: "800", color: "#0f172a" },

  sectionTitle: { fontSize: 14, fontWeight: "900", color: "#0f172a", marginTop: 10, marginBottom: 10 },

  statsRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  miniStat: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  miniLabel: { fontSize: 12, fontWeight: "800", color: "#64748b" },
  miniValue: { fontSize: 16, fontWeight: "900", color: "#0f172a", marginTop: 4 },
  miniSub: { fontSize: 11, color: "#64748b", marginTop: 4 },

  moduleCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  pressedCard: { opacity: 0.96, transform: [{ scale: 0.997 }] },
  moduleLeft: { flex: 1, flexDirection: "row", gap: 10, alignItems: "flex-start" },

  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  moduleTitle: { fontSize: 15, fontWeight: "900", color: "#0f172a" },
  moduleSub: { fontSize: 13, color: "#475569", lineHeight: 18, marginTop: 2 },

  howCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginTop: 6,
  },
  stepRow: { flexDirection: "row", gap: 10, alignItems: "flex-start", marginTop: 10 },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: "#e2e8f0",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumText: { fontSize: 12, fontWeight: "900", color: "#0f172a" },
  stepTitle: { fontSize: 13, fontWeight: "900", color: "#0f172a" },
  stepText: { fontSize: 12, color: "#475569", lineHeight: 17, marginTop: 2 },

  tipCard: {
    backgroundColor: "#ecfeff",
    borderColor: "#67e8f9",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
  },
  tipTitle: { fontSize: 13, fontWeight: "900", color: "#155e75", marginBottom: 4 },
  tipText: { fontSize: 12, color: "#155e75", lineHeight: 17 },

  btnDisabled: { opacity: 0.6 },
  btnPressed: { opacity: 0.95, transform: [{ scale: 0.995 }] },
});
