/**
 * SegmentTimelineCard.tsx
 *
 * Visual display of the dynamic audio variation plan:
 *
 *   ┌──────────────────────────────────────┐
 *   │  🎬 Audio Variation Plan             │
 *   │  3 segments · 3 different tracks     │
 *   │                                      │
 *   │  ████████ ████████████ █████████     │  ← proportional timeline bar
 *   │   Seg 1     Seg 2       Seg 3        │
 *   │                                      │
 *   │  [1] Segment 1  0:00→0:18            │
 *   │      Drums  •  ▶ from 0:23  •  ▶    │
 *   │  [2] Segment 2  0:18→0:41            │
 *   │      Rhythmic D  •  ▶ from 1:05 • ▶  │
 *   │  …                                   │
 *   └──────────────────────────────────────┘
 *
 * Tapping the ▶ button plays that track from its assigned audioStartTime
 * via expo-av Sound.createAsync with positionMillis set.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';
import { fmtTime } from '../engine/videoSegmenter';
import type { SegmentAssignment } from '../engine/audioVariationEngine';
import { createAudioPlayer, IAudioPlayer } from '../engine/audioPlayer';

interface Props {
  assignments: SegmentAssignment[];
  videoDuration: number;
}

// ── Timeline bar ──────────────────────────────────────────────────────────────
function TimelineBar({
  assignments,
  videoDuration,
  activeIdx,
  onSegmentPress,
}: {
  assignments: SegmentAssignment[];
  videoDuration: number;
  activeIdx: number | null;
  onSegmentPress: (idx: number) => void;
}) {
  return (
    <View style={tlStyles.wrap}>
      {assignments.map((a, idx) => {
        const widthPct = (a.segment.duration / videoDuration) * 100;
        const isActive = activeIdx === idx;
        return (
          <TouchableOpacity
            key={a.segment.index}
            activeOpacity={0.75}
            onPress={() => onSegmentPress(idx)}
            style={[
              tlStyles.block,
              { width: `${widthPct}%`, backgroundColor: a.segment.color },
              isActive && tlStyles.blockActive,
            ]}
          >
            <Text style={tlStyles.blockLabel} numberOfLines={1}>
              {a.segment.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tlStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
    gap: 2,
    backgroundColor: Colors.card,
  },
  block: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 24,
    paddingHorizontal: 4,
  },
  blockActive: {
    opacity: 1,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  blockLabel: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

// ── Individual segment assignment row ─────────────────────────────────────────
function AssignmentRow({
  assignment,
  index,
  isActive,
  isLoading,
  onPlay,
}: {
  assignment: SegmentAssignment;
  index: number;
  isActive: boolean;
  isLoading: boolean;
  onPlay: () => void;
}) {
  const { segment, track, offsetLabel, audioStartTime } = assignment;
  const accent = segment.color;

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 380, delay: index * 100, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8,   delay: index * 100, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View style={[arStyles.row, isActive && { borderColor: accent }]}>
        {/* Colour swatch + segment index */}
        <View style={[arStyles.swatch, { backgroundColor: accent }]}>
          <Text style={arStyles.swatchNum}>{index + 1}</Text>
        </View>

        {/* Main content */}
        <View style={arStyles.content}>
          {/* Segment label + time range */}
          <View style={arStyles.topLine}>
            <Text style={arStyles.segLabel}>{segment.label}</Text>
            <Text style={arStyles.timeRange}>
              {fmtTime(segment.startTime)} → {fmtTime(segment.endTime)}
            </Text>
            <View style={[arStyles.durationPill, { borderColor: accent + '66' }]}>
              <Text style={[arStyles.durationText, { color: accent }]}>
                {segment.duration.toFixed(1)}s
              </Text>
            </View>
          </View>

          {/* Track + offset */}
          <View style={arStyles.bottomLine}>
            <Ionicons name="musical-note" size={11} color={Colors.textMuted} />
            <Text style={arStyles.trackName} numberOfLines={1}>
              {track.title}
            </Text>
            <View style={arStyles.offsetPill}>
              <Ionicons name="play-skip-forward" size={9} color={Colors.textMuted} />
              <Text style={arStyles.offsetText}>{offsetLabel}</Text>
            </View>
            <View style={arStyles.bpmPill}>
              <Text style={arStyles.bpmText}>{track.bpm} BPM</Text>
            </View>
          </View>

          {/* Motion bar */}
          <View style={arStyles.motionWrap}>
            <Text style={arStyles.motionLabel}>Motion</Text>
            <View style={arStyles.motionTrack}>
              <View
                style={[
                  arStyles.motionFill,
                  { width: `${segment.motionScore * 100}%`, backgroundColor: accent },
                ]}
              />
            </View>
            <Text style={[arStyles.motionPct, { color: accent }]}>
              {(segment.motionScore * 100).toFixed(0)}%
            </Text>
          </View>
        </View>

        {/* Preview play button */}
        <TouchableOpacity
          style={[arStyles.playBtn, { borderColor: accent }]}
          onPress={onPlay}
          activeOpacity={0.7}
        >
          {isLoading ? (
            <Ionicons name="hourglass" size={14} color={accent} />
          ) : (
            <Ionicons name={isActive ? 'pause' : 'play'} size={14} color={accent} />
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const arStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  swatch: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  swatchNum: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  segLabel: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  timeRange: {
    color: Colors.textSecondary,
    fontSize: 11,
    flex: 1,
  },
  durationPill: {
    borderWidth: 1,
    borderRadius: 7,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  durationText: {
    fontSize: 10,
    fontWeight: '700',
  },
  bottomLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexWrap: 'wrap',
  },
  trackName: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  offsetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 7,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  offsetText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  bpmPill: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 7,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bpmText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  motionWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  motionLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
    width: 36,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  motionTrack: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  motionFill: {
    height: '100%',
    borderRadius: 2,
    opacity: 0.75,
  },
  motionPct: {
    fontSize: 9,
    fontWeight: '700',
    width: 28,
    textAlign: 'right',
  },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});

