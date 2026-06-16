/**
 * ExportPanel.tsx
 *
 * Premium export UI — triggered from the HomeScreen results section.
 * Handles both web (WAV download) and native (gallery + share) export flows.
 *
 * Layout (top → bottom):
 *   1. Header — "Export Final Video" + close toggle
 *   2. Summary — # segments, unique tracks, sync note
 *   3. Export buttons — platform-aware primary action + share
 *   4. Progress view — animated phase steps + progress bar + message
 *   5. Result view — download link (web) or success card (native) + copy plan
 */

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';
import {
  exportWithBGM,
  ExportProgress,
  ExportResult,
  ExportPhase,
} from '../engine/audioExportEngine';
import type { SegmentAssignment } from '../engine/audioVariationEngine';

interface Props {
  videoUri:       string;
  videoDuration:  number;
  assignments:    SegmentAssignment[];
  onClose?:       () => void;
}

// ── Phase display config ──────────────────────────────────────────────────────
const PHASE_STEPS: { phase: ExportPhase; label: string; icon: string }[] = [
  { phase: 'preparing', label: 'Preparing',  icon: 'settings-outline'       },
  { phase: 'rendering', label: 'Rendering',  icon: 'musical-notes-outline'  },
  { phase: 'encoding',  label: 'Encoding',   icon: 'code-working-outline'   },
  { phase: 'saving',    label: 'Saving',     icon: 'cloud-upload-outline'   },
  { phase: 'done',      label: 'Complete',   icon: 'checkmark-circle-outline'},
];

const PHASE_ORDER: ExportPhase[] = ['preparing', 'rendering', 'encoding', 'saving', 'done'];

function phaseIndex(p: ExportPhase): number {
  return PHASE_ORDER.indexOf(p);
}

// ── Animated progress bar ─────────────────────────────────────────────────────
function ProgressBar({ progress }: { progress: number }) {
  const fillAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(fillAnim, { toValue: progress, friction: 8, tension: 50, useNativeDriver: false }).start();
  }, [progress]);

  return (
    <View style={pbStyles.track}>
      <Animated.View
        style={[
          pbStyles.fill,
          { width: fillAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
        ]}
      />
    </View>
  );
}
const pbStyles = StyleSheet.create({
  track: { height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  fill:  { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
});

// ── Phase stepper ─────────────────────────────────────────────────────────────
function PhaseStepper({ currentPhase }: { currentPhase: ExportPhase }) {
  const currentIdx = phaseIndex(currentPhase);
  return (
    <View style={psStyles.row}>
      {PHASE_STEPS.map((step, idx) => {
        const done   = idx < currentIdx;
        const active = idx === currentIdx;
        const color  = done ? Colors.success : active ? Colors.primary : Colors.textMuted;
        return (
          <View key={step.phase} style={psStyles.step}>
            <View style={[psStyles.circle, { borderColor: color, backgroundColor: done ? Colors.success + '22' : active ? Colors.primary + '22' : 'transparent' }]}>
              <Ionicons
                name={(done ? 'checkmark' : step.icon) as any}
                size={11}
                color={color}
              />
            </View>
            <Text style={[psStyles.label, { color }]} numberOfLines={1}>
              {step.label}
            </Text>
            {idx < PHASE_STEPS.length - 1 && (
              <View style={[psStyles.connector, { backgroundColor: done ? Colors.success : Colors.border }]} />
            )}
          </View>
        );
      })}
    </View>
  );
}
const psStyles = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'flex-start', gap: 0 },
  step:      { flex: 1, alignItems: 'center', gap: 4, position: 'relative' },
  circle:    { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  label:     { fontSize: 9, fontWeight: '600', textAlign: 'center', letterSpacing: 0.3 },
  connector: { position: 'absolute', top: 13, left: '55%', right: '-45%', height: 1.5 },
});

