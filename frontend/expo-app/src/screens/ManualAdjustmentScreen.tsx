import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  PanResponder, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const RAIL_WIDTH = width - 48;

interface Segment { index: number; startTime: number; duration: number; color: string; label: string; }
interface Props   { segments: Segment[]; totalDuration: number; onBack: () => void; onSave: (updated: Segment[]) => void; }

export default function ManualAdjustmentScreen({ segments, totalDuration, onBack, onSave }: Props) {
  const anim = useRef(new Animated.Value(0)).current;
  const [segs, setSegs] = useState(segments);

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const formatTime = (sec: number) => `${Math.floor(sec / 60)}:${Math.round(sec % 60).toString().padStart(2, '0')}`;

  // Adjust segment boundary by nudging duration of previous and start of next
  const nudge = (idx: number, delta: number) => {
    setSegs(prev => {
      const next = prev.map(s => ({ ...s }));
      if (idx < next.length - 1) {
        const newDur = Math.max(1, next[idx].duration + delta);
        const overflow = newDur - next[idx].duration;
        next[idx].duration = newDur;
        next[idx + 1].startTime = next[idx + 1].startTime + overflow;
        next[idx + 1].duration  = Math.max(1, next[idx + 1].duration - overflow);
      }
      return next;
    });
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#1A0533', '#08080F', '#0A0A1A']} style={StyleSheet.absoluteFillObject} />

      <Animated.View style={[styles.header, { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Manual Adjustment</Text>
          <Text style={styles.headerSub}>Drag segment boundaries to fine-tune</Text>
        </View>
      </Animated.View>

      <View style={styles.content}>
        {/* Full timeline strip */}
        <LinearGradient colors={['#13132A', '#0E0E1C']} style={styles.timelineCard}>
          <Text style={styles.cardLabel}>TIMELINE</Text>
          <View style={styles.timeline}>
            {segs.map((s, i) => (
              <View key={i} style={[styles.block, { flex: s.duration, backgroundColor: s.color }]}>
                <Text style={styles.blockLabel} numberOfLines={1}>{s.label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(0)}</Text>
            <Text style={styles.timeText}>{formatTime(totalDuration)}</Text>
          </View>
        </LinearGradient>

        {/* Per-segment nudge controls */}
        <Text style={styles.sectionLabel}>ADJUST BOUNDARIES</Text>
        {segs.map((s, i) => (
          <LinearGradient key={i} colors={['#13132A', '#0E0E1C']} style={styles.segRow}>
            <View style={[styles.segDot, { backgroundColor: s.color }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.segName}>{s.label}</Text>
              <Text style={styles.segMeta}>{formatTime(s.startTime)} – {formatTime(s.startTime + s.duration)} ({s.duration.toFixed(1)}s)</Text>
            </View>
            {i < segs.length - 1 && (
              <View style={styles.nudgeRow}>
                <TouchableOpacity onPress={() => nudge(i, -1)} style={styles.nudgeBtn}>
                  <Ionicons name="remove" size={16} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => nudge(i, 1)} style={styles.nudgeBtn}>
                  <Ionicons name="add" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </LinearGradient>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => onSave(segs)} style={styles.saveBtn}>
          <LinearGradient colors={['#8B5CF6', '#3B82F6']} style={styles.saveBtnInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="checkmark-circle" size={18} color="#fff" />
            <Text style={styles.saveBtnText}>Save Adjustments</Text>
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
  content:     { flex: 1, padding: 20, gap: 14 },
  cardLabel:   { fontSize: 11, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1.5, marginBottom: 14 },
  sectionLabel:{ fontSize: 11, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1.5 },
  timelineCard:{ borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  timeline:    { flexDirection: 'row', height: 44, borderRadius: 10, overflow: 'hidden', gap: 2 },
  block:       { alignItems: 'center', justifyContent: 'center', minWidth: 10 },
  blockLabel:  { fontSize: 8, fontWeight: '700', color: '#fff', paddingHorizontal: 2 },
  timeRow:     { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  timeText:    { fontSize: 11, color: Colors.textMuted },
  segRow:      { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', gap: 12 },
  segDot:      { width: 14, height: 14, borderRadius: 7 },
  segName:     { fontSize: 13, fontWeight: '600', color: '#fff', marginBottom: 2 },
  segMeta:     { fontSize: 11, color: Colors.textMuted },
  nudgeRow:    { flexDirection: 'row', gap: 6 },
  nudgeBtn:    { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(139,92,246,0.2)', alignItems: 'center', justifyContent: 'center' },
  footer:      { padding: 20, paddingBottom: 36, backgroundColor: 'rgba(8,8,15,0.95)' },
  saveBtn:     { borderRadius: 16, overflow: 'hidden' },
  saveBtnInner:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 8 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
