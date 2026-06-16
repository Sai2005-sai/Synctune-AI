import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';
import type { FrameAnalysisResult } from '../engine/frameAnalyzer';
import type { ClassifiedMood, EnergyLevel } from '../engine/classifier';

interface Props {
  frameMetrics: FrameAnalysisResult;
  classifiedMood: ClassifiedMood;
  energyLevel: EnergyLevel;
  reasoning: string;
}

const ENERGY_CONFIG: Record<EnergyLevel, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  low:    { label: 'Low Energy',    color: Colors.moodPeaceful,  icon: 'moon-outline' },
  medium: { label: 'Medium Energy', color: '#F59E0B',             icon: 'sunny-outline' },
  high:   { label: 'High Energy',   color: Colors.moodEnergetic,  icon: 'flash-outline' },
};

const MOOD_CONFIG: Record<ClassifiedMood, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  happy:     { label: 'Happy',     icon: 'happy-outline', color: '#F59E0B' },
  sad:       { label: 'Sad',       icon: 'sad-outline', color: '#6366F1' },
  energetic: { label: 'Energetic', icon: 'flash-outline', color: '#F97316' },
  calm:      { label: 'Calm',      icon: 'water-outline', color: '#10B981' },
  cinematic: { label: 'Cinematic', icon: 'film-outline', color: '#7C3AED' },
};

