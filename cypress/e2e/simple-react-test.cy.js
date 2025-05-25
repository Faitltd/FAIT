/// <reference types="cypress" />

describe('Simple React App Test', () => {
  it('should load the simple React app', () => {
    cy.visit('/simple-app.html');
    cy.get('h1').should('contain', 'FAIT Co-op Platform');
    cy.get('#status').should('contain', 'Click the button to test');
    cy.get('#testButton').should('be.visible');
    cy.screenshot('simple-react-app');
  });

  it('should interact with the React button', () => {
    cy.visit('/simple-app.html');
    cy.get('#testButton').click();
    cy.get('#status').should('not.contain', 'Click the button to test');
    cy.screenshot('simple-react-app-after-click');
  });

  it('should interact with the login form', () => {
    cy.visit('/simple-app.html');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.screenshot('simple-react-app-form-submit');
  });
});
