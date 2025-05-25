/// <reference types="cypress" />

describe('Screenshot Test', () => {
  it('should take a screenshot of the homepage', () => {
    cy.visit('/');
    cy.screenshot('homepage');
    
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
