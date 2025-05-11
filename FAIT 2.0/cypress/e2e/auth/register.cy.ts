describe('Register Page', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('should display the registration form', () => {
    cy.get('h2').should('contain', 'Create your account');
    cy.get('form').should('exist');
    cy.get('input[name="firstName"]').should('exist');
    cy.get('input[name="lastName"]').should('exist');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.get('input[name="confirmPassword"]').should('exist');
    cy.get('select[name="userType"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should show validation errors for empty fields', () => {
    cy.get('button[type="submit"]').click();
    cy.get('form').should('contain', 'Please fill in all fields');
  });

  it('should show validation error for password mismatch', () => {
    cy.get('input[name="firstName"]').type('Test');
    cy.get('input[name="lastName"]').type('User');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('differentpassword');
    cy.get('button[type="submit"]').click();
    cy.get('form').should('contain', 'Passwords do not match');
  });

  it('should navigate to login page when clicking the sign in link', () => {
    cy.get('a').contains('Sign in').click();
    cy.url().should('include', '/login');
  });

  it('should register successfully with valid information', () => {
    const email = `test${Date.now()}@example.com`; // Generate unique email
    
    cy.get('input[name="firstName"]').type('Test');
    cy.get('input[name="lastName"]').type('User');
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('password123');
    cy.get('select[name="userType"]').select('client');
    
    // Intercept the registration request and mock a successful response
    cy.intercept('POST', '**/auth/v1/signup*', {
      statusCode: 200,
      body: {
        id: 'test-user-id',
        email: email,
        user_metadata: {
          first_name: 'Test',
          last_name: 'User',
          user_role: 'client'
        }
      }
    }).as('registerRequest');
    
    cy.get('button[type="submit"]').click();
    
    // Wait for the request to complete and verify success message
    cy.wait('@registerRequest');
    cy.get('form').should('contain', 'Account created successfully');
    
    // Verify redirection to login page after a delay
    cy.url().should('include', '/login', { timeout: 3000 });
  });

  it('should show error message for existing email', () => {
    cy.get('input[name="firstName"]').type('Test');
    cy.get('input[name="lastName"]').type('User');
    cy.get('input[type="email"]').type('existing@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('password123');
    cy.get('select[name="userType"]').select('client');
    
    // Intercept the registration request and mock a failed response
    cy.intercept('POST', '**/auth/v1/signup*', {
      statusCode: 400,
      body: {
        error: 'User already registered',
        error_description: 'User already registered'
      }
    }).as('registerRequest');
    
    cy.get('button[type="submit"]').click();
    
    // Wait for the request to complete and verify error message
    cy.wait('@registerRequest');
    cy.get('form').should('contain', 'User already registered');
  });
});
