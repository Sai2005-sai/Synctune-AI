import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

interface Props { onBack: () => void; }

const FEATURES = [
  { icon: 'analytics', title: 'Real Frame Analysis',    desc: 'Pixel-level brightness, motion, and scene cut detection across all video frames.' },
  { icon: 'musical-notes', title: 'Smart BGM Matching', desc: 'Mood-based AI ranking of 90+ royalty-free tracks against your video.' },
  { icon: 'sync', title: 'Dynamic Audio Sync',           desc: 'Automatic segment-level music transitions synced to your scene cuts.' },
  { icon: 'share-social', title: 'Export & Share',       desc: 'Export the final video with mixed background music to any platform.' },
  { icon: 'wifi-outline', title: '100% Offline',         desc: 'All processing happens on your device. No cloud, no subscription, no cost.' },
];

export default function AboutScreen({ onBack }: Props) {
  const anim = useRef(new Animated.Value(0)).current;
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
        <Text style={styles.headerTitle}>About SyncTune AI</Text>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Logo block */}
        <Animated.View style={[styles.logoWrap, { opacity: anim }]}>
          <LinearGradient colors={['#8B5CF6', '#3B82F6', '#06B6D4']} style={styles.logoCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Ionicons name="musical-notes" size={42} color="#fff" />
          </LinearGradient>
          <Text style={styles.appName}>SyncTune AI</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
          <Text style={styles.tagline}>AI Video Background Music Matcher</Text>
        </Animated.View>

        {/* Description */}
        <LinearGradient colors={['#13132A', '#0E0E1C']} style={styles.descCard}>
          <Text style={styles.descText}>
            SyncTune AI is a production-grade mobile app that analyses every frame of your video using proprietary AI algorithms to detect mood, energy, and scene dynamics — then automatically recommends and synchronises perfectly-matched background music from a curated library of 90+ royalty-free tracks.
          </Text>
        </LinearGradient>

        <Text style={styles.sectionLabel}>KEY FEATURES</Text>
        {FEATURES.map((f, i) => (
          <LinearGradient key={i} colors={['#13132A', '#0E0E1C']} style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Ionicons name={f.icon as any} size={20} color="#8B5CF6" />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </LinearGradient>
        ))}

        <Text style={styles.sectionLabel}>CREDITS</Text>
        <LinearGradient colors={['#13132A', '#0E0E1C']} style={styles.descCard}>
          <Text style={styles.descText}>Music sourced from Kevin MacLeod (incompetech.com) licensed under CC BY 4.0 and Pixabay contributors (CC0). Built with React Native, Expo, and expo-av.</Text>
        </LinearGradient>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with</Text>
          <Ionicons name="heart" size={14} color="#EF4444" />
          <Text style={styles.footerText}>© 2025 SyncTune AI</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: '#08080F' },
  header:        { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20, gap: 14 },
  backBtn:       { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  headerTitle:   { fontSize: 20, fontWeight: '700', color: '#fff' },
  scroll:        { padding: 20, paddingBottom: 120, gap: 12, alignItems: 'stretch' },
  logoWrap:      { alignItems: 'center', paddingVertical: 24 },
  logoCircle:    { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#8B5CF6', shadowOpacity: 0.7, shadowRadius: 25, elevation: 18 },
  appName:       { fontSize: 28, fontWeight: '800', color: '#fff' },
  versionBadge:  { backgroundColor: 'rgba(139,92,246,0.2)', paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20, marginTop: 8 },
  versionText:   { fontSize: 12, fontWeight: '600', color: '#8B5CF6' },
  tagline:       { fontSize: 13, color: Colors.textMuted, marginTop: 8, textAlign: 'center' },
  sectionLabel:  { fontSize: 11, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1.5 },
  descCard:      { borderRadius: 16, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  descText:      { fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },
  featureCard:   { flexDirection: 'row', alignItems: 'flex-start', gap: 14, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  featureIcon:   { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(139,92,246,0.15)', alignItems: 'center', justifyContent: 'center' },
  featureText:   { flex: 1 },
  featureTitle:  { fontSize: 14, fontWeight: '600', color: '#fff', marginBottom: 4 },
  featureDesc:   { fontSize: 12, color: Colors.textMuted, lineHeight: 18 },
  footer:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 16 },
  footerText:    { fontSize: 12, color: Colors.textMuted },
});
