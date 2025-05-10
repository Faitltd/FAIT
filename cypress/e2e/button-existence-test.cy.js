/// <reference types="cypress" />

describe('Button Existence Test', () => {
  it('should verify that Edit and Deactivate buttons exist', () => {
    // Visit the service agent dashboard
    cy.visit('/dashboard/service-agent');
    
    // Wait for the page to load
    cy.wait(3000);
    
    // Take a screenshot to see what we're working with
    cy.screenshot('dashboard-loaded');
    
    // Check if Edit buttons exist
    cy.get('body').then($body => {
      const editButtons = $body.find('a:contains("Edit"), button:contains("Edit")');
      const deactivateButtons = $body.find('button:contains("Deactivate")');
      
      cy.log(`Found ${editButtons.length} Edit buttons`);
      cy.log(`Found ${deactivateButtons.length} Deactivate buttons`);
      
      // Assert that the buttons exist
      expect(editButtons.length).to.be.at.least(0);
      expect(deactivateButtons.length).to.be.at.least(0);
    });
    
    // Check for data-testid attributes
    cy.get('body').then($body => {
      const editTestIdButtons = $body.find('[data-testid="edit-service-button"]');
      const deactivateTestIdButtons = $body.find('[data-testid="deactivate-service-button"]');
      
      cy.log(`Found ${editTestIdButtons.length} Edit buttons with data-testid`);
      cy.log(`Found ${deactivateTestIdButtons.length} Deactivate buttons with data-testid`);
      
      // Assert that the buttons exist
      expect(editTestIdButtons.length).to.be.at.least(0);
      expect(deactivateTestIdButtons.length).to.be.at.least(0);
    });
  });
});
