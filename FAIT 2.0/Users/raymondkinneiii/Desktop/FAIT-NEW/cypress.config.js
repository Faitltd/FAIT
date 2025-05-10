const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173', // Adjust this to match your dev server URL
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  
  // Configure viewport size
  viewportWidth: 1280,
  viewportHeight: 720,
  
  // Configure retries
  retries: {
    runMode: 2,
    openMode: 0,
  },
  
  // Configure screenshots and videos
  screenshotOnRunFailure: true,
  video: true,
  
  // Configure Supabase environment variables
  env: {
    SUPABASE_URL: 'https://sjrehyseqqptdcnadvod.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqcmVoeXNlcXFwdGRjbmFkdm9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MzMxMzcsImV4cCI6MjA1OTAwOTEzN30.fPyawZcgteRLZUH0MvtVSmNmZSdbxUOyN9lo6BDe8-8',
  },
});
