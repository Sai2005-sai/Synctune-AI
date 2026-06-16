import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

interface Props {
  onPress: () => void;
  isAnalyzing: boolean;
  disabled?: boolean;
}

export default function AnalyzeButton({ onPress, isAnalyzing, disabled }: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  // Idle pulse
  useEffect(() => {
    if (!isAnalyzing && !disabled) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.04,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isAnalyzing, disabled]);

  // Rotate spinner
  useEffect(() => {
    if (isAnalyzing) {
      const spin = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      );
      spin.start();
      return () => spin.stop();
    } else {
      rotateAnim.setValue(0);
    }
  }, [isAnalyzing]);

  // Shimmer sweep
  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 2,
          duration: 2400,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: -1,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    shimmer.start();
    return () => shimmer.stop();
  }, []);

  const spinInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={{ transform: [{ scale: disabled ? 1 : pulseAnim }], opacity: disabled ? 0.4 : 1 }}
    >
      <TouchableOpacity
        onPress={!isAnalyzing && !disabled ? onPress : undefined}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={
            isAnalyzing
              ? (['#5B21B6', '#0891B2'] as const)
              : (['#7C3AED', '#06B6D4'] as const)
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.button}
        >
          {isAnalyzing ? (
            <>
              <Animated.View style={{ transform: [{ rotate: spinInterpolate }] }}>
                <Ionicons name="sync" size={22} color="#fff" />
              </Animated.View>
              <Text style={styles.label}>Analyzing…</Text>
              <View style={styles.dotsContainer}>
                {[0, 1, 2].map((i) => (
                  <BouncingDot key={i} delay={i * 200} />
                ))}
              </View>
            </>
          ) : (
            <>
              <Ionicons name="sparkles" size={20} color="#fff" />
              <Text style={styles.label}>Analyze & Match BGM</Text>
              <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.7)" />
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

function BouncingDot({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: -5, duration: 300, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.delay(600),
      ]),
    );
    bounce.start();
    return () => bounce.stop();
  }, []);

  return (
    <Animated.View
      style={[styles.dot, { transform: [{ translateY: anim }] }]}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 20,
    gap: 10,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  label: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginLeft: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
});
