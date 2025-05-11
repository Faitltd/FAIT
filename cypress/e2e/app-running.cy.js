/// <reference types="cypress" />

describe('Application Running Test', () => {
  it('should load the home page', () => {
    cy.visit('/');
    cy.contains('FAIT Co-op Test Page').should('be.visible');
  });

  it('should navigate to login page', () => {
    cy.visit('/login');
    cy.get('form').should('exist');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
  });

  it('should display test credentials on login page', () => {
    cy.visit('/login');
    cy.contains('Test Credentials').should('be.visible');
    cy.contains('Admin: admin@itsfait.com / admin123').should('be.visible');
    cy.contains('Client: client@itsfait.com / client123').should('be.visible');
    cy.contains('Service Agent: service@itsfait.com / service123').should('be.visible');
  });
});
