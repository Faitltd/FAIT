/**
 * Webpack environment configuration
 * This file contains environment-specific settings for webpack
 */

const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

/**
 * Load environment variables from .env files
 * Priority: .env.local > .env.[environment] > .env
 */
function loadEnv(environment) {
  const envFiles = [
    '.env',
    `.env.${environment}`,
    '.env.local',
  ];

  const envVars = {};

  // Load each env file if it exists
  envFiles.forEach(file => {
    const envPath = path.resolve(__dirname, file);
    if (fs.existsSync(envPath)) {
      const fileEnv = dotenv.parse(fs.readFileSync(envPath));
      Object.keys(fileEnv).forEach(key => {
        envVars[key] = fileEnv[key];
      });
    }
  });

  return envVars;
}

/**
 * Get webpack environment configuration
 * @param {string} environment - The environment (development, production, test)
 * @returns {Object} Environment configuration
 */
function getEnvConfig(environment) {
  const env = loadEnv(environment);
  
  // Convert env variables to format for webpack DefinePlugin
  const envKeys = Object.keys(env).reduce((prev, next) => {
    prev[`process.env.${next}`] = JSON.stringify(env[next]);
    return prev;
  }, {});

  // Add environment-specific settings
  const config = {
    env: envKeys,
    isDevelopment: environment === 'development',
    isProduction: environment === 'production',
    isTest: environment === 'test',
    publicPath: env.PUBLIC_PATH || '/',
  };

  return config;
}

module.exports = getEnvConfig;
