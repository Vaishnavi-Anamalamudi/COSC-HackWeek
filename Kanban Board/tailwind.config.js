/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        flow: {
          ink: '#0B1120',
          sidebar: '#111827',
          panel: '#1F2937',
          accent: '#22C55E',
          text: '#F8FAFC',
          sky: '#38BDF8',
          gold: '#FBBF24',
          rose: '#FB7185',
          violet: '#A78BFA',
        },
      },
      boxShadow: {
        panel: '0 24px 80px rgba(0, 0, 0, 0.28)',
        glow: '0 18px 50px rgba(34, 197, 94, 0.22)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
