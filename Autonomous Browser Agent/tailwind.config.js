export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pilot: {
          bg: '#06110d',
          panel: 'rgba(12, 28, 23, 0.72)',
          line: 'rgba(124, 252, 190, 0.18)',
          green: '#39ff9c',
          mint: '#94f7c5',
          text: '#e9fff4',
          muted: '#91a99d'
        }
      },
      boxShadow: {
        glow: '0 0 36px rgba(57, 255, 156, 0.18)',
        panel: '0 22px 70px rgba(0, 0, 0, 0.38)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif']
      }
    }
  },
  plugins: []
};
