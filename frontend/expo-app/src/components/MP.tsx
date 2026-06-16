/**
 * Magic Pattern shared components – React Native translation
 * Mirrors the web design: glassmorphism, purple→blue→cyan gradient, dark bg
 */
import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const C = {
  bg:       '#0A0A1A',
  surface:  '#12122A',
  glass:    'rgba(255,255,255,0.05)',
  border:   'rgba(255,255,255,0.10)',
  purple:   '#8B5CF6',
  blue:     '#3B82F6',
  cyan:     '#06B6D4',
  textPri:  '#FFFFFF',
  textSec:  '#8B8BA7',
  success:  '#10B981',
  warning:  '#F59E0B',
  error:    '#EF4444',
};

/** Glass card – rgba(255,255,255,0.05) + border */
export const GlassCard = ({
  children, style, onPress,
}: { children: React.ReactNode; style?: any; onPress?: () => void }) => {
  const Inner = (
    <View style={[gc.card, style]}>
      {children}
    </View>
  );
  if (onPress) return <TouchableOpacity onPress={onPress} activeOpacity={0.85}>{Inner}</TouchableOpacity>;
  return Inner;
};
const gc = StyleSheet.create({
  card: {
    backgroundColor: C.glass,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 16,
  },
});

/** Gradient button: Purple → Blue → Cyan pill */
export const GradientButton = ({
  children, onPress, style, disabled,
}: { children: React.ReactNode; onPress?: () => void; style?: any; disabled?: boolean }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.85} disabled={disabled} style={[{ borderRadius: 50, overflow: 'hidden', opacity: disabled ? 0.5 : 1 }, style]}>
    <LinearGradient
      colors={['#8B5CF6', '#3B82F6', '#06B6D4']}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
      style={gb.inner}
    >
      <Text style={gb.text}>{children}</Text>
    </LinearGradient>
  </TouchableOpacity>
);
const gb = StyleSheet.create({
  inner: { paddingVertical: 14, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  text:  { color: '#fff', fontSize: 15, fontWeight: '700' },
});

/** Outlined button */
export const OutlinedButton = ({
  children, onPress, style,
}: { children: React.ReactNode; onPress?: () => void; style?: any }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[ob.btn, style]}>
    <Text style={ob.text}>{children}</Text>
  </TouchableOpacity>
);
const ob = StyleSheet.create({
  btn:  { borderRadius: 50, borderWidth: 1, borderColor: 'rgba(255,255,255,0.20)', backgroundColor: 'rgba(255,255,255,0.05)', paddingVertical: 14, paddingHorizontal: 24, alignItems: 'center' },
  text: { color: '#fff', fontSize: 15, fontWeight: '600' },
});

/** Back button – circle with chevron */
export const BackButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={bb.btn}>
    <Ionicons name="arrow-back" size={20} color="#fff" />
  </TouchableOpacity>
);
const bb = StyleSheet.create({
  btn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', alignItems: 'center', justifyContent: 'center' },
});

/** Progress steps dots */
export const ProgressSteps = ({ current, total = 5 }: { current: number; total?: number }) => (
  <View style={ps.row}>
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={[
          ps.dot,
          i + 1 === current ? ps.active : i + 1 < current ? ps.done : ps.inactive,
        ]}
      />
    ))}
  </View>
);
const ps = StyleSheet.create({
  row:      { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  dot:      { height: 6, borderRadius: 3 },
  active:   { width: 32, backgroundColor: '#8B5CF6' },
  done:     { width: 16, backgroundColor: 'rgba(139,92,246,0.5)' },
  inactive: { width: 16, backgroundColor: 'rgba(255,255,255,0.10)' },
});

/** Mood chip */
export const MoodChip = ({ mood }: { mood: string }) => {
  const map: Record<string, { bg: string; text: string; border: string }> = {
    happy:      { bg: 'rgba(245,158,11,0.2)', text: '#F59E0B', border: 'rgba(245,158,11,0.3)' },
    sad:        { bg: 'rgba(59,130,246,0.2)', text: '#3B82F6', border: 'rgba(59,130,246,0.3)' },
    energetic:  { bg: 'rgba(249,115,22,0.2)', text: '#F97316', border: 'rgba(249,115,22,0.3)' },
    calm:       { bg: 'rgba(16,185,129,0.2)', text: '#10B981', border: 'rgba(16,185,129,0.3)' },
    cinematic:  { bg: 'rgba(139,92,246,0.2)', text: '#8B5CF6', border: 'rgba(139,92,246,0.3)' },
  };
  const c = map[mood.toLowerCase()] ?? { bg: 'rgba(255,255,255,0.1)', text: '#fff', border: 'rgba(255,255,255,0.2)' };
  return (
    <View style={[mc.chip, { backgroundColor: c.bg, borderColor: c.border }]}>
      <Text style={[mc.text, { color: c.text }]}>{mood}</Text>
    </View>
  );
};
const mc = StyleSheet.create({
  chip: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 4 },
  text: { fontSize: 12, fontWeight: '600' },
});

/** Energy badge */
export const EnergyBadge = ({ level }: { level: 'low' | 'medium' | 'high' }) => {
  const label = level.charAt(0).toUpperCase() + level.slice(1);
  const colors = { low: C.success, medium: C.warning, high: C.error };
  const c = colors[level];
  return (
    <View style={eb.wrap}>
      <View style={eb.bars}>
        <View style={[eb.bar, { height: 6, backgroundColor: C.success }]} />
        <View style={[eb.bar, { height: 10, backgroundColor: level !== 'low' ? C.warning : 'rgba(255,255,255,0.2)' }]} />
        <View style={[eb.bar, { height: 14, backgroundColor: level === 'high' ? C.error : 'rgba(255,255,255,0.2)' }]} />
      </View>
      <Text style={eb.text}>{label} Energy</Text>
    </View>
  );
};
const eb = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)' },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 14 },
  bar:  { width: 4, borderRadius: 2 },
  text: { fontSize: 12, fontWeight: '600', color: '#fff' },
});

/** Section header */
export const SectionHeader = ({ title, sub }: { title: string; sub?: string }) => (
  <View style={{ marginBottom: 4 }}>
    <Text style={{ fontSize: 22, fontWeight: '800', color: '#fff' }}>{title}</Text>
    {sub && <Text style={{ fontSize: 13, color: C.textSec, marginTop: 4 }}>{sub}</Text>}
  </View>
);

/** Quick-suggestion pill */
export const SuggestionPill = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[sp.pill, active && sp.pillActive]}
  >
    <Text style={[sp.text, active && sp.textActive]}>{label}</Text>
  </TouchableOpacity>
);
const sp = StyleSheet.create({
  pill:       { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)' },
  pillActive: { backgroundColor: 'rgba(139,92,246,0.15)', borderColor: 'rgba(139,92,246,0.5)' },
  text:       { fontSize: 12, color: '#8B8BA7', fontWeight: '500' },
  textActive: { color: '#8B5CF6', fontWeight: '700' },
});

export { C };
