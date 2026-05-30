/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdfbf7',
          100: '#f9f3e8',
          200: '#f0e4cc',
          300: '#e5cfaa',
          400: '#d4af37',
          500: '#c5a880',
          600: '#a8885e',
          700: '#8a6d45',
          800: '#6e5534',
          900: '#543f26',
        },
        dark: {
          50: '#f0f1f3',
          100: '#d1d4da',
          200: '#a3a9b5',
          300: '#757e90',
          400: '#47536b',
          500: '#2a3447',
          600: '#1a2233',
          700: '#0f1625',
          800: '#0b0f19',
          900: '#06090f',
        },
        surface: '#ffffff',
        canvas: '#fdfbf7',
        ink: '#1a2233',
        mute: '#757e90',
        accent: '#d4af37',
        accentSoft: '#f9f3e8',
        success: '#16a34a',
        warning: '#d97706',
        error: '#dc2626',
      },
      boxShadow: {
        panel: '0 10px 30px rgba(84, 63, 38, 0.08)',
      },
      borderRadius: {
        panel: '14px',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
