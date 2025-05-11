/// <reference types="cypress" />

describe('Find Services Button Test', () => {
  it('should check if the Find Services button exists and links to the services search page', () => {
    // Visit the home page
    cy.visit('/');
    
    // Check if the Find Services button exists
    cy.contains('Find Services').should('exist');
    
    // Click the Find Services button
    cy.contains('Find Services').click();
    
    // Verify we're on the services search page
    cy.url().should('include', '/services/search');
    
    // Verify the services search page has loaded correctly
    cy.contains('Find Service Providers').should('exist');
  });
});
