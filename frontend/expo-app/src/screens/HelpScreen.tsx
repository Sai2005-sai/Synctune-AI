import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props { onBack: () => void; }

const FAQS = [
  { q: 'Does the app work without internet?', a: 'Yes! The entire analysis engine and music library are bundled offline. No internet required after install.' },
  { q: 'How does the AI detect mood?', a: 'The AI analyses each video frame for brightness, motion intensity, and scene cut frequency — then maps these signals to mood categories (Happy, Sad, Calm, Cinematic, Energetic).' },
  { q: 'Can I use the music in my YouTube videos?', a: 'All tracks are sourced from Kevin MacLeod (CC BY 4.0) and Pixabay (CC0). They are royalty-free and safe for YouTube, Instagram, and commercial use.' },
  { q: 'How many music tracks are available?', a: 'The library contains 90+ carefully curated tracks across 5 mood categories: Calm, Cinematic, Energetic, Happy, and Sad.' },
  { q: 'What video formats are supported?', a: 'The app supports MP4, MOV, and most standard video formats available on your device gallery or files app.' },
  { q: 'Can I preview the music before applying?', a: 'Yes! Each recommended track has a Play button. You can also use the Synced Preview to watch your entire video with the background music playing simultaneously.' },
  { q: 'How do I export the final video?', a: 'After selecting tracks and reviewing the synced preview, tap the Export button. The app will generate a mixed audio track file which you can share or save.' },
  { q: 'Why does the app show only 3 tracks?', a: 'The AI ranks all 90+ tracks against your video\'s mood and energy scores, then surfaces only the top 3 best matches to keep the experience focused and fast.' },
];

export default function HelpScreen({ onBack }: Props) {
  const anim = useRef(new Animated.Value(0)).current;
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const toggle = (i: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIdx(prev => (prev === i ? null : i));
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#1A0533', '#08080F', '#0A0A1A']} style={StyleSheet.absoluteFillObject} />

      <Animated.View style={[styles.header, { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Help & FAQ</Text>
          <Text style={styles.headerSub}>Frequently asked questions</Text>
        </View>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {FAQS.map((faq, i) => (
          <TouchableOpacity key={i} onPress={() => toggle(i)} activeOpacity={0.8}>
            <LinearGradient colors={['#13132A', '#0E0E1C']} style={styles.faqCard}>
              <View style={styles.faqHeader}>
                <View style={styles.faqNum}>
                  <Text style={styles.faqNumText}>{i + 1}</Text>
                </View>
                <Text style={styles.faqQ}>{faq.q}</Text>
                <Ionicons name={openIdx === i ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.textMuted} />
              </View>
              {openIdx === i && (
                <View style={styles.faqBody}>
                  <View style={styles.divider} />
                  <Text style={styles.faqA}>{faq.a}</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        ))}

        {/* Contact */}
        <LinearGradient colors={['#13132A', '#0E0E1C']} style={styles.contactCard}>
          <Ionicons name="mail" size={24} color="#8B5CF6" />
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactSub}>Reach us at support@synctune.ai</Text>
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: '#08080F' },
  header:       { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20, gap: 14 },
  backBtn:      { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  headerTitle:  { fontSize: 20, fontWeight: '700', color: '#fff' },
  headerSub:    { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  scroll:       { padding: 20, paddingBottom: 120, gap: 10 },
  faqCard:      { borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  faqHeader:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  faqNum:       { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(139,92,246,0.2)', alignItems: 'center', justifyContent: 'center' },
  faqNumText:   { fontSize: 12, fontWeight: '700', color: '#8B5CF6' },
  faqQ:         { flex: 1, fontSize: 14, fontWeight: '600', color: '#fff', lineHeight: 20 },
  faqBody:      { marginTop: 12 },
  divider:      { height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginBottom: 12 },
  faqA:         { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  contactCard:  { borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(139,92,246,0.3)', alignItems: 'center', gap: 8, marginTop: 8 },
  contactTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  contactSub:   { fontSize: 13, color: Colors.textMuted },
});
