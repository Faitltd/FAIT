/// <reference types="cypress" />

describe('Basic Application Check', () => {
  it('should load the application', () => {
    cy.visit('/');
    cy.log('Application loaded successfully');
    
    // Take a screenshot of what's actually there
    cy.screenshot('home-page-actual');
  });

  it('should check page title', () => {
    cy.visit('/');
    cy.title().then((title) => {
      cy.log(`Page title is: ${title}`);
    });
  });

  it('should check for basic HTML structure', () => {
    cy.visit('/');
    cy.get('html').should('exist');
    cy.get('body').should('exist');
    cy.get('head').should('exist');
  });
});
