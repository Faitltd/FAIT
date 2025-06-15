describe('Authentication', () => {
  beforeEach(() => {
    // Visit the home page before each test
    cy.visit('/');
  });

  it('should navigate to login page', () => {
    // Find and click the login button
    cy.contains('Login').click();
    
    // Verify we're on the login page
    cy.url().should('include', '/login');
    cy.get('h1').should('contain', 'Login');
    cy.get('form').should('exist');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should show validation errors on login form', () => {
    // Navigate to login page
    cy.contains('Login').click();
    
    // Submit the form without entering any data
    cy.get('button[type="submit"]').click();
    
    // Check for validation errors
    cy.contains('Email is required').should('be.visible');
    cy.contains('Password is required').should('be.visible');
    
    // Enter invalid email
    cy.get('input[type="email"]').type('invalid-email');
    cy.get('button[type="submit"]').click();
    
    // Check for email validation error
    cy.contains('Invalid email address').should('be.visible');
  });

  it('should navigate to registration page', () => {
    // Navigate to login page first
    cy.contains('Login').click();
    
    // Find and click the register link
    cy.contains('Create an account').click();
    
    // Verify we're on the registration page
    cy.url().should('include', '/register');
    cy.get('h1').should('contain', 'Create an Account');
    cy.get('form').should('exist');
    cy.get('input[name="name"]').should('exist');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should show validation errors on registration form', () => {
    // Navigate to registration page
    cy.contains('Login').click();
    cy.contains('Create an account').click();
    
    // Submit the form without entering any data
    cy.get('button[type="submit"]').click();
    
    // Check for validation errors
    cy.contains('Name is required').should('be.visible');
    cy.contains('Email is required').should('be.visible');
    cy.contains('Password is required').should('be.visible');
    
    // Enter invalid email
    cy.get('input[name="name"]').type('Test User');
    cy.get('input[type="email"]').type('invalid-email');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Check for email validation error
    cy.contains('Invalid email address').should('be.visible');
    
    // Enter valid email but short password
    cy.get('input[type="email"]').clear().type('test@example.com');
    cy.get('input[type="password"]').clear().type('pass');
    cy.get('button[type="submit"]').click();
    
    // Check for password validation error
    cy.contains('Password must be at least 8 characters').should('be.visible');
  });
});
