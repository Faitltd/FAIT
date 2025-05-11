describe('Authentication Tests', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display the login form', () => {
    cy.get('form').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should show validation errors for empty fields', () => {
    cy.get('button[type="submit"]').click();
    cy.get('form').contains('required').should('be.visible');
  });

  it('should show error for invalid credentials', () => {
    cy.get('input[type="email"]').type('invalid@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    // Wait for error message
    cy.contains('Invalid email or password', { timeout: 10000 }).should('be.visible');
  });

  it('should login as admin user', () => {
    cy.get('input[type="email"]').type(Cypress.env('adminEmail'));
    cy.get('input[type="password"]').type(Cypress.env('adminPassword'));
    cy.get('button[type="submit"]').click();
    
    // Verify successful login
    cy.url().should('include', '/admin/dashboard');
    cy.contains('Admin Dashboard').should('be.visible');
  });

  it('should login as client user', () => {
    cy.get('input[type="email"]').type(Cypress.env('clientEmail'));
    cy.get('input[type="password"]').type(Cypress.env('clientPassword'));
    cy.get('button[type="submit"]').click();
    
    // Verify successful login
    cy.url().should('include', '/client/dashboard');
    cy.contains('Client Dashboard').should('be.visible');
  });

  it('should login as service agent user', () => {
    cy.get('input[type="email"]').type(Cypress.env('serviceEmail'));
    cy.get('input[type="password"]').type(Cypress.env('servicePassword'));
    cy.get('button[type="submit"]').click();
    
    // Verify successful login
    cy.url().should('include', '/service/dashboard');
    cy.contains('Service Dashboard').should('be.visible');
  });

  it('should redirect to previous page after login', () => {
    // Visit a protected page first
    cy.visit('/projects');
    
    // Should redirect to login
    cy.url().should('include', '/login');
    
    // Login
    cy.get('input[type="email"]').type(Cypress.env('clientEmail'));
    cy.get('input[type="password"]').type(Cypress.env('clientPassword'));
    cy.get('button[type="submit"]').click();
    
    // Should redirect back to the projects page
    cy.url().should('include', '/projects');
  });

  it('should allow logout', () => {
    // Login first
    cy.get('input[type="email"]').type(Cypress.env('clientEmail'));
    cy.get('input[type="password"]').type(Cypress.env('clientPassword'));
    cy.get('button[type="submit"]').click();
    
    // Verify login
    cy.url().should('include', '/client/dashboard');
    
    // Logout
    cy.get('[data-testid="user-menu"]').click();
    cy.contains('Logout').click();
    
    // Verify logout
    cy.url().should('include', '/login');
  });
});
