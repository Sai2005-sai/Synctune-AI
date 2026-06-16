
/** @type {import('tailwindcss').Config} */
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0A0A1A',
          surface: '#12122A',
        },
        accent: {
          purple: '#8B5CF6',
          blue: '#3B82F6',
          cyan: '#06B6D4',
        },
        status: {
          success: '#10B981',
          error: '#EF4444',
          warning: '#F59E0B',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#8B8BA7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(to right, #8B5CF6, #3B82F6, #06B6D4)',
      }
    },
  },
  plugins: [],
}
