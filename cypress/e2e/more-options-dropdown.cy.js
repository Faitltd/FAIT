/// <reference types="cypress" />

describe('More Options Dropdown Test', () => {
  it('should open the More Options dropdown', () => {
    // Visit the home page
    cy.visit('/');

    // Check if the More Options button exists
    cy.get('[data-testid="more-options-button"]').should('exist');

    // Click the More Options button to open the dropdown
    cy.get('[data-testid="more-options-button"]').click();

    // The dropdown should be visible
    cy.get('.origin-top-right').should('be.visible');

    // Take a screenshot of the dropdown
    cy.screenshot('more-options-dropdown');
  });

  it('should navigate to the Services page', () => {
    // Visit the home page
    cy.visit('/');

    // Click the More Options button to open the dropdown
    cy.get('[data-testid="more-options-button"]').click();

    // Click the Services link using data-testid
    cy.get('[data-testid="dropdown-link-services"]').click();

    // Verify we're on the correct page
    cy.url().should('include', '/services');
  });

  it('should navigate to the Estimates page', () => {
    // Visit the home page
    cy.visit('/');

    // Click the More Options button to open the dropdown
    cy.get('[data-testid="more-options-button"]').click();

    // Click the Estimates link using data-testid
    cy.get('[data-testid="dropdown-link-estimates"]').click();

    // Verify we're on the correct page
    cy.url().should('include', '/estimates');
  });

  it('should navigate to the Warranty page', () => {
    // Visit the home page
    cy.visit('/');

    // Click the More Options button to open the dropdown
    cy.get('[data-testid="more-options-button"]').click();

    // Click the Warranties link using data-testid
    cy.get('[data-testid="dropdown-link-warranties"]').click();

    // Verify we're on the correct page
    cy.url().should('include', '/warranty');
  });

  it('should navigate to the Gamification page', () => {
    // Visit the home page
    cy.visit('/');

    // Click the More Options button to open the dropdown
    cy.get('[data-testid="more-options-button"]').click();

    // Click the Gamification link using data-testid
    cy.get('[data-testid="dropdown-link-gamification"]').click();

    // Verify we're on the correct page
    cy.url().should('include', '/gamification');
  });
});
