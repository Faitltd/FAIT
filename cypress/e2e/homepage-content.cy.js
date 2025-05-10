/// <reference types="cypress" />

describe('Homepage Content Test', () => {
  it('should check the content of the homepage', () => {
    cy.visit('/');
    cy.screenshot('homepage-full');
    
    // Log all text content on the page
    cy.get('body').then(($body) => {
      cy.log('Page content:');
      cy.log($body.text());
    });
    
    // Log all links on the page
    cy.get('a').each(($a) => {
      cy.log(`Link: ${$a.text().trim()} with href: ${$a.prop('href')}`);
    });
    
    // Check if the Free Estimators section exists
    cy.contains('Free Estimators').should('exist');
    cy.contains('Free Estimators').parent().parent().screenshot('free-estimators-section');
    
    // Log all links in the Free Estimators section
    cy.contains('Free Estimators').parent().parent().find('a').each(($a) => {
      cy.log(`Free Estimators link: ${$a.text().trim()} with href: ${$a.prop('href')}`);
    });
  });
});
