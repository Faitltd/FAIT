describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display the login form', () => {
    cy.get('h2').should('contain', 'Sign in to your account');
    cy.get('form').should('exist');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should show validation errors for empty fields', () => {
    cy.get('button[type="submit"]').click();
    cy.get('form').should('contain', 'Please fill in all fields');
  });

  it('should navigate to register page when clicking the sign up link', () => {
    cy.get('a').contains('Sign up').click();
    cy.url().should('include', '/register');
  });

  it('should navigate to forgot password page when clicking the forgot password link', () => {
    cy.get('a').contains('Forgot your password').click();
    cy.url().should('include', '/forgot-password');
  });

  it('should login successfully with valid credentials', () => {
    // This test requires a valid user in the database
    // For testing purposes, we can use a test user or mock the authentication
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
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
    
    // Wait for the request to complete and verify redirection
    cy.wait('@loginRequest');
    cy.url().should('include', '/dashboard');
  });

  it('should show error message for invalid credentials', () => {
    cy.get('input[type="email"]').type('invalid@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    // Intercept the login request and mock a failed response
    cy.intercept('POST', '**/auth/v1/token*', {
      statusCode: 400,
      body: {
        error: 'Invalid login credentials',
        error_description: 'Invalid login credentials'
      }
    }).as('loginRequest');
    
    // Wait for the request to complete and verify error message
    cy.wait('@loginRequest');
    cy.get('form').should('contain', 'Invalid login credentials');
  });
});
