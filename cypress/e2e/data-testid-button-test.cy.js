/// <reference types="cypress" />

describe('Data TestID Button Test', () => {
  it('should test the Edit and Deactivate buttons using data-testid attributes', () => {
    // Visit the service agent dashboard
    cy.visit('/dashboard/service-agent');
    
    // Wait for the page to load
    cy.wait(3000);
    
    // Take a screenshot to see what we're working with
    cy.screenshot('dashboard-loaded');
    
    // Test the Edit button using data-testid
    cy.get('[data-testid="edit-service-button"]').then($editButtons => {
      if ($editButtons.length > 0) {
        cy.log(`Found ${$editButtons.length} Edit buttons with data-testid`);
        cy.get('[data-testid="edit-service-button"]').first().click({force: true});
        cy.wait(1000);
        cy.screenshot('after-edit-click');
        
        // Go back to the dashboard
        cy.visit('/dashboard/service-agent');
        cy.wait(2000);
      } else {
        cy.log('No Edit buttons found with data-testid');
      }
    });
    
    // Test the Deactivate button using data-testid
    cy.get('[data-testid="deactivate-service-button"]').then($deactivateButtons => {
      if ($deactivateButtons.length > 0) {
        cy.log(`Found ${$deactivateButtons.length} Deactivate buttons with data-testid`);
        cy.get('[data-testid="deactivate-service-button"]').first().click({force: true});
        cy.wait(1000);
        cy.screenshot('after-deactivate-click');
        
        // Check if the button changed to Activate
        cy.get('[data-testid="activate-service-button"]').should('exist');
      } else {
        cy.log('No Deactivate buttons found with data-testid');
      }
    });
  });
});
