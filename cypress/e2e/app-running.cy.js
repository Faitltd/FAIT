/// <reference types="cypress" />

describe('Application Running Test', () => {
  it('should load the home page', () => {
    cy.visit('/?version=full');
    cy.get('#root').should('exist');
    cy.contains('Find Services').should('be.visible');
  });

  it('should navigate to login page', () => {
    cy.visit('/login');
    cy.get('form').should('exist');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
  });

  it('should navigate to services search page', () => {
    cy.visit('/?version=full');
    cy.contains('Find Services').click();
    cy.url().should('include', '/services/search');
  });
});
