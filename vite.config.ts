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
      extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json'],
    },
    build: {
      chunkSizeWarningLimit: 350, // Increase from default 500kb to 350kb
      sourcemap: true, // Always generate source maps for better debugging and analysis
      rollupOptions: {
        output: {
          manualChunks: {
            // Framework chunks
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],

            // UI library chunks
            'ui-vendor': ['framer-motion', '@radix-ui/react-tabs', 'class-variance-authority', 'clsx'],

            // Icons - react-icons only since we're using individual imports for lucide-react
            'icons-vendor': ['react-icons'],

            // Calendar chunks - separate FullCalendar into its own chunk
            'calendar-vendor': [
              '@fullcalendar/core',
              '@fullcalendar/daygrid',
              '@fullcalendar/interaction',
              '@fullcalendar/react',
              '@fullcalendar/timegrid'
            ],

            // Utility chunks
            'utils-vendor': ['date-fns'],

            // Chart chunks
            'chart-vendor': ['chart.js'],

            // API chunks
            'api-vendor': ['@supabase/supabase-js', 'stripe'],

            // Map chunks
            'maps-vendor': ['@googlemaps/markerclusterer', '@googlemaps/js-api-loader'],
          }
        }
      }
    }
  };

  if (mode === 'simple') {
    return {
      ...baseConfig,
      server: {
        port: 5174,
      },
      build: {
        ...baseConfig.build,
        sourcemap: true, // Ensure source maps are enabled in simple mode too
        rollupOptions: {
          ...baseConfig.build.rollupOptions,
          input: {
            main: 'src/SimpleApp.tsx',
          },
        },
      },
    };
  }

  return baseConfig;
});
