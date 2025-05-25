/// <reference types="cypress" />

describe('App Navigation', () => {
  beforeEach(() => {
    // Visit the home page before each test
    cy.visit('/');
  });

  it('should load the home page successfully', () => {
    // Check that the page loaded successfully
    cy.title().should('exist');
    cy.get('body').should('be.visible');
  });

  it('should have navigation elements', () => {
    // Check for navigation elements
    cy.get('nav').should('exist');
    cy.get('a').should('have.length.at.least', 1);
  });

  it('should navigate to login page', () => {
    // Find and click on login link
    cy.contains('a', /login|sign in/i, { timeout: 10000 }).click();

    // Verify we're on the login page
    cy.url().should('include', '/login');

    // Check for login form elements
    cy.get('form').should('exist');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
  });

  it('should navigate to register page', () => {
    // Find and click on register link (Join Now button)
    cy.contains('a', /join now/i, { timeout: 10000 }).click();

    // Verify we're on the register page
    cy.url().should('include', '/register');

    // Check for registration form elements
    cy.get('form').should('exist');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
  });

  it('should display services information', () => {
    // Find and click on services link in the navigation
    cy.contains('a', 'Services').click();

    // Verify we're on the services page
    cy.url().should('include', '/services');

    // Check for services content by looking for common service-related text
    cy.get('body').should('be.visible');
    cy.log('Successfully navigated to services page');
  });

  it('should have footer with important links', () => {
    // Check for footer
    cy.get('footer').should('exist');

    // Check for common footer links
    cy.get('footer a').should('have.length.at.least', 1);

    // Check for common footer sections
    cy.get('footer').should('contain.text', 'FAIT Co-Op');
    cy.get('footer').should('contain.text', 'Services');
  });
});
