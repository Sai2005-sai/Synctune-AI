import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

interface Props { onDone: () => void; }

export default function SplashScreen({ onDone }: Props) {
  const glowAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const textFade  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 50, useNativeDriver: true }),
        Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(glowAnim,  { toValue: 1, duration: 1000, useNativeDriver: true }),
      ]),
      Animated.timing(textFade, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(onDone, 2500);
    return () => clearTimeout(timer);
  }, []);

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.6, 0.3] });

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0D0015', '#08080F', '#00050F']} style={StyleSheet.absoluteFillObject} />

      {/* Glow rings */}
      <Animated.View style={[styles.glowRing, styles.ring1, { opacity: glowOpacity }]} />
      <Animated.View style={[styles.glowRing, styles.ring2, { opacity: glowOpacity }]} />

      {/* Logo */}
      <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
        <LinearGradient colors={['#8B5CF6', '#3B82F6', '#06B6D4']} style={styles.logoCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Ionicons name="musical-notes" size={48} color="#fff" />
        </LinearGradient>
      </Animated.View>

      {/* App name */}
      <Animated.View style={{ opacity: textFade, alignItems: 'center', marginTop: 28 }}>
        <Text style={styles.appName}>SyncTune AI</Text>
        <Text style={styles.tagline}>AI Video BGM Matcher</Text>
      </Animated.View>

      {/* Bottom bar */}
      <Animated.View style={[styles.bottomBar, { opacity: textFade }]}>
        <View style={styles.dot} /><View style={[styles.dot, styles.dotActive]} /><View style={styles.dot} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#08080F' },
  glowRing:   { position: 'absolute', borderRadius: 999, borderWidth: 1 },
  ring1:      { width: 280, height: 280, borderColor: '#8B5CF6', top: height * 0.3 - 140, left: width / 2 - 140 },
  ring2:      { width: 380, height: 380, borderColor: '#3B82F6', top: height * 0.3 - 190, left: width / 2 - 190 },
  logoCircle: { width: 110, height: 110, borderRadius: 55, alignItems: 'center', justifyContent: 'center', shadowColor: '#8B5CF6', shadowOpacity: 0.9, shadowRadius: 30, elevation: 20 },
  appName:    { fontSize: 34, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  tagline:    { fontSize: 14, color: Colors.textSecondary, marginTop: 6, letterSpacing: 2 },
  bottomBar:  { position: 'absolute', bottom: 60, flexDirection: 'row', gap: 8 },
  dot:        { width: 6, height: 6, borderRadius: 3, backgroundColor: '#333' },
  dotActive:  { width: 20, backgroundColor: '#8B5CF6' },
});
