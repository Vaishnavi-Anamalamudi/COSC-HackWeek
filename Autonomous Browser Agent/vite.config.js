import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5175,
    proxy: {
      '/api': 'http://localhost:8787',
      '/screenshots': 'http://localhost:8787',
      '/reports': 'http://localhost:8787',
      '/uploads': 'http://localhost:8787',
      '/ws': {
        target: 'ws://localhost:8787',
        ws: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
