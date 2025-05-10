/// <reference types="cypress" />

describe('Simple Login Test with SimpleTestApp', () => {
  beforeEach(() => {
    // Clear cookies and local storage
    cy.clearCookies();
    cy.clearLocalStorage();

    // Visit home page with SimpleTestApp
    cy.visit('/');

    // Verify SimpleTestApp is loaded
    cy.get('h1').should('contain', 'FAIT Co-op Test Page');
  });

  it('should interact with the login form using admin credentials', () => {
    // Enter admin credentials
    cy.get('input[type="email"]').clear().type('admin@itsfait.com');
    cy.get('input[type="password"]').clear().type('admin123');

    // Click the button (since our SimpleTestApp doesn't have form submission)
    cy.get('button').click();

    // Take a screenshot after interaction
    cy.screenshot('admin-login-interaction');

    // Log the current URL after interaction
    cy.url().then(url => {
      cy.log(`Current URL after login attempt: ${url}`);
    });
  });

  it('should interact with the login form using client credentials', () => {
    // Enter client credentials
    cy.get('input[type="email"]').clear().type('client@itsfait.com');
    cy.get('input[type="password"]').clear().type('client123');

    // Click the button (since our SimpleTestApp doesn't have form submission)
    cy.get('button').click();

    // Take a screenshot after interaction
    cy.screenshot('client-login-interaction');

    // Log the current URL after interaction
    cy.url().then(url => {
      cy.log(`Current URL after login attempt: ${url}`);
    });
  });

  it('should interact with the login form using service agent credentials', () => {
    // Enter service agent credentials
    cy.get('input[type="email"]').clear().type('service@itsfait.com');
    cy.get('input[type="password"]').clear().type('service123');

    // Click the button (since our SimpleTestApp doesn't have form submission)
    cy.get('button').click();

    // Take a screenshot after interaction
    cy.screenshot('service-agent-login-interaction');

    // Log the current URL after interaction
    cy.url().then(url => {
      cy.log(`Current URL after login attempt: ${url}`);
    });
  });
});
