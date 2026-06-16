import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Colors } from '../theme/colors';

interface Props {
  uri: string;
  name?: string;
  fileSize?: number;
  onDurationLoaded?: (durationSec: number) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PLAYER_HEIGHT = Math.round(SCREEN_WIDTH * 0.5625); // 16:9

function formatTime(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function VideoPlayer({ uri, name, fileSize, onDurationLoaded }: Props) {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const handlePlaybackUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      setPosition(status.positionMillis);
      
      const newDur = status.durationMillis ?? 0;
      if (newDur !== duration && newDur > 0) {
        setDuration(newDur);
        onDurationLoaded?.(newDur / 1000);
      }
    }
  };

  const togglePlay = async () => {
    if (!videoRef.current) return;
    try {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    } catch (err) {
      console.warn('[VideoPlayer] Playback toggle failed:', err);
    }
  };

  const toggleMute = () => {
    setIsMuted((m) => !m);
    videoRef.current?.setIsMutedAsync(!isMuted);
  };

  const seek = async (value: number) => {
    try {
      await videoRef.current?.setPositionAsync(value);
    } catch (err) {
      console.warn('[VideoPlayer] Seek failed:', err);
    }
  };

  const toggleControls = () => setShowControls((c) => !c);

  return (
    <View style={styles.container}>
      {/* Video Info strip */}
      <View style={styles.infoStrip}>
        <Ionicons name="videocam" size={14} color={Colors.primary} />
        <Text style={styles.videoName} numberOfLines={1}>
          {name ?? 'Video Preview'}
        </Text>
        {fileSize ? (
          <Text style={styles.fileSize}>{formatSize(fileSize)}</Text>
        ) : null}
      </View>

      {/* Player area */}
      <TouchableOpacity
        onPress={toggleControls}
        activeOpacity={1}
        style={styles.playerWrapper}
      >
        <Video
          ref={videoRef}
          source={{ uri }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          isLooping
          isMuted={isMuted}
          onPlaybackStatusUpdate={handlePlaybackUpdate}
          useNativeControls={false}
        />

        {/* Controls overlay */}
        {showControls && (
          <View style={styles.overlay} pointerEvents="box-none">
            {/* Top bar */}
            <View style={styles.topBar}>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>PREVIEW</Text>
              </View>
              {duration > 0 && (
                <Text style={styles.durationBadge}>{formatTime(duration)}</Text>
              )}
            </View>

            {/* Centre play button */}
            <TouchableOpacity
              onPress={togglePlay}
              style={styles.centrePlayBtn}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={32}
                color="#fff"
              />
            </TouchableOpacity>

            {/* Bottom seek bar + controls */}
            <View style={styles.bottomControls}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={duration || 1}
                value={position}
                onSlidingComplete={seek}
                minimumTrackTintColor={Colors.primary}
                maximumTrackTintColor="rgba(255,255,255,0.25)"
                thumbTintColor={Colors.primaryLight}
              />
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
              <TouchableOpacity onPress={toggleMute} style={styles.muteBtn}>
                <Ionicons
                  name={isMuted ? 'volume-mute' : 'volume-high'}
                  size={18}
                  color="rgba(255,255,255,0.85)"
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.surfaceElevated,
  },
  videoName: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  fileSize: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  playerWrapper: {
    width: '100%',
    height: PLAYER_HEIGHT,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  liveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  durationBadge: {
    color: '#fff',
    fontSize: 11,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontWeight: '600',
  },
  centrePlayBtn: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(124,58,237,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    gap: 6,
  },
  slider: {
    flex: 1,
    height: 24,
  },
  timeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    minWidth: 38,
    textAlign: 'center',
  },
  muteBtn: {
    padding: 4,
  },
});
