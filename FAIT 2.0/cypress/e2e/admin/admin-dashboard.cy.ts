describe('Admin Dashboard', () => {
  beforeEach(() => {
    // Login as admin before each test
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    
    // Intercept the login request and mock a successful response for admin
    cy.intercept('POST', '**/auth/v1/token*', {
      statusCode: 200,
      body: {
        access_token: 'fake-admin-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'fake-admin-refresh-token',
        user: {
          id: 'admin-user-id',
          email: 'admin@example.com',
          user_metadata: {
            first_name: 'Admin',
            last_name: 'User',
            user_role: 'admin'
          }
        }
      }
    }).as('loginRequest');
    
    cy.get('button[type="submit"]').click();
    cy.wait('@loginRequest');
    cy.url().should('include', '/dashboard');
    
    // Mock the users API response
    cy.intercept('GET', '**/rest/v1/profiles*', {
      statusCode: 200,
      body: [
        {
          id: 'user-1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          user_role: 'client',
          is_verified: true,
          is_active: true,
          created_at: '2023-01-01T00:00:00Z',
          last_sign_in_at: '2023-05-15T00:00:00Z'
        },
        {
          id: 'user-2',
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane@example.com',
          user_role: 'contractor',
          is_verified: true,
          is_active: true,
          created_at: '2023-02-01T00:00:00Z',
          last_sign_in_at: '2023-05-10T00:00:00Z'
        },
        {
          id: 'user-3',
          first_name: 'Bob',
          last_name: 'Johnson',
          email: 'bob@example.com',
          user_role: 'service_agent',
          is_verified: false,
          is_active: false,
          created_at: '2023-03-01T00:00:00Z',
          last_sign_in_at: null
        },
        {
          id: 'admin-user-id',
          first_name: 'Admin',
          last_name: 'User',
          email: 'admin@example.com',
          user_role: 'admin',
          is_verified: true,
          is_active: true,
          created_at: '2023-01-01T00:00:00Z',
          last_sign_in_at: new Date().toISOString()
        }
      ]
    }).as('getUsers');
    
    cy.visit('/admin');
    cy.wait('@getUsers');
  });

  it('should display the admin dashboard with users tab active by default', () => {
    cy.get('h1').should('contain', 'Admin Dashboard');
    cy.get('[data-cy="users-tab"]').should('have.class', 'active');
    cy.get('[data-cy="user-list"]').should('exist');
    cy.get('[data-cy="user-row"]').should('have.length', 4);
  });

  it('should display user details correctly', () => {
    cy.get('[data-cy="user-row"]').first().within(() => {
      cy.get('[data-cy="user-name"]').should('contain', 'John Doe');
      cy.get('[data-cy="user-email"]').should('contain', 'john@example.com');
      cy.get('[data-cy="user-role"]').should('contain', 'client');
      cy.get('[data-cy="user-status"]').should('contain', 'Active');
      cy.get('[data-cy="user-verified"]').should('exist');
      cy.get('[data-cy="user-joined"]').should('contain', '01/01/2023');
      cy.get('[data-cy="user-last-login"]').should('contain', '05/15/2023');
    });
  });

  it('should filter users based on role', () => {
    cy.get('[data-cy="role-filter"]').select('client');
    cy.get('[data-cy="user-row"]').should('have.length', 1);
    cy.get('[data-cy="user-row"]').first().should('contain', 'John Doe');
    
    cy.get('[data-cy="role-filter"]').select('contractor');
    cy.get('[data-cy="user-row"]').should('have.length', 1);
    cy.get('[data-cy="user-row"]').first().should('contain', 'Jane Smith');
    
    cy.get('[data-cy="role-filter"]').select('all');
    cy.get('[data-cy="user-row"]').should('have.length', 4);
  });

  it('should filter users based on status', () => {
    cy.get('[data-cy="status-filter"]').select('active');
    cy.get('[data-cy="user-row"]').should('have.length', 3);
    
    cy.get('[data-cy="status-filter"]').select('inactive');
    cy.get('[data-cy="user-row"]').should('have.length', 1);
    cy.get('[data-cy="user-row"]').first().should('contain', 'Bob Johnson');
    
    cy.get('[data-cy="status-filter"]').select('all');
    cy.get('[data-cy="user-row"]').should('have.length', 4);
  });

  it('should filter users based on search query', () => {
    cy.get('[data-cy="search-input"]').type('Jane');
    cy.get('[data-cy="user-row"]').should('have.length', 1);
    cy.get('[data-cy="user-row"]').first().should('contain', 'Jane Smith');
    
    cy.get('[data-cy="search-input"]').clear().type('john@example.com');
    cy.get('[data-cy="user-row"]').should('have.length', 1);
    cy.get('[data-cy="user-row"]').first().should('contain', 'John Doe');
    
    cy.get('[data-cy="search-input"]').clear();
    cy.get('[data-cy="user-row"]').should('have.length', 4);
  });

  it('should toggle user status successfully', () => {
    // Intercept the update user status request and mock a successful response
    cy.intercept('PATCH', '**/rest/v1/profiles?id=eq.user-1*', {
      statusCode: 200,
      body: [
        {
          id: 'user-1',
          is_active: false,
          updated_at: new Date().toISOString()
        }
      ]
    }).as('updateUserStatus');
    
    // Click the toggle status button for the first user
    cy.get('[data-cy="user-row"]').first().find('[data-cy="toggle-status-button"]').click();
    cy.wait('@updateUserStatus');
    
    // Mock the updated users list
    cy.intercept('GET', '**/rest/v1/profiles*', {
      statusCode: 200,
      body: [
        {
          id: 'user-1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          user_role: 'client',
          is_verified: true,
          is_active: false,
          created_at: '2023-01-01T00:00:00Z',
          last_sign_in_at: '2023-05-15T00:00:00Z'
        },
        {
          id: 'user-2',
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane@example.com',
          user_role: 'contractor',
          is_verified: true,
          is_active: true,
          created_at: '2023-02-01T00:00:00Z',
          last_sign_in_at: '2023-05-10T00:00:00Z'
        },
        {
          id: 'user-3',
          first_name: 'Bob',
          last_name: 'Johnson',
          email: 'bob@example.com',
          user_role: 'service_agent',
          is_verified: false,
          is_active: false,
          created_at: '2023-03-01T00:00:00Z',
          last_sign_in_at: null
        },
        {
          id: 'admin-user-id',
          first_name: 'Admin',
          last_name: 'User',
          email: 'admin@example.com',
          user_role: 'admin',
          is_verified: true,
          is_active: true,
          created_at: '2023-01-01T00:00:00Z',
          last_sign_in_at: new Date().toISOString()
        }
      ]
    }).as('getUpdatedUsers');
    
    cy.wait('@getUpdatedUsers');
    
    // Verify the user status has changed
    cy.get('[data-cy="user-row"]').first().find('[data-cy="user-status"]').should('contain', 'Inactive');
  });

  it('should verify a user successfully', () => {
    // Intercept the update user verification request and mock a successful response
    cy.intercept('PATCH', '**/rest/v1/profiles?id=eq.user-3*', {
      statusCode: 200,
      body: [
        {
          id: 'user-3',
          is_verified: true,
          updated_at: new Date().toISOString()
        }
      ]
    }).as('verifyUser');
    
    // Click the verify button for the third user (Bob Johnson)
    cy.get('[data-cy="user-row"]').eq(2).find('[data-cy="verify-button"]').click();
    cy.wait('@verifyUser');
    
    // Mock the updated users list
    cy.intercept('GET', '**/rest/v1/profiles*', {
      statusCode: 200,
      body: [
        {
          id: 'user-1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          user_role: 'client',
          is_verified: true,
          is_active: true,
          created_at: '2023-01-01T00:00:00Z',
          last_sign_in_at: '2023-05-15T00:00:00Z'
        },
        {
          id: 'user-2',
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane@example.com',
          user_role: 'contractor',
          is_verified: true,
          is_active: true,
          created_at: '2023-02-01T00:00:00Z',
          last_sign_in_at: '2023-05-10T00:00:00Z'
        },
        {
          id: 'user-3',
          first_name: 'Bob',
          last_name: 'Johnson',
          email: 'bob@example.com',
          user_role: 'service_agent',
          is_verified: true,
          is_active: false,
          created_at: '2023-03-01T00:00:00Z',
          last_sign_in_at: null
        },
        {
          id: 'admin-user-id',
          first_name: 'Admin',
          last_name: 'User',
          email: 'admin@example.com',
          user_role: 'admin',
          is_verified: true,
          is_active: true,
          created_at: '2023-01-01T00:00:00Z',
          last_sign_in_at: new Date().toISOString()
        }
      ]
    }).as('getUpdatedUsers');
    
    cy.wait('@getUpdatedUsers');
    
    // Verify the user is now verified
    cy.get('[data-cy="user-row"]').eq(2).find('[data-cy="user-verified"]').should('exist');
  });

  it('should delete a user successfully', () => {
    // Mock the window.confirm to return true
    cy.on('window:confirm', () => true);
    
    // Intercept the delete user auth request and mock a successful response
    cy.intercept('DELETE', '**/auth/v1/admin/users/user-3*', {
      statusCode: 200,
      body: {}
    }).as('deleteUserAuth');
    
    // Intercept the delete user profile request and mock a successful response
    cy.intercept('DELETE', '**/rest/v1/profiles?id=eq.user-3*', {
      statusCode: 204,
      body: null
    }).as('deleteUserProfile');
    
    // Click the delete button for the third user (Bob Johnson)
    cy.get('[data-cy="user-row"]').eq(2).find('[data-cy="delete-user-button"]').click();
    cy.wait('@deleteUserAuth');
    cy.wait('@deleteUserProfile');
    
    // Mock the updated users list
    cy.intercept('GET', '**/rest/v1/profiles*', {
      statusCode: 200,
      body: [
        {
          id: 'user-1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          user_role: 'client',
          is_verified: true,
          is_active: true,
          created_at: '2023-01-01T00:00:00Z',
          last_sign_in_at: '2023-05-15T00:00:00Z'
        },
        {
          id: 'user-2',
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane@example.com',
          user_role: 'contractor',
          is_verified: true,
          is_active: true,
          created_at: '2023-02-01T00:00:00Z',
          last_sign_in_at: '2023-05-10T00:00:00Z'
        },
        {
          id: 'admin-user-id',
          first_name: 'Admin',
          last_name: 'User',
          email: 'admin@example.com',
          user_role: 'admin',
          is_verified: true,
          is_active: true,
          created_at: '2023-01-01T00:00:00Z',
          last_sign_in_at: new Date().toISOString()
        }
      ]
    }).as('getUpdatedUsers');
    
    cy.wait('@getUpdatedUsers');
    
    // Verify the user has been removed
    cy.get('[data-cy="user-row"]').should('have.length', 3);
    cy.get('[data-cy="user-row"]').should('not.contain', 'Bob Johnson');
  });

  it('should cancel user deletion when confirmation is declined', () => {
    // Mock the window.confirm to return false
    cy.on('window:confirm', () => false);
    
    // Click the delete button for the third user (Bob Johnson)
    cy.get('[data-cy="user-row"]').eq(2).find('[data-cy="delete-user-button"]').click();
    
    // Verify the user still exists
    cy.get('[data-cy="user-row"]').should('have.length', 4);
    cy.get('[data-cy="user-row"]').eq(2).should('contain', 'Bob Johnson');
  });

  it('should switch between tabs correctly', () => {
    // Click on the Projects tab
    cy.get('[data-cy="projects-tab"]').click();
    cy.get('[data-cy="projects-content"]').should('be.visible');
    cy.get('[data-cy="users-content"]').should('not.exist');
    
    // Click on the Settings tab
    cy.get('[data-cy="settings-tab"]').click();
    cy.get('[data-cy="settings-content"]').should('be.visible');
    cy.get('[data-cy="projects-content"]').should('not.exist');
    
    // Click on the Roles tab
    cy.get('[data-cy="roles-tab"]').click();
    cy.get('[data-cy="roles-content"]').should('be.visible');
    cy.get('[data-cy="settings-content"]').should('not.exist');
    
    // Click on the Data tab
    cy.get('[data-cy="data-tab"]').click();
    cy.get('[data-cy="data-content"]').should('be.visible');
    cy.get('[data-cy="roles-content"]').should('not.exist');
    
    // Click on the Logs tab
    cy.get('[data-cy="logs-tab"]').click();
    cy.get('[data-cy="logs-content"]').should('be.visible');
    cy.get('[data-cy="data-content"]').should('not.exist');
    
    // Click back on the Users tab
    cy.get('[data-cy="users-tab"]').click();
    cy.get('[data-cy="users-content"]').should('be.visible');
    cy.get('[data-cy="logs-content"]').should('not.exist');
  });

  it('should show empty state when no users match filter criteria', () => {
    cy.get('[data-cy="role-filter"]').select('client');
    cy.get('[data-cy="status-filter"]').select('inactive');
    cy.get('[data-cy="user-row"]').should('not.exist');
    cy.get('[data-cy="empty-state"]').should('be.visible');
    cy.get('[data-cy="empty-state"]').should('contain', 'No users match your search criteria');
  });
});
