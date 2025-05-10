const { merge } = require('webpack-merge');
const common = require('./webpack.config.js');
const path = require('path');

module.exports = (env, argv) => {
  const commonConfig = common(env, { ...argv, mode: 'development' });
  
  return merge(commonConfig, {
    mode: 'development',
    devtool: 'inline-source-map',
    // Use a different entry point for tests
    entry: './src/test-entry.tsx',
    output: {
      path: path.resolve(__dirname, 'dist-test'),
      filename: 'js/[name].js',
      publicPath: '/',
    },
    // Add any test-specific configurations here
    module: {
      rules: [
        // Add any test-specific rules here
      ],
    },
    plugins: [
      // Add any test-specific plugins here
    ],
  });
};
