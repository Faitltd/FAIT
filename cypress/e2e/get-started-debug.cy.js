/// <reference types="cypress" />

describe('Get Started Debug Test', () => {
  it('should debug the Get Started button', () => {
    cy.visit('/');
    
    // Log all links on the page
    cy.get('a').each(($a) => {
      const text = $a.text().trim();
      const href = $a.prop('href');
      cy.log(`Link: "${text}" with href: ${href}`);
      
      if (text.includes('Get Started')) {
        cy.log(`Found Get Started link with href: ${href}`);
      }
    });
    
    // Try to find the Get Started button by text
    cy.contains('a', 'Get Started').then(($a) => {
      cy.log(`Found Get Started link: ${$a.prop('href')}`);
      
      // Click it and check where it goes
      cy.wrap($a).click();
      cy.url().then(url => {
        cy.log(`Navigated to: ${url}`);
      });
    });
  });
});
