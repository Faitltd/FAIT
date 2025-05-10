/// <reference types="cypress" />

describe('Calculator Navigation', () => {
  beforeEach(() => {
    // Visit the home page before each test
    cy.visit('/');

    // Wait for the page to load
    cy.wait(1000);
  });

  it('should navigate to the calculator page from the home page', () => {
    // Find and click the Free Instant Estimate button
    cy.contains('Free Instant Estimate').should('be.visible').click();

    // Verify URL changed to calculator page
    cy.url().should('include', '/calculator/estimate');

    // Verify calculator page loaded
    cy.contains('h1', 'Free Instant Estimate').should('be.visible');

    // Verify tabs are present
    cy.contains('button', 'Remodeling Calculator').should('be.visible');
    cy.contains('button', 'Handyman Task Estimator').should('be.visible');
  });

  it('should switch between calculator tabs', () => {
    // Go to calculator page
    cy.visit('/calculator/estimate');

    // Wait for page to load
    cy.wait(1000);

    // Verify Remodeling Calculator is active by default
    cy.contains('button', 'Remodeling Calculator').should('have.class', 'border-blue-500');

    // Switch to Handyman Calculator
    cy.contains('button', 'Handyman Task Estimator').click();

    // Verify Handyman Calculator is now active
    cy.contains('button', 'Handyman Task Estimator').should('have.class', 'border-blue-500');

    // Switch back to Remodeling Calculator
    cy.contains('button', 'Remodeling Calculator').click();

    // Verify Remodeling Calculator is active again
    cy.contains('button', 'Remodeling Calculator').should('have.class', 'border-blue-500');
  });

  it('should navigate back to home from calculator page', () => {
    // Go to calculator page
    cy.visit('/calculator/estimate');

    // Wait for page to load
    cy.wait(1000);

    // Find and click the Back to Home link
    cy.contains('Back to Home').should('be.visible').click();

    // Verify URL changed back to home page
    cy.url().should('eq', Cypress.config().baseUrl + '/');

    // Verify home page loaded
    cy.contains('Welcome to').should('be.visible');
  });
});
