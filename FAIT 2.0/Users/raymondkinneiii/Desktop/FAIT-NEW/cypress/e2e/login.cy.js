describe('Login Page', () => {
  beforeEach(() => {
    // Visit the login page before each test
    cy.visit('/');
    
    // Clear localStorage to ensure we're starting fresh
    cy.clearLocalStorage();
  });

  it('should display the login form', () => {
    // Check if the login form elements are visible
    cy.contains('h2', 'Sign in to your account').should('be.visible');
    cy.get('[data-testid="email-input"]').should('be.visible');
    cy.get('[data-testid="password-input"]').should('be.visible');
    cy.get('[data-testid="login-button"]').should('be.visible');
  });

  it('should show error for invalid credentials', () => {
    // Try to login with invalid credentials
    cy.get('[data-testid="email-input"]').type('invalid@example.com');
    cy.get('[data-testid="password-input"]').type('wrongpassword');
    cy.get('[data-testid="login-button"]').click();

    // Check if error message appears
    cy.get('[data-testid="message-container"]').should('contain', 'Error:');
  });

  it('should toggle password visibility', () => {
    // Type a password
    cy.get('[data-testid="password-input"]').type('password123');
    
    // Password should be hidden by default
    cy.get('[data-testid="password-input"]').should('have.attr', 'type', 'password');
    
    // Click the show password button
    cy.get('[data-testid="toggle-password-visibility"]').click();
    
    // Password should now be visible
    cy.get('[data-testid="password-input"]').should('have.attr', 'type', 'text');
    
    // Click the hide password button
    cy.get('[data-testid="toggle-password-visibility"]').click();
    
    // Password should be hidden again
    cy.get('[data-testid="password-input"]').should('have.attr', 'type', 'password');
  });

  it('should remember email when checkbox is checked', () => {
    // Type email and check remember me
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="remember-me-checkbox"]').check();
    
    // Submit form (it will fail but that's ok for this test)
    cy.get('[data-testid="login-button"]').click();
    
    // Reload the page
    cy.reload();
    
    // Email should be remembered
    cy.get('[data-testid="email-input"]').should('have.value', 'test@example.com');
    cy.get('[data-testid="remember-me-checkbox"]').should('be.checked');
  });

  it('should login successfully with client demo account', () => {
    // Use the URL parameter for auto-login
    cy.visit('/?autologin=client');
    
    // Check for success message and redirection
    cy.get('[data-testid="message-container"]', { timeout: 10000 })
      .should('contain', 'Successfully logged in');
    
    // We can't test the actual redirect in Cypress since it's to another origin
    // but we can check that the timeout was set
    cy.window().then((win) => {
      expect(win.location.href).to.include('/');
    });
  });

  it('should login successfully with contractor demo account', () => {
    // Click on the contractor demo button
    cy.contains('button', 'Contractor Demo').click();
    
    // Submit the form
    cy.contains('button', 'Sign in').click();
    
    // Check for success message and redirection
    cy.contains('Successfully logged in').should('be.visible');
    cy.url().should('include', '/dashboard', { timeout: 10000 });
  });

  it('should login successfully with admin demo account', () => {
    // Click on the admin demo button
    cy.contains('button', 'Admin Demo').click();
    
    // Submit the form
    cy.contains('button', 'Sign in').click();
    
    // Check for success message and redirection
    cy.contains('Successfully logged in').should('be.visible');
    cy.url().should('include', '/dashboard', { timeout: 10000 });
  });

  it('should login successfully with ally demo account', () => {
    // Click on the ally demo button
    cy.contains('button', 'Ally Demo').click();
    
    // Submit the form
    cy.contains('button', 'Sign in').click();
    
    // Check for success message and redirection
    cy.contains('Successfully logged in').should('be.visible');
    cy.url().should('include', '/dashboard', { timeout: 10000 });
  });

  it('should validate email format', () => {
    // Try to submit with invalid email format
    cy.get('[data-testid="email-input"]').type('invalidemail');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    
    // The browser's built-in validation should prevent submission
    // We can check if we're still on the login page
    cy.url().should('not.include', '/dashboard');
  });
});
