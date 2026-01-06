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

import Svg, {
  Path,
  Line,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

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

const C = {
  bg: '#070B16',
  surface: 'rgba(255,255,255,0.05)',
  surface2: 'rgba(255,255,255,0.08)',
  border: 'rgba(255,255,255,0.10)',
  text: 'rgba(255,255,255,0.92)',
  muted: 'rgba(255,255,255,0.65)',
  faint: 'rgba(255,255,255,0.45)',
  ok: '#34D399',
  bad: '#FB7185',
  warn: '#F59E0B',
};

function ymdLocal(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function pickDefaultDate(dates) {
  const today = ymdLocal(new Date());
  if (Array.isArray(dates) && dates.includes(today)) return today;
  if (Array.isArray(dates) && dates.length > 0) return dates[0];
  return null;
}

function Chip({ tone = 'muted', text }) {
  const color =
    tone === 'ok' ? C.ok : tone === 'bad' ? C.bad : tone === 'warn' ? C.warn : C.muted;

  return (
    <View style={[styles.chip, { borderColor: color }]}>
      <Text style={[styles.chipText, { color }]}>{text}</Text>
    </View>
  );
}


function Card({ title, right, children }) {
  return (
    <View style={styles.card}>
      {(title || right) && (
        <View style={styles.cardHead}>
          <Text style={styles.cardTitle}>{title}</Text>
          {right ? <View>{right}</View> : null}
        </View>
      )}
      {children}
    </View>
  );
}

function StatTile({ label, value, unit, status, subtitle }) {
  const tone = status === 'within' ? 'ok' : status === 'out' ? 'bad' : 'muted';
  const chipText = status === 'within' ? 'Within' : status === 'out' ? 'Out' : '—';

  return (
    <View style={styles.tile}>
      <View style={styles.tileTopRow}>
        <Text style={styles.tileLabel}>{label}</Text>
        <Chip tone={tone} text={chipText} />
      </View>

      <Text style={styles.tileValue}>
        {value}
        <Text style={styles.tileUnit}> {unit}</Text>
      </Text>

      {!!subtitle && <Text style={styles.tileSub}>{subtitle}</Text>}
    </View>
  );
}

function AlertRow({ title, message, rightText, severity = 'bad' }) {
  const isWarn = severity === 'warn';
  const tintBg = isWarn ? 'rgba(245,158,11,0.10)' : 'rgba(251,113,133,0.10)';
  const tintBorder = isWarn ? 'rgba(245,158,11,0.22)' : 'rgba(251,113,133,0.22)';
  const dotColor = isWarn ? C.warn : C.bad;

  return (
    <View style={[styles.alertBanner, { backgroundColor: tintBg, borderColor: tintBorder }]}>
      <View style={[styles.alertDot, { backgroundColor: dotColor }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.alertTitle}>{title}</Text>
        <Text style={styles.alertMsg}>

          {message}
        </Text>
      </View>
      {!!rightText && <Text style={[styles.alertRight, { color: dotColor }]}>{rightText}</Text>}
    </View>
  );
}


function SelectModal({ visible, title, items, onClose, onPick }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{title}</Text>

          <FlatList
            data={items}
            keyExtractor={(item) => item.key}
            ListEmptyComponent={<Text style={styles.modalEmpty}>No dates available.</Text>}
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

    const t0 = yMin;
    const t1 = yMin + (yMax - yMin) * 0.33;
    const t2 = yMin + (yMax - yMin) * 0.66;
    const t3 = yMax;
    return [t0, t1, t2, t3].map((v) => Number(v.toFixed(0)));
  }, [yTicks, yMin, yMax]);

  const xTickIndices = useMemo(() => {
    if (!n) return [];
    if (n === 1) return [0];
    const q1 = Math.round((n - 1) * 0.25);
    const q2 = Math.round((n - 1) * 0.5);
    const q3 = Math.round((n - 1) * 0.75);
    return Array.from(new Set([0, q1, q2, q3, n - 1]));
  }, [n]);

  const fmtTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const { linePath, areaPaths, plotW, plotH } = useMemo(() => {
    if (!width || !points || points.length < 2) {
      return { linePath: '', areaPaths: [], plotW: 0, plotH: 0 };
    }

    const w = width;
    const h = height;

    const pw = Math.max(10, w - paddingLeft - paddingRight);
    const ph = Math.max(10, h - paddingTop - paddingBottom);

    const baseY = paddingTop + ph; // yMin baseline

    const scaleX = (i) => paddingLeft + (i / (points.length - 1)) * pw;

    const scaleY = (v) => {
      const clamped = Math.max(yMin, Math.min(yMax, v));
      const t = (clamped - yMin) / (yMax - yMin);
      return paddingTop + (1 - t) * ph;
    };

    // Build the line path (your original logic)
    let lp = '';
    let started = false;

    // Also build area segments for gradient fill
    const segments = [];
    let current = [];

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const v = p?.[field];

      const x = scaleX(i);

      if (v === null || v === undefined) {
        if (current.length >= 2) segments.push(current);
        current = [];
        started = false;
        continue;
      }

      const y = scaleY(Number(v));

      // Line path
      if (!started) {
        lp += `M ${x.toFixed(2)} ${y.toFixed(2)} `;
        started = true;
      } else {
        lp += `L ${x.toFixed(2)} ${y.toFixed(2)} `;
      }

      // Area segment point
      current.push({ x, y });
    }

    if (current.length >= 2) segments.push(current);

    // Convert segments -> closed area paths
    const ap = segments.map((seg) => {
      const first = seg[0];
      const last = seg[seg.length - 1];

      let d = `M ${first.x.toFixed(2)} ${first.y.toFixed(2)} `;
      for (let i = 1; i < seg.length; i++) {
        d += `L ${seg[i].x.toFixed(2)} ${seg[i].y.toFixed(2)} `;
      }

      // close down to baseline
      d += `L ${last.x.toFixed(2)} ${baseY.toFixed(2)} `;
      d += `L ${first.x.toFixed(2)} ${baseY.toFixed(2)} Z`;
      return d;
    });

    return { linePath: lp.trim(), areaPaths: ap, plotW: pw, plotH: ph };
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

  const gradientId = `areaGrad_${field}`;

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ width: '100%', height }}
    >
      {width > 0 ? (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="rgba(255,255,255,0.35)" stopOpacity="0.16" />
              <Stop offset="55%" stopColor="rgba(255,255,255,0.20)" stopOpacity="0.08" />
              <Stop offset="100%" stopColor="rgba(255,255,255,0.10)" stopOpacity="0.02" />
            </LinearGradient>
          </Defs>

          {/* Axes */}
          <Line
            x1={paddingLeft}
            y1={paddingTop}
            x2={paddingLeft}
            y2={paddingTop + plotH}
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1"
          />
          <Line
            x1={paddingLeft}
            y1={paddingTop + plotH}
            x2={paddingLeft + plotW}
            y2={paddingTop + plotH}
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1"
          />

          {/* Y ticks */}
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
                  stroke="rgba(255,255,255,0.22)"
                  strokeWidth="1"
                />
                <SvgText
                  x={paddingLeft - 8}
                  y={y + 3}
                  fontSize="10"
                  fill="rgba(255,255,255,0.55)"
                  textAnchor="end"
                >
                  {Number(tickVal).toFixed(0)}
                </SvgText>
              </React.Fragment>
            );
          })}

          {/* X ticks */}
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
                  stroke="rgba(255,255,255,0.22)"
                  strokeWidth="1"
                />
                <SvgText
                  x={x}
                  y={paddingTop + plotH + 16}
                  fontSize="10"
                  fill="rgba(255,255,255,0.55)"
                  textAnchor="middle"
                >
                  {label}
                </SvgText>
              </React.Fragment>
            );
          })}

          {/* Gradient fill area */}
          {areaPaths.map((d, idx) => (
            <Path key={`area-${idx}`} d={d} fill={`url(#${gradientId})`} stroke="none" />
          ))}

          {/* Line path */}
          {linePath ? (
            <Path d={linePath} stroke="rgba(255,255,255,0.90)" strokeWidth="2" fill="none" />
          ) : null}
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

  // Graphs: last_1h | date (only)
  const [graphMode, setGraphMode] = useState('last_1h');
  const [historyPoints, setHistoryPoints] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDateModal, setShowDateModal] = useState(false);

  // Recommendation: current | last_1h | date (only)
  const [recSource, setRecSource] = useState('current');
  const [recommendation, setRecommendation] = useState(null);
  const [recLoading, setRecLoading] = useState(false);
  const [showRecDateModal, setShowRecDateModal] = useState(false);
  
  const [recExpandedKey, setRecExpandedKey] = useState(null);
  const [showAllRecs, setShowAllRecs] = useState(false);

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

  const stageLabel = useMemo(() => {
    if (!profile.stage) return null;
    return stageItems.find((s) => s.key === profile.stage)?.label ?? profile.stage;
  }, [profile.stage, stageItems]);

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

  const headerStatus = useMemo(() => {
    if (!health) return { text: 'Checking...', tone: 'muted' };
    if (!health.online) return { text: 'OFFLINE', tone: 'bad' };
    return { text: 'ONLINE', tone: 'ok' };
  }, [health]);

  const headerSubline = useMemo(() => {
    const parts = [];
    if (health?.seconds_since_last != null) parts.push(`Updated ${health.seconds_since_last}s ago`);
    if (profile.mushroom_type) parts.push(profile.mushroom_type);
    if (stageLabel) parts.push(stageLabel);
    return parts.length ? parts.join(' • ') : '—';
  }, [health?.seconds_since_last, profile.mushroom_type, stageLabel]);

  function deltaText(value, min, max, unit, decimals = 1) {
    if (value == null || min == null || max == null) return null;
    const v = Number(value);
    const mn = Number(min);
    const mx = Number(max);
    if (!Number.isFinite(v) || !Number.isFinite(mn) || !Number.isFinite(mx)) return null;

    if (v < mn) return `Low by ${(mn - v).toFixed(decimals)}${unit}`;
    if (v > mx) return `High by ${(v - mx).toFixed(decimals)}${unit}`;
    return `Within range`;
  }

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

      setRecExpandedKey(null);
      setShowAllRecs(false);
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

      const def = selectedDate ?? pickDefaultDate(dates);
      if (!selectedDate && def) setSelectedDate(def);

      await refreshHistory(graphMode, def);
      await loadRecommendation('current', def);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading) refreshHistory(graphMode, selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphMode, selectedDate]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator />
          <Text style={styles.subtle}>Loading environment data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const activeAlerts = (alerts || []).filter((a) => a.active);

  const dateForButtons = selectedDate ?? ymdLocal(new Date());

  const graphHint =
    graphMode === 'last_1h'
      ? 'Last 1 hour (5-min avg)'
      : selectedDate
      ? `Date view (${selectedDate})`
      : 'Date view';

  const recHint =
    recSource === 'current'
      ? 'Current reading'
      : recSource === 'last_1h'
      ? 'Last 1 hour average'
      : selectedDate
      ? `Selected date (${selectedDate})`
      : 'Selected date';

  
  const tempSubtitle = range ? `Target ${range.temp_min}–${range.temp_max}°C` : null;
  const rhSubtitle = range ? `Target ${range.rh_min}–${range.rh_max}%` : null;
  const co2Subtitle = hasAnyCo2 ? `Target ${co2RangeLabel}` : 'No CO₂ range for this variety';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          
          <Chip tone={headerStatus.tone} text={headerStatus.text} />
        </View>
        <Text style={styles.headerSub}>{headerSubline}</Text>
        {!health && healthError ? (
          <Text style={[styles.subtle, { marginTop: 6 }]}>Unable to read sensor status.</Text>
        ) : null}
        {health && !health.online ? (
          <Text style={[styles.subtle, { marginTop: 6 }]}>
            No data received recently. Check ESP32 power/Wi-Fi and server IP.
          </Text>
        ) : null}

        <Card title="Live readings">
          <View style={styles.tileRow}>
            <StatTile
              label="Temp"
              value={reading?.temperature?.toFixed?.(1) ?? '-'}
              unit="°C"
              status={tempInRange === null ? 'muted' : tempInRange ? 'within' : 'out'}
              subtitle={tempSubtitle}
            />
            <StatTile
              label="RH"
              value={reading?.humidity?.toFixed?.(1) ?? '-'}
              unit="%"
              status={rhInRange === null ? 'muted' : rhInRange ? 'within' : 'out'}
              subtitle={rhSubtitle}
            />
          </View>

          <View style={{ height: 10 }} />

          <StatTile
            label="CO₂ (estimated)"
            value={co2Value?.toFixed?.(0) ?? '-'}
            unit="ppm"
            status={co2InRange === null ? 'muted' : co2InRange ? 'within' : 'out'}
            subtitle={co2Subtitle}
          />
        </Card>

        <Card title="Alerts">
          {activeAlerts.length > 0 ? (
            <View style={{ marginTop: 2 }}>
              {activeAlerts.map((a) => {
                const isTemp = a.param === 'temperature';
                const isHum = a.param === 'humidity';

                const delta =
                  range && reading
                    ? isTemp
                      ? deltaText(reading.temperature, range.temp_min, range.temp_max, '°C', 1)
                      : isHum
                      ? deltaText(reading.humidity, range.rh_min, range.rh_max, '%', 1)
                      : null
                    : null;

                const targetText =
                  range
                    ? isTemp
                      ? `Target ${range.temp_min}–${range.temp_max}°C`
                      : isHum
                      ? `Target ${range.rh_min}–${range.rh_max}%`
                      : null
                    : null;

                const cleanMessage = targetText
                  ? `${isTemp ? 'Temperature' : 'Humidity'} out of range. ${targetText}.`
                  : (a.last_message || 'Out of range');

                return (
                  <AlertRow
                    key={a.param}
                    title={isTemp ? 'Temperature' : isHum ? 'Humidity' : String(a.param)}
                    message={cleanMessage}
                    rightText={delta && delta !== 'Within range' ? delta : null}
                    severity="bad"
                  />
                );
              })}


            </View>
          ) : (
            <Text style={styles.subtle}>No active alerts.</Text>
          )}
        </Card>


        <Card title="Mushroom profile">
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Mushroom type</Text>
            <Pressable style={styles.selectBtn} onPress={() => setShowMushroomModal(true)}>
              <Text style={styles.selectBtnText}>{profile.mushroom_type ?? 'Select'}</Text>
            </Pressable>
          </View>

          <View style={[styles.rowBetween, { marginTop: 10 }]}>
            <Text style={styles.label}>Stage</Text>
            <Pressable style={styles.selectBtn} onPress={() => setShowStageModal(true)}>
              <Text style={styles.selectBtnText}>{stageLabel ?? 'Select'}</Text>
            </Pressable>
          </View>

          {range ? (
            <View style={{ marginTop: 14 }}>
              <Text style={[styles.sectionTitle, { marginTop: 8, marginBottom: 18 }]}>
                Optimal comparison
              </Text>


              <View style={styles.optRow}>
                <Text style={styles.optLeft}>Temp</Text>
                <Text style={styles.optMid}>
                  <Text style={styles.optMuted}>Target {range.temp_min}–{range.temp_max}°C</Text>
                </Text>
                <Text
                  style={[
                    styles.optRight,
                    tempInRange === null ? null : tempInRange ? styles.okText : styles.badText,
                  ]}
                >
                  {tempInRange === null ? '—' : tempInRange ? 'Within' : 'Out'}
                </Text>
              </View>

              <View style={[styles.optRow, { marginTop: 10 }]}>
                <Text style={styles.optLeft}>RH</Text>
                <Text style={styles.optMid}>
                  <Text style={styles.optMuted}>Target {range.rh_min}–{range.rh_max}%</Text>
                </Text>
                <Text
                  style={[
                    styles.optRight,
                    rhInRange === null ? null : rhInRange ? styles.okText : styles.badText,
                  ]}
                >
                  {rhInRange === null ? '—' : rhInRange ? 'Within' : 'Out'}
                </Text>
              </View>

              <View style={[styles.optRow, { marginTop: 10 }]}>
                <Text style={styles.optLeft}>CO₂</Text>
                <Text style={styles.optMid}>
                  <Text style={styles.optMuted}>
                    {hasAnyCo2 ? `Target ${co2RangeLabel}` : 'No target'}
                  </Text>
                </Text>
                <Text
                  style={[
                    styles.optRight,
                    co2InRange === null ? null : co2InRange ? styles.okText : styles.badText,
                  ]}
                >
                  {co2InRange === null ? '—' : co2InRange ? 'Within' : 'Out'}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.subtle}>Select mushroom type and stage to see optimal ranges.</Text>
          )}

        </Card>

        <Card title="Graphs">
          <View style={styles.segmentWrap}>
            <Pressable
              style={[styles.segmentBtn, graphMode === 'last_1h' && styles.segmentBtnActive]}
              onPress={() => setGraphMode('last_1h')}
            >
              <Text style={styles.segmentText}>Last 1h</Text>
            </Pressable>

            <Pressable
              style={[styles.segmentBtn, graphMode === 'date' && styles.segmentBtnActive]}
              onPress={async () => {
                setGraphMode('date');
                const datesRes = await fetchEnvironmentAvailableDates();
                const dates = datesRes.dates || [];
                setAvailableDates(dates);

                if (!selectedDate) {
                  const def = pickDefaultDate(dates);
                  if (def) setSelectedDate(def);
                }

                setShowDateModal(true);
              }}
            >
              <Text style={styles.segmentText}>Date</Text>
              <Text style={styles.segmentSub}>{dateForButtons}</Text>
            </Pressable>
          </View>

          <Text style={styles.subtle}>{graphHint}</Text>

          <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Temperature (0–45°C)</Text>
          <SimpleLineChart
            points={historyPoints}
            field="temperature"
            yMin={0}
            yMax={45}
            yTicks={[0, 15, 30, 45]}
          />

          <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Humidity (0–100%RH)</Text>
          <SimpleLineChart points={historyPoints} field="humidity" yMin={0} yMax={100} yTicks={[0, 50, 100]} />

          <Text style={[styles.sectionTitle, { marginTop: 12 }]}>CO₂ (0–5000 ppm)</Text>
          <SimpleLineChart points={historyPoints} field="co2" yMin={0} yMax={5000} yTicks={[0, 2500, 5000]} />
        </Card>

        <Card title="Variety recommendation">
          <View style={styles.segmentWrap}>
            <Pressable
              style={[styles.segmentBtn, recSource === 'current' && styles.segmentBtnActive]}
              onPress={() => setRecSource('current')}
            >
              <Text style={styles.segmentText}>Current</Text>
            </Pressable>

            <Pressable
              style={[styles.segmentBtn, recSource === 'last_1h' && styles.segmentBtnActive]}
              onPress={() => setRecSource('last_1h')}
            >
              <Text style={styles.segmentText}>Last 1h</Text>
            </Pressable>

            <Pressable
              style={[styles.segmentBtn, recSource === 'date' && styles.segmentBtnActive]}
              onPress={async () => {
                setRecSource('date');
                const datesRes = await fetchEnvironmentAvailableDates();
                const dates = datesRes.dates || [];
                setAvailableDates(dates);

                if (!selectedDate) {
                  const def = pickDefaultDate(dates);
                  if (def) setSelectedDate(def);
                }

                setShowRecDateModal(true);
              }}
            >
              <Text style={styles.segmentText}>Date</Text>
              <Text style={styles.segmentSub}>{dateForButtons}</Text>
            </Pressable>
          </View>

          <Text style={styles.subtle}>{recHint}</Text>

          <Pressable
            style={[styles.primaryBtn, recLoading && { opacity: 0.7 }]}
            onPress={() => loadRecommendation()}
            disabled={recLoading}
          >
            <Text style={styles.primaryBtnText}>{recLoading ? 'Loading...' : 'Get recommendation'}</Text>
          </Pressable>

          {recommendation?.temperature != null && recommendation?.humidity != null ? (
            <Text style={styles.subtle}>
              Used: Temp {recommendation.temperature.toFixed(1)}°C, RH {recommendation.humidity.toFixed(1)}%
              {recommendation.points_used ? ` (points: ${recommendation.points_used})` : ''}
            </Text>
          ) : (
            <Text style={styles.subtle}>No data available for the selected source yet.</Text>
          )}

          {recommendation?.recommendations?.length > 0 ? (
            <View style={{ marginTop: 10 }}>
              {(showAllRecs ? recommendation.recommendations : recommendation.recommendations.slice(0, 3)).map(
                (r, idx) => {
                  const key = `${r.mushroom_type}-${idx}`;
                  const expanded = recExpandedKey === key;

                  const parts = String(r.reason || '')
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean);

                  return (
                    <Pressable
                      key={key}
                      onPress={() => setRecExpandedKey(expanded ? null : key)}
                      style={[styles.recItem, expanded && styles.recItemExpanded]}
                    >
                      <View style={styles.recTopRow}>
                        <Text style={styles.recTitle}>
                          {idx + 1}. {r.mushroom_type}
                        </Text>

                        <View style={styles.recRightGroup}>
                          <Text style={styles.recScore}>{Number(r.score).toFixed(2)}</Text>
                          <Text style={styles.recChevron}>{expanded ? '▴' : '▾'}</Text>
                        </View>
                      </View>

                      {!expanded ? (
                        <Text style={styles.recHint} numberOfLines={1}>
                          {r.reason}
                        </Text>
                      ) : (
                        <View style={styles.recDetails}>
                          {parts.length > 0 ? (
                            parts.map((p, i) => (
                              <Text key={i} style={styles.recDetailText}>
                                {p}
                              </Text>
                            ))
                          ) : (
                            <Text style={styles.recDetailText}>No details available</Text>
                          )}
                        </View>
                      )}
                    </Pressable>
                  );

                }
              )}

              {recommendation.recommendations.length > 3 ? (
                <Pressable style={styles.showMoreBtn} onPress={() => setShowAllRecs((v) => !v)}>
                  <Text style={styles.showMoreText}>{showAllRecs ? 'Show top 3 only' : 'Show all'}</Text>
                </Pressable>
              ) : null}

              <Text style={[styles.subtle, { marginTop: 8 }]}>
                Lower score means a better match.
              </Text>
            </View>
          ) : null}

        </Card>

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
            setGraphMode('date');
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
            setRecSource('date');
            await loadRecommendation('date', item.key);
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1, paddingHorizontal: 16, paddingVertical: 16 },
  scrollContent: { paddingBottom: 120 },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: C.text, letterSpacing: 0.2 },
  headerSub: { marginTop: 6, color: C.muted, fontSize: 13 },

  subtle: { color: C.muted, marginTop: 10, fontSize: 12 },

  card: {
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  cardTitle: { color: C.text, fontWeight: '800', fontSize: 16 },

  sectionTitle: { color: C.text, fontWeight: '800', marginBottom: 8 },

  recRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recChevron: {
    color: C.faint,
    fontSize: 14,
    fontWeight: '900',
  },


  recItem: {
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  recItemExpanded: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.16)',
  },
  recTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  recHint: {
    color: C.muted,
    marginTop: 6,
    fontSize: 12,
    lineHeight: 16,
  },
  recTapText: {
    color: C.faint,
    marginTop: 8,
    fontSize: 11,
    fontWeight: '800',
  },
  recDetails: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  recDetailText: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  showMoreBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: 'rgba(0,0,0,0.10)',
    marginTop: 2,
  },
  showMoreText: {
    color: C.text,
    fontWeight: '900',
    fontSize: 12,
  },

  toggleBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderColor: 'rgba(255,255,255,0.22)',
  },
  toggleTextActive: {
    color: '#ffffff',
  },


  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0,0,0,0.10)',
  },

  chipText: { fontSize: 12, fontWeight: '800' },

  tileRow: { flexDirection: 'row', gap: 10 },
  tile: {
    flex: 1,
    backgroundColor: C.surface2,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  tileTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tileLabel: { color: C.muted, fontSize: 12, fontWeight: '700' },
  tileValue: { color: C.text, fontSize: 22, fontWeight: '900', marginTop: 8 },
  tileUnit: { color: C.muted, fontSize: 12, fontWeight: '800' },
  tileSub: { color: C.muted, fontSize: 12, marginTop: 6 },

  alertBanner: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 10,
  },
  alertDot: {
    width: 10,
    height: 10,
    borderRadius: 99,
    marginTop: 4,
  },
  
  alertTitle: { color: C.text, fontSize: 14, fontWeight: '900' },
  alertMsg: { color: C.muted, fontSize: 13, marginTop: 2 },
  alertRight: { fontSize: 13, fontWeight: '900', marginLeft: 8 },

  alertRow: { flexDirection: 'row', gap: 10, paddingVertical: 10 },
  

  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: C.muted, fontWeight: '700' },

  selectBtn: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: 'rgba(0,0,0,0.16)',
    maxWidth: 220,
  },
  selectBtnText: { color: C.text, fontWeight: '800' },

  okText: { color: C.ok, fontWeight: '900' },
  badText: { color: C.bad, fontWeight: '900' },

  optRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  optLeft: { width: 46, color: C.text, fontWeight: '900' },
  optMid: { flex: 1, color: C.text, fontWeight: '800' },
  optMuted: { color: C.muted, fontWeight: '700' },
  optRight: { minWidth: 54, textAlign: 'right', color: C.muted, fontWeight: '900' },
  optHint: { marginTop: 6, color: C.muted, fontSize: 12 },

  segmentWrap: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: 'rgba(0,0,0,0.12)',
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.18)',
  },
  segmentText: { color: C.text, fontWeight: '900' },
  segmentSub: { color: C.muted, fontSize: 11, marginTop: 2, fontWeight: '800' },

  primaryBtn: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: 'rgba(0,0,0,0.14)',
    alignItems: 'center',
  },
  primaryBtnText: { color: C.text, fontWeight: '900' },

  recRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 10,
  },
  recTitle: { color: C.text, fontWeight: '900' },
  recReason: { color: C.muted, marginTop: 4, fontSize: 12 },
  recScore: { color: C.text, fontWeight: '900', minWidth: 60, textAlign: 'right' },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0B1020',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    maxHeight: '80%',
  },
  modalTitle: { color: C.text, fontWeight: '900', marginBottom: 12, fontSize: 16 },
  modalItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  modalItemText: { color: C.text, fontWeight: '800' },
  modalEmpty: { color: C.muted, paddingVertical: 12, fontSize: 12 },
  modalCloseBtn: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  modalCloseText: { color: C.text, fontWeight: '900' },
});
