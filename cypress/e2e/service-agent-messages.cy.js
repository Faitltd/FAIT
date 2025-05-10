/// <reference types="cypress" />

describe('Service Agent Messages Page', () => {
  it('should load the service agent messages page', () => {
    // Visit the service agent messages page
    cy.visit('/dashboard/service-agent/messages');

    // Check if the page title exists
    cy.contains('Messages').should('exist');

    // Check if the "Back to Dashboard" link exists
    cy.contains('Back to Dashboard').should('exist');

    // Check if the simplified message is displayed
    cy.contains('This is a simplified version of the Service Agent Messages page').should('exist');

    // Check if the "Return to Dashboard" button exists
    cy.contains('Return to Dashboard').should('exist');
  });

  it('should navigate back to dashboard from messages page', () => {
    // Visit the service agent messages page
    cy.visit('/dashboard/service-agent/messages');

    // Click the "Back to Dashboard" link
    cy.contains('Back to Dashboard').click();

    // Verify we're on the dashboard page
    cy.url().should('include', '/dashboard/service-agent');
    cy.url().should('not.include', '/messages');
  });
});
