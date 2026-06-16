import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

interface TrackItem { id: string; title: string; mood: string; bpm: number; nominalDuration: number; energyLevel: number; }
interface Props { tracks: TrackItem[]; onBack: () => void; onConfirm: (selected: TrackItem[]) => void; }

const MOOD_COLOR: Record<string, string> = {
  happy: '#F59E0B', sad: '#6366F1', calm: '#10B981', energetic: '#EF4444', cinematic: '#8B5CF6',
};

export default function MultiTrackSelectionScreen({ tracks, onBack, onConfirm }: Props) {
  const anim = useRef(new Animated.Value(0)).current;
  const [selected, setSelected] = useState<Set<string>>(new Set(tracks.map(t => t.id)));

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const selectedTracks = tracks.filter(t => selected.has(t.id));

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#1A0533', '#08080F', '#0A0A1A']} style={StyleSheet.absoluteFillObject} />

      <Animated.View style={[styles.header, { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Select Tracks</Text>
          <Text style={styles.headerSub}>{selected.size} of {tracks.length} selected</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{selected.size}</Text>
        </View>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.hint}>Choose which tracks to include in your video's BGM rotation.</Text>

        {tracks.map((track) => {
          const isSelected = selected.has(track.id);
          const color = MOOD_COLOR[track.mood] ?? '#8B5CF6';
          const mm = Math.floor(track.nominalDuration / 60);
          const ss = Math.round(track.nominalDuration % 60);
          return (
            <TouchableOpacity key={track.id} onPress={() => toggle(track.id)} activeOpacity={0.8}>
              <LinearGradient
                colors={isSelected ? [color + '22', '#0E0E1C'] : ['#13132A', '#0E0E1C']}
                style={[styles.card, { borderColor: isSelected ? color + '66' : 'rgba(255,255,255,0.06)' }]}
              >
                {/* Checkbox */}
                <View style={[styles.checkbox, isSelected && { backgroundColor: color, borderColor: color }]}>
                  {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>

                {/* Album art */}
                <LinearGradient colors={[color, color + '88']} style={styles.albumArt}>
                  <Ionicons name="musical-note" size={20} color="#fff" />
                </LinearGradient>

                {/* Info */}
                <View style={styles.info}>
                  <Text style={styles.trackTitle}>{track.title}</Text>
                  <View style={styles.metaRow}>
                    <View style={[styles.moodChip, { backgroundColor: color + '22' }]}>
                      <Text style={[styles.moodText, { color }]}>{track.mood}</Text>
                    </View>
                    <Text style={styles.metaText}>{track.bpm} BPM</Text>
                    <Text style={styles.metaText}>{mm}:{ss.toString().padStart(2, '0')}</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Confirm button */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => onConfirm(selectedTracks)} disabled={selected.size === 0} style={styles.confirmBtn}>
          <LinearGradient colors={selected.size > 0 ? ['#8B5CF6', '#3B82F6'] : ['#333', '#222']} style={styles.confirmInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="checkmark-done-circle" size={20} color="#fff" />
            <Text style={styles.confirmText}>Confirm {selected.size} Track{selected.size !== 1 ? 's' : ''}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: '#08080F' },
  header:       { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20, gap: 14 },
  backBtn:      { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  headerTitle:  { fontSize: 20, fontWeight: '700', color: '#fff' },
  headerSub:    { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  countBadge:   { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(139,92,246,0.2)', alignItems: 'center', justifyContent: 'center' },
  countText:    { fontSize: 16, fontWeight: '800', color: '#8B5CF6' },
  scroll:       { padding: 20, paddingBottom: 140, gap: 10 },
  hint:         { fontSize: 13, color: Colors.textMuted, marginBottom: 4, lineHeight: 20 },
  card:         { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 14, borderWidth: 1, gap: 12 },
  checkbox:     { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  albumArt:     { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  info:         { flex: 1, gap: 6 },
  trackTitle:   { fontSize: 14, fontWeight: '600', color: '#fff' },
  metaRow:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  moodChip:     { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  moodText:     { fontSize: 11, fontWeight: '600' },
  metaText:     { fontSize: 11, color: Colors.textMuted },
  footer:       { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 36, backgroundColor: 'rgba(8,8,15,0.95)' },
  confirmBtn:   { borderRadius: 16, overflow: 'hidden' },
  confirmInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 8 },
  confirmText:  { fontSize: 16, fontWeight: '700', color: '#fff' },
});
