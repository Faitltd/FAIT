/// <reference types="cypress" />

describe('Service Agent Dashboard Navigation', () => {
  it('should navigate directly to referrals page', () => {
    // Visit the service agent referrals page directly
    cy.visit('/dashboard/service-agent/referrals');

    // Check if the page has loaded correctly
    cy.contains('Grow Your Network').should('exist');

    // Check if the "Back to Dashboard" link exists
    cy.contains('Back to Dashboard').should('exist');
  });

  it('should navigate back to dashboard from referrals page', () => {
    // Visit the service agent referrals page
    cy.visit('/dashboard/service-agent/referrals');

    // Click the "Back to Dashboard" link
    cy.contains('Back to Dashboard').click();

    // Verify we're on the dashboard page
    cy.url().should('include', '/dashboard/service-agent');
    cy.url().should('not.include', '/referrals');
  });
});
