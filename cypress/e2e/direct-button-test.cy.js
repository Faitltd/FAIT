/// <reference types="cypress" />

describe('Direct Button Test', () => {
  it('should directly test the Edit and Deactivate buttons', () => {
    // Visit the service agent dashboard
    cy.visit('/dashboard/service-agent');
    
    // Wait for the page to load
    cy.wait(3000);
    
    // Take a screenshot to see what we're working with
    cy.screenshot('dashboard-loaded');
    
    // Test the Edit button by directly targeting it with a more specific selector
    cy.get('td.whitespace-nowrap.text-right.text-sm.font-medium a, td.whitespace-nowrap.text-right.text-sm.font-medium button')
      .contains('Edit')
      .first()
      .then($btn => {
        if ($btn.length > 0) {
          cy.wrap($btn).click({force: true});
          cy.wait(1000);
          cy.screenshot('after-edit-click');
          
          // Go back to the dashboard
          cy.visit('/dashboard/service-agent');
          cy.wait(2000);
        } else {
          cy.log('No Edit button found with specific selector');
        }
      });
    
    // Test the Deactivate button by directly targeting it with a more specific selector
    cy.get('td.whitespace-nowrap.text-right.text-sm.font-medium button')
      .contains('Deactivate')
      .first()
      .then($btn => {
        if ($btn.length > 0) {
          cy.wrap($btn).click({force: true});
          cy.wait(1000);
          cy.screenshot('after-deactivate-click');
          
          // Check if the button text changed to Activate
          cy.get('td.whitespace-nowrap.text-right.text-sm.font-medium button')
            .contains('Activate')
            .should('exist');
        } else {
          cy.log('No Deactivate button found with specific selector');
        }
      });
  });
});
