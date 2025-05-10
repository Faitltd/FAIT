/// <reference types="cypress" />

describe('Calculator Links', () => {
  it('should have working calculator links on the client dashboard', () => {
    // Login as a client
    cy.visit('/login');
    cy.get('input[name="email"]').type('client@itsfait.com');
    cy.get('input[name="password"]').type('client123');
    cy.get('button[type="submit"]').click();
    
    // Wait for dashboard to load
    cy.url().should('include', '/dashboard');
    
    // Check for calculator links in the dashboard
    cy.contains('Remodeling Calculator').should('exist');
    cy.contains('Handyman Task Estimator').should('exist');
    
    // Visit the calculator page
    cy.visit('/calculator/estimate');
    cy.contains('Free Instant Estimate').should('exist');
    cy.contains('Remodeling Calculator').should('exist');
    cy.contains('Handyman Task Estimator').should('exist');
  });
});
