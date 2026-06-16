import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

const { width } = Dimensions.get('window');

interface Segment { index: number; startTime: number; duration: number; color: string; }
interface TrackItem { id: string; title: string; mood: string; bpm: number; nominalDuration: number; }
interface Assignment { segment: Segment; track: TrackItem; }

interface Props { assignments: Assignment[]; currentIdx: number; onBack: () => void; onEditSegment: (idx: number) => void; }

export default function SegmentDetailScreen({ assignments, currentIdx, onBack, onEditSegment }: Props) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const current = assignments[currentIdx];

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#1A0533', '#08080F', '#0A0A1A']} style={StyleSheet.absoluteFillObject} />

      <Animated.View style={[styles.header, { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Segment {currentIdx + 1} Details</Text>
          <Text style={styles.headerSub}>of {assignments.length} total segments</Text>
        </View>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Timeline mini-map */}
        <LinearGradient colors={['#13132A', '#0E0E1C']} style={styles.timelineCard}>
          <Text style={styles.cardLabel}>FULL TIMELINE</Text>
          <View style={styles.timeline}>
            {assignments.map((a, i) => (
              <View
                key={i}
                style={[styles.block, {
                  flex: a.segment.duration,
                  backgroundColor: i === currentIdx ? a.segment.color : a.segment.color + '44',
                  borderWidth: i === currentIdx ? 2 : 0,
                  borderColor: a.segment.color,
                }]}
              />
            ))}
          </View>
          <View style={styles.timelineLabels}>
            <Text style={styles.timeLabel}>{formatTime(0)}</Text>
            <Text style={styles.timeLabel}>{formatTime(assignments.reduce((s, a) => s + a.segment.duration, 0))}</Text>
          </View>
        </LinearGradient>

        {/* Current segment info */}
        {current && (
          <>
            <LinearGradient colors={[current.segment.color + '22', '#0E0E1C']} style={[styles.segCard, { borderColor: current.segment.color + '55' }]}>
              <View style={[styles.segDot, { backgroundColor: current.segment.color }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.segLabel}>SEGMENT {currentIdx + 1}</Text>
                <Text style={[styles.segTime, { color: current.segment.color }]}>
                  {formatTime(current.segment.startTime)} → {formatTime(current.segment.startTime + current.segment.duration)}
                </Text>
                <Text style={styles.segDuration}>Duration: {current.segment.duration.toFixed(1)}s</Text>
              </View>
            </LinearGradient>

            <LinearGradient colors={['#13132A', '#0E0E1C']} style={styles.trackCard}>
              <View style={[styles.trackIcon, { backgroundColor: current.segment.color + '22' }]}>
                <Ionicons name="musical-note" size={22} color={current.segment.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.trackCardLabel}>ASSIGNED TRACK</Text>
                <Text style={styles.trackName}>{current.track.title}</Text>
                <Text style={styles.trackMeta}>{current.track.mood} · {current.track.bpm} BPM</Text>
              </View>
              <TouchableOpacity onPress={() => onEditSegment(currentIdx)} style={styles.editBtn}>
                <LinearGradient colors={['#8B5CF6', '#3B82F6']} style={styles.editBtnInner}>
                  <Ionicons name="pencil" size={14} color="#fff" />
                  <Text style={styles.editBtnText}>Edit</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </>
        )}

        {/* All segments list */}
        <Text style={styles.sectionLabel}>ALL SEGMENTS</Text>
        {assignments.map((a, i) => (
          <TouchableOpacity key={i} onPress={() => onEditSegment(i)} activeOpacity={0.8}>
            <LinearGradient colors={i === currentIdx ? [a.segment.color + '22', '#0E0E1C'] : ['#13132A', '#0E0E1C']} style={[styles.segRow, { borderColor: i === currentIdx ? a.segment.color + '66' : 'rgba(255,255,255,0.06)' }]}>
              <View style={[styles.segCircle, { backgroundColor: a.segment.color }]}>
                <Text style={styles.segCircleText}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.segRowTitle}>{a.track.title}</Text>
                <Text style={styles.segRowMeta}>{formatTime(a.segment.startTime)} · {a.segment.duration.toFixed(1)}s</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: '#08080F' },
  header:        { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20, gap: 14 },
  backBtn:       { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  headerTitle:   { fontSize: 20, fontWeight: '700', color: '#fff' },
  headerSub:     { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  scroll:        { padding: 20, paddingBottom: 120, gap: 14 },
  cardLabel:     { fontSize: 11, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1.5, marginBottom: 14 },
  sectionLabel:  { fontSize: 11, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1.5 },
  timelineCard:  { borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  timeline:      { flexDirection: 'row', height: 32, borderRadius: 8, overflow: 'hidden', gap: 2 },
  block:         { borderRadius: 4 },
  timelineLabels:{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  timeLabel:     { fontSize: 11, color: Colors.textMuted },
  segCard:       { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 18, borderWidth: 1, overflow: 'hidden', gap: 14 },
  segDot:        { width: 16, height: 16, borderRadius: 8 },
  segLabel:      { fontSize: 11, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1 },
  segTime:       { fontSize: 20, fontWeight: '800', marginTop: 4 },
  segDuration:   { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
  trackCard:     { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  trackIcon:     { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  trackCardLabel:{ fontSize: 11, color: Colors.textMuted, letterSpacing: 1, marginBottom: 4 },
  trackName:     { fontSize: 15, fontWeight: '700', color: '#fff' },
  trackMeta:     { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  editBtn:       { borderRadius: 10, overflow: 'hidden' },
  editBtnInner:  { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8 },
  editBtnText:   { fontSize: 13, fontWeight: '600', color: '#fff' },
  segRow:        { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14, borderWidth: 1, gap: 12 },
  segCircle:     { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  segCircleText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  segRowTitle:   { fontSize: 14, fontWeight: '600', color: '#fff' },
  segRowMeta:    { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
});
