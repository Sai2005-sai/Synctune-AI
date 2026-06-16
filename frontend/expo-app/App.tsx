import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen          from './src/screens/HomeScreen';
import AuthScreen          from './src/screens/AuthScreen';
import SplashScreen        from './src/screens/SplashScreen';
import OnboardingScreen    from './src/screens/OnboardingScreen';
import ProjectHistoryScreen from './src/screens/ProjectHistoryScreen';
import ProfileScreen       from './src/screens/ProfileScreen';
import HelpScreen          from './src/screens/HelpScreen';
import AboutScreen         from './src/screens/AboutScreen';
import BottomNavigation, { TabName } from './src/components/BottomNavigation';
import { Colors } from './src/theme/colors';

type AppFlow = 'splash' | 'onboarding' | 'auth' | 'main';
type SubScreen = 'none' | 'help' | 'about';

const ONBOARDED_KEY = 'synctune_onboarded';

export default function App() {
  const [flow,          setFlow]          = useState<AppFlow>('splash');
  const [isAuth,        setIsAuth]        = useState(false);
  const [activeTab,     setActiveTab]     = useState<TabName>('home');
  const [subScreen,     setSubScreen]     = useState<SubScreen>('none');

  // Check if user has seen onboarding before
  useEffect(() => {
    AsyncStorage.getItem(ONBOARDED_KEY).then(val => {
      // Pre-load this info so splash → onboarding or splash → auth is instant
      if (val) setFlow('splash'); // still show splash, then skip onboarding
    });
  }, []);

  const handleSplashDone = async () => {
    const seen = await AsyncStorage.getItem(ONBOARDED_KEY);
    setFlow(seen ? 'auth' : 'onboarding');
  };

  const handleOnboardingDone = async () => {
    await AsyncStorage.setItem(ONBOARDED_KEY, 'true');
    setFlow('auth');
  };

  const handleSignIn  = () => { setIsAuth(true);  setFlow('main'); };
  const handleSignOut = () => { setIsAuth(false);  setFlow('auth'); setActiveTab('home'); };

  // ── Render flows ────────────────────────────────────────────────────────────

  if (flow === 'splash')     return <SplashScreen onDone={handleSplashDone} />;
  if (flow === 'onboarding') return <OnboardingScreen onDone={handleOnboardingDone} />;
  if (flow === 'auth')       return <AuthScreen onSignIn={handleSignIn} />;

  // ── Sub-screens launched from Profile (Help, About) ──────────────────────
  if (subScreen === 'help')  return <HelpScreen  onBack={() => setSubScreen('none')} />;
  if (subScreen === 'about') return <AboutScreen onBack={() => setSubScreen('none')} />;

  // ── Main app with Bottom Navigation ─────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor={Colors.background} />

      {/* Tab content */}
      {activeTab === 'home' && (
        <HomeScreen onSignOut={handleSignOut} />
      )}
      {activeTab === 'projects' && (
        <ProjectHistoryScreen onBack={() => setActiveTab('home')} />
      )}
      {activeTab === 'profile' && (
        <ProfileScreen
          onBack={() => setActiveTab('home')}
          onSignOut={handleSignOut}
        />
      )}

      {/* Bottom navigation — always visible in main flow */}
      <BottomNavigation active={activeTab} onPress={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
