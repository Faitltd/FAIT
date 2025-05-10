/// <reference types="cypress" />

describe('Features Test', () => {
  it('should check if the Free Estimators section exists', () => {
    cy.visit('/');
    
    // Take a screenshot of the page
    cy.screenshot('homepage-full');
    
    // Check if the Free Estimators heading exists
    cy.contains('h3', 'Free Estimators').should('exist');
    
    // Check if the Remodeling Calculator link exists
    cy.contains('Remodeling Calculator').should('exist');
    
    // Check if the Handyman Task Estimator link exists
    cy.contains('Handyman Task Estimator').should('exist');
    
    // Check if the View All Calculators link exists
    cy.contains('View All Calculators').should('exist');
  });
});
