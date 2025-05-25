describe('Projects Page Tests', () => {
  context('As a client', () => {
    beforeEach(() => {
      // Login as client
      cy.visit('/login');
      cy.get('input[type="email"]').type(Cypress.env('clientEmail'));
      cy.get('input[type="password"]').type(Cypress.env('clientPassword'));
      cy.get('button[type="submit"]').click();
      
      // Navigate to projects page
      cy.visit('/projects');
    });

    it('should display client projects', () => {
      cy.contains('My Projects').should('be.visible');
      cy.get('[data-testid="project-list"]').should('exist');
    });

    it('should show project details when clicking on a project', () => {
      cy.get('[data-testid="project-item"]').first().click();
      cy.url().should('include', '/projects/');
      cy.contains('Project Details').should('be.visible');
      cy.contains('Status').should('be.visible');
      cy.contains('Timeline').should('be.visible');
    });

    it('should allow filtering projects by status', () => {
      cy.get('[data-testid="status-filter"]').click();
      cy.contains('In Progress').click();
      
      // Check that only in-progress projects are shown
      cy.get('[data-testid="project-item"]').each(($el) => {
        cy.wrap($el).should('contain', 'In Progress');
      });
    });

    it('should allow searching for projects', () => {
      // Get the text of the first project
      cy.get('[data-testid="project-item"]').first().find('h3').invoke('text').then((text) => {
        // Search for part of the text
        const searchTerm = text.substring(0, 5);
        cy.get('[data-testid="search-input"]').type(searchTerm);
        
        // Check that search results contain the term
        cy.get('[data-testid="project-item"]').each(($el) => {
          cy.wrap($el).should('contain', searchTerm);
        });
      });
    });
  });

  context('As a service agent', () => {
    beforeEach(() => {
      // Login as service agent
      cy.visit('/login');
      cy.get('input[type="email"]').type(Cypress.env('serviceEmail'));
      cy.get('input[type="password"]').type(Cypress.env('servicePassword'));
      cy.get('button[type="submit"]').click();
      
      // Navigate to projects page
      cy.visit('/projects');
    });

    it('should display assigned projects', () => {
      cy.contains('Assigned Projects').should('be.visible');
      cy.get('[data-testid="project-list"]').should('exist');
    });

    it('should allow updating project status', () => {
      // Open the first project
      cy.get('[data-testid="project-item"]').first().click();
      
      // Update status
      cy.get('[data-testid="status-dropdown"]').click();
      cy.contains('Completed').click();
      cy.get('[data-testid="update-status-button"]').click();
      
      // Verify status update
      cy.contains('Status updated successfully').should('be.visible');
      cy.contains('Completed').should('be.visible');
    });

    it('should allow adding project notes', () => {
      // Open the first project
      cy.get('[data-testid="project-item"]').first().click();
      
      // Add a note
      cy.get('[data-testid="add-note-button"]').click();
      cy.get('textarea[name="note"]').type('This is a test note from Cypress');
      cy.get('[data-testid="submit-note-button"]').click();
      
      // Verify note was added
      cy.contains('Note added successfully').should('be.visible');
      cy.contains('This is a test note from Cypress').should('be.visible');
    });
  });

  context('As an admin', () => {
    beforeEach(() => {
      // Login as admin
      cy.visit('/login');
      cy.get('input[type="email"]').type(Cypress.env('adminEmail'));
      cy.get('input[type="password"]').type(Cypress.env('adminPassword'));
      cy.get('button[type="submit"]').click();
      
      // Navigate to projects page
      cy.visit('/projects');
    });

    it('should display all projects', () => {
      cy.contains('All Projects').should('be.visible');
      cy.get('[data-testid="project-list"]').should('exist');
    });

    it('should allow creating a new project', () => {
      cy.get('[data-testid="create-project-button"]').click();
      
      // Fill out project form
      cy.get('input[name="title"]').type('Cypress Test Project');
      cy.get('textarea[name="description"]').type('This is a test project created by Cypress');
      
      // Select client
      cy.get('[data-testid="client-select"]').click();
      cy.get('[data-testid="client-option"]').first().click();
      
      // Select service agent
      cy.get('[data-testid="service-agent-select"]').click();
      cy.get('[data-testid="service-agent-option"]').first().click();
      
      // Submit form
      cy.get('[data-testid="submit-project-button"]').click();
      
      // Verify project creation
      cy.contains('Project created successfully').should('be.visible');
      cy.url().should('include', '/projects/');
      cy.contains('Cypress Test Project').should('be.visible');
    });

    it('should allow assigning a different service agent', () => {
      // Open the first project
      cy.get('[data-testid="project-item"]').first().click();
      
      // Change service agent
      cy.get('[data-testid="edit-project-button"]').click();
      cy.get('[data-testid="service-agent-select"]').click();
      cy.get('[data-testid="service-agent-option"]').eq(1).click();
      cy.get('[data-testid="update-project-button"]').click();
      
      // Verify update
      cy.contains('Project updated successfully').should('be.visible');
    });

    it('should allow deleting a project', () => {
      // Create a test project to delete
      cy.get('[data-testid="create-project-button"]').click();
      cy.get('input[name="title"]').type('Project to Delete');
      cy.get('textarea[name="description"]').type('This project will be deleted');
      cy.get('[data-testid="client-select"]').click();
      cy.get('[data-testid="client-option"]').first().click();
      cy.get('[data-testid="service-agent-select"]').click();
      cy.get('[data-testid="service-agent-option"]').first().click();
      cy.get('[data-testid="submit-project-button"]').click();
      
      // Now delete it
      cy.contains('Project to Delete').should('be.visible');
      cy.get('[data-testid="delete-project-button"]').click();
      cy.get('[data-testid="confirm-delete-button"]').click();
      
      // Verify deletion
      cy.contains('Project deleted successfully').should('be.visible');
      cy.contains('Project to Delete').should('not.exist');
    });
  });
});
