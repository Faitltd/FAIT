/// <reference types="cypress" />

describe('Service Agent Dashboard Screenshot', () => {
  it('should take a screenshot of the service agent dashboard', () => {
    // Visit the service agent dashboard directly
    cy.visit('/dashboard/service-agent');
    
    // Wait for the page to load
    cy.wait(2000);
    
    // Take a screenshot
    cy.screenshot('service-agent-dashboard');
    
    // Log the page content for debugging
    cy.get('body').then($body => {
      cy.log('Page content:');
      cy.log($body.text());
    });
  });
});
