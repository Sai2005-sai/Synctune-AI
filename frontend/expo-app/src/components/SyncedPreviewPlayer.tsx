/**
 * SyncedPreviewPlayer.tsx
 *
 * Full-featured preview player that plays the video and synchronised
 * background music simultaneously.
 *
 * ARCHITECTURE
 * ────────────
 *   Video (expo-av)  ──[onPlaybackStatusUpdate]──► AudioSyncEngine
 *                                                       │
 *                          setVolumeAsync()  ◄──────────┘
 *                          crossfade / play / pause
 *
 * UI sections (top → bottom):
 *   1. Video frame -- expo-av Video, muted by default
 *   2. Sync Status overlay — "Now Playing", state badge, volume meter
 *   3. Segment progress rail — coloured blocks, active segment highlighted
 *   4. Transport controls — ⏮ Rewind | ▶/⏸ Play | 🔇 Toggle video audio
 *   5. Transition log — last N events (fade in, fade out, etc.)
 */

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Video, AVPlaybackStatus, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';
import { AudioSyncEngine, SyncStatus } from '../engine/audioSyncEngine';
import type { SegmentAssignment } from '../engine/audioVariationEngine';
import { fmtTime, SEGMENT_PALETTE } from '../engine/videoSegmenter';

interface Props {
  videoUri:     string;
  videoDuration: number;
  assignments:  SegmentAssignment[];
}

const STATE_CONFIG: Record<
  SyncStatus['state'],
  { label: string; color: string; icon: string }
> = {
  idle:          { label: 'Ready',         color: Colors.textMuted,   icon: 'radio-button-off' },
  loading:       { label: 'Loading…',      color: Colors.secondary,   icon: 'hourglass'        },
  playing:       { label: 'Playing',       color: Colors.success,     icon: 'musical-notes'    },
  paused:        { label: 'Paused',        color: Colors.warning,     icon: 'pause-circle'     },
  fading:        { label: 'Fading…',       color: '#F59E0B',          icon: 'radio-button-on'  },
  transitioning: { label: 'Transitioning', color: Colors.primary,     icon: 'git-branch'       },
  stopped:       { label: 'Stopped',       color: Colors.textMuted,   icon: 'stop-circle'      },
};

// ── Volume meter component ─────────────────────────────────────────────────────
function VolumeMeter({ volume }: { volume: number }) {
  const BAR_COUNT = 16;
  return (
    <View style={vmStyles.row}>
      {Array.from({ length: BAR_COUNT }, (_, i) => {
        const threshold = (i + 1) / BAR_COUNT;
        const active    = volume >= threshold;
        const color     =
          threshold > 0.8 ? '#EF4444'
          : threshold > 0.5 ? '#F59E0B'
          : Colors.success;
        return (
          <View
            key={i}
            style={[vmStyles.bar, { backgroundColor: active ? color : Colors.border }]}
          />
        );
      })}
    </View>
  );
}
const vmStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 16 },
  bar: { flex: 1, height: '100%', borderRadius: 2 },
});

