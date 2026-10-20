import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();
const isLocalWeb = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_URL = 'http://180.235.121.253:8194';