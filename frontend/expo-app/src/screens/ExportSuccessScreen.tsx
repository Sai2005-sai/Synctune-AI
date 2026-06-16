import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

interface Props { quality: string; format: string; onNewVideo: () => void; }

export default function ExportSuccessScreen({ quality, format, onNewVideo }: Props) {
  const scale   = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const textFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale,   { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(textFade, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({ message: 'Check out my video with AI-matched background music from SyncTune AI!' });
    } catch {}
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0A1A0A', '#08080F', '#0A0A1A']} style={StyleSheet.absoluteFillObject} />

      {/* Glow */}
      <View style={styles.glow} />

      {/* Success icon */}
      <Animated.View style={[styles.iconWrap, { opacity, transform: [{ scale }] }]}>
        <LinearGradient colors={['#10B981', '#059669']} style={styles.iconCircle}>
          <Ionicons name="checkmark" size={56} color="#fff" />
        </LinearGradient>
      </Animated.View>

      {/* Text */}
      <Animated.View style={[styles.textWrap, { opacity: textFade }]}>
        <Text style={styles.title}>Export Complete!</Text>
        <Text style={styles.sub}>Your video has been saved with the AI-matched background music.</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Ionicons name="film" size={14} color="#8B5CF6" />
            <Text style={styles.metaText}>{quality.toUpperCase()}</Text>
          </View>
          <View style={styles.metaChip}>
            <Ionicons name="document" size={14} color="#06B6D4" />
            <Text style={styles.metaText}>{format.toUpperCase()}</Text>
          </View>
          <View style={styles.metaChip}>
            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
            <Text style={styles.metaText}>Saved</Text>
          </View>
        </View>
      </Animated.View>

      {/* Buttons */}
      <Animated.View style={[styles.buttons, { opacity: textFade }]}>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <LinearGradient colors={['#8B5CF6', '#3B82F6']} style={styles.shareBtnInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="share-social" size={20} color="#fff" />
            <Text style={styles.shareBtnText}>Share Video</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={onNewVideo} style={styles.newBtn}>
          <Ionicons name="add-circle-outline" size={18} color={Colors.textSecondary} />
          <Text style={styles.newBtnText}>Process Another Video</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: '#08080F', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 32 },
  glow:         { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: '#10B981', opacity: 0.06, top: '25%', alignSelf: 'center' },
  iconWrap:     { alignItems: 'center' },
  iconCircle:   { width: 130, height: 130, borderRadius: 65, alignItems: 'center', justifyContent: 'center', shadowColor: '#10B981', shadowOpacity: 0.7, shadowRadius: 30, elevation: 20 },
  textWrap:     { alignItems: 'center', gap: 12 },
  title:        { fontSize: 32, fontWeight: '800', color: '#fff', textAlign: 'center' },
  sub:          { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24 },
  metaRow:      { flexDirection: 'row', gap: 8, marginTop: 8 },
  metaChip:     { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  metaText:     { fontSize: 12, fontWeight: '600', color: '#fff' },
  buttons:      { width: '100%', gap: 14, alignItems: 'center' },
  shareBtn:     { width: '100%', borderRadius: 16, overflow: 'hidden' },
  shareBtnInner:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
  shareBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  newBtn:       { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 },
  newBtnText:   { fontSize: 14, color: Colors.textSecondary },
});
