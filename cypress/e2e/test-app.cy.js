/// <reference types="cypress" />

describe('Test App', () => {
  it('should load the test app and verify React rendering', () => {
    cy.visit('/test-app.html');
    cy.get('h1').should('contain', 'FAIT Co-op Test Page');
    cy.get('form').should('exist');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.get('button').should('contain', 'Sign In');
    cy.screenshot('test-app');
  });
});
