import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions,
} from 'react-native';
import SavedVideosScreen from './SavedVideosScreen';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

const { width } = Dimensions.get('window');

interface Props { onBack: () => void; }

const HISTORY = [
  { id: '1', name: 'Beach Holiday.mp4',   mood: 'Happy',     date: 'May 10, 2025',  duration: '0:42', color: '#F59E0B' },
  { id: '2', name: 'City Drive.mp4',       mood: 'Energetic', date: 'May 8, 2025',   duration: '1:15', color: '#EF4444' },
  { id: '3', name: 'Rainy Window.mp4',     mood: 'Sad',       date: 'May 5, 2025',   duration: '2:03', color: '#6366F1' },
  { id: '4', name: 'Sunrise Yoga.mp4',     mood: 'Calm',      date: 'May 3, 2025',   duration: '3:30', color: '#10B981' },
  { id: '5', name: 'Movie Trailer.mp4',    mood: 'Cinematic', date: 'Apr 28, 2025',  duration: '1:58', color: '#8B5CF6' },
  { id: '6', name: 'Birthday Party.mp4',   mood: 'Happy',     date: 'Apr 22, 2025',  duration: '0:55', color: '#F59E0B' },
  { id: '7', name: 'Gaming Session.mp4',   mood: 'Energetic', date: 'Apr 20, 2025',  duration: '5:10', color: '#EF4444' },
];

const MOOD_COLOR: Record<string, string> = {
  Happy: '#F59E0B', Energetic: '#EF4444', Sad: '#6366F1', Calm: '#10B981', Cinematic: '#8B5CF6',
};

export default function ProjectHistoryScreen({ onBack }: Props) {
  const headerAnim = useRef(new Animated.Value(0)).current;
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  if (showSaved) return <SavedVideosScreen onBack={() => setShowSaved(false)} />;

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#1A0533', '#08080F', '#0A0A1A']} style={StyleSheet.absoluteFillObject} />

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Project History</Text>
          <Text style={styles.headerSub}>{HISTORY.length} videos processed</Text>
        </View>
        <TouchableOpacity onPress={() => setShowSaved(true)} style={styles.savedBtn}>
          <Ionicons name="folder" size={16} color="#8B5CF6" />
          <Text style={styles.savedBtnText}>Saved</Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {HISTORY.map((item, i) => (
          <Animated.View
            key={item.id}
            style={[styles.card, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [20 + i * 5, 0] }) }] }]}
          >
            <LinearGradient colors={['#13132A', '#0E0E1C']} style={styles.cardInner}>
              {/* Icon */}
              <View style={[styles.iconBox, { backgroundColor: item.color + '22', borderColor: item.color + '55' }]}>
                <Ionicons name="videocam" size={22} color={item.color} />
              </View>

              {/* Info */}
              <View style={styles.cardInfo}>
                <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.cardMeta}>
                  <View style={[styles.moodChip, { backgroundColor: MOOD_COLOR[item.mood] + '22' }]}>
                    <Text style={[styles.moodText, { color: MOOD_COLOR[item.mood] }]}>{item.mood}</Text>
                  </View>
                  <Ionicons name="time-outline" size={12} color={Colors.textMuted} style={{ marginLeft: 8 }} />
                  <Text style={styles.metaText}>{item.duration}</Text>
                </View>
                <Text style={styles.dateText}>{item.date}</Text>
              </View>

              {/* Arrow */}
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </LinearGradient>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: '#08080F' },
  header:     { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20, gap: 14 },
  backBtn:    { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  headerTitle:{ fontSize: 22, fontWeight: '700', color: '#fff' },
  headerSub:  { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  list:       { padding: 20, paddingBottom: 100, gap: 12 },
  card:       { borderRadius: 16, overflow: 'hidden' },
  cardInner:  { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 16 },
  iconBox:    { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  cardInfo:   { flex: 1, gap: 4 },
  cardName:   { fontSize: 14, fontWeight: '600', color: '#fff' },
  cardMeta:   { flexDirection: 'row', alignItems: 'center' },
  moodChip:   { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  moodText:   { fontSize: 11, fontWeight: '600' },
  metaText:   { fontSize: 11, color: Colors.textMuted, marginLeft: 4 },
  dateText:     { fontSize: 11, color: Colors.textMuted },
  savedBtn:     { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(139,92,246,0.15)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  savedBtnText: { fontSize: 13, fontWeight: '600', color: '#8B5CF6' },
});
