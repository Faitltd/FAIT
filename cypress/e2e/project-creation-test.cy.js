/// <reference types="cypress" />

describe('Project Creation Test', () => {
  // Test project data
  const testProject = {
    title: 'Test Kitchen Remodel ' + new Date().getTime(), // Add timestamp for uniqueness
    description: 'Complete kitchen renovation with new appliances and countertops',
    budget: '25000',
    timeline: '2-3 months',
    category: 'Renovation',
    address: '123 Main St',
    city: 'Denver',
    state: 'Colorado',
    zip: '80202'
  };

  it('should create a project and verify it appears in the list', () => {
    // Visit the projects page
    cy.visit('/projects');
    
    // Click on the "New Project" button (using contains since the exact structure might vary)
    cy.contains('New Project').click();
    
    // Verify we're on the create project page
    cy.url().should('include', '/projects/create');
    
    // Fill out the form
    cy.get('#title').type(testProject.title);
    cy.get('#description').type(testProject.description);
    cy.get('#budget').type(testProject.budget);
    cy.get('#timeline').select(testProject.timeline);
    cy.get('#category').select(testProject.category);
    cy.get('#address').type(testProject.address);
    cy.get('#city').type(testProject.city);
    cy.get('#state').select(testProject.state);
    cy.get('#zip').type(testProject.zip);
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Verify we're redirected to the projects page
    cy.url().should('include', '/projects');
    
    // Verify the project appears in the list
    cy.contains(testProject.title).should('be.visible');
  });
});
