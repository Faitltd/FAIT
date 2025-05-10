/// <reference types="cypress" />

describe('Active Services Buttons Test', () => {
  it('should test the Edit and Deactivate buttons in the Active Services section', () => {
    // Visit the service agent dashboard
    cy.visit('/dashboard/service-agent');
    
    // Wait for the page to load
    cy.wait(3000);
    
    // Take a screenshot to see what we're working with
    cy.screenshot('active-services-before');
    
    // Find the Active Services section
    cy.get('body').then($body => {
      // Log if we found the Active Services section
      cy.log(`Active Services section found: ${$body.text().includes('Active Services')}`);
      
      // Look for the Edit and Deactivate buttons directly
      const editButtons = $body.find('button:contains("Edit"), a:contains("Edit")');
      const deactivateButtons = $body.find('button:contains("Deactivate")');
      
      cy.log(`Edit buttons found: ${editButtons.length}`);
      cy.log(`Deactivate buttons found: ${deactivateButtons.length}`);
      
      // If Edit buttons exist, test the first one
      if (editButtons.length > 0) {
        cy.get('button:contains("Edit"), a:contains("Edit")').first().click({force: true});
        cy.wait(1000);
        cy.screenshot('after-edit-click');
        
        // Go back to the dashboard
        cy.visit('/dashboard/service-agent');
        cy.wait(2000);
      }
      
      // If Deactivate buttons exist, test the first one
      if (deactivateButtons.length > 0) {
        cy.get('button:contains("Deactivate")').first().click({force: true});
        cy.wait(1000);
        cy.screenshot('after-deactivate-click');
        
        // Check if the button text changed to Activate
        cy.get('body').then($updatedBody => {
          cy.log(`Activate button found after click: ${$updatedBody.find('button:contains("Activate")').length > 0}`);
        });
      }
    });
  });
});
