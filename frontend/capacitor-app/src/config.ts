const isCapacitor = !!(window as any).Capacitor;

export const API_URL = isCapacitor
  ? 'http://172.23.51.34:5000'
  : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:5000'
    : 'https://synctune-api.onrender.com');

