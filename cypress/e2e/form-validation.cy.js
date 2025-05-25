/// <reference types="cypress" />

describe('Form Validation', () => {
  describe('Login Form Validation', () => {
    beforeEach(() => {
      // Visit the login page before each test
      cy.visit('/login');
    });

    it('should validate email format', () => {
      // Enter invalid email format
      cy.get('input[type="email"]').type('invalid-email');
      cy.get('input[type="password"]').type('password123');

      // Submit form
      cy.contains('button', /sign in/i).click();

      // Check that we're still on the login page (form wasn't submitted)
      cy.url().should('include', '/login');
    });

    it('should validate password length', () => {
      // Enter short password
      cy.get('input[type="email"]').type('valid@example.com');
      cy.get('input[type="password"]').type('123');

      // Submit form
      cy.contains('button', /sign in/i).click();

      // Check that we're still on the login page (form wasn't submitted)
      cy.url().should('include', '/login');
    });

    it('should show error for non-existent user', () => {
      // Enter credentials for non-existent user
      cy.get('input[type="email"]').type('nonexistent@example.com');
      cy.get('input[type="password"]').type('Password123!');

      // Submit form
      cy.contains('button', /sign in/i).click();

      // Check for error message
      cy.contains('Invalid email or password').should('be.visible');
    });
  });

  describe('Registration Form Validation', () => {
    beforeEach(() => {
      // Visit the registration page before each test
      cy.visit('/register');
    });

    it('should validate email format', () => {
      // Enter invalid email format - use first() to ensure we're only targeting one element
      cy.get('input[type="email"]').first().type('invalid-email');
      cy.get('input[type="password"]').first().type('Password123!');

      // Submit form
      cy.contains('button', /create account/i).click();

      // Check that we're still on the registration page (form wasn't submitted)
      cy.url().should('include', '/register');
    });

    it('should validate password strength', () => {
      // Enter weak password - use first() to ensure we're only targeting one element
      cy.get('input[type="email"]').first().type('valid@example.com');
      cy.get('input[type="password"]').first().type('123456');

      // Submit form
      cy.contains('button', /create account/i).click();

      // Check that we're still on the registration page (form wasn't submitted)
      cy.url().should('include', '/register');
    });

    it('should validate required fields', () => {
      // Submit form without filling any fields
      cy.contains('button', /create account/i).click();

      // Check that we're still on the registration page (form wasn't submitted)
      cy.url().should('include', '/register');
    });
  });

  describe('Forgot Password Form Validation', () => {
    beforeEach(() => {
      // Visit the forgot password page before each test
      cy.visit('/forgot-password');
    });

    it('should validate email format', () => {
      // Enter invalid email format
      cy.get('input[type="email"]').type('invalid-email');

      // Submit form
      cy.contains('button', /send reset instructions/i).click();

      // Check that we're still on the forgot password page (form wasn't submitted)
      cy.url().should('include', '/forgot-password');
    });

    it('should validate required fields', () => {
      // Submit form without filling any fields
      cy.contains('button', /send reset instructions/i).click();

      // Check that we're still on the forgot password page (form wasn't submitted)
      cy.url().should('include', '/forgot-password');
    });
  });
});
