/// <reference types="cypress" />

describe('Calculator Links Test', () => {
  it('should check if all calculator links work', () => {
    cy.visit('/');

    // Check for Free Instant Estimate button
    cy.get('[data-testid="free-instant-estimate-link"]').should('exist');
    cy.get('[data-testid="free-instant-estimate-link"]').click();
    cy.url().should('include', '/calculator/estimate');
    cy.go('back');

    // Check for Remodeling Calculator link
    cy.get('[data-testid="remodeling-calculator-link"]').should('exist');
    cy.get('[data-testid="remodeling-calculator-link"]').click();
    cy.url().should('include', '/calculator/remodeling');
    cy.go('back');

    // Check for Handyman Task Estimator link
    cy.get('[data-testid="handyman-calculator-link"]').should('exist');
    cy.get('[data-testid="handyman-calculator-link"]').click();
    cy.url().should('include', '/calculator/handyman');
    cy.go('back');

    // Check for View All Calculators link
    cy.get('[data-testid="view-all-calculators-link"]').should('exist');
    cy.get('[data-testid="view-all-calculators-link"]').click();
    cy.url().should('include', '/calculator/estimate');
  });
});
