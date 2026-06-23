import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();
const isLocalWeb = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_URL = (isLocalWeb && !isNative)
  ? 'http://localhost:5000'
  : 'https://synctune-api.onrender.com';
