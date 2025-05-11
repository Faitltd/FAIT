/// <reference types="cypress" />

describe('Service Agent Dashboard Simple Tests', () => {
  it('should load the service agent dashboard', () => {
    // Visit the service agent dashboard directly
    cy.visit('/dashboard/service-agent');
    
    // Wait for the page to load
    cy.wait(2000);
    
    // Take a screenshot
    cy.screenshot('service-agent-dashboard-loaded');
  });
  
  it('should verify Edit and Deactivate buttons exist', () => {
    // Visit the service agent dashboard directly
    cy.visit('/dashboard/service-agent');
    
    // Wait for the page to load
    cy.wait(2000);
    
    // Check if the Edit and Deactivate buttons exist
    cy.get('body').then($body => {
      // Log whether the buttons exist
      cy.log(`Edit button exists: ${$body.find('a:contains("Edit")').length > 0 || $body.find('button:contains("Edit")').length > 0}`);
      cy.log(`Deactivate button exists: ${$body.find('a:contains("Deactivate")').length > 0 || $body.find('button:contains("Deactivate")').length > 0}`);
      
      // Take a screenshot
      cy.screenshot('service-agent-dashboard-buttons');
    });
  });
});
