import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

const { width } = Dimensions.get('window');

interface Props { onDone: () => void; }

const SLIDES = [
  {
    icon: 'sparkles' as const,
    gradient: ['#8B5CF6', '#6D28D9'] as const,
    title: 'AI Music for\nYour Videos',
    desc: 'Our AI analyses every frame of your video — detecting brightness, motion, and scene cuts — to find the perfect background music.',
  },
  {
    icon: 'analytics' as const,
    gradient: ['#3B82F6', '#1D4ED8'] as const,
    title: 'Analyze, Sync\n& Export',
    desc: 'Detect mood, match energy, sync music with your scenes, then export your professional video in seconds.',
  },
  {
    icon: 'library' as const,
    gradient: ['#06B6D4', '#0E7490'] as const,
    title: '90+ Royalty-Free\nTracks',
    desc: 'A curated library of cinematic, calm, energetic, happy and sad tracks — all free to use in your videos forever.',
  },
];

export default function OnboardingScreen({ onDone }: Props) {
  const [idx, setIdx] = useState(0);
  const scrollRef = useRef<FlatList>(null);
  const fadeAnim  = useRef(new Animated.Value(1)).current;

  const goNext = () => {
    if (idx < SLIDES.length - 1) {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
      const next = idx + 1;
      setIdx(next);
      scrollRef.current?.scrollToIndex({ index: next, animated: true });
    } else {
      onDone();
    }
  };

  const slide = SLIDES[idx];

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0D0015', '#08080F', '#00050F']} style={StyleSheet.absoluteFillObject} />

      {/* Skip */}
      <TouchableOpacity style={styles.skip} onPress={onDone}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slide content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <LinearGradient colors={slide.gradient} style={styles.iconCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Ionicons name={slide.icon} size={56} color="#fff" />
        </LinearGradient>

        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.desc}>{slide.desc}</Text>
      </Animated.View>

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === idx && styles.dotActive]} />
        ))}
      </View>

      {/* Button */}
      <TouchableOpacity onPress={goNext} style={styles.btnWrap}>
        <LinearGradient colors={['#8B5CF6', '#3B82F6']} style={styles.btn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <Text style={styles.btnText}>{idx === SLIDES.length - 1 ? "Let's Go" : 'Next'}</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: '#08080F', alignItems: 'center', justifyContent: 'center' },
  skip:       { position: 'absolute', top: 56, right: 24 },
  skipText:   { color: Colors.textSecondary, fontSize: 14 },
  content:    { alignItems: 'center', paddingHorizontal: 32 },
  iconCircle: { width: 130, height: 130, borderRadius: 65, alignItems: 'center', justifyContent: 'center', marginBottom: 40, shadowColor: '#8B5CF6', shadowOpacity: 0.7, shadowRadius: 30, elevation: 18 },
  title:      { fontSize: 32, fontWeight: '800', color: '#fff', textAlign: 'center', lineHeight: 42, marginBottom: 20 },
  desc:       { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24 },
  dots:       { flexDirection: 'row', gap: 8, marginTop: 48 },
  dot:        { width: 8, height: 8, borderRadius: 4, backgroundColor: '#333' },
  dotActive:  { width: 24, backgroundColor: '#8B5CF6' },
  btnWrap:    { marginTop: 32, width: width - 64 },
  btn:        { borderRadius: 16, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  btnText:    { color: '#fff', fontSize: 17, fontWeight: '700' },
});
