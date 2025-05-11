/// <reference types="cypress" />

describe('Projects Page', () => {
  it('should load the projects page correctly', () => {
    // Visit the projects page
    cy.visit('/projects');
    
    // Check if the page has loaded correctly
    cy.contains('Create Project').should('exist');
    
    // Check if the tabs exist
    cy.contains('All Projects').should('exist');
    cy.contains('Active').should('exist');
    cy.contains('Completed').should('exist');
    cy.contains('Pending').should('exist');
    
    // Check if the view mode buttons exist
    cy.get('button').should('have.length.at.least', 3);
    
    // Check if the stats cards exist
    cy.contains('Total Projects').should('exist');
    cy.contains('In Progress').should('exist');
    cy.contains('Due This Week').should('exist');
  });
  
  it('should switch between tabs', () => {
    // Visit the projects page
    cy.visit('/projects');
    
    // Click on the Active tab
    cy.contains('Active').click();
    
    // Verify the Active tab is selected
    cy.contains('Active').should('have.attr', 'data-state', 'active');
    
    // Click on the Completed tab
    cy.contains('Completed').click();
    
    // Verify the Completed tab is selected
    cy.contains('Completed').should('have.attr', 'data-state', 'active');
  });
});
