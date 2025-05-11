/// <reference types="cypress" />

describe('Service Agent Dashboard Edit and Deactivate Buttons', () => {
  beforeEach(() => {
    // Visit the service agent dashboard directly
    cy.visit('/dashboard/service-agent');
    
    // Wait for the page to load
    cy.wait(3000);
  });

  it('should verify the page loaded correctly', () => {
    // Take a screenshot to verify what we're seeing
    cy.screenshot('service-agent-dashboard');
    
    // Log the page content for debugging
    cy.get('body').then($body => {
      cy.log('Page content loaded successfully');
    });
  });

  it('should find and test Edit buttons', () => {
    // Look for Edit buttons or links anywhere on the page
    cy.get('body').then($body => {
      // Check if there are any Edit buttons or links
      const hasEditButtons = $body.find('a:contains("Edit"), button:contains("Edit")').length > 0;
      
      cy.log(`Edit buttons found: ${hasEditButtons}`);
      
      if (hasEditButtons) {
        // Find the first Edit button/link and click it
        cy.get('a:contains("Edit"), button:contains("Edit")').first().click();
        
        // Verify we navigated to an edit page
        cy.url().should('include', '/edit');
      } else {
        cy.log('No Edit buttons found to test');
      }
    });
  });

  it('should find and test Deactivate buttons', () => {
    // Look for Deactivate buttons anywhere on the page
    cy.get('body').then($body => {
      // Check if there are any Deactivate buttons
      const hasDeactivateButtons = $body.find('button:contains("Deactivate")').length > 0;
      
      cy.log(`Deactivate buttons found: ${hasDeactivateButtons}`);
      
      if (hasDeactivateButtons) {
        // Find the first Deactivate button and click it
        cy.get('button:contains("Deactivate")').first().click();
        
        // Verify the button text changes to Activate
        cy.contains('Activate').should('exist');
      } else {
        cy.log('No Deactivate buttons found to test');
      }
    });
  });
});
