import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Switch, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import HelpScreen  from './HelpScreen';
import AboutScreen from './AboutScreen';

interface Props { onBack: () => void; onSignOut: () => void; }

type SubPage = 'none' | 'help' | 'about';

export default function ProfileScreen({ onBack, onSignOut }: Props) {
  const anim = useRef(new Animated.Value(0)).current;
  const [notifications, setNotifications] = useState(true);
  const [autoExport,    setAutoExport]    = useState(false);
  const [subPage,       setSubPage]       = useState<SubPage>('none');

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  // Sub-page routing
  if (subPage === 'help')  return <HelpScreen  onBack={() => setSubPage('none')} />;
  if (subPage === 'about') return <AboutScreen onBack={() => setSubPage('none')} />;

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: onSignOut },
    ]);
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0D0025', '#050510', '#050510']} style={StyleSheet.absoluteFillObject} />
      {/* Glow */}
      <View style={styles.glow} />

      <Animated.View style={[styles.header, { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile & Settings</Text>
        <View style={{ width: 38 }} />
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Avatar card ── */}
        <Animated.View style={[styles.avatarCard, { opacity: anim }]}>
          <LinearGradient colors={['#161630','#0C0C1E']} style={[StyleSheet.absoluteFillObject, { borderRadius: 24 }]} />
          <LinearGradient colors={['#A855F7', '#22D3EE']} style={styles.avatar}>
            <Text style={styles.avatarText}>S</Text>
          </LinearGradient>
          <View style={styles.avatarInfo}>
            <Text style={styles.userName}>SyncTune User</Text>
            <Text style={styles.userEmail}>user@synctune.ai</Text>
          </View>
          <View style={styles.planBadge}>
            <Ionicons name="star" size={11} color="#FBBF24" />
            <Text style={styles.planText}>Free</Text>
          </View>
        </Animated.View>

        {/* ── Stats ── */}
        <View style={styles.statsRow}>
          {[{ val: '7', label: 'Videos' }, { val: '3', label: 'Exported' }, { val: '90+', label: 'Tracks' }].map(s => (
            <LinearGradient key={s.label} colors={['#161630','#0C0C1E']} style={styles.statCard}>
              <Text style={styles.statVal}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </LinearGradient>
          ))}
        </View>

        {/* ── Preferences ── */}
        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <LinearGradient colors={['#161630','#0C0C1E']} style={styles.section}>
          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: 'rgba(168,85,247,0.15)' }]}>
              <Ionicons name="notifications" size={17} color="#A855F7" />
            </View>
            <Text style={styles.rowLabel}>Push Notifications</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ true: '#A855F7', false: '#333' }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: 'rgba(34,211,238,0.15)' }]}>
              <Ionicons name="cloud-upload" size={17} color="#22D3EE" />
            </View>
            <Text style={styles.rowLabel}>Auto-Export After Analysis</Text>
            <Switch
              value={autoExport}
              onValueChange={setAutoExport}
              trackColor={{ true: '#A855F7', false: '#333' }}
              thumbColor="#fff"
            />
          </View>
        </LinearGradient>

        {/* ── App options ── */}
        <Text style={styles.sectionLabel}>APP</Text>
        <LinearGradient colors={['#161630','#0C0C1E']} style={styles.section}>
          {[
            { icon: 'help-circle', label: 'Help & FAQ', color: '#A855F7', page: 'help' as SubPage },
            { icon: 'information-circle', label: 'About SyncTune AI', color: '#22D3EE', page: 'about' as SubPage },
          ].map((item, i, arr) => (
            <View key={item.label}>
              <TouchableOpacity style={styles.row} onPress={() => setSubPage(item.page)} activeOpacity={0.7}>
                <View style={[styles.rowIcon, { backgroundColor: item.color + '22' }]}>
                  <Ionicons name={item.icon as any} size={17} color={item.color} />
                </View>
                <Text style={styles.rowLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
              {i < arr.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </LinearGradient>

        {/* ── Account ── */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <LinearGradient colors={['#161630','#0C0C1E']} style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={() => Alert.alert('Privacy Policy', 'Offline app — no data is ever uploaded or shared.')} activeOpacity={0.7}>
            <View style={[styles.rowIcon, { backgroundColor: 'rgba(52,211,153,0.15)' }]}>
              <Ionicons name="shield-checkmark" size={17} color="#34D399" />
            </View>
            <Text style={styles.rowLabel}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={() => Alert.alert('Rate Us', 'Thank you for using SyncTune AI!')} activeOpacity={0.7}>
            <View style={[styles.rowIcon, { backgroundColor: 'rgba(251,191,36,0.15)' }]}>
              <Ionicons name="star" size={17} color="#FBBF24" />
            </View>
            <Text style={styles.rowLabel}>Rate the App</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </LinearGradient>

        {/* ── Sign out ── */}
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
          <Ionicons name="log-out-outline" size={18} color="#F87171" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>SyncTune AI v1.0.0 · 100% Offline</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#050510' },
  glow:        { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: '#A855F7', opacity: 0.06, top: -80, right: -60 },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 56, paddingBottom: 14, paddingHorizontal: 20 },
  backBtn:     { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.07)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  scroll:      { paddingHorizontal: 20, paddingBottom: 110, gap: 12 },
  avatarCard:  { flexDirection: 'row', alignItems: 'center', borderRadius: 24, padding: 18, borderWidth: 1, borderColor: 'rgba(168,85,247,0.2)', overflow: 'hidden', gap: 14 },
  avatar:      { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  avatarText:  { fontSize: 26, fontWeight: '800', color: '#fff' },
  avatarInfo:  { flex: 1 },
  userName:    { fontSize: 17, fontWeight: '700', color: '#fff' },
  userEmail:   { fontSize: 12, color: Colors.textMuted, marginTop: 3 },
  planBadge:   { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(251,191,36,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  planText:    { fontSize: 11, fontWeight: '700', color: '#FBBF24' },
  statsRow:    { flexDirection: 'row', gap: 10 },
  statCard:    { flex: 1, borderRadius: 16, alignItems: 'center', paddingVertical: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  statVal:     { fontSize: 22, fontWeight: '800', color: '#fff' },
  statLabel:   { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  sectionLabel:{ fontSize: 10, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1.5, marginTop: 4 },
  section:     { borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', paddingVertical: 2 },
  row:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  rowIcon:     { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowLabel:    { flex: 1, fontSize: 14, color: '#fff', fontWeight: '500' },
  divider:     { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginLeft: 62 },
  signOutBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15, borderRadius: 16, backgroundColor: 'rgba(248,113,113,0.08)', borderWidth: 1, borderColor: 'rgba(248,113,113,0.25)', marginTop: 4 },
  signOutText: { fontSize: 15, fontWeight: '700', color: '#F87171' },
  version:     { textAlign: 'center', fontSize: 11, color: Colors.textMuted, paddingVertical: 8 },
});
