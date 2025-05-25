/// <reference types="cypress" />

describe('Screenshot Buttons', () => {
  it('should take screenshots of the service agent dashboard and buttons', () => {
    // Visit the service agent dashboard
    cy.visit('/dashboard/service-agent');
    
    // Wait for the page to load
    cy.wait(3000);
    
    // Take a screenshot of the entire dashboard
    cy.screenshot('full-dashboard');
    
    // Scroll to the Active Services section
    cy.contains('Active Services').scrollIntoView();
    cy.wait(1000);
    
    // Take a screenshot of the Active Services section
    cy.screenshot('active-services-section');
    
    // Log information about the buttons
    cy.get('body').then($body => {
      // Check for Edit buttons
      const editButtons = $body.find('a:contains("Edit"), button:contains("Edit")');
      cy.log(`Found ${editButtons.length} Edit buttons`);
      
      // Check for Deactivate buttons
      const deactivateButtons = $body.find('button:contains("Deactivate")');
      cy.log(`Found ${deactivateButtons.length} Deactivate buttons`);
      
      // Check for data-testid attributes
      const editTestIdButtons = $body.find('[data-testid="edit-service-button"]');
      const deactivateTestIdButtons = $body.find('[data-testid="deactivate-service-button"]');
      
      cy.log(`Found ${editTestIdButtons.length} Edit buttons with data-testid`);
      cy.log(`Found ${deactivateTestIdButtons.length} Deactivate buttons with data-testid`);
    });
    
    // Try to find and highlight the Edit button
    cy.get('body').then($body => {
      if ($body.find('[data-testid="edit-service-button"]').length > 0) {
        cy.get('[data-testid="edit-service-button"]').first().scrollIntoView().should('be.visible');
        cy.get('[data-testid="edit-service-button"]').first().then($el => {
          $el.css('border', '3px solid red');
        });
        cy.wait(1000);
        cy.screenshot('edit-button-highlighted');
      } else if ($body.find('a:contains("Edit")').length > 0) {
        cy.contains('a', 'Edit').first().scrollIntoView().should('be.visible');
        cy.contains('a', 'Edit').first().then($el => {
          $el.css('border', '3px solid red');
        });
        cy.wait(1000);
        cy.screenshot('edit-button-highlighted');
      } else {
        cy.log('No Edit buttons found to highlight');
      }
    });
    
    // Try to find and highlight the Deactivate button
    cy.get('body').then($body => {
      if ($body.find('[data-testid="deactivate-service-button"]').length > 0) {
        cy.get('[data-testid="deactivate-service-button"]').first().scrollIntoView().should('be.visible');
        cy.get('[data-testid="deactivate-service-button"]').first().then($el => {
          $el.css('border', '3px solid blue');
        });
        cy.wait(1000);
        cy.screenshot('deactivate-button-highlighted');
      } else if ($body.find('button:contains("Deactivate")').length > 0) {
        cy.contains('button', 'Deactivate').first().scrollIntoView().should('be.visible');
        cy.contains('button', 'Deactivate').first().then($el => {
          $el.css('border', '3px solid blue');
        });
        cy.wait(1000);
        cy.screenshot('deactivate-button-highlighted');
      } else {
        cy.log('No Deactivate buttons found to highlight');
      }
    });
  });
});
