/// <reference types="cypress" />

describe('Get Started Button Test', () => {
  it('should check if the Get Started button exists and links to the signup page', () => {
    // Visit the home page
    cy.visit('/');

    // Check if the Get Started button exists
    cy.contains('Get Started').should('exist');

    // Click the Get Started button
    cy.contains('Get Started').click();

    // Verify we're on the register page
    cy.url().should('include', '/register');
  });
});
