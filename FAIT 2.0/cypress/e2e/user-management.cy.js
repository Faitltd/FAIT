describe('User Management', () => {
  beforeEach(() => {
    // Mock admin user authentication
    cy.intercept('POST', '**/auth/v1/token?grant_type=password', {
      fixture: 'auth/admin_login_success.json',
    }).as('loginAdmin');

    // Mock users list
    cy.intercept('GET', '**/rest/v1/admin/users*', {
      fixture: 'admin/users.json',
    }).as('getUsers');

    // Mock user update
    cy.intercept('PATCH', '**/rest/v1/profiles/*', {
      statusCode: 200,
      body: { success: true }
    }).as('updateUser');

    // Mock user creation
    cy.intercept('POST', '**/rest/v1/profiles', {
      statusCode: 201,
      fixture: 'admin/new_user.json',
    }).as('createUser');

    // Mock role update
    cy.intercept('POST', '**/rest/v1/admin/update_role', {
      statusCode: 200,
      body: { success: true }
    }).as('updateRole');

    // Login as admin and navigate to user management
    cy.visit('/login');
    cy.get('input[name="email"]').type('admin@example.com');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginAdmin');
    
    cy.visit('/admin/users');
    cy.wait('@getUsers');
  });

  it('should display the list of users', () => {
    cy.get('[data-testid="user-management"]').should('be.visible');
    cy.get('[data-testid="user-table"]').should('be.visible');
    cy.get('[data-testid="user-row"]').should('have.length.at.least', 1);
  });

  it('should search for users', () => {
    // Mock search results
    cy.intercept('GET', '**/rest/v1/admin/users*', {
      fixture: 'admin/search_users.json',
    }).as('searchUsers');
    
    cy.get('[data-testid="user-search"]').type('john');
    cy.get('[data-testid="search-form"]').submit();
    cy.wait('@searchUsers');
    
    cy.get('[data-testid="user-row"]').should('have.length.at.least', 1);
    cy.get('[data-testid="user-name"]').first().should('contain', 'John');
  });

  it('should filter users by role', () => {
    // Mock filtered results
    cy.intercept('GET', '**/rest/v1/admin/users*', {
      fixture: 'admin/filtered_users.json',
    }).as('filterUsers');
    
    cy.get('[data-testid="role-filter"]').select('CONTRACTOR');
    cy.wait('@filterUsers');
    
    cy.get('[data-testid="user-row"]').each(($el) => {
      cy.wrap($el).find('[data-testid="user-role"]').should('contain', 'CONTRACTOR');
    });
  });

  it('should edit a user', () => {
    // Click edit on the first user
    cy.get('[data-testid="user-row"]').first().find('[data-testid="edit-user-button"]').click();
    
    // User edit modal should appear
    cy.get('[data-testid="user-edit-modal"]').should('be.visible');
    
    // Update user information
    cy.get('[data-testid="user-full-name"]').clear().type('Updated Name');
    cy.get('[data-testid="user-email"]').clear().type('updated@example.com');
    cy.get('[data-testid="user-active-toggle"]').click();
    
    // Save changes
    cy.get('[data-testid="save-user-button"]').click();
    cy.wait('@updateUser');
    
    // Modal should close
    cy.get('[data-testid="user-edit-modal"]').should('not.exist');
    
    // User list should refresh
    cy.wait('@getUsers');
  });

  it('should add a new user', () => {
    // Click add user button
    cy.get('[data-testid="add-user-button"]').click();
    
    // User edit modal should appear
    cy.get('[data-testid="user-edit-modal"]').should('be.visible');
    
    // Fill in new user information
    cy.get('[data-testid="user-full-name"]').type('New User');
    cy.get('[data-testid="user-email"]').type('newuser@example.com');
    cy.get('[data-testid="user-role"]').select('CLIENT');
    
    // Save changes
    cy.get('[data-testid="save-user-button"]').click();
    cy.wait('@createUser');
    
    // Modal should close
    cy.get('[data-testid="user-edit-modal"]').should('not.exist');
    
    // User list should refresh
    cy.wait('@getUsers');
  });

  it('should change user role', () => {
    // Click role button on the first user
    cy.get('[data-testid="user-row"]').first().find('[data-testid="change-role-button"]').click();
    
    // Role modal should appear
    cy.get('[data-testid="role-modal"]').should('be.visible');
    
    // Select a new role
    cy.get('[data-testid="role-select"]').select('ADMIN');
    
    // Save changes
    cy.get('[data-testid="save-role-button"]').click();
    cy.wait('@updateRole');
    
    // Modal should close
    cy.get('[data-testid="role-modal"]').should('not.exist');
    
    // User list should refresh
    cy.wait('@getUsers');
  });

  it('should paginate through users', () => {
    // Mock second page of users
    cy.intercept('GET', '**/rest/v1/admin/users*', {
      fixture: 'admin/users_page2.json',
    }).as('getUsersPage2');
    
    // Check that pagination exists
    cy.get('[data-testid="pagination"]').should('be.visible');
    
    // Go to next page
    cy.get('[data-testid="next-page"]').click();
    cy.wait('@getUsersPage2');
    
    // Should show different users
    cy.get('[data-testid="user-row"]').should('have.length.at.least', 1);
    
    // Go back to first page
    cy.get('[data-testid="prev-page"]').click();
    cy.wait('@getUsers');
  });

  it('should show empty state when no users match filters', () => {
    // Mock empty users list
    cy.intercept('GET', '**/rest/v1/admin/users*', {
      body: { users: [], total: 0 }
    }).as('getEmptyUsers');
    
    // Search for a non-existent user
    cy.get('[data-testid="user-search"]').type('nonexistentuser');
    cy.get('[data-testid="search-form"]').submit();
    cy.wait('@getEmptyUsers');
    
    // Should show empty state
    cy.get('[data-testid="empty-users"]').should('be.visible');
  });
});
