/// <reference types="cypress" />

describe('Fixed App Login Test', () => {
  beforeEach(() => {
    // Clear cookies and local storage
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Visit login page
    cy.visit('/login');
    
    // Verify FixedApp is loaded
    cy.get('h1').should('contain', 'FAIT Co-op Test Page');
  });
  
  it('should interact with the login form using admin credentials', () => {
    // Enter admin credentials
    cy.get('input[type="email"]').clear().type('admin@itsfait.com');
    cy.get('input[type="password"]').clear().type('admin123');
    
    // Click the button
    cy.get('button').click();
    
    // Take a screenshot after interaction
    cy.screenshot('fixed-app-admin-login');
  });
  
  it('should interact with the login form using client credentials', () => {
    // Enter client credentials
    cy.get('input[type="email"]').clear().type('client@itsfait.com');
    cy.get('input[type="password"]').clear().type('client123');
    
    // Click the button
    cy.get('button').click();
    
    // Take a screenshot after interaction
    cy.screenshot('fixed-app-client-login');
  });
  
  it('should interact with the login form using service agent credentials', () => {
    // Enter service agent credentials
    cy.get('input[type="email"]').clear().type('service@itsfait.com');
    cy.get('input[type="password"]').clear().type('service123');
    
    // Click the button
    cy.get('button').click();
    
    // Take a screenshot after interaction
    cy.screenshot('fixed-app-service-login');
  });
});
