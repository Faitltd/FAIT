/// <reference types="cypress" />

describe('Static Test Page', () => {
  it('should load the static test page', () => {
    cy.visit('/test.html');
    cy.get('h1').should('contain', 'Static Test Page');
    cy.get('.status').should('be.visible');
    cy.get('#test-button').should('be.visible');
    cy.screenshot('static-test-page');
  });

  it('should interact with the test button', () => {
    cy.visit('/test.html');
    cy.get('#test-button').click();
    cy.get('#click-result').should('not.be.empty');
    cy.screenshot('static-test-page-after-click');
  });

  it('should display the current time', () => {
    cy.visit('/test.html');
    cy.get('#current-time').should('not.be.empty');
  });
});
