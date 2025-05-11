const { merge } = require('webpack-merge');
const common = require('./webpack.config.js');
const DashboardPlugin = require('webpack-dashboard/plugin');

module.exports = (env, argv) => {
  const commonConfig = common(env, { ...argv, mode: 'development' });
  
  return merge(commonConfig, {
    mode: 'development',
    devtool: 'eval-source-map',
    plugins: [
      new DashboardPlugin(),
    ],
  });
};
