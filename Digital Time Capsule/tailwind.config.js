/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        vault: {
          ink: '#0B1120',
          panel: '#111827',
          panel2: '#182233',
          accent: '#22C55E',
          gold: '#FBBF24',
          rose: '#FB7185',
          sky: '#38BDF8',
        },
      },
      boxShadow: {
        glow: '0 24px 70px rgba(34, 197, 94, 0.18)',
        panel: '0 18px 60px rgba(15, 23, 42, 0.22)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
