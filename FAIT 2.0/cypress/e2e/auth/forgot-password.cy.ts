describe('Forgot Password Page', () => {
  beforeEach(() => {
    cy.visit('/forgot-password');
  });

  it('should display the forgot password form', () => {
    cy.get('h2').should('contain', 'Reset your password');
    cy.get('form').should('exist');
    cy.get('input[type="email"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should show validation error for empty email', () => {
    cy.get('button[type="submit"]').click();
    cy.get('form').should('contain', 'Please enter your email address');
  });

  it('should navigate to login page when clicking the back to login link', () => {
    cy.get('a').contains('Back to login').click();
    cy.url().should('include', '/login');
  });

  it('should send password reset instructions successfully', () => {
    cy.get('input[type="email"]').type('test@example.com');
    
    // Intercept the password reset request and mock a successful response
    cy.intercept('POST', '**/auth/v1/recover*', {
      statusCode: 200,
      body: {}
    }).as('resetRequest');
    
    cy.get('button[type="submit"]').click();
    
    // Wait for the request to complete and verify success message
    cy.wait('@resetRequest');
    cy.get('form').should('contain', 'Password reset instructions have been sent to your email');
    
    // Verify the email field is cleared
    cy.get('input[type="email"]').should('have.value', '');
  });

  it('should show error message for non-existent email', () => {
    cy.get('input[type="email"]').type('nonexistent@example.com');
    
    // Intercept the password reset request and mock a failed response
    cy.intercept('POST', '**/auth/v1/recover*', {
      statusCode: 400,
      body: {
        error: 'User not found',
        error_description: 'User not found'
      }
    }).as('resetRequest');
    
    cy.get('button[type="submit"]').click();
    
    // Wait for the request to complete and verify error message
    cy.wait('@resetRequest');
    cy.get('form').should('contain', 'User not found');
  });
});
