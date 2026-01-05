import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Modal,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

import Svg, { Path, Line, Text as SvgText } from 'react-native-svg';


import {
  fetchEnvironmentStatus,
  fetchEnvironmentOptions,
  fetchEnvironmentProfile,
  updateEnvironmentProfile,
  fetchOptimalRange,
  fetchEnvironmentHistory,
  fetchEnvironmentAvailableDates,
  fetchEnvironmentRecommendation,
  fetchEnvironmentHealth,
} from '../services/environmentApi';

function SelectModal({ visible, title, items, onClose, onPick }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{title}</Text>

          <FlatList
            data={items}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <Pressable style={styles.modalItem} onPress={() => onPick(item)}>
                <Text style={styles.modalItemText}>{item.label}</Text>
              </Pressable>
            )}
          />

          <Pressable style={styles.modalCloseBtn} onPress={onClose}>
            <Text style={styles.modalCloseText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function SimpleLineChart({
  points,
  field,
  yMin,
  yMax,
  height = 150,
  yTicks = null,
}) {
  const [width, setWidth] = useState(0);

  const paddingLeft = 44;
  const paddingRight = 10;
  const paddingTop = 10;
  const paddingBottom = 24;

  const n = points?.length || 0;

  const computedYTicks = useMemo(() => {
    if (Array.isArray(yTicks) && yTicks.length > 0) return yTicks;

    // default: 4 ticks
    const t0 = yMin;
    const t1 = yMin + (yMax - yMin) * 0.33;
    const t2 = yMin + (yMax - yMin) * 0.66;
    const t3 = yMax;
    return [t0, t1, t2, t3].map((v) => Number(v.toFixed(0)));
  }, [yTicks, yMin, yMax]);

  const xTickIndices = useMemo(() => {
    if (!n) return [];
    if (n <= 12) return [0, 3, 6, 9, n - 1]; // last 1h (12 points)
    return [0, 6, 12, 18, n - 1]; // 24 points
  }, [n]);

  const fmtTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const { path, plotW, plotH } = useMemo(() => {
    if (!width || !points || points.length < 2) {
      return { path: '', plotW: 0, plotH: 0 };
    }

    const w = width;
    const h = height;
    const pw = Math.max(10, w - paddingLeft - paddingRight);
    const ph = Math.max(10, h - paddingTop - paddingBottom);

    const scaleX = (i) => paddingLeft + (i / (points.length - 1)) * pw;
    const scaleY = (v) => {
      const clamped = Math.max(yMin, Math.min(yMax, v));
      const t = (clamped - yMin) / (yMax - yMin);
      return paddingTop + (1 - t) * ph;
    };

    let d = '';
    let started = false;

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const v = p?.[field];
      const x = scaleX(i);

      if (v === null || v === undefined) {
        started = false;
        continue;
      }

      const y = scaleY(Number(v));

      if (!started) {
        d += `M ${x.toFixed(2)} ${y.toFixed(2)} `;
        started = true;
      } else {
        d += `L ${x.toFixed(2)} ${y.toFixed(2)} `;
      }
    }

    return { path: d.trim(), plotW: pw, plotH: ph };
  }, [
    width,
    height,
    points,
    field,
    yMin,
    yMax,
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingBottom,
  ]);

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ width: '100%', height }}>
      {width > 0 ? (
        <Svg width={width} height={height}>
          {/* Axes */}
          <Line
            x1={paddingLeft}
            y1={paddingTop}
            x2={paddingLeft}
            y2={paddingTop + plotH}
            stroke="#334155"
            strokeWidth="1"
          />
          <Line
            x1={paddingLeft}
            y1={paddingTop + plotH}
            x2={paddingLeft + plotW}
            y2={paddingTop + plotH}
            stroke="#334155"
            strokeWidth="1"
          />

          {/* Y ticks + labels */}
          {computedYTicks.map((tickVal, idx) => {
            const t = (tickVal - yMin) / (yMax - yMin);
            const y = paddingTop + (1 - t) * plotH;

            return (
              <React.Fragment key={`y-${idx}`}>
                <Line
                  x1={paddingLeft - 4}
                  y1={y}
                  x2={paddingLeft}
                  y2={y}
                  stroke="#475569"
                  strokeWidth="1"
                />
                <SvgText
                  x={paddingLeft - 8}
                  y={y + 3}
                  fontSize="10"
                  fill="#94a3b8"
                  textAnchor="end"
                >
                  {Number(tickVal).toFixed(0)}
                </SvgText>
              </React.Fragment>
            );
          })}

          {/* X ticks + labels */}
          {xTickIndices.map((i) => {
            const x = paddingLeft + (i / (n - 1)) * plotW;
            const label = fmtTime(points?.[i]?.ts);

            return (
              <React.Fragment key={`x-${i}`}>
                <Line
                  x1={x}
                  y1={paddingTop + plotH}
                  x2={x}
                  y2={paddingTop + plotH + 4}
                  stroke="#475569"
                  strokeWidth="1"
                />
                <SvgText
                  x={x}
                  y={paddingTop + plotH + 16}
                  fontSize="10"
                  fill="#94a3b8"
                  textAnchor="middle"
                >
                  {label}
                </SvgText>
              </React.Fragment>
            );
          })}

          {/* Line path */}
          {path ? <Path d={path} stroke="#e5e7eb" strokeWidth="2" fill="none" /> : null}
        </Svg>
      ) : null}
    </View>
  );
}


