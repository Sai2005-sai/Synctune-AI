import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

interface TrackItem {
  id: string;
  title: string;
  mood: string;
  bpm: number;
  nominalDuration: number;
  energyLevel: number;
}

interface Props {
  track: TrackItem;
  onBack: () => void;
  onApply: () => void;
}

const MOOD_COLOR: Record<string, string> = {
  happy: '#F59E0B', sad: '#6366F1', calm: '#10B981',
  energetic: '#EF4444', cinematic: '#8B5CF6',
};

function StatBox({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <LinearGradient colors={['#13132A', '#0E0E1C']} style={statStyles.card}>
      <View style={[statStyles.icon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </LinearGradient>
  );
}

const statStyles = StyleSheet.create({
  card:  { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  icon:  { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: 20, fontWeight: '800', color: '#fff' },
  label: { fontSize: 11, color: Colors.textMuted },
});

export default function TrackDetailsScreen({ track, onBack, onApply }: Props) {
  const anim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const color = MOOD_COLOR[track.mood] ?? '#8B5CF6';
  const mm = Math.floor(track.nominalDuration / 60);
  const ss = Math.round(track.nominalDuration % 60);
  const duration = `${mm}:${ss.toString().padStart(2, '0')}`;

  const BARS = Array.from({ length: 30 }, (_, i) => 0.2 + Math.abs(Math.sin(i * 0.7)) * 0.8);

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#1A0533', '#08080F', '#0A0A1A']} style={StyleSheet.absoluteFillObject} />

      <Animated.View style={[styles.header, { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Track Details</Text>
          <Text style={styles.headerSub}>{track.title}</Text>
        </View>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <Animated.View style={[styles.heroCard, { opacity: anim, borderColor: color + '55' }]}>
          <LinearGradient colors={[color + '33', 'transparent']} style={StyleSheet.absoluteFillObject} />
          <LinearGradient colors={[color, color + 'AA']} style={styles.albumArt} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Ionicons name="musical-note" size={40} color="#fff" />
          </LinearGradient>
          <View style={styles.heroInfo}>
            <Text style={styles.trackTitle}>{track.title}</Text>
            <View style={[styles.moodChip, { backgroundColor: color + '22' }]}>
              <Text style={[styles.moodText, { color }]}>{track.mood.charAt(0).toUpperCase() + track.mood.slice(1)}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatBox icon="musical-notes" label="BPM" value={String(track.bpm)} color="#8B5CF6" />
          <StatBox icon="time-outline" label="Duration" value={duration} color="#06B6D4" />
          <StatBox icon="flash-outline" label="Energy" value={`${track.energyLevel}%`} color={color} />
        </View>

        {/* Waveform visualizer */}
        <LinearGradient colors={['#13132A', '#0E0E1C']} style={styles.waveCard}>
          <Text style={styles.waveLabel}>AUDIO WAVEFORM</Text>
          <View style={styles.waveform}>
            {BARS.map((h, i) => (
              <Animated.View
                key={i}
                style={[styles.waveBar, {
                  height: `${h * 80}%` as any,
                  backgroundColor: color,
                  opacity: waveAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4 + h * 0.4, 0.8 + h * 0.2] }),
                }]}
              />
            ))}
          </View>
        </LinearGradient>

        {/* Mood match */}
        <LinearGradient colors={['#13132A', '#0E0E1C']} style={styles.matchCard}>
          <Ionicons name="checkmark-circle" size={22} color="#10B981" />
          <View style={{ flex: 1 }}>
            <Text style={styles.matchTitle}>Mood Match</Text>
            <Text style={styles.matchDesc}>This track is perfectly tuned for {track.mood} video content with a {track.bpm} BPM tempo.</Text>
          </View>
        </LinearGradient>

        {/* Apply button */}
        <TouchableOpacity onPress={onApply} style={styles.applyBtn}>
          <LinearGradient colors={['#8B5CF6', '#3B82F6']} style={styles.applyBtnInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.applyText}>Apply This Track</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#08080F' },
  header:      { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20, gap: 14 },
  backBtn:     { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  headerSub:   { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  scroll:      { padding: 20, paddingBottom: 120, gap: 16 },
  heroCard:    { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 20, borderWidth: 1, overflow: 'hidden', gap: 16 },
  albumArt:    { width: 80, height: 80, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  heroInfo:    { flex: 1, gap: 10 },
  trackTitle:  { fontSize: 20, fontWeight: '800', color: '#fff' },
  moodChip:    { alignSelf: 'flex-start', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4 },
  moodText:    { fontSize: 13, fontWeight: '700' },
  statsRow:    { flexDirection: 'row', gap: 10 },
  waveCard:    { borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  waveLabel:   { fontSize: 11, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1.5, marginBottom: 16 },
  waveform:    { flexDirection: 'row', alignItems: 'center', height: 60, gap: 2 },
  waveBar:     { flex: 1, borderRadius: 2, minHeight: 4 },
  matchCard:   { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)', backgroundColor: 'rgba(16,185,129,0.05)' },
  matchTitle:  { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 2 },
  matchDesc:   { fontSize: 12, color: Colors.textMuted, lineHeight: 18 },
  applyBtn:    { borderRadius: 16, overflow: 'hidden' },
  applyBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 8 },
  applyText:   { fontSize: 16, fontWeight: '700', color: '#fff' },
});
