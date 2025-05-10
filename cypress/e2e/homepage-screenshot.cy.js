/// <reference types="cypress" />

describe('Homepage Screenshot Test', () => {
  it('should take a screenshot of the homepage', () => {
    cy.visit('/');
    cy.screenshot('homepage-full');
    
    // Log all buttons and links on the page
    cy.get('button, a').each(($el) => {
      cy.log(`Element: ${$el.text().trim()} with href: ${$el.prop('href') || 'N/A'}`);
    });
    
    // Log all elements containing "Get Started"
    cy.contains('Get Started').then(($el) => {
      cy.log(`Get Started element: ${$el.prop('tagName')} with href: ${$el.prop('href') || 'N/A'}`);
    });
  });
});
