import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.synctune.app',
  appName: 'SyncTune',
  webDir: 'dist',
  android: {
    overrideUserAgent: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36'
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '61136341892-o6a6pcabnolhj2ec3jidmfron4bept0e.apps.googleusercontent.com',
      forceCodeForRefreshToken: false
    }
  }
};

export default config;