// ── Segment rail ──────────────────────────────────────────────────────────────
function SegmentRail({
  assignments,
  videoDuration,
  currentIdx,
  positionSec,
}: {
  assignments:  SegmentAssignment[];
  videoDuration: number;
  currentIdx:   number;
  positionSec:  number;
}) {
  return (
    <View style={railStyles.wrap}>
      {assignments.map((a, idx) => {
        const pct     = (a.segment.duration / videoDuration) * 100;
        const isActive = idx === currentIdx;
        const progress =
          isActive
            ? Math.max(0, Math.min(1, (positionSec - a.segment.startTime) / a.segment.duration))
            : idx < currentIdx ? 1 : 0;
        return (
          <View
            key={a.segment.index}
            style={[railStyles.block, { flex: pct, opacity: isActive ? 1 : idx < currentIdx ? 0.5 : 0.2 }]}
          >
            <View style={[railStyles.fill, { width: `${progress * 100}%`, backgroundColor: a.segment.color }]} />
            <View style={[railStyles.track, { backgroundColor: a.segment.color + '33' }]} />
            {isActive && (
              <View style={[railStyles.label]}>
                <Text style={[railStyles.labelText, { color: a.segment.color }]} numberOfLines={1}>
                  {a.track.title}
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}
const railStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', height: 30, borderRadius: 10, overflow: 'hidden', gap: 2 },
  block: { position: 'relative', minWidth: 6 },
  track: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  label: { position: 'absolute', bottom: 2, left: 4, right: 4 },
  labelText: { fontSize: 8, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
});

// ── Main component ─────────────────────────────────────────────────────────────
export default function SyncedPreviewPlayer({ videoUri, videoDuration, assignments }: Props) {
  const videoRef   = useRef<any>(null);
  const engineRef  = useRef<AudioSyncEngine | null>(null);

  const [isPlaying,    setIsPlaying]    = useState(false);
  const [muteVideo,    setMuteVideo]    = useState(true);
  const [positionSec,  setPositionSec]  = useState(0);
  const [syncStatus,   setSyncStatus]   = useState<SyncStatus>({
    currentSegmentIdx: -1, currentTrackTitle: '—',
    volume: 0, state: 'idle', nextTrackTitle: null,
  });
  const [eventLog,     setEventLog]     = useState<string[]>([]);

  const headerFade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  // ── Create/destroy engine ─────────────────────────────────────────────────
  useEffect(() => {
    engineRef.current = new AudioSyncEngine(assignments, (status) => {
      setSyncStatus(status);
      // Append event to log for state transitions
      if (status.state === 'transitioning') {
        setEventLog((prev) => [
          `▶ Transition → ${status.currentTrackTitle}`,
          ...prev.slice(0, 5),
        ]);
      } else if (status.state === 'fading') {
        setEventLog((prev) => [`~ Fading out segment ${status.currentSegmentIdx + 1}`, ...prev.slice(0, 5)]);
      }
    });
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, [assignments]);

  // ── Video status handler ──────────────────────────────────────────────────
  const handleVideoStatus = useCallback(async (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    const posSec = (status.positionMillis ?? 0) / 1000;
    setPositionSec(posSec);
    setIsPlaying(status.isPlaying ?? false);

    if (status.isPlaying) {
      await engineRef.current?.handleVideoPosition(posSec, videoDuration);
    }
    if (status.didJustFinish) {
      setIsPlaying(false);
      await engineRef.current?.stop();
    }
  }, [videoDuration]);

  // ── Transport controls ────────────────────────────────────────────────────
  const handlePlayPause = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
        await engineRef.current?.pause();
      } else {
        await videoRef.current.playAsync();
        await engineRef.current?.play();
      }
    } catch (err) {
      console.warn('[SyncedPreview] Playback failed natively:', err);
    }
  }, [isPlaying]);

  const handleRewind = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      await videoRef.current.setPositionAsync(0);
      await engineRef.current?.reset();
      setPositionSec(0);
      setEventLog([]);
    } catch (err) {
      console.warn('[SyncedPreview] Rewind failed:', err);
    }
  }, []);

  const handleMuteToggle = () => {
    setMuteVideo((m) => !m);
  };

  const stateCfg = STATE_CONFIG[syncStatus.state];

  return (
    <LinearGradient colors={['#0A0A18', '#060610']} style={styles.card}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerFade }]}>
        <View style={styles.headerLeft}>
          <LinearGradient colors={Colors.gradientAnalyze} style={styles.headerIcon}>
            <Ionicons name="film" size={14} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={styles.headerTitle}>Synced Preview</Text>
            <Text style={styles.headerSub}>Video + Background Music</Text>
          </View>
        </View>
        {/* State badge */}
        <View style={[styles.stateBadge, { borderColor: stateCfg.color + '66' }]}>
          <Ionicons name={stateCfg.icon as any} size={10} color={stateCfg.color} />
          <Text style={[styles.stateText, { color: stateCfg.color }]}>{stateCfg.label}</Text>
        </View>
      </Animated.View>

      {/* Video frame */}
      <View style={styles.videoWrap}>
        <Video
          ref={videoRef}
          source={{ uri: videoUri }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          isMuted={muteVideo}
          progressUpdateIntervalMillis={200}
          onPlaybackStatusUpdate={handleVideoStatus}
          useNativeControls={false}
        />
        {/* Position overlay */}
        <View style={styles.posOverlay}>
          <Text style={styles.posText}>
            {fmtTime(positionSec)} / {fmtTime(videoDuration)}
          </Text>
        </View>
      </View>

      {/* Now Playing section */}
      <LinearGradient
        colors={[Colors.card, Colors.surfaceElevated]}
        style={styles.nowPlaying}
      >
        <Ionicons name="musical-note" size={13} color={Colors.primary} />
        <View style={styles.nowPlayingInfo}>
          <Text style={styles.nowPlayingLabel}>Now Playing</Text>
          <Text style={styles.nowPlayingTitle} numberOfLines={1}>
            {syncStatus.currentTrackTitle}
          </Text>
          {syncStatus.nextTrackTitle && (
            <Text style={styles.nextTrack}>
              Next → {syncStatus.nextTrackTitle}
            </Text>
          )}
        </View>
        <View style={styles.volumeSection}>
          <Text style={styles.volumeLabel}>VOL</Text>
          <VolumeMeter volume={syncStatus.volume} />
          <Text style={styles.volumePct}>
            {Math.round(syncStatus.volume * 100)}%
          </Text>
        </View>
      </LinearGradient>

      {/* Segment progress rail */}
      <View style={styles.railSection}>
        <Text style={styles.sectionMini}>SEGMENT PROGRESS</Text>
        <SegmentRail
          assignments={assignments}
          videoDuration={videoDuration}
          currentIdx={syncStatus.currentSegmentIdx}
          positionSec={positionSec}
        />
        <View style={styles.railLegend}>
          {assignments.map((a, idx) => (
            <View key={idx} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: a.segment.color }]} />
              <Text style={styles.legendLabel} numberOfLines={1}>{a.segment.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Transport controls */}
      <View style={styles.controls}>
        {/* Rewind */}
        <TouchableOpacity style={styles.controlBtn} onPress={handleRewind} activeOpacity={0.7}>
          <LinearGradient colors={[Colors.card, Colors.surfaceElevated]} style={styles.controlBtnGrad}>
            <Ionicons name="play-skip-back" size={20} color={Colors.textSecondary} />
          </LinearGradient>
          <Text style={styles.controlLabel}>Rewind</Text>
        </TouchableOpacity>

        {/* Play / Pause — primary action */}
        <TouchableOpacity style={styles.playPauseWrap} onPress={handlePlayPause} activeOpacity={0.8}>
          <LinearGradient colors={Colors.gradientPrimary} style={styles.playPauseBtn}>
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={28} color="#fff" />
          </LinearGradient>
          <Text style={styles.controlLabel}>{isPlaying ? 'Pause' : 'Play'}</Text>
        </TouchableOpacity>

        {/* Mute video audio toggle */}
        <TouchableOpacity style={styles.controlBtn} onPress={handleMuteToggle} activeOpacity={0.7}>
          <LinearGradient
            colors={muteVideo ? [Colors.card, Colors.surfaceElevated] : [Colors.success + '33', Colors.success + '11']}
            style={[styles.controlBtnGrad, !muteVideo && { borderColor: Colors.success }]}
          >
            <Ionicons name={muteVideo ? 'volume-mute' : 'volume-high'} size={20} color={muteVideo ? Colors.textSecondary : Colors.success} />
          </LinearGradient>
          <Text style={styles.controlLabel}>{muteVideo ? 'Video Muted' : 'Video Audio'}</Text>
        </TouchableOpacity>
      </View>

      {/* Fade/transition info chips */}
      {assignments.length > 1 && (
        <View style={styles.infoChips}>
          <View style={styles.infoChip}>
            <Ionicons name="swap-horizontal" size={11} color={Colors.primary} />
            <Text style={styles.infoChipText}>Crossfade: 0.6s out / 0.7s in</Text>
          </View>
          <View style={styles.infoChip}>
            <Ionicons name="cut" size={11} color={Colors.secondary} />
            <Text style={styles.infoChipText}>{assignments.length} segments</Text>
          </View>
          <View style={styles.infoChip}>
            <Ionicons name="trending-down" size={11} color={Colors.warning} />
            <Text style={styles.infoChipText}>Fade out at end</Text>
          </View>
        </View>
      )}

      {/* Event log */}
      {eventLog.length > 0 && (
        <View style={styles.logSection}>
          <Text style={styles.sectionMini}>TRANSITION LOG</Text>
          {eventLog.map((e, i) => (
            <Text key={i} style={[styles.logEntry, { opacity: 1 - i * 0.15 }]}>
              {e}
            </Text>
          ))}
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 14,
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
  },
  headerIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerSub: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  stateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stateText: {
    fontSize: 11,
    fontWeight: '700',
  },
  videoWrap: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
    aspectRatio: 16 / 9,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  posOverlay: {
    position: 'absolute',
    bottom: 6,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  posText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  nowPlaying: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  nowPlayingInfo: {
    flex: 1,
    gap: 2,
  },
  nowPlayingLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  nowPlayingTitle: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  nextTrack: {
    color: Colors.textMuted,
    fontSize: 10,
    fontStyle: 'italic',
  },
  volumeSection: {
    alignItems: 'flex-end',
    gap: 3,
  },
  volumeLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  volumePct: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  railSection: {
    gap: 6,
  },
  sectionMini: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  railLegend: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  legendLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-evenly',
    paddingVertical: 4,
  },
  controlBtn: {
    alignItems: 'center',
    gap: 5,
  },
  controlBtnGrad: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseWrap: {
    alignItems: 'center',
    gap: 5,
  },
  playPauseBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 10,
  },
  controlLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoChipText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  logSection: {
    gap: 3,
  },
  logEntry: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: 'monospace',
  },
});
