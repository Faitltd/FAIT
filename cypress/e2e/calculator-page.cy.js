/// <reference types="cypress" />

describe('Calculator Page Test', () => {
  it('should check the calculator/estimate page', () => {
    cy.visit('/calculator/estimate');
    cy.screenshot('calculator-estimate-page');
    
    // Log all text content on the page
    cy.get('body').then(($body) => {
      cy.log('Page content:');
      cy.log($body.text());
    });
    
    // Log all links on the page
    cy.get('a').each(($a) => {
      cy.log(`Link: ${$a.text()} with href: ${$a.prop('href')}`);
    });
  });
});