// ── Main exported component ───────────────────────────────────────────────────
export default function SegmentTimelineCard({ assignments, videoDuration }: Props) {
  const [activeIdx, setActiveIdx]   = useState<number | null>(null);
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null);
  const playerRef = useRef<IAudioPlayer | null>(null);

  const headFade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(headFade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const stopCurrent = async () => {
    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }
    setActiveIdx(null);
  };

  const handlePlay = useCallback(async (idx: number) => {
    if (activeIdx === idx) { await stopCurrent(); return; }
    await stopCurrent();

    const asn = assignments[idx];
    if (!asn) return;

    setLoadingIdx(idx);
    try {
      if (!asn.track.resolvedUri) {
        console.warn('[SegmentTimelineCard] No resolved URI for', asn.track.title);
        return;
      }
      
      const player = createAudioPlayer();
      playerRef.current = player;
      
      player.setOnEnded(() => {
        stopCurrent();
      });

      await player.play(asn.track.resolvedUri, asn.audioStartTime, 1.0);
      setActiveIdx(idx);
      
    } catch (err) {
      console.warn('[SegmentTimelineCard] Playback error:', err);
    } finally {
      setLoadingIdx(null);
    }
  }, [activeIdx, assignments]);

  useEffect(() => () => { stopCurrent(); }, []);

  if (assignments.length === 0) return null;

  const uniqueTracks = new Set(assignments.map((a) => a.track.id)).size;

  return (
    <LinearGradient colors={['#0C0C1A', '#080810']} style={styles.card}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headFade }]}>
        <View style={styles.headerLeft}>
          <LinearGradient colors={['#7C3AED', '#06B6D4']} style={styles.headerIcon}>
            <Ionicons name="git-branch" size={14} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={styles.headerTitle}>Audio Variation Plan</Text>
            <Text style={styles.headerSub}>
              {assignments.length} segment{assignments.length > 1 ? 's' : ''} ·{' '}
              {uniqueTracks} different track{uniqueTracks > 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        <View style={styles.segCountBadge}>
          <Text style={styles.segCountText}>{assignments.length}</Text>
        </View>
      </Animated.View>

      {/* Proportion timeline bar */}
      <TimelineBar
        assignments={assignments}
        videoDuration={videoDuration}
        activeIdx={activeIdx}
        onSegmentPress={handlePlay}
      />

      {/* Colour legend */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.legendRow}
      >
        {assignments.map((a) => (
          <View key={a.segment.index} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: a.segment.color }]} />
            <Text style={styles.legendLabel}>{a.segment.label}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Assignment rows */}
      <View style={styles.rowList}>
        {assignments.map((asn, idx) => (
          <AssignmentRow
            key={`${asn.segment.index}-${asn.variationIndex}`}
            assignment={asn}
            index={idx}
            isActive={activeIdx === idx}
            isLoading={loadingIdx === idx}
            onPlay={() => handlePlay(idx)}
          />
        ))}
      </View>

      {/* Footer hint */}
      <Text style={styles.footerHint}>
        Tap a timeline block or ▶ to preview each segment's assigned audio
      </Text>
    </LinearGradient>
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
    marginTop: 1,
  },
  segCountBadge: {
    backgroundColor: '#7C3AED',
    borderRadius: 10,
    minWidth: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  segCountText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  legendRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  rowList: {
    gap: 8,
  },
  footerHint: {
    color: Colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