function GaugeBar({
  value,
  color,
  label,
  sublabel,
}: {
  value: number;
  color: string;
  label: string;
  sublabel: string;
}) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(widthAnim, {
      toValue: value,
      friction: 8,
      tension: 50,
      useNativeDriver: false,
    }).start();
  }, [value]);

  return (
    <View style={gaugeStyles.row}>
      <View style={gaugeStyles.labels}>
        <Text style={gaugeStyles.label}>{label}</Text>
        <Text style={[gaugeStyles.sublabel, { color }]}>
          {sublabel}
        </Text>
      </View>
      <View style={gaugeStyles.track}>
        <Animated.View
          style={[
            gaugeStyles.fill,
            {
              backgroundColor: color,
              width: widthAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        >
          {/* Shimmer tip */}
          <View style={[gaugeStyles.tip, { backgroundColor: color }]} />
        </Animated.View>
      </View>
      <Text style={[gaugeStyles.pct, { color }]}>
        {(value * 100).toFixed(0)}%
      </Text>
    </View>
  );
}

/** Mini sparkline bars */
function Sparkline({
  values,
  color,
  height = 28,
}: {
  values: number[];
  color: string;
  height?: number;
}) {
  if (values.length === 0) return null;
  const max = Math.max(...values, 0.01);

  return (
    <View style={[sparkStyles.row, { height }]}>
      {values.map((v, i) => (
        <View
          key={i}
          style={[
            sparkStyles.bar,
            {
              height: Math.max(2, (v / max) * height),
              backgroundColor: color,
              opacity: 0.4 + (v / max) * 0.6,
            },
          ]}
        />
      ))}
    </View>
  );
}

export default function AnalysisMetricsCard({
  frameMetrics,
  classifiedMood,
  energyLevel,
  reasoning,
}: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 50, useNativeDriver: true }),
    ]).start();
  }, []);

  const moodCfg = MOOD_CONFIG[classifiedMood];
  const energyCfg = ENERGY_CONFIG[energyLevel];

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <LinearGradient colors={['#0F0F1F', '#08080F']} style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons name="analytics" size={16} color={Colors.primary} />
            <Text style={styles.title}>Frame Analysis</Text>
          </View>
          <View
            style={[
              styles.methodBadge,
              {
                borderColor:
                  frameMetrics.analysisMethod === 'canvas'
                    ? Colors.success
                    : Colors.secondary,
              },
            ]}
          >
            <Ionicons
              name={frameMetrics.analysisMethod === 'canvas' ? 'layers' : 'image'}
              size={10}
              color={
                frameMetrics.analysisMethod === 'canvas'
                  ? Colors.success
                  : Colors.secondary
              }
            />
            <Text
              style={[
                styles.methodText,
                {
                  color:
                    frameMetrics.analysisMethod === 'canvas'
                      ? Colors.success
                      : Colors.secondary,
                },
              ]}
            >
              {frameMetrics.analysisMethod === 'canvas'
                ? 'Canvas Pixel Analysis'
                : `Thumbnail Entropy (${frameMetrics.frameCount} frames)`}
            </Text>
          </View>
        </View>

        {/* Classified Mood + Energy row */}
        <View style={styles.resultRow}>
          {/* Mood */}
          <LinearGradient
            colors={[moodCfg.color + '20', moodCfg.color + '10']}
            style={[styles.resultCard, { borderColor: moodCfg.color + '55' }]}
          >
            <Ionicons name={moodCfg.icon} size={24} color={moodCfg.color} style={{ marginBottom: 2 }} />
            <Text style={[styles.resultValue, { color: moodCfg.color }]}>
              {moodCfg.label}
            </Text>
            <Text style={styles.resultSubLabel}>Detected Mood</Text>
          </LinearGradient>

          {/* Energy Level */}
          <LinearGradient
            colors={[energyCfg.color + '20', energyCfg.color + '10']}
            style={[styles.resultCard, { borderColor: energyCfg.color + '55' }]}
          >
            <Ionicons name={energyCfg.icon} size={24} color={energyCfg.color} style={{ marginBottom: 2 }} />
            <Text style={[styles.resultValue, { color: energyCfg.color }]}>
              {energyCfg.label}
            </Text>
            <Text style={styles.resultSubLabel}>Energy Level</Text>
          </LinearGradient>
        </View>

        {/* Gauge bars */}
        <View style={styles.gaugesSection}>
          <GaugeBar
            label="Brightness"
            sublabel={
              frameMetrics.brightness < 0.35
                ? 'Dark'
                : frameMetrics.brightness > 0.58
                ? 'Bright'
                : 'Normal'
            }
            value={frameMetrics.brightness}
            color="#F59E0B"
          />
          <GaugeBar
            label="Motion Intensity"
            sublabel={
              frameMetrics.motionIntensity >= 0.30
                ? 'Fast'
                : frameMetrics.motionIntensity >= 0.12
                ? 'Medium'
                : 'Static'
            }
            value={frameMetrics.motionIntensity}
            color="#7C3AED"
          />
        </View>

        {/* Scene cuts counter */}
        <View style={styles.cutsRow}>
          <Ionicons name="cut" size={14} color={Colors.secondary} />
          <Text style={styles.cutsLabel}>Scene Cuts Detected</Text>
          <View style={styles.cutsBadge}>
            <Text style={styles.cutsValue}>{frameMetrics.sceneCuts}</Text>
          </View>
          <Text style={styles.cutsHint}>
            {frameMetrics.sceneCuts === 0
              ? '— continuous shot'
              : frameMetrics.sceneCuts === 1
              ? '— one edit'
              : `— ${frameMetrics.sceneCuts} transitions`}
          </Text>
        </View>

        {/* Brightness sparkline */}
        {frameMetrics.rawBrightnessValues.length > 0 && (
          <View style={styles.sparklineSection}>
            <Text style={styles.sparklineLabel}>Brightness across frames</Text>
            <Sparkline
              values={frameMetrics.rawBrightnessValues}
              color="#F59E0B"
              height={32}
            />
          </View>
        )}

        {/* Motion sparkline */}
        {frameMetrics.rawMotionValues.length > 0 && (
          <View style={styles.sparklineSection}>
            <Text style={styles.sparklineLabel}>Motion intensity across frames</Text>
            <Sparkline
              values={frameMetrics.rawMotionValues}
              color="#7C3AED"
              height={32}
            />
          </View>
        )}

        {/* Reasoning */}
        <View style={styles.reasoningRow}>
          <Ionicons name="bulb-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.reasoningText}>{reasoning}</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  methodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  methodText: {
    fontSize: 10,
    fontWeight: '600',
  },
  resultRow: {
    flexDirection: 'row',
    gap: 10,
  },
  resultCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    gap: 3,
  },
  resultIcon: {
    fontSize: 26,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  resultSubLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '500',
  },
  gaugesSection: {
    gap: 10,
  },
  cutsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  cutsLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    flex: 0,
  },
  cutsBadge: {
    backgroundColor: Colors.secondary + '22',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.secondary + '55',
  },
  cutsValue: {
    color: Colors.secondary,
    fontSize: 13,
    fontWeight: '800',
  },
  cutsHint: {
    color: Colors.textMuted,
    fontSize: 11,
    flex: 1,
  },
  sparklineSection: {
    gap: 5,
  },
  sparklineLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  reasoningRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    padding: 10,
  },
  reasoningText: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
});

const gaugeStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labels: {
    width: 80,
  },
  label: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  sublabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  track: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  tip: {
    width: 4,
    height: 14,
    borderRadius: 2,
    opacity: 0.9,
  },
  pct: {
    fontSize: 11,
    fontWeight: '700',
    width: 32,
    textAlign: 'right',
  },
});

const sparkStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    overflow: 'hidden',
  },
  bar: {
    flex: 1,
    borderRadius: 2,
    minHeight: 2,
  },
});
