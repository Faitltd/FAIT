/// <reference types="cypress" />

describe('SMS Messaging Page', () => {
  it('should load the SMS messaging page', () => {
    // Visit the SMS messaging page
    cy.visit('/messaging/sms');

    // Verify we're on the SMS messaging page
    cy.url().should('include', '/messaging/sms');

    // Check if the page has loaded correctly
    cy.contains('SMS Messaging').should('exist');

    // Check if the "Back to Dashboard" link exists
    cy.contains('Back to Dashboard').should('exist');

    // Check if the tabs exist
    cy.contains('Messages').should('exist');
    cy.contains('Templates').should('exist');
  });

  it('should switch between tabs', () => {
    // Visit the SMS messaging page
    cy.visit('/messaging/sms');

    // Click on the Templates tab
    cy.contains('Templates').click();

    // Verify the Templates tab content is visible
    cy.contains('Message Templates').should('exist');

    // Click back on the Messages tab
    cy.contains('Messages').click();

    // Verify the Messages tab content is visible
    cy.contains('+1 (555) 123-4567').should('exist');
  });
});
