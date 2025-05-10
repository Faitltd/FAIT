describe('Project Management', () => {
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
  });

  describe('Project List', () => {
    beforeEach(() => {
      // Mock the projects API response
      cy.intercept('GET', '**/rest/v1/projects*', {
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
          },
          {
            id: 'project-2',
            title: 'Bathroom Remodel',
            description: 'Master bathroom remodel',
            client_id: 'test-user-id',
            status: 'pending',
            budget: 15000,
            start_date: '2023-06-01',
            end_date: '2023-07-15',
            overall_progress: 0,
            created_at: '2023-05-10T00:00:00Z',
            updated_at: '2023-05-10T00:00:00Z',
            client: {
              id: 'test-user-id',
              first_name: 'Test',
              last_name: 'User',
              email: 'test@example.com'
            }
          }
        ]
      }).as('getProjects');
      
      cy.visit('/dashboard/projects');
      cy.wait('@getProjects');
    });

    it('should display the list of projects', () => {
      cy.get('[data-cy="project-list"]').should('exist');
      cy.get('[data-cy="project-card"]').should('have.length', 2);
      cy.get('[data-cy="project-card"]').first().should('contain', 'Kitchen Renovation');
      cy.get('[data-cy="project-card"]').last().should('contain', 'Bathroom Remodel');
    });

    it('should navigate to project details when clicking on a project', () => {
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
      
      cy.get('[data-cy="project-card"]').first().click();
      cy.wait('@getProjectDetails');
      cy.wait('@getProjectMilestones');
      cy.url().should('include', '/dashboard/projects/project-1');
      cy.get('h1').should('contain', 'Kitchen Renovation');
    });

    it('should navigate to create project page when clicking the new project button', () => {
      cy.get('[data-cy="new-project-button"]').click();
      cy.url().should('include', '/dashboard/projects/new');
      cy.get('h1').should('contain', 'Create New Project');
    });
  });

  describe('Create Project', () => {
    beforeEach(() => {
      cy.visit('/dashboard/projects/new');
    });

    it('should display the create project form', () => {
      cy.get('h1').should('contain', 'Create New Project');
      cy.get('form').should('exist');
      cy.get('input[name="title"]').should('exist');
      cy.get('textarea[name="description"]').should('exist');
      cy.get('input[name="budget"]').should('exist');
      cy.get('input[name="start-date"]').should('exist');
      cy.get('input[name="end-date"]').should('exist');
      cy.get('input[name="address"]').should('exist');
      cy.get('button[type="submit"]').should('exist');
    });

    it('should show validation errors for empty required fields', () => {
      cy.get('button[type="submit"]').click();
      cy.get('form').should('contain', 'Please fill in all required fields');
    });

    it('should create a project successfully with valid information', () => {
      // Fill out the form
      cy.get('input[name="title"]').type('New Test Project');
      cy.get('textarea[name="description"]').type('This is a test project created by Cypress');
      cy.get('input[name="budget"]').type('10000');
      cy.get('input[name="start-date"]').type('2023-07-01');
      cy.get('input[name="end-date"]').type('2023-08-31');
      cy.get('input[name="address"]').type('123 Test St');
      cy.get('input[name="city"]').type('Test City');
      cy.get('input[name="state"]').type('TS');
      cy.get('input[name="zip"]').type('12345');
      
      // Intercept the create project request and mock a successful response
      cy.intercept('POST', '**/rest/v1/projects*', {
        statusCode: 201,
        body: {
          id: 'new-project-id',
          title: 'New Test Project',
          description: 'This is a test project created by Cypress',
          client_id: 'test-user-id',
          status: 'pending',
          budget: 10000,
          start_date: '2023-07-01',
          end_date: '2023-08-31',
          address: '123 Test St, Test City, TS 12345',
          city: 'Test City',
          state: 'TS',
          zip: '12345',
          overall_progress: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }).as('createProject');
      
      cy.get('button[type="submit"]').click();
      
      // Wait for the request to complete and verify success message
      cy.wait('@createProject');
      cy.get('form').should('contain', 'Project created successfully');
      
      // Verify redirection to project details page
      cy.url().should('include', '/dashboard/projects/new-project-id', { timeout: 3000 });
    });

    it('should show error message when project creation fails', () => {
      // Fill out the form
      cy.get('input[name="title"]').type('Failed Project');
      cy.get('textarea[name="description"]').type('This project will fail to create');
      
      // Intercept the create project request and mock a failed response
      cy.intercept('POST', '**/rest/v1/projects*', {
        statusCode: 400,
        body: {
          error: 'Failed to create project',
          error_description: 'Database error'
        }
      }).as('createProjectFail');
      
      cy.get('button[type="submit"]').click();
      
      // Wait for the request to complete and verify error message
      cy.wait('@createProjectFail');
      cy.get('form').should('contain', 'Failed to create project');
    });
  });
});
