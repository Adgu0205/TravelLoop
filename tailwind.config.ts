import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          deep: '#061E29',
          mid: '#0a2535',
          surface: '#0f2d40',
        },
        accent: {
          teal: '#1D546D',
          sage: '#5F9598',
          gold: '#E0DDAA',
          'gold-dark': '#c8c577',
        },
        text: {
          primary: '#EEEDDE',
          muted: '#8a9aaa',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        glass: '20px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.4)',
        glow: '0 0 20px rgba(29,84,109,0.5)',
        'glow-gold': '0 0 20px rgba(224,221,170,0.3)',
      },
      keyframes: {
        'float-up': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'float-up': 'float-up 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'spin-slow': 'spin-slow 20s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
