import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar, Dimensions } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

interface Props { uri: string; onClose: () => void; }

function formatTime(ms: number) {
  const t = Math.floor(ms / 1000);
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function FullscreenPreviewScreen({ uri, onClose }: Props) {
  const videoRef = useRef<Video>(null);
  const controlsFade = useRef(new Animated.Value(1)).current;
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition]   = useState(0);
  const [duration, setDuration]   = useState(0);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleStatus = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    setIsPlaying(status.isPlaying);
    setPosition(status.positionMillis ?? 0);
    setDuration(status.durationMillis ?? 0);
  };

  const togglePlay = async () => {
    try {
      if (isPlaying) { await videoRef.current?.pauseAsync(); }
      else           { await videoRef.current?.playAsync(); }
    } catch {}
  };

  const toggleControls = () => {
    if (showControls) {
      Animated.timing(controlsFade, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => setShowControls(false));
    } else {
      setShowControls(true);
      Animated.timing(controlsFade, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => {
        Animated.timing(controlsFade, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => setShowControls(false));
      }, 3000);
    }
  };

  const progress = duration > 0 ? position / duration : 0;

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      <TouchableOpacity style={styles.videoWrap} onPress={toggleControls} activeOpacity={1}>
        <Video
          ref={videoRef}
          source={{ uri }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          onPlaybackStatusUpdate={handleStatus}
          isLooping
        />
      </TouchableOpacity>

      {/* Controls overlay */}
      {showControls && (
        <Animated.View style={[styles.overlay, { opacity: controlsFade }]}>
          {/* Top bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.topTitle}>Fullscreen Preview</Text>
            <View style={{ width: 44 }} />
          </View>

          {/* Centre play */}
          <TouchableOpacity onPress={togglePlay} style={styles.playBtn}>
            <View style={styles.playCircle}>
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={36} color="#fff" />
            </View>
          </TouchableOpacity>

          {/* Bottom progress */}
          <View style={styles.bottomBar}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
              <View style={[styles.thumb, { left: `${progress * 100}%` as any }]} />
            </View>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#000' },
  videoWrap:   { flex: 1 },
  video:       { width: '100%', height: '100%' },
  overlay:     { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },
  topBar:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: 'rgba(0,0,0,0.5)' },
  closeBtn:    { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  topTitle:    { fontSize: 16, fontWeight: '700', color: '#fff' },
  playBtn:     { alignSelf: 'center' },
  playCircle:  { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  bottomBar:   { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingBottom: 40, paddingTop: 16, backgroundColor: 'rgba(0,0,0,0.5)' },
  timeText:    { fontSize: 12, color: '#fff', fontWeight: '600', minWidth: 36 },
  progressBg:  { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, position: 'relative' },
  progressFill:{ height: 4, backgroundColor: '#8B5CF6', borderRadius: 2 },
  thumb:       { position: 'absolute', top: -6, width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff', marginLeft: -8 },
});
