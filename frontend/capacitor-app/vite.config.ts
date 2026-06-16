import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/Synctune-AI/',
  plugins: [react()],
  server: {
    // Headers removed to allow Google OAuth cross-origin popups
  }
})
