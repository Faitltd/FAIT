/// <reference types="cypress" />

describe('Simple Login Test', () => {
  it('should login with test credentials', () => {
    cy.visit('/login');
    
    // Try different selectors for login form
    cy.get('input[type="email"], input[name="email"]').first().type('client@itsfait.com');
    cy.get('input[type="password"], input[name="password"]').first().type('client123');
    cy.get('button[type="submit"], button:contains("Sign In"), button:contains("Login")').first().click();
    
    // Check for successful login
    cy.url().should('not.include', '/login');
    cy.wait(3000);
    cy.screenshot('after-login');
  });
});
