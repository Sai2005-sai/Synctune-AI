import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

export type TabName = 'home' | 'projects' | 'profile';

interface Props {
  active: TabName;
  onPress: (tab: TabName) => void;
}

const TABS: { name: TabName; icon: string; label: string }[] = [
  { name: 'home',     icon: 'home',         label: 'Home'     },
  { name: 'projects', icon: 'folder-open',   label: 'Projects' },
  { name: 'profile',  icon: 'person-circle', label: 'Profile'  },
];

export const BOTTOM_NAV_HEIGHT = Platform.OS === 'ios' ? 72 : 60;

export default function BottomNavigation({ active, onPress }: Props) {
  return (
    <View style={styles.bar}>
      <View style={styles.innerBar}>
        {TABS.map((tab) => {
          const isActive = tab.name === active;
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              onPress={() => onPress(tab.name)}
              activeOpacity={0.7}
            >
              {isActive ? (
                <LinearGradient
                  colors={['#A855F7', '#7C3AED']}
                  style={styles.activeIconWrap}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name={tab.icon as any} size={18} color="#fff" />
                </LinearGradient>
              ) : (
                <View style={styles.inactiveIconWrap}>
                  <Ionicons name={`${tab.icon}-outline` as any} size={18} color={Colors.textMuted} />
                </View>
              )}
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(5,5,16,0.97)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(168,85,247,0.15)',
    paddingBottom: Platform.OS === 'ios' ? 20 : 6,
    paddingTop: 6,
  },
  innerBar: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  activeIconWrap: {
    width: 36,
    height: 26,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveIconWrap: {
    width: 36,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  labelActive: {
    color: '#A855F7',
    fontWeight: '700',
  },
});
