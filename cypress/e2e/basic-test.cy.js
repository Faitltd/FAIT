/// <reference types="cypress" />

describe('Basic Application Test', () => {
  it('should load the home page and take a screenshot', () => {
    cy.visit('/');
    cy.screenshot('home-page');
    cy.log('Home page loaded');
  });

  it('should navigate to login page and take a screenshot', () => {
    cy.visit('/login');
    cy.screenshot('login-page');
    cy.log('Login page loaded');
  });

  it('should check basic HTML structure', () => {
    cy.visit('/');
    cy.get('html').should('exist');
    cy.get('body').should('exist');
    cy.log('Basic HTML structure exists');
  });
});
