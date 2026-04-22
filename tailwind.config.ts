import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        green: {
          primary: '#4CAF50',
          dark: '#2E7D32',
          soft: '#E8F5E9',
        },
        brand: {
          bg: '#FAFAF7',
          card: '#FFFFFF',
          text: '#1A1D1A',
          muted: '#6B7168',
          border: 'rgba(0,0,0,0.06)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '28px',
      },
    },
  },
}

export default config
