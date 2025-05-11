describe('Project Details', () => {
  beforeEach(() => {
    // Login before each test
    cy.visit('/login');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    
    // Intercept the login request and mock a successful response
    cy.intercept('POST', '**/auth/v1/token*', {
      statusCode: 200,
      body: {
        access_token: 'fake-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'fake-refresh-token',
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          user_metadata: {
            first_name: 'Test',
            last_name: 'User',
            user_role: 'client'
          }
        }
      }
    }).as('loginRequest');
    
    cy.get('button[type="submit"]').click();
    cy.wait('@loginRequest');
    cy.url().should('include', '/dashboard');
    
    // Mock the project details API response
    cy.intercept('GET', '**/rest/v1/projects?id=eq.project-1*', {
      statusCode: 200,
      body: [
        {
          id: 'project-1',
          title: 'Kitchen Renovation',
          description: 'Complete kitchen renovation',
          client_id: 'test-user-id',
          status: 'in_progress',
          budget: 25000,
          start_date: '2023-05-15',
          end_date: '2023-07-30',
          overall_progress: 65,
          created_at: '2023-05-01T00:00:00Z',
          updated_at: '2023-05-15T00:00:00Z',
          client: {
            id: 'test-user-id',
            first_name: 'Test',
            last_name: 'User',
            email: 'test@example.com'
          }
        }
      ]
    }).as('getProjectDetails');
    
    // Mock the project milestones API response
    cy.intercept('GET', '**/rest/v1/project_milestones?project_id=eq.project-1*', {
      statusCode: 200,
      body: [
        {
          id: 'milestone-1',
          project_id: 'project-1',
          title: 'Demo',
          description: 'Demolition of existing kitchen',
          status: 'completed',
          due_date: '2023-05-20',
          completed_date: '2023-05-18',
          progress: 100,
          order_index: 1,
          created_at: '2023-05-01T00:00:00Z',
          updated_at: '2023-05-18T00:00:00Z'
        },
        {
          id: 'milestone-2',
          project_id: 'project-1',
          title: 'Cabinets',
          description: 'Installation of new cabinets',
          status: 'in_progress',
          due_date: '2023-06-10',
          completed_date: null,
          progress: 50,
          order_index: 2,
          created_at: '2023-05-01T00:00:00Z',
          updated_at: '2023-05-25T00:00:00Z'
        }
      ]
    }).as('getProjectMilestones');
    
    cy.visit('/dashboard/projects/project-1');
    cy.wait('@getProjectDetails');
    cy.wait('@getProjectMilestones');
  });

  it('should display project details correctly', () => {
    cy.get('h1').should('contain', 'Kitchen Renovation');
    cy.get('[data-cy="project-description"]').should('contain', 'Complete kitchen renovation');
    cy.get('[data-cy="project-status"]').should('contain', 'in progress');
    cy.get('[data-cy="project-budget"]').should('contain', '$25,000');
    cy.get('[data-cy="project-dates"]').should('contain', '05/15/2023 to 07/30/2023');
    cy.get('[data-cy="project-progress"]').should('contain', '65%');
  });

  it('should display project milestones correctly', () => {
    cy.get('[data-cy="milestones-tab"]').click();
    cy.get('[data-cy="milestone-list"]').should('exist');
    cy.get('[data-cy="milestone-item"]').should('have.length', 2);
    cy.get('[data-cy="milestone-item"]').first().should('contain', 'Demo');
    cy.get('[data-cy="milestone-item"]').first().should('contain', 'completed');
    cy.get('[data-cy="milestone-item"]').last().should('contain', 'Cabinets');
    cy.get('[data-cy="milestone-item"]').last().should('contain', 'in progress');
  });

  it('should update project status successfully', () => {
    // Intercept the update project status request and mock a successful response
    cy.intercept('PATCH', '**/rest/v1/projects?id=eq.project-1*', {
      statusCode: 200,
      body: [
        {
          id: 'project-1',
          status: 'completed',
          updated_at: new Date().toISOString()
        }
      ]
    }).as('updateProjectStatus');
    
    // Intercept the project status update record creation
    cy.intercept('POST', '**/rest/v1/project_status_updates*', {
      statusCode: 201,
      body: {
        id: 'status-update-1',
        project_id: 'project-1',
        previous_status: 'in_progress',
        new_status: 'completed',
        updated_by: 'test-user-id',
        created_at: new Date().toISOString()
      }
    }).as('createStatusUpdate');
    
    cy.get('[data-cy="status-select"]').select('completed');
    cy.wait('@updateProjectStatus');
    cy.wait('@createStatusUpdate');
    cy.get('[data-cy="project-status"]').should('contain', 'completed');
  });

  it('should add a new milestone successfully', () => {
    cy.get('[data-cy="milestones-tab"]').click();
    cy.get('[data-cy="add-milestone-button"]').click();
    
    // Fill out the milestone form
    cy.get('[data-cy="milestone-title-input"]').type('Countertops');
    cy.get('[data-cy="milestone-description-input"]').type('Installation of new countertops');
    cy.get('[data-cy="milestone-due-date-input"]').type('2023-06-30');
    cy.get('[data-cy="milestone-status-select"]').select('pending');
    
    // Intercept the create milestone request and mock a successful response
    cy.intercept('POST', '**/rest/v1/project_milestones*', {
      statusCode: 201,
      body: {
        id: 'milestone-3',
        project_id: 'project-1',
        title: 'Countertops',
        description: 'Installation of new countertops',
        status: 'pending',
        due_date: '2023-06-30',
        completed_date: null,
        progress: 0,
        order_index: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }).as('createMilestone');
    
    cy.get('[data-cy="save-milestone-button"]').click();
    cy.wait('@createMilestone');
    
    // Mock the updated milestones list
    cy.intercept('GET', '**/rest/v1/project_milestones?project_id=eq.project-1*', {
      statusCode: 200,
      body: [
        {
          id: 'milestone-1',
          project_id: 'project-1',
          title: 'Demo',
          description: 'Demolition of existing kitchen',
          status: 'completed',
          due_date: '2023-05-20',
          completed_date: '2023-05-18',
          progress: 100,
          order_index: 1,
          created_at: '2023-05-01T00:00:00Z',
          updated_at: '2023-05-18T00:00:00Z'
        },
        {
          id: 'milestone-2',
          project_id: 'project-1',
          title: 'Cabinets',
          description: 'Installation of new cabinets',
          status: 'in_progress',
          due_date: '2023-06-10',
          completed_date: null,
          progress: 50,
          order_index: 2,
          created_at: '2023-05-01T00:00:00Z',
          updated_at: '2023-05-25T00:00:00Z'
        },
        {
          id: 'milestone-3',
          project_id: 'project-1',
          title: 'Countertops',
          description: 'Installation of new countertops',
          status: 'pending',
          due_date: '2023-06-30',
          completed_date: null,
          progress: 0,
          order_index: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    }).as('getUpdatedMilestones');
    
    cy.wait('@getUpdatedMilestones');
    cy.get('[data-cy="milestone-item"]').should('have.length', 3);
    cy.get('[data-cy="milestone-item"]').last().should('contain', 'Countertops');
  });

  it('should update a milestone successfully', () => {
    cy.get('[data-cy="milestones-tab"]').click();
    cy.get('[data-cy="edit-milestone-button"]').eq(1).click(); // Edit the second milestone (Cabinets)
    
    // Update the milestone form
    cy.get('[data-cy="milestone-status-select"]').select('completed');
    cy.get('[data-cy="milestone-description-input"]').clear().type('Installation of new cabinets - Completed');
    
    // Intercept the update milestone request and mock a successful response
    cy.intercept('PATCH', '**/rest/v1/project_milestones?id=eq.milestone-2*', {
      statusCode: 200,
      body: [
        {
          id: 'milestone-2',
          project_id: 'project-1',
          title: 'Cabinets',
          description: 'Installation of new cabinets - Completed',
          status: 'completed',
          due_date: '2023-06-10',
          completed_date: new Date().toISOString().split('T')[0],
          progress: 100,
          order_index: 2,
          created_at: '2023-05-01T00:00:00Z',
          updated_at: new Date().toISOString()
        }
      ]
    }).as('updateMilestone');
    
    cy.get('[data-cy="save-milestone-button"]').click();
    cy.wait('@updateMilestone');
    
    // Mock the updated milestones list
    cy.intercept('GET', '**/rest/v1/project_milestones?project_id=eq.project-1*', {
      statusCode: 200,
      body: [
        {
          id: 'milestone-1',
          project_id: 'project-1',
          title: 'Demo',
          description: 'Demolition of existing kitchen',
          status: 'completed',
          due_date: '2023-05-20',
          completed_date: '2023-05-18',
          progress: 100,
          order_index: 1,
          created_at: '2023-05-01T00:00:00Z',
          updated_at: '2023-05-18T00:00:00Z'
        },
        {
          id: 'milestone-2',
          project_id: 'project-1',
          title: 'Cabinets',
          description: 'Installation of new cabinets - Completed',
          status: 'completed',
          due_date: '2023-06-10',
          completed_date: new Date().toISOString().split('T')[0],
          progress: 100,
          order_index: 2,
          created_at: '2023-05-01T00:00:00Z',
          updated_at: new Date().toISOString()
        }
      ]
    }).as('getUpdatedMilestones');
    
    cy.wait('@getUpdatedMilestones');
    cy.get('[data-cy="milestone-item"]').eq(1).should('contain', 'Cabinets');
    cy.get('[data-cy="milestone-item"]').eq(1).should('contain', 'completed');
    cy.get('[data-cy="milestone-item"]').eq(1).should('contain', 'Installation of new cabinets - Completed');
  });

  it('should delete a milestone successfully', () => {
    cy.get('[data-cy="milestones-tab"]').click();
    
    // Mock the window.confirm to return true
    cy.on('window:confirm', () => true);
    
    // Intercept the delete milestone request and mock a successful response
    cy.intercept('DELETE', '**/rest/v1/project_milestones?id=eq.milestone-2*', {
      statusCode: 204,
      body: null
    }).as('deleteMilestone');
    
    cy.get('[data-cy="delete-milestone-button"]').eq(1).click(); // Delete the second milestone (Cabinets)
    cy.wait('@deleteMilestone');
    
    // Mock the updated milestones list
    cy.intercept('GET', '**/rest/v1/project_milestones?project_id=eq.project-1*', {
      statusCode: 200,
      body: [
        {
          id: 'milestone-1',
          project_id: 'project-1',
          title: 'Demo',
          description: 'Demolition of existing kitchen',
          status: 'completed',
          due_date: '2023-05-20',
          completed_date: '2023-05-18',
          progress: 100,
          order_index: 1,
          created_at: '2023-05-01T00:00:00Z',
          updated_at: '2023-05-18T00:00:00Z'
        }
      ]
    }).as('getUpdatedMilestones');
    
    cy.wait('@getUpdatedMilestones');
    cy.get('[data-cy="milestone-item"]').should('have.length', 1);
    cy.get('[data-cy="milestone-item"]').should('contain', 'Demo');
  });
});
