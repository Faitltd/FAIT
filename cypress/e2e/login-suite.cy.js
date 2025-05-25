/// <reference types="cypress" />

describe('Login Functionality Test Suite', () => {
  // Test credentials from user requirements
  const testCredentials = [
    {
      email: 'admin@itsfait.com',
      password: 'admin123',
      type: 'Admin'
    },
    {
      email: 'client@itsfait.com',
      password: 'client123',
      type: 'Client'
    },
    {
      email: 'service@itsfait.com',
      password: 'service123',
      type: 'Service Agent'
    }
  ];

  beforeEach(() => {
    // Clear cookies and local storage between tests
    cy.clearCookies();
    cy.clearLocalStorage();

    // Capture console logs
    cy.window().then((win) => {
      cy.spy(win.console, 'log').as('consoleLog');
      cy.spy(win.console, 'error').as('consoleError');
    });
  });

  describe('Standard Login Tests', () => {
    beforeEach(() => {
      // Visit the login page
      cy.visit('/login');

      // Verify we're on the login page
      cy.url().should('include', '/login');
      cy.get('form').should('exist');
      cy.get('input[type="email"]').should('exist');
      cy.get('input[type="password"]').should('exist');
    });

    // Test each set of credentials
    testCredentials.forEach((cred) => {
      it(`should attempt login with ${cred.type} credentials`, () => {
        // Enter credentials
        cy.get('input[type="email"]').clear().type(cred.email);
        cy.get('input[type="password"]').clear().type(cred.password);

        // Submit form
        cy.contains('button', /sign in/i).click();

        // Wait for any redirects to complete
        cy.wait(3000);

        // Log the current URL
        cy.url().then(url => {
          cy.log(`Current URL after login attempt: ${url}`);
        });

        // Check localStorage for any auth tokens or user info
        cy.window().then(win => {
          cy.log('LocalStorage contents:');
          Object.keys(win.localStorage).forEach(key => {
            cy.log(`${key}: ${win.localStorage.getItem(key)}`);
          });
        });
      });
    });

    it('should show error for invalid credentials', () => {
      // Enter invalid credentials
      cy.get('input[type="email"]').clear().type('wrong@example.com');
      cy.get('input[type="password"]').clear().type('wrongpassword');

      // Submit form
      cy.contains('button', /sign in/i).click();

      // Check for error message
      cy.contains(/invalid|error|failed/i, { timeout: 10000 }).should('be.visible');
    });

    it('should validate email format', () => {
      // Enter invalid email format
      cy.get('input[type="email"]').clear().type('invalid-email');
      cy.get('input[type="password"]').clear().type('password123');

      // Submit form
      cy.contains('button', /sign in/i).click();

      // Check that we're still on the login page (form wasn't submitted)
      cy.url().should('include', '/login');
    });
  });

  describe('Emergency Login Tests', () => {
    it('should navigate to emergency login page', () => {
      cy.visit('/login');

      // Look for emergency login link and click it
      cy.contains('a', /emergency|direct login/i).click();

      // Verify we're on the emergency login page
      cy.url().should('include', '/direct-login');

      // Check for login form elements
      cy.get('form').should('exist');
      cy.get('input[type="email"]').should('exist');
      cy.get('input[type="password"]').should('exist');
    });

    // Test each set of credentials with emergency login
    testCredentials.forEach((cred) => {
      it(`should login with ${cred.type} credentials using emergency login`, () => {
        cy.visit('/direct-login');

        // Enter credentials
        cy.get('input[type="email"]').clear().type(cred.email);
        cy.get('input[type="password"]').clear().type(cred.password);

        // Submit form
        cy.contains('button', /sign in|login/i).click();

        // Wait for any redirects to complete
        cy.wait(3000);

        // Log the current URL
        cy.url().then(url => {
          cy.log(`Current URL after login attempt: ${url}`);
        });
      });
    });
  });

  describe('Super Emergency Login Tests', () => {
    it('should navigate to super emergency login page', () => {
      cy.visit('/direct-login');

      // Look for super emergency login link and click it
      cy.contains('a', /super emergency|advanced login/i).click();

      // Verify we're on the super emergency login page
      cy.url().should('include', '/super-login');

      // Check for login form elements
      cy.get('form').should('exist');
      cy.get('input[type="email"]').should('exist');
      cy.get('input[type="password"]').should('exist');
    });

    // Test each set of credentials with super emergency login
    testCredentials.forEach((cred) => {
      it(`should login with ${cred.type} credentials using super emergency login`, () => {
        cy.visit('/super-login');

        // Enter credentials
        cy.get('input[type="email"]').clear().type(cred.email);
        cy.get('input[type="password"]').clear().type(cred.password);

        // Submit form
        cy.contains('button', /sign in|login/i).click();

        // Wait for any redirects to complete
        cy.wait(3000);

        // Log the current URL
        cy.url().then(url => {
          cy.log(`Current URL after login attempt: ${url}`);
        });
      });
    });
  });
});
