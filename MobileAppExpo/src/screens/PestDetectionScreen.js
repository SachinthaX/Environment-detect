import React, { useMemo } from "react";
import { SafeAreaView, StyleSheet, Text, View, ScrollView, Pressable } from "react-native";

export default function PestDetectionScreen() {
  // Hardcoded sample values (replace later with image picker + backend model)
  const commonPests = useMemo(
    () => [
      {
        name: "Sciarid Flies (Fungus Gnats)",
        signs: "Small black flies; larvae in compost; slow growth.",
        action: "Improve sanitation, manage moisture, use traps and safe control methods.",
        risk: "High",
      },
      {
        name: "Mites",
        signs: "Tiny moving dots; surface damage; reduced yield.",
        action: "Clean growing area, remove infected material, maintain hygiene barriers.",
        risk: "Medium",
      },
      {
        name: "Nematodes",
        signs: "Poor pinning; weak mycelium; patchy beds.",
        action: "Use clean substrate, heat treatment, and strict sterilization practices.",
        risk: "High",
      },
    ],
    []
  );

  const recentScans = useMemo(
    () => [
      { date: "2026-01-06", result: "No pest detected", confidence: "91%" },
      { date: "2026-01-05", result: "Possible mites", confidence: "67%" },
      { date: "2026-01-03", result: "No pest detected", confidence: "88%" },
    ],
    []
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Pest Detection</Text>
        <Text style={styles.subtitle}>
          Sample UI (hardcoded). Later connect camera/gallery + backend pest model.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>

          <View style={styles.actionRow}>
            <Pressable style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>Choose Image</Text>
            </Pressable>
            <Pressable style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>Capture Image</Text>
            </Pressable>
          </View>

          <View style={styles.fakeResult}>
            <Text style={styles.fakeResultTitle}>Latest Result (Sample)</Text>
            <Text style={styles.fakeResultMain}>Possible mites</Text>
            <Text style={styles.fakeResultSub}>Confidence: 67%</Text>
            <Text style={styles.fakeResultHint}>
              Next step: isolate affected area and inspect substrate moisture and hygiene.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Scan History (Sample)</Text>
          {recentScans.map((s) => (
            <View key={s.date} style={styles.historyRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyDate}>{s.date}</Text>
                <Text style={styles.historyRes}>{s.result}</Text>
              </View>
              <Text style={styles.historyConf}>{s.confidence}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Common Pests</Text>
          {commonPests.map((p) => (
            <View key={p.name} style={styles.pestItem}>
              <View style={styles.pestTop}>
                <Text style={styles.pestName}>{p.name}</Text>
                <View style={[styles.riskPill, p.risk === "High" ? styles.riskHigh : styles.riskMed]}>
                  <Text style={styles.riskText}>{p.risk}</Text>
                </View>
              </View>
              <Text style={styles.pestLine}>
                <Text style={styles.bold}>Signs: </Text>
                {p.signs}
              </Text>
              <Text style={styles.pestLine}>
                <Text style={styles.bold}>Action: </Text>
                {p.action}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>Tip</Text>
          <Text style={styles.tipText}>
            Pest issues spread fast. Regular scanning + clean substrate handling gives the best results.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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

  actionRow: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flex: 1,
    backgroundColor: "#e2e8f0",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  actionBtnText: { fontSize: 13, fontWeight: "900", color: "#0f172a" },

  fakeResult: {
    marginTop: 12,
    backgroundColor: "#fff7ed",
    borderColor: "#fdba74",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  fakeResultTitle: { fontSize: 12, fontWeight: "900", color: "#9a3412" },
  fakeResultMain: { fontSize: 16, fontWeight: "900", color: "#0f172a", marginTop: 6 },
  fakeResultSub: { fontSize: 12, color: "#475569", marginTop: 2 },
  fakeResultHint: { fontSize: 12, color: "#9a3412", lineHeight: 17, marginTop: 8 },

  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  historyDate: { fontSize: 12, fontWeight: "900", color: "#0f172a" },
  historyRes: { fontSize: 12, color: "#475569", marginTop: 2 },
  historyConf: { fontSize: 12, fontWeight: "900", color: "#0f172a" },

  pestItem: {
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 12,
    marginTop: 12,
  },
  pestTop: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  pestName: { flex: 1, fontSize: 13, fontWeight: "900", color: "#0f172a" },

  riskPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1 },
  riskHigh: { backgroundColor: "#fee2e2", borderColor: "#fecaca" },
  riskMed: { backgroundColor: "#fef9c3", borderColor: "#fde68a" },
  riskText: { fontSize: 11, fontWeight: "900", color: "#0f172a" },

  pestLine: { fontSize: 12, color: "#475569", lineHeight: 17, marginTop: 6 },
  bold: { fontWeight: "900", color: "#0f172a" },

  tipCard: {
    backgroundColor: "#ecfeff",
    borderColor: "#67e8f9",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
  },
  tipTitle: { fontSize: 13, fontWeight: "900", color: "#155e75", marginBottom: 4 },
  tipText: { fontSize: 12, color: "#155e75", lineHeight: 17 },
});
