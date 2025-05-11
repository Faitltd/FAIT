/// <reference types="cypress" />

describe('Fixed App Test', () => {
  it('should load the home page and check if FixedApp is rendering', () => {
    cy.visit('/');
    cy.get('h1').should('contain', 'FAIT Co-op Test Page');
    cy.get('form').should('exist');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.get('button').should('exist');
    cy.screenshot('fixed-app-home');
  });
  
  it('should load the login page and check if FixedApp is rendering', () => {
    cy.visit('/login');
    cy.get('h1').should('contain', 'FAIT Co-op Test Page');
    cy.get('form').should('exist');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.get('button').should('exist');
    cy.screenshot('fixed-app-login');
  });
  
  it('should load a non-existent page and check if FixedApp is rendering', () => {
    cy.visit('/non-existent-page');
    cy.get('h1').should('contain', 'FAIT Co-op Test Page');
    cy.get('form').should('exist');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.get('button').should('exist');
    cy.screenshot('fixed-app-non-existent');
  });
});
