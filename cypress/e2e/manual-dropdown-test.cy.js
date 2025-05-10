/// <reference types="cypress" />

describe('Manual Dropdown Test', () => {
  it('should open the More Options dropdown and log all links', () => {
    // Visit the home page
    cy.visit('/');
    
    // Check if the More Options button exists
    cy.contains('button', 'More Options').should('exist');
    
    // Click the More Options button to open the dropdown
    cy.contains('button', 'More Options').click();
    
    // The dropdown should be visible
    cy.get('.origin-top-right').should('be.visible');
    
    // Log all links in the dropdown
    cy.get('.origin-top-right a').each(($el) => {
      cy.log(`Link: ${$el.text().trim()} with href: ${$el.prop('href')}`);
    });
    
    // Take a screenshot of the dropdown
    cy.screenshot('manual-dropdown-test');
  });
});
