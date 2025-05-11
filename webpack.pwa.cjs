/**
 * Webpack PWA Configuration
 * 
 * This configuration extends the production webpack configuration with
 * Progressive Web App features, including:
 * - Service worker for offline support
 * - Web app manifest
 * - Icon generation
 * - Cache management
 */

const { merge } = require('webpack-merge');
const prod = require('./webpack.prod.cjs');
const WorkboxPlugin = require('workbox-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
const { DefinePlugin } = require('webpack');

module.exports = (env, argv) => {
  const prodConfig = prod(env, argv);
  
  return merge(prodConfig, {
    plugins: [
      // Define environment variables
      new DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production'),
        'process.env.PWA_ENABLED': JSON.stringify('true'),
      }),
      
      // Copy PWA assets
      new CopyPlugin({
        patterns: [
          { 
            from: 'public/manifest.json', 
            to: 'manifest.json' 
          },
          { 
            from: 'public/offline.html', 
            to: 'offline.html' 
          },
          { 
            from: 'public/icons', 
            to: 'icons',
            noErrorOnMissing: true
          }
        ],
      }),
      
      // Generate service worker
      new WorkboxPlugin.GenerateSW({
        clientsClaim: true,
        skipWaiting: true,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        
        // Don't precache images or large files
        exclude: [/\.(?:png|jpg|jpeg|svg|gif)$/],
        
        // Define runtime caching rules
        runtimeCaching: [
          // Cache images with a cache-first strategy
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
          
          // Cache CSS and JS with a stale-while-revalidate strategy
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
            },
          },
          
          // Cache Google Fonts stylesheets
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            },
          },
          
          // Cache Google Fonts webfonts
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          
          // Cache API requests with a network-first strategy
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
            },
          },
          
          // Cache other origin requests with a stale-while-revalidate strategy
          {
            urlPattern: /^https:\/\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'cross-origin',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
            },
          },
        ],
        
        // Offline fallback
        navigateFallback: '/offline.html',
        navigateFallbackDenylist: [
          // Avoid caching API requests, admin routes, etc.
          /^\/api\//,
          /^\/admin\//,
          /\.(json|xml|csv|png|jpg|jpeg|gif|webp|svg)$/,
        ],
      }),
    ],
  });
};
