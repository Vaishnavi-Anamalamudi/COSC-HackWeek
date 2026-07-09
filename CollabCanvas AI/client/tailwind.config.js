export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: '#0B1120',
        sidebar: '#111827',
        accent: '#22C55E',
        canvas: '#FFFFFF',
        glass: 'rgba(17, 24, 39, 0.78)'
      },
      boxShadow: {
        glow: '0 24px 90px rgba(0, 0, 0, 0.35)',
        soft: '0 12px 45px rgba(15, 23, 42, 0.24)'
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
