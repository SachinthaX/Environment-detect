import React, { useMemo } from "react";
import { SafeAreaView, StyleSheet, Text, View, ScrollView } from "react-native";

export default function GrowthPredictionScreen() {
  // Hardcoded sample values (replace later with model/API)
  const batch = {
    batchId: "BATCH-014",
    mushroomType: "Oyster Mushroom",
    startedOn: "2026-01-02",
    currentStage: "Fruiting Phase",
    dayCount: 6,
    predictedHarvestWindow: "2026-01-10 to 2026-01-13",
    expectedYieldKg: 28.5,
    confidence: 0.82,
  };

  const stages = useMemo(
    () => [
      { name: "Spawn Run", pct: 1.0, note: "Completed" },
      { name: "Pinning", pct: 0.7, note: "Stable" },
      { name: "Fruiting", pct: 0.45, note: "In progress" },
      { name: "Harvest", pct: 0.0, note: "Upcoming" },
    ],
    []
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Growth Prediction</Text>
        <Text style={styles.subtitle}>
          Sample growth output (hardcoded). Later connect this to your growth prediction model.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Batch</Text>

          <Row label="Batch ID" value={batch.batchId} />
          <Row label="Mushroom Type" value={batch.mushroomType} />
          <Row label="Started On" value={batch.startedOn} />
          <Row label="Day Count" value={`${batch.dayCount} days`} />
          <Row label="Current Stage" value={batch.currentStage} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Predictions</Text>

          <Row label="Harvest Window" value={batch.predictedHarvestWindow} />
          <Row label="Expected Yield" value={`${batch.expectedYieldKg} kg`} />
          <Row label="Confidence" value={`${Math.round(batch.confidence * 100)}%`} />

          <Text style={styles.smallNote}>
            Confidence is a demo value. In real use, it can be derived from model probability or validation metrics.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Stage Timeline</Text>

          {stages.map((s) => (
            <View key={s.name} style={styles.stageRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.stageName}>{s.name}</Text>
                <Text style={styles.stageNote}>{s.note}</Text>
              </View>

              <View style={styles.barOuter}>
                <View style={[styles.barInner, { width: `${Math.round(s.pct * 100)}%` }]} />
              </View>

              <Text style={styles.stagePct}>{Math.round(s.pct * 100)}%</Text>
            </View>
          ))}
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>Recommended Actions (Sample)</Text>
          <Text style={styles.tipText}>
            Maintain humidity around 85–92%, keep temperature stable, and avoid direct airflow on fruiting bodies.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8fafc" },
  container: { padding: 16, paddingBottom: 28 },

  title: { fontSize: 22, fontWeight: "900", color: "#0f172a", marginBottom: 6 },
  subtitle: { fontSize: 13, color: "#475569", lineHeight: 18, marginBottom: 12 },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
  },
  cardTitle: { fontSize: 14, fontWeight: "900", color: "#0f172a", marginBottom: 10 },

  row: { flexDirection: "row", justifyContent: "space-between", gap: 10, marginBottom: 8 },
  rowLabel: { fontSize: 12, fontWeight: "800", color: "#64748b" },
  rowValue: { fontSize: 12, fontWeight: "900", color: "#0f172a" },

  stageRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  stageName: { fontSize: 12, fontWeight: "900", color: "#0f172a" },
  stageNote: { fontSize: 12, color: "#475569", marginTop: 2 },

  barOuter: {
    width: 120,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#e2e8f0",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    overflow: "hidden",
  },
  barInner: { height: "100%", backgroundColor: "#22c55e" },
  stagePct: { width: 40, textAlign: "right", fontSize: 12, fontWeight: "900", color: "#0f172a" },

  smallNote: { fontSize: 12, color: "#475569", lineHeight: 17, marginTop: 10 },

  tipCard: {
    backgroundColor: "#f0fdf4",
    borderColor: "#86efac",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
  },
  tipTitle: { fontSize: 13, fontWeight: "900", color: "#14532d", marginBottom: 4 },
  tipText: { fontSize: 12, color: "#14532d", lineHeight: 17 },
});
