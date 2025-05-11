/// <reference types="cypress" />

describe('Simple Test', () => {
  it('should check if the Free Instant Estimate link exists and works', () => {
    // Increase the default command timeout for this test
    Cypress.config('defaultCommandTimeout', 20000);
    
    cy.visit('/');
    
    // Wait for the page to fully load
    cy.wait(5000);
    
    // Check for Free Instant Estimate text
    cy.contains('Free Instant Estimate').should('exist');
    
    // Click on the link containing Free Instant Estimate text
    cy.contains('Free Instant Estimate').click();
    
    // Verify we're on the estimate page
    cy.url().should('include', '/calculator/estimate');
  });
});
