/// <reference types="cypress" />

describe('Free Estimate Link Test', () => {
  it('should check if the Free Instant Estimate link exists and works', () => {
    cy.visit('/');
    
    // Check for Free Instant Estimate text
    cy.contains('Free Instant Estimate').should('exist');
    
    // Click on the link containing Free Instant Estimate text
    cy.contains('Free Instant Estimate').click();
    
    // Verify we're on the estimate page
    cy.url().should('include', '/calculator/estimate');
  });
});
