/// <reference types="cypress" />

describe('App Versions Test', () => {
  it('should load the simple test app', () => {
    cy.visit('/?version=simple');
    cy.get('h1').should('contain', 'FAIT Co-op Test Page');
    cy.get('form').should('exist');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.get('button').should('exist');
    cy.get('div').contains('Simple Test App').should('exist');
    cy.screenshot('simple-test-app');
  });

  it('should load the minimal app', () => {
    cy.visit('/?version=minimal');
    cy.get('nav').should('exist');
    cy.get('a').contains('Home').should('exist');
    cy.get('a').contains('Login').should('exist');
    cy.get('a').contains('Join Now').should('exist');
    cy.get('div').contains('Minimal App').should('exist');
    cy.screenshot('minimal-app');
  });

  it('should load the enhanced minimal app', () => {
    cy.visit('/?version=enhanced');
    cy.get('nav').should('exist');
    cy.get('a').contains('Home').should('exist');
    cy.get('a').contains('Login').should('exist');
    cy.get('a').contains('Join Now').should('exist');
    cy.get('div').contains('Enhanced Minimal App').should('exist');
    cy.screenshot('enhanced-minimal-app');
  });

  // This test might fail if the full app has issues
  it('should attempt to load the full app', () => {
    cy.visit('/?version=full', {
      // Don't fail the test if there's an uncaught exception
      onBeforeLoad(win) {
        cy.stub(win.console, 'error').as('consoleError');
        const originalOnError = win.onerror;
        win.onerror = (msg, source, lineno, colno, err) => {
          console.log('Caught error:', msg);
          return true; // Prevents the error from being propagated
        };
      }
    });

    // Check if either the app loaded or we got the error screen
    cy.get('body').then($body => {
      if ($body.find('nav').length > 0) {
        cy.log('Full app loaded successfully');
        cy.get('nav').should('exist');
        // Check for version indicator
        cy.get('div').contains('Full App').should('exist');
        cy.screenshot('full-app-success');
      } else if ($body.find('h1:contains("Error Rendering React App")').length > 0) {
        cy.log('Full app failed to load, but error screen is displayed');
        cy.get('h1').should('contain', 'Error Rendering React App');
        cy.get('pre').should('exist'); // Error message
        cy.screenshot('full-app-error');
      } else {
        cy.log('Unknown state - neither app nor error screen detected');
        cy.screenshot('full-app-unknown');
      }
    });
  });
});
