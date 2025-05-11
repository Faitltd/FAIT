/// <reference types="cypress" />

describe('Emergency Login Tests', () => {
  beforeEach(() => {
    // Clear cookies and local storage before each test
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('should navigate to emergency login page', () => {
    cy.visit('/login');
    
    // Look for emergency login link and click it
    cy.contains('a', /emergency login/i).click();
    
    // Verify we're on the emergency login page
    cy.url().should('include', '/direct-login');
    
    // Check for emergency login form elements
    cy.get('form').should('exist');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.contains('button', /login|sign in/i).should('exist');
  });

  it('should login successfully with Admin credentials using emergency login', () => {
    cy.visit('/direct-login');
    
    // Get credentials from Cypress environment variables
    const adminEmail = Cypress.env('adminEmail');
    const adminPassword = Cypress.env('adminPassword');
    
    // Fill in the form
    cy.get('input[type="email"]').clear().type(adminEmail);
    cy.get('input[type="password"]').clear().type(adminPassword);
    
    // Submit the form
    cy.contains('button', /login|sign in/i).click();
    
    // Verify successful login - should be redirected to admin dashboard
    cy.url().should('include', '/dashboard/admin');
    
    // Verify admin-specific content is visible
    cy.contains(/admin dashboard|welcome, admin/i).should('be.visible');
  });

  it('should login successfully with Client credentials using emergency login', () => {
    cy.visit('/direct-login');
    
    // Get credentials from Cypress environment variables
    const clientEmail = Cypress.env('clientEmail');
    const clientPassword = Cypress.env('clientPassword');
    
    // Fill in the form
    cy.get('input[type="email"]').clear().type(clientEmail);
    cy.get('input[type="password"]').clear().type(clientPassword);
    
    // Submit the form
    cy.contains('button', /login|sign in/i).click();
    
    // Verify successful login - should be redirected to client dashboard
    cy.url().should('include', '/dashboard/client');
    
    // Verify client-specific content is visible
    cy.contains(/client dashboard|welcome, client/i).should('be.visible');
  });

  it('should login successfully with Service Agent credentials using emergency login', () => {
    cy.visit('/direct-login');
    
    // Get credentials from Cypress environment variables
    const serviceEmail = Cypress.env('serviceEmail');
    const servicePassword = Cypress.env('servicePassword');
    
    // Fill in the form
    cy.get('input[type="email"]').clear().type(serviceEmail);
    cy.get('input[type="password"]').clear().type(servicePassword);
    
    // Submit the form
    cy.contains('button', /login|sign in/i).click();
    
    // Verify successful login - should be redirected to service agent dashboard
    cy.url().should('include', '/dashboard/service-agent');
    
    // Verify service agent-specific content is visible
    cy.contains(/service agent dashboard|welcome, service agent/i).should('be.visible');
  });

  it('should navigate to super emergency login page', () => {
    cy.visit('/direct-login');
    
    // Look for super emergency login link and click it
    cy.contains('a', /super emergency|advanced login/i).click();
    
    // Verify we're on the super emergency login page
    cy.url().should('include', '/super-login');
    
    // Check for super emergency login form elements
    cy.get('form').should('exist');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.contains('button', /login|sign in/i).should('exist');
  });
});
