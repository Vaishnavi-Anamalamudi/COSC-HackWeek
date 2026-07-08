export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#08110d',
        panel: '#101b16',
        panelSoft: '#15241d',
        line: '#26362e',
        nova: '#47e98d',
        novaSoft: '#a7f3c4',
        warning: '#facc15',
        danger: '#fb7185'
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(71, 233, 141, 0.22), 0 20px 70px rgba(0, 0, 0, 0.38)'
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Cascadia Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
