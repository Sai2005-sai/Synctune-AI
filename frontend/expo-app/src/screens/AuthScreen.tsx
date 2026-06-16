import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../theme/colors';

interface Props {
  onSignIn: () => void;
}

// ── Persistent credential helpers (AsyncStorage for cross-platform) ────────────
const STORAGE_KEY = 'bgm_accounts';

async function getAccounts(): Promise<Record<string, string>> {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : {};
  } catch {
    return {};
  }
}

async function saveAccount(email: string, password: string) {
  try {
    const accounts = await getAccounts();
    accounts[email] = password;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch { /* ignore */ }
}

export default function AuthScreen({ onSignIn }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const clearMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleLogin = async () => {
    clearMessages();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter your email and password.');
      return;
    }

    // Demo bypass
    if (email.trim() === 'demo@demo.com' && password === 'password') {
      onSignIn();
      return;
    }

    const accounts = await getAccounts();
    const stored = accounts[email.trim().toLowerCase()];
    if (stored === undefined) {
      setErrorMsg('No account found with this email. Please register first.');
      return;
    }
    if (stored !== password) {
      setErrorMsg('Incorrect password. Please try again.');
      return;
    }
    onSignIn();
  };

  const handleRegister = async () => {
    clearMessages();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Please fill in all the fields.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    const key = email.trim().toLowerCase();
    const accounts = await getAccounts();
    if (accounts[key] !== undefined) {
      setErrorMsg('This email is already registered. Please sign in.');
      return;
    }
    await saveAccount(key, password);
    setSuccessMsg('Account created! Signing you in…');
    setTimeout(() => onSignIn(), 800);
  };

  const switchToRegister = () => {
    setMode('register');
    clearMessages();
    setEmail('');
    setPassword('');
    setName('');
  };

  const switchToLogin = () => {
    setMode('login');
    clearMessages();
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#1A0533', '#08080F', '#0A0A1A']}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoArea}>
          <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.logoIcon}>
            <Ionicons name="musical-notes" size={32} color="#fff" />
          </LinearGradient>
          <Text style={styles.appName}>BGM Matcher</Text>
          <Text style={styles.tagline}>
            {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Tab switcher */}
          <View style={styles.tabRow}>
            <Pressable
              style={[styles.tab, mode === 'login' && styles.tabActive]}
              onPress={switchToLogin}
            >
              <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>
                Sign In
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, mode === 'register' && styles.tabActive]}
              onPress={switchToRegister}
            >
              <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>
                Register
              </Text>
            </Pressable>
          </View>

          {/* Error / Success banners */}
          {errorMsg !== '' && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={16} color="#FCA5A5" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}
          {successMsg !== '' && (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#6EE7B7" />
              <Text style={styles.successText}>{successMsg}</Text>
            </View>
          )}

          {/* Name — register only */}
          {mode === 'register' && (
            <View style={styles.field}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputRow}>
                <Ionicons name="person-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor={Colors.textMuted}
                  value={name}
                  onChangeText={v => { setName(v); clearMessages(); }}
                  autoCapitalize="words"
                />
              </View>
            </View>
          )}

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={18} color={Colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={v => { setEmail(v); clearMessages(); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder={mode === 'register' ? 'Min. 6 characters' : '••••••••'}
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={v => { setPassword(v); clearMessages(); }}
                secureTextEntry
              />
            </View>
          </View>

          {/* Submit */}
          <Pressable
            style={({ pressed }) => [styles.submitBtn, pressed && styles.submitBtnPressed]}
            onPress={mode === 'login' ? handleLogin : handleRegister}
          >
            <LinearGradient
              colors={['#7C3AED', '#06B6D4']}
              style={styles.submitGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              pointerEvents="none"
            >
              <Text style={styles.submitText}>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </Pressable>

          {/* Switch link */}
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            </Text>
            <Pressable onPress={mode === 'login' ? switchToRegister : switchToLogin}>
              <Text style={styles.switchLink}>
                {mode === 'login' ? ' Register' : ' Sign In'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#08080F',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingVertical: 48,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  tagline: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 24,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#7C3AED',
  },
  tabText: {
    color: Colors.textMuted,
    fontWeight: '600',
    fontSize: 14,
  },
  tabTextActive: {
    color: '#fff',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 13,
    flex: 1,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#6EE7B7',
    fontSize: 13,
    flex: 1,
  },
  field: {
    marginBottom: 18,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}),
  },
  submitBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 8,
  },
  submitBtnPressed: {
    opacity: 0.85,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  switchText: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  switchLink: {
    color: '#22D3EE',
    fontSize: 13,
    fontWeight: '700',
  },
});
