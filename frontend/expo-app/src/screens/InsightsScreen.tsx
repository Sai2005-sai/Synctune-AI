import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

interface Props {
  mood: string;
  energy: string;
  brightness: number;
  motionIntensity: number;
  sceneCuts: number;
  onBack: () => void;
}

const MOOD_COLOR: Record<string, string> = {
  happy: '#F59E0B', sad: '#6366F1', calm: '#10B981',
  energetic: '#EF4444', cinematic: '#8B5CF6',
};

const INSIGHT_TEMPLATES: Record<string, string[]> = {
  happy:     ['Your video radiates warmth and positivity.', 'Bright frames and smooth motion indicate a joyful, upbeat tone.', 'Uplifting, rhythmic music will amplify the celebratory energy.'],
  sad:       ['Your video carries a reflective, emotional tone.', 'Low brightness and gentle motion suggest an introspective mood.', 'Soft piano or strings will complement the emotional depth.'],
  calm:      ['Your video moves at a peaceful, unhurried pace.', 'Steady motion and balanced lighting create a meditative atmosphere.', 'Ambient or acoustic music will enhance the tranquil feel.'],
  energetic: ['Your video pulses with high energy and movement.', 'Fast motion and high scene variability signal an action-packed feel.', 'Driving beats or EDM will match the intensity perfectly.'],
  cinematic: ['Your video has a grand, story-driven quality.', 'Dramatic lighting shifts and controlled motion create a filmic narrative.', 'Orchestral or epic scores will elevate the cinematic impact.'],
};

export default function InsightsScreen({ mood, energy, brightness, motionIntensity, sceneCuts, onBack }: Props) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const moodKey  = mood.toLowerCase();
  const color    = MOOD_COLOR[moodKey] ?? '#8B5CF6';
  const insights = INSIGHT_TEMPLATES[moodKey] ?? INSIGHT_TEMPLATES.calm;

  const metrics = [
    { label: 'Brightness',       value: Math.round(brightness * 100),        unit: '%',  icon: 'sunny-outline',    color: '#F59E0B' },
    { label: 'Motion Intensity', value: Math.round(motionIntensity * 100),    unit: '%',  icon: 'flash-outline',    color: '#EF4444' },
    { label: 'Scene Cuts',       value: sceneCuts,                             unit: ' cuts', icon: 'cut-outline',  color: '#06B6D4' },
  ];

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#1A0533', '#08080F', '#0A0A1A']} style={StyleSheet.absoluteFillObject} />

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>AI Insights</Text>
          <Text style={styles.headerSub}>What the AI detected in your video</Text>
        </View>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Mood hero */}
        <Animated.View style={[styles.heroCard, { opacity: anim, borderColor: color + '55' }]}>
          <LinearGradient colors={[color + '22', 'transparent']} style={StyleSheet.absoluteFillObject} />
          <View style={[styles.moodDot, { backgroundColor: color }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.moodLabel}>Detected Mood</Text>
            <Text style={[styles.moodName, { color }]}>{mood.charAt(0).toUpperCase() + mood.slice(1)}</Text>
            <Text style={styles.energyLabel}>Energy Level: <Text style={{ color, fontWeight: '700' }}>{energy.charAt(0).toUpperCase() + energy.slice(1)}</Text></Text>
          </View>
          <Ionicons name="sparkles" size={32} color={color} />
        </Animated.View>

        {/* AI explanation */}
        <Text style={styles.sectionLabel}>WHAT THE AI SEES</Text>
        {insights.map((text, i) => (
          <Animated.View key={i} style={[styles.insightRow, { opacity: anim }]}>
            <View style={[styles.insightBullet, { backgroundColor: color + '33', borderColor: color + '66' }]}>
              <Text style={[styles.bulletNum, { color }]}>{i + 1}</Text>
            </View>
            <Text style={styles.insightText}>{text}</Text>
          </Animated.View>
        ))}

        {/* Metrics breakdown */}
        <Text style={styles.sectionLabel}>VIDEO METRICS</Text>
        {metrics.map((m) => (
          <LinearGradient key={m.label} colors={['#13132A', '#0E0E1C']} style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: m.color + '22' }]}>
              <Ionicons name={m.icon as any} size={18} color={m.color} />
            </View>
            <View style={styles.metricInfo}>
              <Text style={styles.metricLabel}>{m.label}</Text>
              <View style={styles.barBg}>
                <Animated.View style={[styles.barFill, { width: `${m.value}%` as any, backgroundColor: m.color }]} />
              </View>
            </View>
            <Text style={[styles.metricValue, { color: m.color }]}>{m.value}{m.unit}</Text>
          </LinearGradient>
        ))}

        <TouchableOpacity onPress={onBack} style={styles.backBtn2}>
          <LinearGradient colors={['#8B5CF6', '#3B82F6']} style={styles.backBtn2Inner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="arrow-back" size={18} color="#fff" />
            <Text style={styles.backBtn2Text}>Back to Results</Text>
          </LinearGradient>
        </TouchableOpacity>
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
  heroCard:      { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 20, borderWidth: 1, overflow: 'hidden', gap: 16 },
  moodDot:       { width: 14, height: 14, borderRadius: 7 },
  moodLabel:     { fontSize: 12, color: Colors.textMuted, marginBottom: 4 },
  moodName:      { fontSize: 28, fontWeight: '800' },
  energyLabel:   { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  sectionLabel:  { fontSize: 11, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1.5 },
  insightRow:    { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  insightBullet: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, flexShrink: 0 },
  bulletNum:     { fontSize: 13, fontWeight: '800' },
  insightText:   { flex: 1, fontSize: 14, color: Colors.textSecondary, lineHeight: 22, paddingTop: 6 },
  metricCard:    { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  metricIcon:    { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  metricInfo:    { flex: 1, gap: 8 },
  metricLabel:   { fontSize: 13, color: Colors.textSecondary },
  barBg:         { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
  barFill:       { height: 6, borderRadius: 3 },
  metricValue:   { fontSize: 16, fontWeight: '700', minWidth: 50, textAlign: 'right' },
  backBtn2:      { borderRadius: 16, overflow: 'hidden' },
  backBtn2Inner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  backBtn2Text:  { fontSize: 16, fontWeight: '700', color: '#fff' },
});
