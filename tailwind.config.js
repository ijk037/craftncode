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
        // 1. User Page — "Calm + Trustworthy"
        user: {
          bg: '#F5F3EE',          // Warm Off-White
          primary: '#173F35',     // Deep Forest
          'primary-hover': '#102d26',
          'primary-light': '#225548',
          secondary: '#6F8F7D',   // Muted Sage
          'secondary-light': '#9ab5a6',
          'secondary-dark': '#557262',
          accent: '#C65D32',      // Burnt Orange
          'accent-hover': '#ab4e27',
          'accent-light': '#dc754c',
          text: '#252826',        // Charcoal
          'text-muted': '#5c635f',
          'text-subtle': '#878e8a',
          card: '#E9E5DC',        // Soft Sand
          'card-hover': '#ded8cd',
          'card-border': '#d8d1c3',
          emergency: '#A83F35',   // Brick Red
          'emergency-hover': '#8e332a',
          'emergency-light': '#bf4b40',
        },
        // 2. Command Center — "Operational + High Contrast"
        cmd: {
          bg: '#171A19',          // Deep Charcoal
          surface: '#242927',     // Slate
          'surface-hover': '#2f3533',
          'surface-dark': '#1c211f',
          border: '#333b37',      // Slate border
          'border-subtle': '#2c3330',
          primary: '#E8E6DE',     // Off-White
          'text-sec': '#9CA6A0',  // Cool Gray
          'text-muted': '#6b7771',
          accent: '#879B54',      // Operational Olive
          'accent-hover': '#748647',
          'accent-light': '#9db364',
          success: '#3F8F78',     // Teal Green
          'success-hover': '#357a66',
          'success-dark': '#295f50',
          warning: '#D49A3A',     // Amber
          'warning-hover': '#ba842e',
          critical: '#B84A3A',    // Rust Red
          'critical-hover': '#9c3d2f',
        },
        // Legacy mesh compatibility aliases
        mesh: {
          dark: '#171A19',
          card: '#242927',
          cardBorder: '#333b37',
          accent: '#879B54',
          accentGlow: '#9db364',
          critical: '#B84A3A',
          urgent: '#D49A3A',
          normal: '#3F8F78',
          healthy: '#3F8F78',
          gateway: '#879B54',
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
