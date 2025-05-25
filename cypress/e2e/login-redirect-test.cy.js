/// <reference types="cypress" />

describe('Login Redirect Test', () => {
  beforeEach(() => {
    // Clear cookies and local storage
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Enable local auth
    cy.window().then(win => {
      win.localStorage.setItem('useLocalAuth', 'true');
    });
    
    // Visit login page
    cy.visit('/login');
  });
  
  it('should redirect admin to admin dashboard after login', () => {
    // Enter admin credentials
    cy.get('input[type="email"]').clear().type('admin@itsfait.com');
    cy.get('input[type="password"]').clear().type('admin123');
    
    // Intercept navigation to dashboard
    cy.intercept('**/dashboard/admin*').as('adminDashboard');
    
    // Submit form
    cy.get('form').submit();
    
    // Wait for navigation
    cy.wait(3000);
    
    // Check URL contains admin dashboard path
    cy.url().should('include', '/dashboard/admin');
  });
  
  it('should redirect client to client dashboard after login', () => {
    // Enter client credentials
    cy.get('input[type="email"]').clear().type('client@itsfait.com');
    cy.get('input[type="password"]').clear().type('client123');
    
    // Intercept navigation to dashboard
    cy.intercept('**/dashboard/client*').as('clientDashboard');
    
    // Submit form
    cy.get('form').submit();
    
    // Wait for navigation
    cy.wait(3000);
    
    // Check URL contains client dashboard path
    cy.url().should('include', '/dashboard/client');
  });
  
  it('should redirect service agent to service agent dashboard after login', () => {
    // Enter service agent credentials
    cy.get('input[type="email"]').clear().type('service@itsfait.com');
    cy.get('input[type="password"]').clear().type('service123');
    
    // Intercept navigation to dashboard
    cy.intercept('**/dashboard/service-agent*').as('serviceDashboard');
    
    // Submit form
    cy.get('form').submit();
    
    // Wait for navigation
    cy.wait(3000);
    
    // Check URL contains service agent dashboard path
    cy.url().should('include', '/dashboard/service-agent');
  });
});