export default function EnvironmentScreen() {
  const [loading, setLoading] = useState(true);

  const prevAlertActiveRef = useRef({ temperature: false, humidity: false });
  const [alerts, setAlerts] = useState([]);

  const [health, setHealth] = useState(null);
  const [healthError, setHealthError] = useState(false);

  const [reading, setReading] = useState(null);
  const [options, setOptions] = useState({ mushrooms: [], stages: [] });

  const [profile, setProfile] = useState({ mushroom_type: null, stage: null });
  const [range, setRange] = useState(null);

  const [showMushroomModal, setShowMushroomModal] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);

  const timerRef = useRef(null);
  const historyTimerRef = useRef(null);

  const [graphMode, setGraphMode] = useState('last_1h'); // last_1h | last_day | date
  const [historyPoints, setHistoryPoints] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDateModal, setShowDateModal] = useState(false);

  // Recommendation
  const [recSource, setRecSource] = useState('current'); // current | last_1h | last_day | date
  const [recommendation, setRecommendation] = useState(null);
  const [recLoading, setRecLoading] = useState(false);
  const [showRecDateModal, setShowRecDateModal] = useState(false);

  const stageItems = useMemo(
    () => (options.stages || []).map((s) => ({ key: s.key, label: s.label })),
    [options.stages]
  );

  const mushroomItems = useMemo(
    () => (options.mushrooms || []).map((m) => ({ key: m, label: m })),
    [options.mushrooms]
  );

  const dateItems = useMemo(
    () => (availableDates || []).map((d) => ({ key: d, label: d })),
    [availableDates]
  );

  const co2Value = reading?.co2 ?? reading?.co2_estimated ?? null;

  const tempInRange =
    reading && range
      ? reading.temperature >= range.temp_min && reading.temperature <= range.temp_max
      : null;

  const rhInRange =
    reading && range ? reading.humidity >= range.rh_min && reading.humidity <= range.rh_max : null;

  const co2Min = range?.co2_min;
  const co2Max = range?.co2_max;

  const hasCo2Min = co2Min != null && Number.isFinite(Number(co2Min));
  const hasCo2Max = co2Max != null && Number.isFinite(Number(co2Max));
  const hasAnyCo2 = !!range && (hasCo2Min || hasCo2Max);

  const co2InRange =
    co2Value != null && hasAnyCo2
      ? (hasCo2Min ? Number(co2Value) >= Number(co2Min) : true) &&
        (hasCo2Max ? Number(co2Value) <= Number(co2Max) : true)
      : null;

  const co2RangeLabel = useMemo(() => {
    if (!hasAnyCo2) return null;
    if (hasCo2Min && hasCo2Max) return `${Number(co2Min)}–${Number(co2Max)} ppm`;
    if (hasCo2Max) return `≤ ${Number(co2Max)} ppm`;
    return `≥ ${Number(co2Min)} ppm`;
  }, [hasAnyCo2, hasCo2Min, hasCo2Max, co2Min, co2Max]);



  async function loadRecommendation(forceSource, forceDate) {
    const src = forceSource ?? recSource;
    const dt = forceDate ?? selectedDate;

    if (src === 'date' && !dt) {
      setRecommendation(null);
      return;
    }

    setRecLoading(true);
    try {
      const rec = await fetchEnvironmentRecommendation(src, dt);
      setRecommendation(rec);
    } catch {
      setRecommendation(null);
    } finally {
      setRecLoading(false);
    }
  }

  async function loadInitial() {
    setLoading(true);
    try {
      const [opt, prof, st] = await Promise.all([
        fetchEnvironmentOptions(),
        fetchEnvironmentProfile(),
        fetchEnvironmentStatus(),
      ]);

      setOptions(opt);

      setReading(st.reading ?? null);
      setAlerts(st.alerts || []);
      await refreshHealth();

      const nextPrev = { temperature: false, humidity: false };
      for (const a of st.alerts || []) nextPrev[a.param] = !!a.active;
      prevAlertActiveRef.current = nextPrev;

      const nextProfile = {
        mushroom_type: st.profile?.mushroom_type ?? prof.mushroom_type ?? null,
        stage: st.profile?.stage ?? prof.stage ?? null,
      };
      setProfile(nextProfile);

      if (st.optimal_range) setRange(st.optimal_range);
      else if (nextProfile.mushroom_type && nextProfile.stage) {
        const rg = await fetchOptimalRange(nextProfile.mushroom_type, nextProfile.stage);
        setRange(rg);
      } else setRange(null);

      const datesRes = await fetchEnvironmentAvailableDates();
      const dates = datesRes.dates || [];
      setAvailableDates(dates);

      const defaultDate = selectedDate || (dates.length > 0 ? dates[0] : null);
      if (!selectedDate && defaultDate) setSelectedDate(defaultDate);

      await refreshHistory(graphMode, defaultDate);
      await loadRecommendation('current', defaultDate);
    } finally {
      setLoading(false);
    }
  }

  async function refreshStatus() {
    try {
      const st = await fetchEnvironmentStatus();
      setReading(st.reading ?? null);
      setAlerts(st.alerts || []);
      if (st.optimal_range) setRange(st.optimal_range);

      for (const a of st.alerts || []) {
        prevAlertActiveRef.current[a.param] = !!a.active;
      }
    } catch {
      // ignore
    }
  }

  async function refreshHistory(mode, date) {
    try {
      if (mode === 'date' && !date) {
        setHistoryPoints([]);
        return;
      }
      const hist = await fetchEnvironmentHistory(mode, date);
      setHistoryPoints(hist.points || []);
    } catch {
      setHistoryPoints([]);
    }
  }

  async function refreshHealth() {
    try {
      const h = await fetchEnvironmentHealth();
      setHealth(h);
      setHealthError(false);
    } catch {
      setHealthError(true);
    }
  }


  async function applyProfile(next) {
    const saved = await updateEnvironmentProfile(next);
    const nextProfile = { mushroom_type: saved.mushroom_type, stage: saved.stage };
    setProfile(nextProfile);

    prevAlertActiveRef.current = { temperature: false, humidity: false };
    setAlerts([]);

    const rg = await fetchOptimalRange(nextProfile.mushroom_type, nextProfile.stage);
    setRange(rg);

    refreshStatus();
  }

  useEffect(() => {
    loadInitial();

    timerRef.current = setInterval(() => {
      refreshStatus();
      refreshHealth();
    }, 5000);

    historyTimerRef.current = setInterval(() => {
      refreshHistory(graphMode, selectedDate);
    }, 30000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (historyTimerRef.current) clearInterval(historyTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!loading) refreshHistory(graphMode, selectedDate);
  }, [graphMode, selectedDate]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ActivityIndicator />
          <Text style={styles.subtitle}>Loading environment data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const activeAlerts = (alerts || []).filter((a) => a.active);

  const modeLabel =
    graphMode === 'last_1h'
      ? 'Last 1 hour (5-min avg, 12 points)'
      : graphMode === 'last_day'
      ? 'Last day (hourly avg, 24 points)'
      : selectedDate
      ? `Date view (${selectedDate})`
      : 'Date view';

  const recLabel =
    recSource === 'current'
      ? 'Current reading'
      : recSource === 'last_1h'
      ? 'Last 1 hour average'
      : recSource === 'last_day'
      ? 'Last day average'
      : selectedDate
      ? `Selected date (${selectedDate})`
      : 'Selected date';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Environment Monitoring</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Live Readings</Text>
          {health ? (
            <>
              <Text style={styles.cardRow}>
                Status:{' '}
                <Text style={[styles.value, health.online ? styles.okText : styles.badText]}>
                  {health.online ? 'ONLINE' : 'OFFLINE'}
                </Text>
              </Text>
              {!health.online ? (
                <Text style={styles.note}>
                  No data received recently. Check ESP32 Wi-Fi / power / server IP.
                </Text>
              ) : null}
            </>
          ) : healthError ? (
            <Text style={styles.note}>Unable to read sensor status (server not reachable).</Text>
          ) : (
            <Text style={styles.note}>Loading sensor status...</Text>
          )}
          <Text style={styles.cardRow}>
            Temperature:{' '}
            <Text style={styles.value}>{reading?.temperature?.toFixed?.(1) ?? '-'}</Text> °C
          </Text>
          <Text style={styles.cardRow}>
            Humidity: <Text style={styles.value}>{reading?.humidity?.toFixed?.(1) ?? '-'}</Text> %RH
          </Text>
          <Text style={styles.cardRow}>
            CO₂ (estimated): <Text style={styles.value}>{co2Value?.toFixed?.(0) ?? '-'}</Text> ppm
          </Text>
          <Text style={styles.updatedText}>
            Last updated:{' '}
            <Text style={styles.value}>
              {health?.seconds_since_last != null ? `${health.seconds_since_last}s ago` : '-'}
            </Text>
          </Text>



        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Alerts</Text>
          {activeAlerts.length > 0 ? (
            activeAlerts.map((a) => (
              <Text key={a.param} style={styles.alertText}>
                {a.param.toUpperCase()}: {a.last_message || 'Out of range'}
              </Text>
            ))
          ) : (
            <Text style={styles.note}>No active alerts.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mushroom Profile</Text>

          <View style={styles.rowBetween}>
            <Text style={styles.label}>Mushroom type</Text>
            <Pressable style={styles.selectBtn} onPress={() => setShowMushroomModal(true)}>
              <Text style={styles.selectBtnText}>{profile.mushroom_type ?? 'Select'}</Text>
            </Pressable>
          </View>

          <View style={[styles.rowBetween, { marginTop: 10 }]}>
            <Text style={styles.label}>Stage</Text>
            <Pressable style={styles.selectBtn} onPress={() => setShowStageModal(true)}>
              <Text style={styles.selectBtnText}>
                {profile.stage
                  ? stageItems.find((s) => s.key === profile.stage)?.label ?? profile.stage
                  : 'Select'}
              </Text>
            </Pressable>
          </View>

          {range ? (
            <View style={{ marginTop: 14 }}>
              <Text style={styles.cardTitle}>Optimal Range</Text>
              
              <Text style={styles.cardRow}>
                Temp : {range.temp_min}–{range.temp_max} °C{' '}
                {tempInRange === null ? null : (
                  <Text style={tempInRange ? styles.within : styles.out}>
                    {tempInRange ? '(within)' : '(out)'}
                  </Text>
                )}
              </Text>
              <Text style={styles.cardRow}>
                RH : {range.rh_min}–{range.rh_max} %{' '}
                {rhInRange === null ? null : (
                  <Text style={rhInRange ? styles.within : styles.out}>
                    {rhInRange ? '(within)' : '(out)'}
                  </Text>
                )}
              </Text>
              {hasAnyCo2 ? (
                <Text style={styles.cardRow}>
                  CO₂ : {co2RangeLabel}{' '}
                  {co2InRange === null ? null : (
                    <Text style={co2InRange ? styles.within : styles.out}>
                      {co2InRange ? '(within)' : '(out)'}
                    </Text>
                  )}
                </Text>
              ) : (
                <Text style={styles.note}>CO₂ range not available for this variety.</Text>
              )}



            </View>
          ) : (
            <Text style={styles.note}>Select mushroom type and stage to see optimal ranges.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Graphs</Text>

          <View style={styles.toggleRow}>
            <Pressable
              style={[styles.toggleBtn, graphMode === 'last_1h' && styles.toggleBtnActive]}
              onPress={() => setGraphMode('last_1h')}
            >
              <Text style={styles.toggleText}>Last 1h</Text>
            </Pressable>

            <Pressable
              style={[styles.toggleBtn, graphMode === 'last_day' && styles.toggleBtnActive]}
              onPress={() => setGraphMode('last_day')}
            >
              <Text style={styles.toggleText}>Last day</Text>
            </Pressable>

            <Pressable
              style={[styles.toggleBtn, graphMode === 'date' && styles.toggleBtnActive]}
              onPress={() => setGraphMode('date')}
            >
              <Text style={styles.toggleText}>Date</Text>
            </Pressable>
          </View>

          <View style={[styles.rowBetween, { marginTop: 10 }]}>
            <Text style={styles.note}>{modeLabel}</Text>

            {graphMode === 'date' ? (
              <Pressable
                style={styles.smallBtn}
                onPress={async () => {
                  const datesRes = await fetchEnvironmentAvailableDates();
                  setAvailableDates(datesRes.dates || []);
                  setShowDateModal(true);
                }}
              >
                <Text style={styles.smallBtnText}>{selectedDate ? 'Change date' : 'Pick date'}</Text>
              </Pressable>
            ) : null}
          </View>

          <Text style={[styles.cardTitle, { marginTop: 12 }]}>Temperature (0–45°C)</Text>
          <SimpleLineChart points={historyPoints} field="temperature" yMin={0} yMax={45} yTicks={[0, 15, 30, 45]}/>

          <Text style={[styles.cardTitle, { marginTop: 12 }]}>Humidity (0–100%RH)</Text>
          <SimpleLineChart points={historyPoints} field="humidity" yMin={0} yMax={100} yTicks={[0, 50, 100]}/>

          <Text style={[styles.cardTitle, { marginTop: 12 }]}>CO₂ (0–5000 ppm)</Text>
          <SimpleLineChart points={historyPoints} field="co2" yMin={0} yMax={5000} yTicks={[0, 2500, 5000]}/>

        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Variety Recommendation (Fruiting phase)</Text>

          <View style={styles.toggleRow}>
            <Pressable
              style={[styles.toggleBtn, recSource === 'current' && styles.toggleBtnActive]}
              onPress={() => setRecSource('current')}
            >
              <Text style={styles.toggleText}>Current</Text>
            </Pressable>

            <Pressable
              style={[styles.toggleBtn, recSource === 'last_1h' && styles.toggleBtnActive]}
              onPress={() => setRecSource('last_1h')}
            >
              <Text style={styles.toggleText}>Last 1h</Text>
            </Pressable>

            <Pressable
              style={[styles.toggleBtn, recSource === 'last_day' && styles.toggleBtnActive]}
              onPress={() => setRecSource('last_day')}
            >
              <Text style={styles.toggleText}>Last day</Text>
            </Pressable>

            <Pressable
              style={[styles.toggleBtn, recSource === 'date' && styles.toggleBtnActive]}
              onPress={() => setRecSource('date')}
            >
              <Text style={styles.toggleText}>Date</Text>
            </Pressable>
          </View>

          <View style={[styles.rowBetween, { marginTop: 10 }]}>
            <Text style={styles.note}>{recLabel}</Text>

            {recSource === 'date' ? (
              <Pressable
                style={styles.smallBtn}
                onPress={async () => {
                  const datesRes = await fetchEnvironmentAvailableDates();
                  setAvailableDates(datesRes.dates || []);
                  setShowRecDateModal(true);
                }}
              >
                <Text style={styles.smallBtnText}>{selectedDate ? 'Change date' : 'Pick date'}</Text>
              </Pressable>
            ) : null}
          </View>

          <Pressable
            style={[styles.primaryBtn, recLoading && { opacity: 0.7 }]}
            onPress={() => loadRecommendation()}
            disabled={recLoading}
          >
            <Text style={styles.primaryBtnText}>
              {recLoading ? 'Loading...' : 'Get recommendation'}
            </Text>
          </Pressable>

          {recommendation?.temperature != null && recommendation?.humidity != null ? (
            <Text style={styles.note}>
              Used: Temp {recommendation.temperature.toFixed(1)}°C, RH {recommendation.humidity.toFixed(1)}%
              {recommendation.points_used ? ` (points: ${recommendation.points_used})` : ''}
            </Text>
          ) : (
            <Text style={styles.note}>No data available for the selected source yet.</Text>
          )}

          {recommendation?.recommendations?.length > 0 ? (
            <View style={{ marginTop: 10 }}>
              {recommendation.recommendations.map((r, idx) => (
                <View key={`${r.mushroom_type}-${idx}`} style={styles.recRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recTitle}>
                      {idx + 1}. {r.mushroom_type}
                    </Text>
                    <Text style={styles.note}>{r.reason}</Text>
                  </View>
                  <Text style={styles.recScore}>{Number(r.score).toFixed(2)}</Text>
                </View>
              ))}
              <Text style={styles.note}>
                Lower score means a better match to current Temp/RH.
              </Text>
            </View>
          ) : null}
        </View>

        <SelectModal
          visible={showMushroomModal}
          title="Select mushroom type"
          items={mushroomItems}
          onClose={() => setShowMushroomModal(false)}
          onPick={async (item) => {
            setShowMushroomModal(false);
            const next = { ...profile, mushroom_type: item.key };
            if (next.mushroom_type && next.stage) await applyProfile(next);
            else setProfile(next);
          }}
        />

        <SelectModal
          visible={showStageModal}
          title="Select stage"
          items={stageItems}
          onClose={() => setShowStageModal(false)}
          onPick={async (item) => {
            setShowStageModal(false);
            const next = { ...profile, stage: item.key };
            if (next.mushroom_type && next.stage) await applyProfile(next);
            else setProfile(next);
          }}
        />

        <SelectModal
          visible={showDateModal}
          title="Select date"
          items={dateItems}
          onClose={() => setShowDateModal(false)}
          onPick={async (item) => {
            setShowDateModal(false);
            setSelectedDate(item.key);
          }}
        />

        <SelectModal
          visible={showRecDateModal}
          title="Select date for recommendation"
          items={dateItems}
          onClose={() => setShowRecDateModal(false)}
          onPick={async (item) => {
            setShowRecDateModal(false);
            setSelectedDate(item.key);
            // immediately load recommendation for chosen date
            await loadRecommendation('date', item.key);
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  container: { flex: 1, paddingHorizontal: 16, paddingVertical: 18 },
  title: { fontSize: 20, fontWeight: '700', color: '#e5e7eb', marginBottom: 12 },
  subtitle: { marginTop: 10, color: '#9ca3af' },
  

  card: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  cardTitle: { color: '#e5e7eb', fontWeight: '700', marginBottom: 8 },
  cardRow: { color: '#cbd5e1', marginTop: 4, lineHeight: 20 },
  value: { color: '#ffffff', fontWeight: '700' },
  okText: { color: '#86efac' },   // green
  badText: { color: '#fca5a5' },  // red
  note: { color: '#9ca3af', marginTop: 10, fontSize: 12 },
  within: { color: '#86efac' },
  out: { color: '#fca5a5' },
  updatedText: { color: '#9ca3af', marginTop: 10, fontSize: 11 },


  alertText: { color: '#fca5a5', marginTop: 6, lineHeight: 20, fontWeight: '700' },

  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: '#cbd5e1' },

  selectBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0b1220',
    maxWidth: 220,
  },
  selectBtnText: { color: '#e5e7eb' },

  toggleRow: { flexDirection: 'row', gap: 8, marginTop: 6, flexWrap: 'wrap' },
  toggleBtn: {
    flexGrow: 1,
    minWidth: 90,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0b1220',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  toggleBtnActive: {
    backgroundColor: '#111827',
    borderColor: '#64748b',
  },
  toggleText: { color: '#e5e7eb', fontWeight: '700' },

  smallBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0b1220',
  },
  smallBtnText: { color: '#e5e7eb', fontWeight: '700', fontSize: 12 },

  primaryBtn: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0b1220',
    alignItems: 'center',
  },
  primaryBtnText: { color: '#e5e7eb', fontWeight: '700' },

  recRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
    gap: 10,
  },
  recTitle: { color: '#e5e7eb', fontWeight: '700' },
  recScore: { color: '#e5e7eb', fontWeight: '700', minWidth: 60, textAlign: 'right' },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0b1220',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    maxHeight: '80%',
  },
  modalTitle: { color: '#e5e7eb', fontWeight: '700', marginBottom: 12, fontSize: 16 },
  modalItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1f2937' },
  modalItemText: { color: '#e5e7eb' },
  modalCloseBtn: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#111827',
    alignItems: 'center',
  },
  modalCloseText: { color: '#e5e7eb', fontWeight: '700' },

  scrollContent: {
    paddingBottom: 120,
  },
});
