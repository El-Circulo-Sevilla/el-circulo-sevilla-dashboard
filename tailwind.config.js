/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#f8fafc',
        ink: '#0f172a',
        mute: '#64748b',
        accent: '#0f766e',
        accentSoft: '#ccfbf1',
      },
      boxShadow: {
        panel: '0 8px 24px rgba(15, 23, 42, 0.06)',
      },
      borderRadius: {
        panel: '14px',
      },
    },
  },
  plugins: [],
};
