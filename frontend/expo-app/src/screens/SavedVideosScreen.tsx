import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

interface Props { onBack: () => void; }

interface SavedFile {
  id: string; name: string; size: string; date: string; duration: string; mood: string; color: string;
}

const INITIAL_SAVED: SavedFile[] = [
  { id: '1', name: 'Beach_Holiday_BGM.mp4',  size: '24 MB',  date: 'May 10, 2025',  duration: '0:42', mood: 'Happy',     color: '#FBBF24' },
  { id: '2', name: 'City_Drive_BGM.mp4',      size: '58 MB',  date: 'May 8, 2025',   duration: '1:15', mood: 'Energetic', color: '#F87171' },
  { id: '3', name: 'Rainy_Window_BGM.mp4',    size: '91 MB',  date: 'May 5, 2025',   duration: '2:03', mood: 'Sad',       color: '#818CF8' },
  { id: '4', name: 'Movie_Trailer_BGM.mp4',   size: '84 MB',  date: 'Apr 28, 2025',  duration: '1:58', mood: 'Cinematic', color: '#A855F7' },
];

export default function SavedVideosScreen({ onBack }: Props) {
  const anim = useRef(new Animated.Value(0)).current;
  const [files, setFiles] = useState<SavedFile[]>(INITIAL_SAVED);

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const handleDelete = (file: SavedFile) => {
    Alert.alert(
      'Delete File',
      `Are you sure you want to delete "${file.name}"?\nThis cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setFiles(prev => prev.filter(f => f.id !== file.id)),
        },
      ],
    );
  };

  const handleShare = (file: SavedFile) => {
    Alert.alert('Share', `Sharing "${file.name}" is not available in demo mode.`);
  };

  const totalSize = files.reduce((acc, f) => acc + parseFloat(f.size), 0);

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0D0025', '#050510', '#050510']} style={StyleSheet.absoluteFillObject} />

      <Animated.View style={[styles.header, { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Saved Videos</Text>
          <Text style={styles.headerSub}>{files.length} exported file{files.length !== 1 ? 's' : ''}</Text>
        </View>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Storage info */}
        <LinearGradient colors={['#161630','#0C0C1E']} style={styles.storageCard}>
          <View style={[styles.storageIcon, { backgroundColor: 'rgba(168,85,247,0.15)' }]}>
            <Ionicons name="server" size={18} color="#A855F7" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={styles.storageTitle}>Device Storage</Text>
              <Text style={styles.storageSize}>{totalSize.toFixed(0)} MB used</Text>
            </View>
            <View style={styles.storageBar}>
              <View style={[styles.storageFill, { width: `${Math.min((totalSize / 1024) * 100, 100)}%` as any }]} />
            </View>
          </View>
        </LinearGradient>

        {/* File list */}
        {files.map((file) => (
          <Animated.View key={file.id} style={[styles.fileCard, { opacity: anim }]}>
            <LinearGradient colors={['#161630','#0C0C1E']} style={styles.fileCardInner}>
              {/* Thumbnail */}
              <View style={[styles.thumb, { backgroundColor: file.color + '22' }]}>
                <Ionicons name="play-circle" size={26} color={file.color} />
              </View>

              {/* Info */}
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                <View style={styles.fileMeta}>
                  <View style={[styles.moodChip, { backgroundColor: file.color + '22' }]}>
                    <Text style={[styles.moodText, { color: file.color }]}>{file.mood}</Text>
                  </View>
                  <Text style={styles.fileMetaText}>{file.duration}</Text>
                  <Text style={styles.fileMetaText}>{file.size}</Text>
                </View>
                <Text style={styles.fileDate}>{file.date}</Text>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleShare(file)}>
                  <Ionicons name="share-social-outline" size={16} color={Colors.secondary} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(file)}>
                  <Ionicons name="trash-outline" size={16} color="#F87171" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>
        ))}

        {/* Empty state */}
        {files.length === 0 && (
          <View style={styles.empty}>
            <LinearGradient colors={['rgba(168,85,247,0.15)', 'transparent']} style={styles.emptyIcon}>
              <Ionicons name="cloud-outline" size={42} color="#A855F7" />
            </LinearGradient>
            <Text style={styles.emptyTitle}>No saved videos</Text>
            <Text style={styles.emptyDesc}>Videos you export will appear here.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: '#050510' },
  header:        { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 14, paddingHorizontal: 20, gap: 14 },
  backBtn:       { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.07)', alignItems: 'center', justifyContent: 'center' },
  headerTitle:   { fontSize: 20, fontWeight: '700', color: '#fff' },
  headerSub:     { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  scroll:        { padding: 20, paddingBottom: 110, gap: 12 },
  storageCard:   { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  storageIcon:   { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  storageTitle:  { fontSize: 13, fontWeight: '600', color: '#fff' },
  storageSize:   { fontSize: 12, color: Colors.textMuted },
  storageBar:    { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
  storageFill:   { height: 6, backgroundColor: '#A855F7', borderRadius: 3 },
  fileCard:      { borderRadius: 18, overflow: 'hidden' },
  fileCardInner: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 18 },
  thumb:         { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  fileInfo:      { flex: 1, gap: 4 },
  fileName:      { fontSize: 13, fontWeight: '600', color: '#fff' },
  fileMeta:      { flexDirection: 'row', alignItems: 'center', gap: 6 },
  moodChip:      { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 },
  moodText:      { fontSize: 10, fontWeight: '700' },
  fileMetaText:  { fontSize: 10, color: Colors.textMuted },
  fileDate:      { fontSize: 10, color: Colors.textMuted },
  actions:       { gap: 8 },
  actionBtn:     { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(34,211,238,0.1)', alignItems: 'center', justifyContent: 'center' },
  deleteBtn:     { backgroundColor: 'rgba(248,113,113,0.1)' },
  empty:         { alignItems: 'center', paddingTop: 60, gap: 14 },
  emptyIcon:     { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center' },
  emptyTitle:    { fontSize: 18, fontWeight: '700', color: '#fff' },
  emptyDesc:     { fontSize: 13, color: Colors.textMuted },
});
