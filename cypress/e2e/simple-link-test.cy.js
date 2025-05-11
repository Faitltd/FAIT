/// <reference types="cypress" />

describe('Simple Link Test', () => {
  it('should check if the Free Instant Estimate link works', () => {
    cy.visit('/');
    
    // Check for Free Instant Estimate button
    cy.contains('Free Instant Estimate').should('exist');
    
    // Test clicking the Free Instant Estimate button
    cy.contains('Free Instant Estimate').click();
    cy.url().should('include', '/calculator/estimate');
  });
});
