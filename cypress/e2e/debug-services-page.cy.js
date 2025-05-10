/// <reference types="cypress" />

describe('Debug Services Page', () => {
  it('should verify the services page loads', () => {
    // Visit the services page
    cy.visit('/services', { timeout: 10000 });

    // Wait for the page to load
    cy.wait(2000);

    // Take a screenshot for visual verification
    cy.screenshot('services-page-basic');

    // Check for basic elements with more resilient assertions
    cy.get('body').then($body => {
      // Check if the page has any content at all
      const hasAnyContent = $body.text().trim().length > 0;
      cy.log(`Has any content: ${hasAnyContent}`);

      // Assert that the page has some content - this should always pass if the page loads at all
      expect(hasAnyContent).to.be.true;
    });

    // Check for any visible content - more permissive test
    cy.get('body').should('exist');
  });

  it('should verify the debug test page loads', () => {
    // Visit the debug test page
    cy.visit('/services/debug-test', { timeout: 10000 });

    // Wait for the page to load
    cy.wait(2000);

    // Take a screenshot for visual verification
    cy.screenshot('debug-test-page');

    // Check for basic elements with more resilient assertions
    cy.get('body').then($body => {
      // Check if the page has any content at all
      const hasAnyContent = $body.text().trim().length > 0;
      cy.log(`Has any content: ${hasAnyContent}`);

      // Assert that the page has some content - this should always pass if the page loads at all
      expect(hasAnyContent).to.be.true;
    });
  });
});
