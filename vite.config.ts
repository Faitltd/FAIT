import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const baseConfig = {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
  };

  if (mode === 'simple') {
    return {
      ...baseConfig,
      server: {
        port: 5174,
      },
      build: {
        rollupOptions: {
          input: {
            main: 'src/SimpleApp.tsx',
          },
        },
      },
    };
  }

  return baseConfig;
});
