/// <reference types="cypress" />

describe('Calculator Text Links Test', () => {
  it('should check if the calculator links exist and work', () => {
    cy.visit('/');
    
    // Check for Remodeling Calculator text
    cy.contains('Remodeling Calculator').should('exist');
    
    // Click on the link containing Remodeling Calculator text
    cy.contains('Remodeling Calculator').click();
    
    // Verify we're on the remodeling calculator page
    cy.url().should('include', '/calculator/remodeling');
    cy.go('back');
    
    // Check for Handyman Task Estimator text
    cy.contains('Handyman Task Estimator').should('exist');
    
    // Click on the link containing Handyman Task Estimator text
    cy.contains('Handyman Task Estimator').click();
    
    // Verify we're on the handyman calculator page
    cy.url().should('include', '/calculator/handyman');
    cy.go('back');
    
    // Check for View All Calculators text
    cy.contains('View All Calculators').should('exist');
    
    // Click on the link containing View All Calculators text
    cy.contains('View All Calculators').click();
    
    // Verify we're on the estimate page
    cy.url().should('include', '/calculator/estimate');
  });
});
