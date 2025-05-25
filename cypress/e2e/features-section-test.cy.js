/// <reference types="cypress" />

describe('Features Section Test', () => {
  it('should check if the features section exists and contains calculator links', () => {
    // Increase the default command timeout for this test
    Cypress.config('defaultCommandTimeout', 20000);
    
    cy.visit('/');
    
    // Wait for the page to fully load
    cy.wait(5000);
    
    // Check if the features section exists
    cy.get('.bg-gray-50 .py-12').should('exist');
    
    // Check if the features section contains the Free Estimators heading
    cy.get('.bg-gray-50 .py-12').contains('Free Estimators').should('exist');
    
    // Check if the features section contains the calculator links
    cy.get('.bg-gray-50 .py-12').contains('Remodeling Calculator').should('exist');
    cy.get('.bg-gray-50 .py-12').contains('Handyman Task Estimator').should('exist');
    cy.get('.bg-gray-50 .py-12').contains('View All Calculators').should('exist');
    
    // Click on the Remodeling Calculator link
    cy.get('.bg-gray-50 .py-12').contains('Remodeling Calculator').click();
    
    // Verify we're on the remodeling calculator page
    cy.url().should('include', '/calculator/remodeling');
  });
});
