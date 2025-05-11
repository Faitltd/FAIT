/// <reference types="cypress" />

describe('Service Agent Features', () => {
  beforeEach(() => {
    // Visit the home page before each test
    cy.visit('/');
  });

  it('should navigate to service agent information', () => {
    // Look for service agent related content
    cy.contains('Service Agent').should('be.visible');
  });

  it('should display service categories', () => {
    // Navigate to services page
    cy.contains('a', 'Services').click();

    // Check that we've navigated to the services page
    cy.url().should('include', '/services');

    // Check for any content on the services page
    cy.get('body').should('be.visible');
    cy.log('Successfully navigated to services page');
  });

  it('should show registration page', () => {
    // Navigate to registration page
    cy.contains('a', 'Join Now').click();

    // Check that we've navigated to the registration page
    cy.url().should('include', '/register');

    // Check for registration form
    cy.get('form').should('exist');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');

    cy.log('Successfully navigated to registration page');
  });

  it('should display service agent dashboard demo option', () => {
    // Check for service agent dashboard demo
    cy.contains(/service agent dashboard/i).should('be.visible');
    cy.contains(/try it now/i).should('be.visible');
  });

  it('should navigate to service agent dashboard demo', () => {
    // Find and click on service agent dashboard demo link
    cy.contains(/service agent dashboard/i).parent().contains(/try it now/i).click();

    // Verify navigation occurred
    cy.url().should('not.eq', 'http://localhost:5173/');
  });
});
