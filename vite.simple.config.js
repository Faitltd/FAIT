import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175, // Use a different port to avoid conflicts
  },
  build: {
    rollupOptions: {
      input: {
        main: './simple-app.html',
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
