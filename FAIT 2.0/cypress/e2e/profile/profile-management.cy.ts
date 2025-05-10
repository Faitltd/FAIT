describe('Profile Management', () => {
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
    
    // Mock the profile data API response
    cy.intercept('GET', '**/rest/v1/profiles?id=eq.test-user-id*', {
      statusCode: 200,
      body: [
        {
          id: 'test-user-id',
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
          phone: '555-123-4567',
          address: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zip: '12345',
          bio: 'This is a test user profile',
          avatar_url: null,
          user_role: 'client',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z'
        }
      ]
    }).as('getProfile');
    
    cy.visit('/dashboard/profile');
    cy.wait('@getProfile');
  });

  it('should display the profile information correctly', () => {
    cy.get('h1').should('contain', 'Your Profile');
    cy.get('input[name="first-name"]').should('have.value', 'Test');
    cy.get('input[name="last-name"]').should('have.value', 'User');
    cy.get('input[name="email"]').should('have.value', 'test@example.com').should('be.disabled');
    cy.get('input[name="phone"]').should('have.value', '555-123-4567');
    cy.get('input[name="address"]').should('have.value', '123 Main St');
    cy.get('input[name="city"]').should('have.value', 'Anytown');
    cy.get('input[name="state"]').should('have.value', 'CA');
    cy.get('input[name="zip"]').should('have.value', '12345');
    cy.get('textarea[name="bio"]').should('have.value', 'This is a test user profile');
  });

  it('should update profile information successfully', () => {
    // Update profile information
    cy.get('input[name="first-name"]').clear().type('Updated');
    cy.get('input[name="last-name"]').clear().type('Name');
    cy.get('input[name="phone"]').clear().type('555-987-6543');
    cy.get('input[name="address"]').clear().type('456 Oak Ave');
    cy.get('input[name="city"]').clear().type('Somewhere');
    cy.get('input[name="state"]').clear().type('NY');
    cy.get('input[name="zip"]').clear().type('67890');
    cy.get('textarea[name="bio"]').clear().type('This is an updated test user profile');
    
    // Intercept the update profile request and mock a successful response
    cy.intercept('PATCH', '**/rest/v1/profiles?id=eq.test-user-id*', {
      statusCode: 200,
      body: [
        {
          id: 'test-user-id',
          first_name: 'Updated',
          last_name: 'Name',
          phone: '555-987-6543',
          address: '456 Oak Ave',
          city: 'Somewhere',
          state: 'NY',
          zip: '67890',
          bio: 'This is an updated test user profile',
          avatar_url: null,
          updated_at: new Date().toISOString()
        }
      ]
    }).as('updateProfile');
    
    cy.get('button[type="submit"]').click();
    cy.wait('@updateProfile');
    
    // Verify success message
    cy.get('[data-cy="success-message"]').should('contain', 'Profile updated successfully');
    
    // Mock the updated profile data for a page refresh
    cy.intercept('GET', '**/rest/v1/profiles?id=eq.test-user-id*', {
      statusCode: 200,
      body: [
        {
          id: 'test-user-id',
          first_name: 'Updated',
          last_name: 'Name',
          email: 'test@example.com',
          phone: '555-987-6543',
          address: '456 Oak Ave',
          city: 'Somewhere',
          state: 'NY',
          zip: '67890',
          bio: 'This is an updated test user profile',
          avatar_url: null,
          user_role: 'client',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: new Date().toISOString()
        }
      ]
    }).as('getUpdatedProfile');
    
    // Refresh the page to verify persistence
    cy.visit('/dashboard/profile');
    cy.wait('@getUpdatedProfile');
    
    // Verify updated values
    cy.get('input[name="first-name"]').should('have.value', 'Updated');
    cy.get('input[name="last-name"]').should('have.value', 'Name');
    cy.get('input[name="phone"]').should('have.value', '555-987-6543');
    cy.get('input[name="address"]').should('have.value', '456 Oak Ave');
    cy.get('input[name="city"]').should('have.value', 'Somewhere');
    cy.get('input[name="state"]').should('have.value', 'NY');
    cy.get('input[name="zip"]').should('have.value', '67890');
    cy.get('textarea[name="bio"]').should('have.value', 'This is an updated test user profile');
  });

  it('should upload avatar successfully', () => {
    // Create a test file to upload
    cy.fixture('avatar.jpg', 'base64').then(fileContent => {
      cy.get('input[type="file"]').attachFile({
        fileContent,
        fileName: 'avatar.jpg',
        mimeType: 'image/jpeg'
      });
    });
    
    // Intercept the storage upload request and mock a successful response
    cy.intercept('POST', '**/storage/v1/object/avatars/*', {
      statusCode: 200,
      body: {
        Key: 'avatars/test-user-id-avatar.jpg'
      }
    }).as('uploadAvatar');
    
    // Intercept the get public URL request and mock a successful response
    cy.intercept('GET', '**/storage/v1/object/public/avatars/*', {
      statusCode: 200,
      body: {
        publicUrl: 'https://example.com/avatars/test-user-id-avatar.jpg'
      }
    }).as('getPublicUrl');
    
    // Intercept the update profile request and mock a successful response
    cy.intercept('PATCH', '**/rest/v1/profiles?id=eq.test-user-id*', {
      statusCode: 200,
      body: [
        {
          id: 'test-user-id',
          avatar_url: 'https://example.com/avatars/test-user-id-avatar.jpg',
          updated_at: new Date().toISOString()
        }
      ]
    }).as('updateProfile');
    
    cy.get('button[type="submit"]').click();
    cy.wait('@uploadAvatar');
    cy.wait('@getPublicUrl');
    cy.wait('@updateProfile');
    
    // Verify success message
    cy.get('[data-cy="success-message"]').should('contain', 'Profile updated successfully');
    
    // Mock the updated profile data for a page refresh
    cy.intercept('GET', '**/rest/v1/profiles?id=eq.test-user-id*', {
      statusCode: 200,
      body: [
        {
          id: 'test-user-id',
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
          phone: '555-123-4567',
          address: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zip: '12345',
          bio: 'This is a test user profile',
          avatar_url: 'https://example.com/avatars/test-user-id-avatar.jpg',
          user_role: 'client',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: new Date().toISOString()
        }
      ]
    }).as('getUpdatedProfile');
    
    // Refresh the page to verify persistence
    cy.visit('/dashboard/profile');
    cy.wait('@getUpdatedProfile');
    
    // Verify avatar is displayed
    cy.get('[data-cy="avatar-image"]').should('have.attr', 'src', 'https://example.com/avatars/test-user-id-avatar.jpg');
  });

  it('should show error message when profile update fails', () => {
    // Update profile information
    cy.get('input[name="first-name"]').clear().type('Error');
    
    // Intercept the update profile request and mock a failed response
    cy.intercept('PATCH', '**/rest/v1/profiles?id=eq.test-user-id*', {
      statusCode: 400,
      body: {
        error: 'Database error',
        error_description: 'Failed to update profile'
      }
    }).as('updateProfileError');
    
    cy.get('button[type="submit"]').click();
    cy.wait('@updateProfileError');
    
    // Verify error message
    cy.get('[data-cy="error-message"]').should('contain', 'Failed to update profile');
  });
});
