import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

interface TrackItem { id: string; title: string; mood: string; bpm: number; }
interface Segment   { index: number; startTime: number; duration: number; color: string; }
interface Props     { segment: Segment; tracks: TrackItem[]; currentTrackId: string; onBack: () => void; onSave: (trackId: string) => void; }

const MOOD_COLOR: Record<string, string> = {
  happy: '#F59E0B', sad: '#6366F1', calm: '#10B981', energetic: '#EF4444', cinematic: '#8B5CF6',
};

export default function SegmentEditorScreen({ segment, tracks, currentTrackId, onBack, onSave }: Props) {
  const anim = useRef(new Animated.Value(0)).current;
  const [picked, setPicked] = useState(currentTrackId);

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const formatTime = (sec: number) => `${Math.floor(sec / 60)}:${Math.round(sec % 60).toString().padStart(2, '0')}`;

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#1A0533', '#08080F', '#0A0A1A']} style={StyleSheet.absoluteFillObject} />

      <Animated.View style={[styles.header, { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Edit Segment {segment.index + 1}</Text>
          <Text style={styles.headerSub}>{formatTime(segment.startTime)} → {formatTime(segment.startTime + segment.duration)}</Text>
        </View>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Segment card */}
        <LinearGradient colors={[segment.color + '22', '#0E0E1C']} style={[styles.segCard, { borderColor: segment.color + '55' }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.segLabel}>SEGMENT WINDOW</Text>
            <Text style={[styles.segTime, { color: segment.color }]}>{formatTime(segment.startTime)} – {formatTime(segment.startTime + segment.duration)}</Text>
            <Text style={styles.segDur}>Duration: {segment.duration.toFixed(1)}s</Text>
          </View>
          <View style={[styles.segDot, { backgroundColor: segment.color }]} />
        </LinearGradient>

        <Text style={styles.sectionLabel}>CHOOSE A TRACK FOR THIS SEGMENT</Text>
        <Text style={styles.hint}>Tap a track to assign it to this segment. The track will crossfade in at the segment's start time.</Text>

        {tracks.map((track) => {
          const isSelected = track.id === picked;
          const color = MOOD_COLOR[track.mood] ?? '#8B5CF6';
          return (
            <TouchableOpacity key={track.id} onPress={() => setPicked(track.id)} activeOpacity={0.8}>
              <LinearGradient
                colors={isSelected ? [color + '22', '#0E0E1C'] : ['#13132A', '#0E0E1C']}
                style={[styles.trackCard, { borderColor: isSelected ? color + '77' : 'rgba(255,255,255,0.06)' }]}
              >
                <LinearGradient colors={[color, color + '88']} style={styles.albumArt}>
                  <Ionicons name="musical-note" size={18} color="#fff" />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={styles.trackTitle}>{track.title}</Text>
                  <View style={styles.metaRow}>
                    <View style={[styles.moodChip, { backgroundColor: color + '22' }]}>
                      <Text style={[styles.moodText, { color }]}>{track.mood}</Text>
                    </View>
                    <Text style={styles.bpmText}>{track.bpm} BPM</Text>
                  </View>
                </View>
                {isSelected && (
                  <View style={[styles.checkCircle, { backgroundColor: color }]}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Save footer */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => onSave(picked)} style={styles.saveBtn}>
          <LinearGradient colors={['#8B5CF6', '#3B82F6']} style={styles.saveBtnInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="save" size={18} color="#fff" />
            <Text style={styles.saveBtnText}>Save Assignment</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#08080F' },
  header:      { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20, gap: 14 },
  backBtn:     { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  headerSub:   { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  scroll:      { padding: 20, paddingBottom: 140, gap: 12 },
  segCard:     { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 18, borderWidth: 1, overflow: 'hidden' },
  segLabel:    { fontSize: 11, color: Colors.textMuted, letterSpacing: 1, marginBottom: 6 },
  segTime:     { fontSize: 22, fontWeight: '800' },
  segDur:      { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
  segDot:      { width: 18, height: 18, borderRadius: 9 },
  sectionLabel:{ fontSize: 11, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1.5 },
  hint:        { fontSize: 13, color: Colors.textMuted, lineHeight: 20 },
  trackCard:   { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 14, borderWidth: 1, gap: 12 },
  albumArt:    { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  trackTitle:  { fontSize: 14, fontWeight: '600', color: '#fff', marginBottom: 6 },
  metaRow:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  moodChip:    { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  moodText:    { fontSize: 11, fontWeight: '600' },
  bpmText:     { fontSize: 11, color: Colors.textMuted },
  checkCircle: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  footer:      { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 36, backgroundColor: 'rgba(8,8,15,0.95)' },
  saveBtn:     { borderRadius: 16, overflow: 'hidden' },
  saveBtnInner:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 8 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
