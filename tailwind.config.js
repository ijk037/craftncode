/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        mesh: {
          dark: '#0a0e17',
          card: '#111827',
          cardBorder: '#1f293d',
          accent: '#06b6d4',
          accentGlow: '#0891b2',
          critical: '#ef4444',
          urgent: '#f59e0b',
          normal: '#3b82f6',
          healthy: '#10b981',
          gateway: '#8b5cf6',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.08)' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar': 'radarSweep 4s linear infinite',
      }
    },
  },
  plugins: [],
}
