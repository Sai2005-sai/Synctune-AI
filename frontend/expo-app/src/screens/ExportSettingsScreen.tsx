import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

interface Props { onBack: () => void; onExport: (quality: string, format: string) => void; }

const QUALITIES = [
  { id: '1080p', label: '1080p HD', desc: 'Best quality, larger file', icon: 'star', color: '#F59E0B' },
  { id: '720p',  label: '720p',     desc: 'Balanced quality & size',  icon: 'star-half', color: '#8B5CF6' },
  { id: '480p',  label: '480p',     desc: 'Smaller file, faster share', icon: 'star-outline', color: '#06B6D4' },
];

const FORMATS = [
  { id: 'mp4',  label: 'MP4', desc: 'Universal compatibility' },
  { id: 'mov',  label: 'MOV', desc: 'Best for Apple devices' },
];

export default function ExportSettingsScreen({ onBack, onExport }: Props) {
  const anim = useRef(new Animated.Value(0)).current;
  const [quality, setQuality] = useState('1080p');
  const [format,  setFormat]  = useState('mp4');

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#1A0533', '#08080F', '#0A0A1A']} style={StyleSheet.absoluteFillObject} />

      <Animated.View style={[styles.header, { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Export Settings</Text>
          <Text style={styles.headerSub}>Choose quality and format</Text>
        </View>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Summary */}
        <LinearGradient colors={['#13132A', '#0E0E1C']} style={styles.summaryCard}>
          <Ionicons name="film" size={22} color="#8B5CF6" />
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryTitle}>Ready to Export</Text>
            <Text style={styles.summaryDesc}>Your video with synced background music will be mixed and saved to your device.</Text>
          </View>
        </LinearGradient>

        {/* Quality selection */}
        <Text style={styles.sectionLabel}>VIDEO QUALITY</Text>
        {QUALITIES.map((q) => (
          <TouchableOpacity key={q.id} onPress={() => setQuality(q.id)} activeOpacity={0.8}>
            <LinearGradient
              colors={quality === q.id ? [q.color + '22', '#0E0E1C'] : ['#13132A', '#0E0E1C']}
              style={[styles.optionCard, { borderColor: quality === q.id ? q.color + '66' : 'rgba(255,255,255,0.06)' }]}
            >
              <View style={[styles.optionIcon, { backgroundColor: q.color + '22' }]}>
                <Ionicons name={q.icon as any} size={18} color={q.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionLabel}>{q.label}</Text>
                <Text style={styles.optionDesc}>{q.desc}</Text>
              </View>
              <View style={[styles.radio, quality === q.id && { backgroundColor: q.color, borderColor: q.color }]}>
                {quality === q.id && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}

        {/* Format selection */}
        <Text style={styles.sectionLabel}>FILE FORMAT</Text>
        <View style={styles.formatRow}>
          {FORMATS.map((f) => (
            <TouchableOpacity key={f.id} onPress={() => setFormat(f.id)} style={{ flex: 1 }} activeOpacity={0.8}>
              <LinearGradient
                colors={format === f.id ? ['rgba(139,92,246,0.2)', '#0E0E1C'] : ['#13132A', '#0E0E1C']}
                style={[styles.formatCard, { borderColor: format === f.id ? 'rgba(139,92,246,0.6)' : 'rgba(255,255,255,0.06)' }]}
              >
                <Text style={[styles.formatLabel, format === f.id && { color: '#8B5CF6' }]}>{f.label}</Text>
                <Text style={styles.formatDesc}>{f.desc}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Export button */}
        <TouchableOpacity onPress={() => onExport(quality, format)} style={styles.exportBtn}>
          <LinearGradient colors={['#8B5CF6', '#3B82F6', '#06B6D4']} style={styles.exportBtnInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="cloud-download" size={20} color="#fff" />
            <Text style={styles.exportBtnText}>Start Export</Text>
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
  scroll:        { padding: 20, paddingBottom: 120, gap: 12 },
  summaryCard:   { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: 'rgba(139,92,246,0.3)' },
  summaryTitle:  { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 4 },
  summaryDesc:   { fontSize: 12, color: Colors.textMuted, lineHeight: 18 },
  sectionLabel:  { fontSize: 11, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1.5 },
  optionCard:    { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, borderWidth: 1, gap: 14 },
  optionIcon:    { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  optionLabel:   { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 2 },
  optionDesc:    { fontSize: 12, color: Colors.textMuted },
  radio:         { width: 24, height: 24, borderRadius: 8, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  formatRow:     { flexDirection: 'row', gap: 10 },
  formatCard:    { borderRadius: 16, padding: 16, borderWidth: 1, alignItems: 'center', gap: 6 },
  formatLabel:   { fontSize: 18, fontWeight: '800', color: '#fff' },
  formatDesc:    { fontSize: 11, color: Colors.textMuted, textAlign: 'center' },
  exportBtn:     { borderRadius: 16, overflow: 'hidden', marginTop: 8 },
  exportBtnInner:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
  exportBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
});
