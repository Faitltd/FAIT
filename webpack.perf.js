/**
 * Enhanced Webpack Configuration for Performance
 *
 * This configuration extends the production webpack configuration with
 * additional optimizations for performance, including:
 * - Advanced code splitting
 * - Bundle size optimization
 * - Performance budgets
 * - Improved caching strategies
 */

const { merge } = require('webpack-merge');
const prod = require('./webpack.prod.cjs');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const { SubresourceIntegrityPlugin } = require('webpack-subresource-integrity');
const { DefinePlugin } = require('webpack');

// Performance budget thresholds (in bytes)
const PERFORMANCE_BUDGETS = {
  maxEntrypointSize: 250000, // 250 KB
  maxAssetSize: 250000, // 250 KB
  maxInitialChunkSize: 250000, // 250 KB
  maxAsyncChunkSize: 100000, // 100 KB
};

module.exports = (env, argv) => {
  const prodConfig = prod(env, argv);
  const isAnalyze = env.analyze || false;

  return merge(prodConfig, {
    // Set performance budgets
    performance: {
      hints: 'warning',
      maxEntrypointSize: PERFORMANCE_BUDGETS.maxEntrypointSize,
      maxAssetSize: PERFORMANCE_BUDGETS.maxAssetSize,
    },

    // Enhanced optimization configuration
    optimization: {
      minimize: true,
      minimizer: [
        // JavaScript minification with advanced options
        new TerserPlugin({
          parallel: true,
          terserOptions: {
            ecma: 2020,
            parse: {
              ecma: 2020,
            },
            compress: {
              ecma: 2020,
              comparisons: true,
              inline: 2,
              drop_console: true,
              drop_debugger: true,
              pure_funcs: ['console.info', 'console.debug', 'console.log'],
            },
            mangle: {
              safari10: true,
            },
            output: {
              ecma: 2020,
              comments: false,
              ascii_only: true,
            },
          },
          extractComments: false,
        }),

        // CSS minification with advanced options
        new CssMinimizerPlugin({
          parallel: true,
          minimizerOptions: {
            preset: [
              'default',
              {
                discardComments: { removeAll: true },
                normalizeWhitespace: true,
                minifyFontValues: { removeQuotes: false },
              },
            ],
          },
        }),
      ],

      // Advanced code splitting configuration
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: 25,
        maxAsyncRequests: 25,
        minSize: 20000,
        maxSize: PERFORMANCE_BUDGETS.maxAsyncChunkSize,
        cacheGroups: {
          // Framework code (React, ReactDOM, etc.)
          framework: {
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            name: 'framework',
            chunks: 'all',
            priority: 40,
            enforce: true,
          },

          // UI libraries
          ui: {
            test: /[\\/]node_modules[\\/](framer-motion|@radix-ui|lucide-react|class-variance-authority|clsx)[\\/]/,
            name: 'ui-lib',
            chunks: 'all',
            priority: 30,
            enforce: true,
          },

          // Routing libraries
          router: {
            test: /[\\/]node_modules[\\/](react-router|react-router-dom|@remix-run)[\\/]/,
            name: 'router',
            chunks: 'all',
            priority: 30,
            enforce: true,
          },

          // Utility libraries
          utils: {
            test: /[\\/]node_modules[\\/](date-fns|lodash|crypto-js|libphonenumber-js)[\\/]/,
            name: 'utils',
            chunks: 'all',
            priority: 20,
            enforce: true,
          },

          // Maps libraries
          maps: {
            test: /[\\/]node_modules[\\/](@googlemaps|google-maps)[\\/]/,
            name: 'maps',
            chunks: 'all',
            priority: 20,
            enforce: true,
          },

          // Calendar libraries
          calendar: {
            test: /[\\/]node_modules[\\/](@fullcalendar)[\\/]/,
            name: 'calendar',
            chunks: 'all',
            priority: 20,
            enforce: true,
          },

          // Vendor code (node_modules)
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            enforce: true,
          },

          // Common code used in multiple chunks
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'async',
            priority: 5,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      },

      // Extract runtime code
      runtimeChunk: 'single',

      // Ensure modules are deterministically named
      moduleIds: 'deterministic',

      // Ensure chunks are deterministically named
      chunkIds: 'deterministic',
    },

    // Additional plugins for performance
    plugins: [
      // Define environment variables
      new DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production'),
        'process.env.PERFORMANCE_MODE': JSON.stringify('true'),
      }),

      // Generate compressed versions of assets
      new CompressionPlugin({
        filename: '[path][base].gz',
        algorithm: 'gzip',
        test: /\.(js|css|html|svg)$/,
        threshold: 10240, // Only compress files > 10 KB
        minRatio: 0.8, // Only compress files that compress well
      }),

      // Generate Brotli compressed versions of assets
      new CompressionPlugin({
        filename: '[path][base].br',
        algorithm: 'brotliCompress',
        test: /\.(js|css|html|svg)$/,
        threshold: 10240, // Only compress files > 10 KB
        minRatio: 0.8, // Only compress files that compress well
        compressionOptions: { level: 11 }, // Maximum compression
      }),

      // Generate a manifest of all assets
      new WebpackManifestPlugin({
        fileName: 'asset-manifest.json',
        publicPath: '/',
        generate: (seed, files, entrypoints) => {
          const manifestFiles = files.reduce((manifest, file) => {
            manifest[file.name] = file.path;
            return manifest;
          }, seed);

          const entrypointFiles = entrypoints.main.filter(
            fileName => !fileName.endsWith('.map')
          );

          return {
            files: manifestFiles,
            entrypoints: entrypointFiles,
          };
        },
      }),

      // Add subresource integrity attributes to assets
      new SubresourceIntegrityPlugin({
        hashFuncNames: ['sha256', 'sha384'],
        enabled: true,
      }),

      // Add bundle analyzer if analyze flag is set
      ...(isAnalyze ? [
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: 'bundle-analysis.html',
          openAnalyzer: true,
        }),
      ] : []),
    ],

    // Output configuration
    output: {
      // Add content hash to file names for better caching
      filename: 'js/[name].[contenthash:8].js',
      chunkFilename: 'js/[name].[contenthash:8].chunk.js',

      // Add crossorigin attribute for better error reporting
      crossOriginLoading: 'anonymous',
    },

    // Module rules
    module: {
      rules: [
        // Add module rules if needed
      ],
    },

    // Resolve configuration
    resolve: {
      // Add resolve configuration if needed
    },
  });
};
