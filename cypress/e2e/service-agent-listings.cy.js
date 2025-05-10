/// <reference types="cypress" />

describe('Service Agent Listings Page', () => {
  it('should load the service agent listings page', () => {
    // Visit the service agent listings page
    cy.visit('/dashboard/service-agent/listings');
    
    // Check if the page title exists
    cy.contains('My Service Listings').should('exist');
    
    // Check if the "Back to Dashboard" link exists
    cy.contains('Back to Dashboard').should('exist');
    
    // Check if the "Create New Service" button exists
    cy.contains('Create New Service').should('exist');
  });
});
