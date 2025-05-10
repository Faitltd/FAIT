/// <reference types="cypress" />

describe('Data TestID Test', () => {
  it('should check if the calculator links with data-testid attributes exist and work', () => {
    // Increase the default command timeout for this test
    Cypress.config('defaultCommandTimeout', 20000);
    
    cy.visit('/');
    
    // Wait for the page to fully load
    cy.wait(5000);
    
    // Check if the Free Instant Estimate link exists
    cy.get('[data-testid="free-instant-estimate-link"]').should('exist');
    
    // Click on the Free Instant Estimate link
    cy.get('[data-testid="free-instant-estimate-link"]').click();
    
    // Verify we're on the estimate page
    cy.url().should('include', '/calculator/estimate');
    cy.go('back');
    
    // Wait for the page to fully load again
    cy.wait(5000);
    
    // Check if the Remodeling Calculator link exists
    cy.get('[data-testid="remodeling-calculator-link"]').should('exist');
    
    // Click on the Remodeling Calculator link
    cy.get('[data-testid="remodeling-calculator-link"]').click();
    
    // Verify we're on the remodeling calculator page
    cy.url().should('include', '/calculator/remodeling');
  });
});
