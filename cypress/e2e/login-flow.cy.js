/// <reference types="cypress" />

describe('Login Flow Testing', () => {
  // Test credentials from user requirements
  const testCredentials = [
    { 
      email: 'admin@itsfait.com', 
      password: 'admin123', 
      type: 'Admin', 
      expectedUrl: '/dashboard',
      expectedContent: ['Admin', 'Dashboard']
    },
    { 
      email: 'client@itsfait.com', 
      password: 'client123', 
      type: 'Client', 
      expectedUrl: '/dashboard',
      expectedContent: ['Client', 'Dashboard', 'Projects']
    },
    { 
      email: 'service@itsfait.com', 
      password: 'service123', 
      type: 'Service Agent', 
      expectedUrl: '/dashboard',
      expectedContent: ['Service', 'Dashboard', 'Jobs']
    }
  ];

  beforeEach(() => {
    // Clear cookies and local storage between tests
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Visit the home page
    cy.visit('/');
  });

  testCredentials.forEach((cred) => {
    describe(`${cred.type} Login Flow`, () => {
      it(`should navigate to login page from home`, () => {
        // Find and click on login link
        cy.contains('a', /login|sign in/i).click();
        
        // Verify we're on the login page
        cy.url().should('include', '/login');
        cy.get('form').should('exist');
      });

      it(`should login successfully with ${cred.type} credentials`, () => {
        // Navigate to login page
        cy.visit('/login');
        
        // Enter credentials
        cy.get('input[type="email"]').clear().type(cred.email);
        cy.get('input[type="password"]').clear().type(cred.password);
        
        // Submit form
        cy.get('[data-cy=login-submit]').click();
        
        // Check for successful login - should redirect to dashboard
        cy.url().should('include', cred.expectedUrl, { timeout: 10000 });
        
        // Verify user-specific content is visible
        cred.expectedContent.forEach(content => {
          cy.contains(content, { timeout: 10000 }).should('be.visible');
        });
      });

      it(`should maintain ${cred.type} session after page refresh`, () => {
        // Login first
        cy.visit('/login');
        cy.get('input[type="email"]').clear().type(cred.email);
        cy.get('input[type="password"]').clear().type(cred.password);
        cy.get('[data-cy=login-submit]').click();
        cy.url().should('include', cred.expectedUrl, { timeout: 10000 });
        
        // Refresh the page
        cy.reload();
        
        // Verify we're still logged in
        cy.url().should('include', cred.expectedUrl);
        cred.expectedContent.forEach(content => {
          cy.contains(content, { timeout: 10000 }).should('be.visible');
        });
      });

      it(`should allow ${cred.type} to log out`, () => {
        // Login first
        cy.visit('/login');
        cy.get('input[type="email"]').clear().type(cred.email);
        cy.get('input[type="password"]').clear().type(cred.password);
        cy.get('[data-cy=login-submit]').click();
        cy.url().should('include', cred.expectedUrl, { timeout: 10000 });
        
        // Log out
        cy.get('[data-cy=user-menu]').click();
        cy.get('[data-cy=logout]').click();
        
        // Verify we're logged out and back at login page
        cy.url().should('include', '/login');
      });
    });
  });

  describe('Login Form Validation', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('should validate required fields', () => {
      // Submit empty form
      cy.get('input[type="email"]').clear();
      cy.get('input[type="password"]').clear();
      cy.get('[data-cy=login-submit]').click();
      
      // Check that we're still on the login page
      cy.url().should('include', '/login');
    });

    it('should validate email format', () => {
      // Enter invalid email format
      cy.get('input[type="email"]').clear().type('invalid-email');
      cy.get('input[type="password"]').clear().type('password123');
      cy.get('[data-cy=login-submit]').click();
      
      // Check that we're still on the login page
      cy.url().should('include', '/login');
    });

    it('should show error for invalid credentials', () => {
      // Enter invalid credentials
      cy.get('input[type="email"]').clear().type('wrong@example.com');
      cy.get('input[type="password"]').clear().type('wrongpassword');
      cy.get('[data-cy=login-submit]').click();
      
      // Check for error message
      cy.contains('Invalid email or password', { timeout: 10000 }).should('be.visible');
    });
  });
});
