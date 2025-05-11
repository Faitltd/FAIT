/// <reference types="cypress" />

describe('Project Creation', () => {
  // Test project data
  const testProject = {
    title: 'Test Bathroom Remodel',
    description: 'Complete bathroom renovation with new fixtures, tile, and vanity',
    budget: '15000',
    timeline: '2-3 months',
    category: 'Renovation',
    address: '456 Oak St',
    city: 'Denver',
    state: 'Colorado',
    zip: '80202'
  };

  beforeEach(() => {
    // Visit the projects page directly
    cy.visit('/projects');

    // Wait for the page to load
    cy.get('body').should('be.visible');
  });

  it('should navigate to project creation page', () => {
    // Look for any button or link that might create a new project
    cy.get('a[href="/projects/create"]').click();

    // Verify we're on the project creation page
    cy.url().should('include', '/projects/create');
    cy.contains('Create New Project').should('be.visible');
  });

  it('should create a new project and display it in the projects list', () => {
    // Navigate to project creation page
    cy.get('a[href="/projects/create"]').click();

    // Fill out project details
    cy.get('#title').type(testProject.title);
    cy.get('#description').type(testProject.description);
    cy.get('#budget').type(testProject.budget);
    cy.get('#timeline').select(testProject.timeline);
    cy.get('#category').select(testProject.category);

    // Add project location
    cy.get('#address').type(testProject.address);
    cy.get('#city').type(testProject.city);
    cy.get('#state').select(testProject.state);
    cy.get('#zip').type(testProject.zip);

    // Submit project
    cy.get('button[type="submit"]').click();

    // Should redirect to projects list
    cy.url().should('include', '/projects');

    // Project should be visible in the list
    cy.contains(testProject.title).should('be.visible');
  });

  it('should show the refresh button and refresh the projects list', () => {
    // Check if refresh button exists - look for a button with refresh text or icon
    cy.get('button').contains('Refresh').should('be.visible');

    // Click refresh button
    cy.get('button').contains('Refresh').click();

    // Verify the page refreshes (this is a basic check)
    cy.contains('Projects').should('be.visible');
  });

  it('should handle empty projects list gracefully', () => {
    // This test assumes there might be no projects
    // We'll check if either projects are shown or the empty state is shown
    cy.get('body').then($body => {
      if ($body.find(':contains("No projects")').length > 0) {
        // Empty state is shown
        cy.contains('No projects').should('be.visible');
        cy.contains('Get started by creating a new project').should('be.visible');
      } else {
        // Projects are shown
        cy.log('Projects are displayed in the list');
      }
    });
  });
});