// ── Main component ─────────────────────────────────────────────────────────────
export default function ExportPanel({ videoUri, videoDuration, assignments, onClose }: Props) {
  const [phase,      setPhase]      = useState<ExportPhase>('idle');
  const [progress,   setProgress]   = useState(0);
  const [message,    setMessage]    = useState('');
  const [result,     setResult]     = useState<ExportResult | null>(null);
  const [isExporting,setIsExporting]= useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }).start();
  }, []);

  const uniqueTracks = new Set(assignments.map((a) => a.track.id)).size;
  const isWeb        = Platform.OS === 'web';

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    setResult(null);

    const res = await exportWithBGM(
      videoUri,
      assignments,
      videoDuration,
      (p: ExportProgress) => {
        setPhase(p.phase);
        setProgress(p.progress);
        setMessage(p.message);
      },
    );
    setResult(res);
    setIsExporting(false);
  }, [videoUri, assignments, videoDuration]);

  // Web download trigger
  const handleDownloadWAV = useCallback(() => {
    if (!result?.wavUrl) return;
    const link = document.createElement('a');
    link.href     = result.wavUrl;
    link.download = result.filename ?? 'bgm_mix.wav';
    link.click();
  }, [result]);

  const isInProgress = isExporting && phase !== 'idle' && phase !== 'done' && phase !== 'error';

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <LinearGradient colors={['#08080F', '#0C0C1C']} style={styles.card}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <LinearGradient colors={['#F97316', '#EF4444']} style={styles.headerIcon}>
              <Ionicons name="download" size={14} color="#fff" />
            </LinearGradient>
            <View>
              <Text style={styles.headerTitle}>Export Final Video</Text>
              <Text style={styles.headerSub}>
                {isWeb ? 'Web: Real WAV audio mix download' : 'Native: Save to gallery + BGM plan'}
              </Text>
            </View>
          </View>
          {onClose && (
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Export summary ── */}
        <View style={styles.summaryRow}>
          {[
            { icon: 'play-skip-forward', label: `${assignments.length} Segments`, color: Colors.primary },
            { icon: 'musical-note',      label: `${uniqueTracks} Track${uniqueTracks > 1 ? 's' : ''}`, color: Colors.secondary },
            { icon: 'swap-horizontal',   label: '0.6s / 0.7s Fade',   color: Colors.success },
            { icon: 'timer-outline',     label: `${videoDuration.toFixed(1)}s Duration`, color: Colors.warning },
          ].map((item) => (
            <View key={item.label} style={styles.summaryChip}>
              <Ionicons name={item.icon as any} size={11} color={item.color} />
              <Text style={[styles.summaryText, { color: item.color }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Sync accuracy note ── */}
        <View style={styles.syncNote}>
          <Ionicons name="information-circle-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.syncNoteText}>
            {isWeb
              ? 'OfflineAudioContext renders each segment from its exact audioStartTime offset with matching fade envelopes — bit-for-bit sync with the preview.'
              : 'The BGM plan JSON contains millisecond-precise timing for each segment, matching the live preview engine.'}
          </Text>
        </View>

        {/* ── Segment timing preview ── */}
        <View style={styles.timingTable}>
          <View style={styles.timingHeader}>
            <Text style={[styles.timingCell, styles.timingHead, { flex: 1.2 }]}>Segment</Text>
            <Text style={[styles.timingCell, styles.timingHead, { flex: 1.5 }]}>Track</Text>
            <Text style={[styles.timingCell, styles.timingHead]}>Video</Text>
            <Text style={[styles.timingCell, styles.timingHead]}>Offset</Text>
          </View>
          {assignments.map((a, idx) => (
            <View key={idx} style={[styles.timingRow, idx % 2 === 0 && styles.timingRowAlt]}>
              <View style={styles.timingSegCell}>
                <View style={[styles.timingDot, { backgroundColor: a.segment.color }]} />
                <Text style={styles.timingCell}>{a.segment.label}</Text>
              </View>
              <Text style={[styles.timingCell, { flex: 1.5, color: Colors.textSecondary }]} numberOfLines={1}>
                {a.track.title}
              </Text>
              <Text style={styles.timingCell}>
                {a.segment.startTime.toFixed(1)}–{a.segment.endTime.toFixed(1)}s
              </Text>
              <Text style={[styles.timingCell, { color: Colors.secondary }]}>
                {a.offsetLabel.replace('▶ from ', '')}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Export button ── */}
        {!isInProgress && phase !== 'done' && (
          <TouchableOpacity
            style={[styles.exportBtn, (isExporting) && styles.exportBtnDisabled]}
            onPress={handleExport}
            disabled={isExporting}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isWeb ? ['#F97316', '#EF4444'] : ['#7C3AED', '#06B6D4']}
              style={styles.exportBtnInner}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <Ionicons name={isWeb ? 'musical-notes' : 'save'} size={20} color="#fff" />
              <Text style={styles.exportBtnText}>
                {isWeb ? 'Render & Download Audio Mix (WAV)' : 'Save to Gallery + Share BGM Plan'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* ── Progress view ── */}
        {isInProgress && (
          <View style={styles.progressSection}>
            <PhaseStepper currentPhase={phase} />
            <ProgressBar progress={progress} />
            <Text style={styles.progressMessage}>{message}</Text>
          </View>
        )}

        {/* ── Done: result view ── */}
        {phase === 'done' && result?.success && (
          <View style={styles.successSection}>
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
              <View style={styles.successText}>
                <Text style={styles.successTitle}>Export Complete!</Text>
                <Text style={styles.successSub}>{message}</Text>
              </View>
            </View>

            {/* Web: download WAV */}
            {isWeb && result.wavUrl && (
              <TouchableOpacity
                style={styles.downloadBtn}
                onPress={handleDownloadWAV}
                activeOpacity={0.8}
              >
                <LinearGradient colors={['#10B981', '#059669']} style={styles.downloadBtnInner}>
                  <Ionicons name="download" size={18} color="#fff" />
                  <Text style={styles.downloadBtnText}>Download {result.filename ?? 'bgm_mix.wav'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Web: additional note */}
            {isWeb && (
              <View style={styles.webNote}>
                <Ionicons name="videocam-outline" size={12} color={Colors.textMuted} />
                <Text style={styles.webNoteText}>
                  Import this WAV into your video editor (e.g. CapCut, Premiere, DaVinci) and place it on the audio track — the timing is already matched to the scene cuts.
                </Text>
              </View>
            )}

            {/* Retry button */}
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => { setPhase('idle'); setProgress(0); setMessage(''); setResult(null); }}
            >
              <Ionicons name="refresh" size={14} color={Colors.textMuted} />
              <Text style={styles.retryText}>Export Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Error view ── */}
        {phase === 'error' && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={16} color={Colors.error ?? '#EF4444'} />
            <Text style={styles.errorText}>{message}</Text>
            <TouchableOpacity onPress={() => { setPhase('idle'); setProgress(0); setResult(null); }}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerSub: {
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 1,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  summaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  syncNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: Colors.primary + '0D',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.primary + '25',
  },
  syncNoteText: {
    color: Colors.textSecondary,
    fontSize: 11,
    lineHeight: 17,
    flex: 1,
  },
  timingTable: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timingHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 4,
  },
  timingHead: {
    color: Colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontSize: 9,
  },
  timingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 4,
  },
  timingRowAlt: {
    backgroundColor: Colors.card,
  },
  timingSegCell: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  timingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    flexShrink: 0,
  },
  timingCell: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  exportBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  exportBtnDisabled: {
    opacity: 0.5,
  },
  exportBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  exportBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  progressSection: {
    gap: 10,
  },
  progressMessage: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  successSection: {
    gap: 10,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.success + '15',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.success + '40',
  },
  successText: {
    flex: 1,
  },
  successTitle: {
    color: Colors.success,
    fontSize: 14,
    fontWeight: '800',
  },
  successSub: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  downloadBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  downloadBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  downloadBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  webNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  webNoteText: {
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  retryText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EF444415',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EF444440',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    flex: 1,
  },
});
