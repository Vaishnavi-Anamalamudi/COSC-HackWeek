/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#050807',
        panel: '#0B1110',
        line: 'rgba(255,255,255,0.1)',
        accent: '#22C55E',
      },
      boxShadow: {
        glow: '0 0 40px rgba(34,197,94,0.22)',
        card: '0 24px 80px rgba(0,0,0,0.38)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
