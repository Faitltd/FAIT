const { defineConfig } = require('cypress');

// Monorepo Cypress configuration
module.exports = defineConfig({
  projectId: "ksq7ct",

  e2e: {
    baseUrl: 'http://localhost:5173', // Main app URL
    viewportWidth: 1280,
    viewportHeight: 800,
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 30000,
    pageLoadTimeout: 60000,
    video: false,
    screenshotOnRunFailure: true,
    trashAssetsBeforeRuns: true,
    chromeWebSecurity: false,
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on("task", {
        log(message) {
          console.log(message);
          return null;
        },
      });
    },
  },

  env: {
    apiUrl: "http://localhost:8000",
    // Test credentials
    adminEmail: 'admin@itsfait.com',
    adminPassword: 'admin123',
    clientEmail: 'client@itsfait.com',
    clientPassword: 'client123',
    serviceEmail: 'service@itsfait.com',
    servicePassword: 'service123',
    // Additional configuration
    useLocalAuth: true,
    testMode: true,

    // Tool-specific URLs
    homeDepotScraperUrl: 'http://localhost:5000',
    handymanCalculatorUrl: 'http://localhost:8082',

    // Test environment flags
    runAllTests: true,
    fixFailingTests: true
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
