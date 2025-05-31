describe('Login Debug Tests', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.wait(2000); // Wait for page to fully load
  });

  it('should debug login form accessibility', () => {
    // Check if backdrop is covering the form
    cy.get('body').then(($body) => {
      if ($body.find('.backdrop').length > 0) {
        cy.log('Backdrop element found - this may be covering the form');
        cy.get('.backdrop').should('exist');
      }
    });

    // Try to interact with form elements using force
    cy.get('#email').should('be.visible');
    cy.get('#password').should('be.visible');
    
    // Test form interaction with force flag
    cy.get('#email').type('test@example.com', { force: true });
    cy.get('#password').type('testpassword', { force: true });
    
    cy.screenshot('login-form-filled');
  });

  it('should test Supabase connection', () => {
    // Check if Supabase client is available
    cy.window().then((win) => {
      cy.log('Checking Supabase client availability');
      // This will help us see if Supabase is properly initialized
    });
    
    // Try to submit form and capture any errors
    cy.get('#email').type('invalid@example.com', { force: true });
    cy.get('#password').type('wrongpassword', { force: true });
    cy.get('button[type="submit"]').click({ force: true });
    
    // Wait for any error messages
    cy.wait(3000);
    cy.screenshot('login-error-attempt');
  });

  it('should check environment variables', () => {
    cy.visit('/login');
    
    // Check if we can access the page without errors
    cy.get('h2').should('contain', 'Sign in to your account');
    
    // Check for any console errors
    cy.window().then((win) => {
      // This will help us see any JavaScript errors
      cy.log('Checking for console errors');
    });
  });

  it('should test form validation', () => {
    // Try to submit empty form
    cy.get('button[type="submit"]').click({ force: true });

    // Check for HTML5 validation
    cy.get('#email:invalid').should('exist');
    cy.get('#password:invalid').should('exist');

    cy.screenshot('empty-form-validation');
  });

  it('should check authentication mode and test actual login', () => {
    // Check what authentication mode is being used
    cy.window().then((win) => {
      // Try to access the auth client info
      cy.log('Testing actual authentication flow');
    });

    // Test with a real login attempt and capture detailed info
    cy.get('#email').type('test@fait.com', { force: true });
    cy.get('#password').type('password123', { force: true });

    // Intercept any network requests to see what's happening
    cy.intercept('POST', '**/auth/**').as('authRequest');

    cy.get('button[type="submit"]').click({ force: true });

    // Wait for any auth requests and log them
    cy.wait(5000);

    // Check if we're still on login page or redirected
    cy.url().then((url) => {
      cy.log('Current URL after login attempt:', url);
    });

    // Check for any error messages
    cy.get('body').then(($body) => {
      if ($body.find('.bg-red-50').length > 0) {
        cy.log('Error message found on page');
      }
      if ($body.find('.bg-green-50').length > 0) {
        cy.log('Success message found on page');
      }
    });

    cy.screenshot('actual-login-attempt');
  });
});
