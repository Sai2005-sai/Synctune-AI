import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Synctune-AI/' : '/',
  plugins: [react()],
  server: {
    // Headers removed to allow Google OAuth cross-origin popups
  }
}))
