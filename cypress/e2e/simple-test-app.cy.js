/// <reference types="cypress" />

describe('Simple Test App', () => {
  it('should load the home page and check if SimpleTestApp is rendering', () => {
    cy.visit('/');
    cy.get('h1').should('contain', 'FAIT Co-op Test Page');
    cy.get('form').should('exist');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.get('button').should('exist');
    cy.screenshot('simple-test-app');
  });
});
