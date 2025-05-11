/// <reference types="cypress" />

describe('Login Page Inspection', () => {
  it('should inspect login page elements', () => {
    cy.visit('/login');
    
    // Log all form elements
    cy.get('form').then($form => {
      cy.log('Form found:', $form.length);
      
      // Log all input elements
      cy.get('input').then($inputs => {
        cy.log('Input elements found:', $inputs.length);
        
        // Log details of each input
        $inputs.each((i, el) => {
          const $el = Cypress.$(el);
          cy.log(`Input ${i+1}:`, {
            type: $el.attr('type'),
            id: $el.attr('id'),
            name: $el.attr('name'),
            placeholder: $el.attr('placeholder'),
            'data-cy': $el.attr('data-cy'),
            'data-testid': $el.attr('data-testid'),
            class: $el.attr('class')
          });
        });
      });
      
      // Log all button elements
      cy.get('button').then($buttons => {
        cy.log('Button elements found:', $buttons.length);
        
        // Log details of each button
        $buttons.each((i, el) => {
          const $el = Cypress.$(el);
          cy.log(`Button ${i+1}:`, {
            type: $el.attr('type'),
            id: $el.attr('id'),
            'data-cy': $el.attr('data-cy'),
            'data-testid': $el.attr('data-testid'),
            class: $el.attr('class'),
            text: $el.text().trim()
          });
        });
      });
    });
    
    // Take a screenshot
    cy.screenshot('login-page-inspection');
  });
});
