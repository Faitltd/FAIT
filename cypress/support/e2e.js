// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Note: In Cypress 12+, we use cy.session() instead of Cypress.Cookies.defaults()
// This will be handled in the beforeEach blocks of our tests

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  return false;
});

// Add custom event listeners for test events
before(() => {
  cy.log('Starting FAIT Co-op client functionality tests');

  // Add custom event listener for test events
  Cypress.on('window:before:load', (win) => {
    // Create a custom event handler for test events
    win.handleTestEvent = (event) => {
      cy.log(`Test event received: ${event.type}`);
    };

    // Add event listeners for test events
    ['test:new-message', 'test:new-quotes', 'test:progress-update',
     'test:payment-request', 'test:project-complete', 'test:approve-verification',
     'test:payment-history', 'test:pending-payment', 'test:invoices',
     'test:complete-project'].forEach(eventType => {
      win.addEventListener(eventType, win.handleTestEvent);
    });
  });
});

after(() => {
  cy.log('Completed FAIT Co-op client functionality tests');
});
