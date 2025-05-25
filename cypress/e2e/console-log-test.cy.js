/// <reference types="cypress" />

describe('Console Log Test', () => {
  it('should capture console logs on login page', () => {
    // Set up console log capture
    cy.window().then((win) => {
      cy.spy(win.console, 'log').as('consoleLog');
      cy.spy(win.console, 'error').as('consoleError');
      cy.spy(win.console, 'warn').as('consoleWarn');
    });
    
    // Visit the page
    cy.visit('/login');
    cy.wait(5000); // Wait for any potential errors
    
    // Check console logs
    cy.get('@consoleLog').then((spy) => {
      cy.log('Console logs:');
      spy.args.forEach((args, i) => {
        cy.log(`Log ${i}: ${JSON.stringify(args)}`);
      });
    });
    
    // Check console errors
    cy.get('@consoleError').then((spy) => {
      cy.log('Console errors:');
      spy.args.forEach((args, i) => {
        cy.log(`Error ${i}: ${JSON.stringify(args)}`);
      });
    });
    
    // Check console warnings
    cy.get('@consoleWarn').then((spy) => {
      cy.log('Console warnings:');
      spy.args.forEach((args, i) => {
        cy.log(`Warning ${i}: ${JSON.stringify(args)}`);
      });
    });
  });
});
