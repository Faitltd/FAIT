/// <reference types="cypress" />

describe('Warranty Page Test', () => {
  it('should navigate to the warranty page', () => {
    // Visit the home page
    cy.visit('/');
    
    // Click the More Options button to open the dropdown
    cy.get('[data-testid="more-options-button"]').click();
    
    // Click the Warranties link
    cy.get('[data-testid="dropdown-link-warranties"]').click();
    
    // Verify we're on the warranty page
    cy.url().should('include', '/warranty');
    
    // Take a screenshot of the warranty page
    cy.screenshot('warranty-page');
  });
  
  it('should display warranty page elements', () => {
    // Visit the warranty page directly
    cy.visit('/warranty');
    
    // Check for page title
    cy.get('h1').should('exist');
    
    // Check for warranty content
    cy.get('main').should('exist');
  });
});
