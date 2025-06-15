describe('Authentication', () => {
  describe('Login Page', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('should display the login form', () => {
      cy.get('h1').should('contain', 'Log In');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('should show validation errors for empty fields', () => {
      cy.get('button[type="submit"]').click();
      // Check for validation messages (adjust selectors based on your implementation)
      cy.get('body').should('contain', 'required').or('contain', 'Please');
    });

    it('should have a link to register page', () => {
      cy.get('a[href="/register"]').should('be.visible');
    });
  });

  describe('Register Page', () => {
    beforeEach(() => {
      cy.visit('/register');
    });

    it('should display the registration form', () => {
      cy.get('h1').should('contain', 'Sign Up');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('should show validation errors for empty fields', () => {
      cy.get('button[type="submit"]').click();
      // Check for validation messages
      cy.get('body').should('contain', 'required').or('contain', 'Please');
    });

    it('should have a link to login page', () => {
      cy.get('a[href="/login"]').should('be.visible');
    });
  });

  describe('Navigation Authentication', () => {
    it('should show login/signup buttons when not authenticated', () => {
      cy.visit('/');
      cy.get('a[href="/login"]').should('be.visible');
      cy.get('a[href="/register"]').should('be.visible');
    });
  });
});
