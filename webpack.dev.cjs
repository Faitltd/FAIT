const { merge } = require('webpack-merge');
const common = require('./webpack.config.cjs');
const path = require('path');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const BuildNotificationPlugin = require('./webpack-plugins/BuildNotificationPlugin');

module.exports = (env, argv) => {
  const commonConfig = common(env, { ...argv, mode: 'development' });

  return merge(commonConfig, {
    mode: 'development',
    devtool: 'eval-source-map',
    devServer: {
      historyApiFallback: true,
      port: 8080,
      hot: true,
      open: true,
      compress: true,
      client: {
        overlay: true,
        progress: true,
      },
      static: {
        directory: path.join(__dirname, 'public'),
      },
    },
    plugins: [
      new ReactRefreshWebpackPlugin(),
      new BuildNotificationPlugin({
        title: 'FAIT Co-op Webpack Dev',
        successMessage: 'Development build completed',
        errorMessage: 'Development build failed',
      }),
    ],
    optimization: {
      runtimeChunk: true,
    },
  });
};
