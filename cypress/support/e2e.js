// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
// ***********************************************************

// Import commands.js using CommonJS syntax:
require('./commands');

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Log the error for debugging
  console.log('Uncaught exception:', err.message);
  // returning false here prevents Cypress from failing the test
  return false;
});
