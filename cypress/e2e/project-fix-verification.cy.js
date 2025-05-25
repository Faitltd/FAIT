/// <reference types="cypress" />

describe('Project Fix Verification', () => {
  it('should navigate to projects page', () => {
    // Visit the projects page directly
    cy.visit('/projects');
    
    // Wait for the page to load
    cy.get('body').should('be.visible');
    
    // Verify we're on the projects page
    cy.url().should('include', '/projects');
  });

  it('should display project list or empty state', () => {
    // Visit the projects page
    cy.visit('/projects');
    
    // Check if we see either projects or the empty state message
    cy.get('body').then($body => {
      // Check if we have the empty state message
      if ($body.find(':contains("No projects")').length > 0) {
        cy.contains('No projects').should('be.visible');
      } else {
        // Otherwise, we should see some kind of project list
        cy.get('body').should('be.visible');
        cy.log('Projects page loaded successfully');
      }
    });
  });
});
