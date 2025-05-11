/// <reference types="cypress" />

describe('Basic Server Test', () => {
  it('should navigate to the simple app page', () => {
    // Visit the simple app page
    cy.visit('/public/simple-app.html', { failOnStatusCode: false });

    // Check if the page loads without errors
    cy.get('body').should('be.visible');
    cy.get('h1').should('contain', 'FAIT Co-op Platform');

    // Test button interaction
    cy.get('#testButton').click();
    cy.get('#status').should('not.contain', 'Server is running correctly!');

    // Take a screenshot for visual verification
    cy.screenshot('simple-app-page');
  });
});
