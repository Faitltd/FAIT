/// <reference types="cypress" />

describe('Comprehensive Authentication Tests', () => {
  // Test credentials from user requirements
  const testCredentials = [
    { 
      email: 'admin@itsfait.com', 
      password: 'admin123', 
      type: 'Admin',
      expectedRedirect: '/dashboard/admin'
    },
    { 
      email: 'client@itsfait.com', 
      password: 'client123', 
      type: 'Client',
      expectedRedirect: '/dashboard/client'
    },
    { 
      email: 'service@itsfait.com', 
      password: 'service123', 
      type: 'Service Agent',
      expectedRedirect: '/dashboard/service-agent'
    }
  ];

  beforeEach(() => {
    // Clear cookies and local storage between tests
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Force local auth mode for reliable testing
    cy.window().then(win => {
      win.localStorage.setItem('useLocalAuth', 'true');
    });
    
    // Visit the test auth credentials page
    cy.visit('/test-auth-credentials');
    
    // Verify we're on the test page
    cy.url().should('include', '/test-auth-credentials');
    cy.contains('Authentication Credentials Test').should('exist');
    
    // Verify local auth mode is active
    cy.contains('Current Auth Mode: Local Authentication').should('exist');
  });

  it('should display all test credentials correctly', () => {
    // Check that all test credentials are displayed
    testCredentials.forEach(cred => {
      cy.contains(cred.type).should('exist');
      cy.contains(cred.email).should('exist');
      cy.contains(cred.password).should('exist');
    });
  });

  it('should run all authentication tests successfully', () => {
    // Click the run tests button
    cy.contains('Run Authentication Tests').click();
    
    // Wait for tests to complete
    cy.contains('Running Tests...', { timeout: 10000 }).should('not.exist');
    
    // Check that all tests passed
    cy.contains('✅ All tests passed!', { timeout: 10000 }).should('exist');
    
    // Verify each credential test result
    testCredentials.forEach(cred => {
      cy.contains(`✅ ${cred.type}`).should('exist');
    });
  });

  // Test each credential individually
  testCredentials.forEach((cred) => {
    it(`should login successfully with ${cred.type} credentials on login page`, () => {
      // Visit the login page
      cy.visit('/login');
      
      // Verify we're on the login page
      cy.url().should('include', '/login');
      cy.get('form').should('exist');
      
      // Enter credentials
      cy.get('[data-cy="login-email"]').clear().type(cred.email);
      cy.get('[data-cy="login-password"]').clear().type(cred.password);
      
      // Submit form
      cy.get('[data-cy="login-submit"]').click();
      
      // Wait for any redirects to complete
      cy.wait(2000);
      
      // Check if we're redirected away from login page
      cy.url().should('not.include', '/login');
      
      // Check for dashboard
      cy.url().should('include', '/dashboard');
      
      // Check localStorage for auth tokens
      cy.window().then(win => {
        const hasAuthToken = Object.keys(win.localStorage).some(key => 
          key.includes('auth') || key.includes('supabase') || key.includes('local_auth_session')
        );
        expect(hasAuthToken).to.be.true;
      });
    });
  });

  it('should handle invalid credentials correctly', () => {
    // Visit the login page
    cy.visit('/login');
    
    // Enter invalid credentials
    cy.get('[data-cy="login-email"]').clear().type('invalid@example.com');
    cy.get('[data-cy="login-password"]').clear().type('wrongpassword');
    
    // Submit form
    cy.get('[data-cy="login-submit"]').click();
    
    // Check for error message
    cy.contains('Invalid email or password', { timeout: 5000 }).should('exist');
    
    // Verify we're still on the login page
    cy.url().should('include', '/login');
  });

  it('should toggle between local and Supabase auth modes', () => {
    // Toggle auth mode
    cy.contains('Toggle Auth Mode').click();
    
    // Verify mode changed
    cy.contains('Current Auth Mode: Supabase Authentication').should('exist');
    
    // Toggle back
    cy.contains('Toggle Auth Mode').click();
    
    // Verify mode changed back
    cy.contains('Current Auth Mode: Local Authentication').should('exist');
  });

  it('should sign out successfully', () => {
    // First login
    cy.visit('/login');
    cy.get('[data-cy="login-email"]').clear().type('admin@itsfait.com');
    cy.get('[data-cy="login-password"]').clear().type('admin123');
    cy.get('[data-cy="login-submit"]').click();
    
    // Wait for redirect
    cy.wait(2000);
    
    // Verify login was successful
    cy.url().should('include', '/dashboard');
    
    // Find and click logout button (may need to adjust selector based on your UI)
    cy.contains('Logout', { timeout: 10000 }).click();
    
    // Verify we're logged out and redirected
    cy.url().should('not.include', '/dashboard');
  });
});
