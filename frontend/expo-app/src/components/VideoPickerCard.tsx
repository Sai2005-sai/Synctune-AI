import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';

interface Props {
  onPickVideo: () => void;
  hasVideo: boolean;
}

export default function VideoPickerCard({ onPickVideo, hasVideo }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPickVideo}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <LinearGradient
          colors={['#1A1A2E', '#111120']}
          style={styles.card}
        >
          {/* Dashed border overlay */}
          <View style={styles.dashedBorder} />

          <View style={styles.content}>
            {/* Icon */}
            <LinearGradient
              colors={Colors.gradientPrimary}
              style={styles.iconCircle}
            >
              <Ionicons
                name={hasVideo ? 'swap-horizontal' : 'cloud-upload-outline'}
                size={28}
                color="#fff"
              />
            </LinearGradient>

            <Text style={styles.title}>
              {hasVideo ? 'Change Video' : 'Select a Video'}
            </Text>
            <Text style={styles.subtitle}>
              {hasVideo
                ? 'Tap to choose a different video from your library'
                : 'Tap to browse videos from your device storage'}
            </Text>

            {/* Supported formats row */}
            <View style={styles.formatsRow}>
              {['MP4', 'MOV', 'AVI', 'MKV', 'WebM'].map((fmt) => (
                <View key={fmt} style={styles.fmtChip}>
                  <Text style={styles.fmtText}>{fmt}</Text>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  dashedBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.primary + '60',
    borderStyle: Platform.OS === 'ios' ? 'solid' : 'dashed',
  },
  content: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
    gap: 10,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  formatsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  fmtChip: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  fmtText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
});
