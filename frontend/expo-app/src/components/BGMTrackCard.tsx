import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import type { MatchedTrack } from '../engine/bgmMatcher';
import WaveformVisualizer from './WaveformVisualizer';
import MoodBadge from './MoodBadge';
import { resolveAssetUri } from '../engine/assetResolver';
import { createAudioPlayer, IAudioPlayer } from '../engine/audioPlayer';

interface Props {
  track: MatchedTrack;
  rank: number;
  onSelect?: (track: MatchedTrack) => void;
}

export default function BGMTrackCard({ track, rank, onSelect }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState(false);
  const playerRef = React.useRef<IAudioPlayer | null>(null);

  React.useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, []);

  const handlePlay = async () => {
    if (isLoading) return;
    
    // Stop if currently playing
    if (isPlaying && playerRef.current) {
      await playerRef.current.stop();
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    try {
      // Create player if missing
      if (!playerRef.current) {
        playerRef.current = createAudioPlayer();
        playerRef.current.setOnEnded(() => setIsPlaying(false));
      }

      // Resolve the real URI on the fly for playback
      const uri = await resolveAssetUri(track.asset);
      await playerRef.current.play(uri, 0, 1.0);
      setIsPlaying(true);
    } catch (err) {
      console.warn('[BGMTrackCard] Playback error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = () => {
    setSelected(true);
    onSelect?.(track);
  };

  const matchColor =
    track.matchScore >= 80
      ? Colors.success
      : track.matchScore >= 55
      ? '#F59E0B'
      : Colors.textSecondary;

  return (
    <View style={[styles.card, selected && styles.cardSelected]}>
      {/* Rank badge */}
      <View style={[styles.rankBadge, { backgroundColor: matchColor + '22' }]}>
        <Text style={[styles.rankText, { color: matchColor }]}>#{rank}</Text>
      </View>

      {/* Main info */}
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {track.title}
          </Text>
          <View style={[styles.scorePill, { borderColor: matchColor }]}>
            <Text style={[styles.scoreText, { color: matchColor }]}>
              {track.matchScore}%
            </Text>
          </View>
        </View>

        <Text style={styles.artist}>AI Generated</Text>

        {/* Metadata row */}
        <View style={styles.metaRow}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{track.bpm} BPM</Text>
          </View>
          <View style={styles.chip}>
            <Ionicons name="time-outline" size={11} color={Colors.textSecondary} />
            <Text style={styles.chipText}>{Math.round(track.nominalDuration)}s</Text>
          </View>
        </View>

        {/* Mood badges */}
        <View style={styles.moodRow}>
          <MoodBadge mood={track.mood} size="sm" />
        </View>

        {/* Waveform + Play row */}
        <View style={styles.bottomRow}>
          <WaveformVisualizer
            isPlaying={isPlaying}
            barCount={18}
            color={matchColor}
            height={28}
          />
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.playBtn, { borderColor: matchColor }]}
              onPress={handlePlay}
              activeOpacity={0.7}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={matchColor} />
              ) : (
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={16}
                  color={matchColor}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.selectBtn,
                selected
                  ? { backgroundColor: Colors.success }
                  : { backgroundColor: matchColor },
              ]}
              onPress={handleSelect}
              activeOpacity={0.8}
            >
              {selected && <Ionicons name="checkmark" size={14} color="#fff" style={{ marginRight: 2 }} />}
              <Text style={styles.selectText}>
                {selected ? 'Used' : 'Use'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    gap: 12,
  },
  cardSelected: {
    borderColor: Colors.success,
    backgroundColor: 'rgba(16,185,129,0.06)',
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  scorePill: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '700',
  },
  artist: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: -2,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
  moodRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  energyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  energyLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    width: 42,
  },
  energyTrack: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  energyFill: {
    height: '100%',
    borderRadius: 2,
  },
  energyValue: {
    fontSize: 11,
    fontWeight: '600',
    width: 24,
    textAlign: 'right',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
  },
  selectText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
