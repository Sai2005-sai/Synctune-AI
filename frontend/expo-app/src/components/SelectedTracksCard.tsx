/**
 * SelectedTracksCard.tsx
 *
 * Displays the 2–3 AI-selected local music tracks before they are applied.
 * Each track row shows:
 *   • Rank badge
 *   • Title + mood + real duration from file metadata
 *   • BPM chip
 *   • Play/Pause button (expo-av Sound — real playback from local file)
 *   • "Apply" button
 * The component manages its own Sound instances so only one track plays at a time.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';
import WaveformVisualizer from './WaveformVisualizer';
import MoodBadge from './MoodBadge';
import type { LoadedTrack } from '../engine/musicLoader';
import { createAudioPlayer, IAudioPlayer } from '../engine/audioPlayer';

interface Props {
  tracks: LoadedTrack[];
  onApply?: (track: LoadedTrack) => void;
}

const MOOD_ACCENT: Record<string, string> = {
  happy:     '#F59E0B',
  sad:       '#6366F1',
  energetic: '#F97316',
  calm:      '#10B981',
  cinematic: '#7C3AED',
};

// ── Individual track row ──────────────────────────────────────────────────────
function TrackRow({
  track,
  rank,
  activeId,
  onPlayToggle,
  onApply,
}: {
  track: LoadedTrack;
  rank: number;
  activeId: string | null;
  onPlayToggle: (id: string) => void;
  onApply: (track: LoadedTrack) => void;
}) {
  const accent    = MOOD_ACCENT[track.mood] ?? Colors.primary;
  const isPlaying = activeId === track.id;

  // Animate entry
  const slideAnim = useRef(new Animated.Value(30)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, delay: (rank - 1) * 120, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 55, delay: (rank - 1) * 120, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View style={[styles.row, isPlaying && { borderColor: accent }]}>
        {/* Rank badge */}
        <LinearGradient
          colors={[accent + '33', accent + '11']}
          style={[styles.rankBadge, { borderColor: accent + '55' }]}
        >
          <Text style={[styles.rankText, { color: accent }]}>{rank}</Text>
        </LinearGradient>

        {/* Track info */}
        <View style={styles.info}>
          <View style={styles.titleLine}>
            <Text style={styles.title} numberOfLines={1}>{track.title}</Text>
            {isPlaying && (
              <View style={[styles.nowPlayingDot, { backgroundColor: accent }]} />
            )}
          </View>

          <View style={styles.metaLine}>
            <MoodBadge mood={track.mood} size="sm" />
            <View style={styles.chip}>
              <Text style={styles.chipText}>{track.bpm} BPM</Text>
            </View>
            <View style={styles.chip}>
              <Ionicons name="time-outline" size={10} color={Colors.textMuted} />
              <Text style={styles.chipText}>{track.durationLabel}</Text>
            </View>
          </View>

          {/* Waveform when playing */}
          {isPlaying && (
            <WaveformVisualizer
              isPlaying
              color={accent}
              barCount={22}
              height={22}
            />
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.playBtn, { borderColor: accent }]}
            onPress={() => onPlayToggle(track.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={16}
              color={accent}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.applyBtn, { backgroundColor: accent }]}
            onPress={() => onApply(track)}
            activeOpacity={0.8}
          >
            <Text style={styles.applyText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

// ── Main exported component ───────────────────────────────────────────────────
export default function SelectedTracksCard({ tracks, onApply }: Props) {
  const [activeId, setActiveId]   = useState<string | null>(null);
  const [loading,  setLoading]    = useState<string | null>(null);
  const [appliedId, setAppliedId] = useState<string | null>(null);
  const playerRef = useRef<IAudioPlayer | null>(null);

  // Header slide-in
  const headFade  = useRef(new Animated.Value(0)).current;
  const headSlide = useRef(new Animated.Value(-12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(headFade,  { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(headSlide, { toValue: 0, friction: 7, tension: 60, useNativeDriver: true }),
    ]).start();
  }, []);

  const stopCurrent = async () => {
    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }
    setActiveId(null);
  };

  const handlePlayToggle = useCallback(async (id: string) => {
    if (activeId === id) {
      await stopCurrent();
      return;
    }

    await stopCurrent();

    const track = tracks.find((t) => t.id === id);
    if (!track) return;

    setLoading(id);
    try {
      if (!track.resolvedUri) {
        console.warn('[SelectedTracksCard] No resolved URI for', track.title);
        return;
      }
      
      const player = createAudioPlayer();
      playerRef.current = player;
      
      player.setOnEnded(() => {
        stopCurrent();
      });

      await player.play(track.resolvedUri, 0, 1.0);
      setActiveId(id);
      
    } catch (err) {
      console.warn('[SelectedTracksCard] Playback error:', err);
    } finally {
      setLoading(null);
    }
  }, [activeId, tracks]);

  const handleApply = useCallback((track: LoadedTrack) => {
    setAppliedId(track.id);
    stopCurrent();
    onApply?.(track);
  }, [onApply]);

  // Cleanup on unmount
  useEffect(() => () => { stopCurrent(); }, []);

  if (tracks.length === 0) return null;

  return (
    <LinearGradient colors={['#0E0E1C', '#080810']} style={styles.card}>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          { opacity: headFade, transform: [{ translateY: headSlide }] },
        ]}
      >
        <View style={styles.headerLeft}>
          <LinearGradient colors={Colors.gradientPrimary} style={styles.headerIcon}>
            <Ionicons name="sparkles" size={14} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={styles.headerTitle}>AI Selected Tracks</Text>
            <Text style={styles.headerSub}>
              {tracks.length} track{tracks.length > 1 ? 's' : ''} matched your video's mood
            </Text>
          </View>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{tracks.length}</Text>
        </View>
      </Animated.View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Track rows */}
      <View style={styles.trackList}>
        {tracks.map((track, idx) => (
          loading === track.id ? (
            <View key={track.id} style={[styles.row, styles.loadingRow]}>
              <ActivityIndicator size="small" color={MOOD_ACCENT[track.mood] ?? Colors.primary} />
              <Text style={styles.loadingText}>Loading "{track.title}"…</Text>
            </View>
          ) : (
            <TrackRow
              key={track.id}
              track={track}
              rank={idx + 1}
              activeId={activeId}
              onPlayToggle={handlePlayToggle}
              onApply={handleApply}
            />
          )
        ))}
      </View>

      {/* Applied confirmation */}
      {appliedId && (
        <Animated.View style={styles.appliedBanner}>
          <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
          <Text style={styles.appliedText}>
            "{tracks.find((t) => t.id === appliedId)?.title}" applied to your video
          </Text>
        </Animated.View>
      )}

      {/* Footer hint */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="play" size={10} color={Colors.textMuted} style={{ marginRight: 4 }} />
        <Text style={styles.footerHint}>
          Tap play to preview • Tap Apply to select
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
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
  countBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  trackList: {
    gap: 10,
  },
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
  loadingRow: {
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rankText: {
    fontSize: 13,
    fontWeight: '800',
  },
  info: {
    flex: 1,
    gap: 5,
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  nowPlayingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  metaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  playBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  appliedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.success + '15',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.success + '40',
  },
  appliedText: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  footerHint: {
    color: Colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
