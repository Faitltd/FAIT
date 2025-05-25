/// <reference types="cypress" />

describe('Get Started By ID Test', () => {
  it('should find the Get Started button by ID', () => {
    cy.visit('/');
    
    // Find the Get Started button by ID
    cy.get('#get-started-button').should('exist');
    cy.get('#get-started-button').should('have.attr', 'href', '/signup');
    
    // Click the Get Started button
    cy.get('#get-started-button').click();
    
    // Verify we're on the signup page
    cy.url().should('include', '/signup');
  });
});
