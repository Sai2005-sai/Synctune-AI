import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

// Union of all mood strings in the app (ClassifiedMood + BGM-database Mood)
type AnyMood =
  | 'happy' | 'sad' | 'calm'           // ClassifiedMood
  | 'energetic' | 'cinematic' | 'peaceful' | 'romantic'
  | 'dark' | 'corporate' | 'vlog' | 'nature'; // BGM-database Mood

interface Props {
  mood: AnyMood;
  size?: 'sm' | 'md';
}

const MOOD_CONFIG: Record<AnyMood, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
  happy:     { label: 'Happy',     icon: 'happy-outline', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  sad:       { label: 'Sad',       icon: 'sad-outline', color: '#6366F1', bg: 'rgba(99,102,241,0.15)' },
  calm:      { label: 'Calm',      icon: 'water-outline', color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
  energetic: { label: 'Energetic', icon: 'flash-outline', color: Colors.moodEnergetic, bg: 'rgba(245,158,11,0.15)' },
  cinematic: { label: 'Cinematic', icon: 'film-outline', color: Colors.moodCinematic, bg: 'rgba(124,58,237,0.15)' },
  peaceful:  { label: 'Peaceful',  icon: 'leaf-outline', color: Colors.moodPeaceful,  bg: 'rgba(16,185,129,0.15)' },
  romantic:  { label: 'Romantic',  icon: 'heart-outline', color: Colors.moodRomantic,  bg: 'rgba(236,72,153,0.15)' },
  dark:      { label: 'Dark',      icon: 'moon-outline', color: Colors.moodDark,      bg: 'rgba(239,68,68,0.15)'  },
  corporate: { label: 'Corporate', icon: 'briefcase-outline', color: Colors.moodCorporate, bg: 'rgba(6,182,212,0.15)'  },
  vlog:      { label: 'Vlog',      icon: 'phone-portrait-outline', color: Colors.moodVlog,      bg: 'rgba(249,115,22,0.15)' },
  nature:    { label: 'Nature',    icon: 'flower-outline', color: Colors.moodNature,    bg: 'rgba(34,197,94,0.15)'  },
};

export default function MoodBadge({ mood, size = 'md' }: Props) {
  const cfg = MOOD_CONFIG[mood] ?? MOOD_CONFIG.calm;
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: cfg.bg, borderColor: cfg.color },
        isSmall && styles.badgeSm,
      ]}
    >
      <Ionicons name={cfg.icon} size={isSmall ? 13 : 15} color={cfg.color} />
      <Text style={[styles.label, { color: cfg.color }, isSmall && styles.labelSm]}>
        {cfg.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 5,
  },
  badgeSm:  { paddingHorizontal: 8, paddingVertical: 4 },
  label:    { fontSize: 13, fontWeight: '600', letterSpacing: 0.3 },
  labelSm:  { fontSize: 11 },
});
