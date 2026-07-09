/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B1120',
        panel: '#111827',
        accent: '#22C55E',
        text: '#F8FAFC',
      },
      boxShadow: {
        glow: '0 18px 80px rgba(34, 197, 94, 0.16)',
        panel: '0 18px 60px rgba(0, 0, 0, 0.28)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
