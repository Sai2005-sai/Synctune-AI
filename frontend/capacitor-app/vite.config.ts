import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  base: './',
  plugins: [react()],
  server: {
    // Headers removed to allow Google OAuth cross-origin popups
  },
  optimizeDeps: {
    entries: [
      'index.html',
      'src/**/*.{ts,tsx,js,jsx}'
    ]
  }
}))
