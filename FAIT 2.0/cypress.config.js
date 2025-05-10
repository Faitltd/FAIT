import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: "ksq7ct",

  e2e: {
    baseUrl: 'http://localhost:3001',
    viewportWidth: 1280,
    viewportHeight: 800,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
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
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
