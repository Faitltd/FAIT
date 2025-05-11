/// <reference types="cypress" />

describe('Login Credentials Testing', () => {
  // Test credentials from user requirements
  const testCredentials = [
    { email: 'admin@itsfait.com', password: 'admin123', type: 'Admin', expectedUrl: '/dashboard' },
    { email: 'client@itsfait.com', password: 'client123', type: 'Client', expectedUrl: '/dashboard' },
    { email: 'service@itsfait.com', password: 'service123', type: 'Service Agent', expectedUrl: '/dashboard' }
  ];

  beforeEach(() => {
    // Visit the login page before each test
    cy.visit('/login');

    // Verify we're on the login page
    cy.url().should('include', '/login');
    cy.get('form').should('exist');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
  });

  // Test each set of credentials
  testCredentials.forEach((cred) => {
    it(`should login successfully with ${cred.type} credentials`, () => {
      // Enable local auth
      cy.window().then(win => {
        win.localStorage.setItem('useLocalAuth', 'true');
      });

      // Enter credentials
      cy.get('[data-cy=login-email]').clear().type(cred.email);
      cy.get('[data-cy=login-password]').clear().type(cred.password);

      // Check localStorage before submission
      cy.window().then(win => {
        cy.log('LocalStorage before login:');
        Object.keys(win.localStorage).forEach(key => {
          cy.log(`${key}: ${win.localStorage.getItem(key)}`);
        });
      });

      // Submit form and verify it was submitted
      cy.get('[data-cy=login-submit]').click();
      cy.log(`Submitted login form for ${cred.type}`);

      // Wait for the login process to complete
      cy.wait(2000);

      // Check that authentication was successful by checking localStorage
      cy.window().then(win => {
        const session = win.localStorage.getItem('local_auth_session');
        cy.log(`Session after login: ${session ? 'Found' : 'Not found'}`);

        if (session) {
          const sessionData = JSON.parse(session);
          cy.log(`Logged in as: ${sessionData.user.email}`);
          expect(sessionData.user.email).to.equal(cred.email);
        } else {
          // If session is not found, check if we're using a different storage key
          const keys = Object.keys(win.localStorage);
          const authKeys = keys.filter(key =>
            key.includes('auth') || key.includes('supabase') || key.includes('session')
          );
          cy.log('Auth-related localStorage keys:', authKeys);

          // For this test, we'll pass if we find userType and userEmail in localStorage
          const userType = win.localStorage.getItem('userType');
          const userEmail = win.localStorage.getItem('userEmail');

          expect(userEmail).to.equal(cred.email);
        }
      });

      // Verify user type was stored correctly
      cy.window().then(win => {
        const userType = win.localStorage.getItem('userType');
        if (cred.type === 'Admin') {
          expect(userType).to.equal('admin');
        } else if (cred.type === 'Client') {
          expect(userType).to.equal('client');
        } else if (cred.type === 'Service Agent') {
          expect(userType).to.equal('service_agent');
        }
      });

      // Success - the login credentials work correctly
      cy.log(`Login successful for ${cred.type}`);
    });
  });

  it('should show error for invalid credentials', () => {
    // Enable local auth
    cy.window().then(win => {
      win.localStorage.setItem('useLocalAuth', 'true');
    });

    // Enter invalid credentials
    cy.get('[data-cy=login-email]').clear().type('wrong@example.com');
    cy.get('[data-cy=login-password]').clear().type('wrongpassword');

    // Submit form
    cy.get('[data-cy=login-submit]').click();

    // Check for error message or error class
    cy.get('.bg-red-50, .text-red-600, [role="alert"]').should('exist');

    // Verify we're still on the login page
    cy.url().should('include', '/login');

    // Verify no session was created
    cy.window().then(win => {
      const session = win.localStorage.getItem('local_auth_session');
      expect(session).to.be.null;
    });
  });

  it('should validate email format', () => {
    // Enter invalid email format
    cy.get('[data-cy=login-email]').clear().type('invalid-email');
    cy.get('[data-cy=login-password]').clear().type('password123');

    // Submit form
    cy.get('[data-cy=login-submit]').click();

    // Check that we're still on the login page (form wasn't submitted)
    cy.url().should('include', '/login');
  });

  it('should validate empty fields', () => {
    // Submit empty form
    cy.get('[data-cy=login-email]').clear();
    cy.get('[data-cy=login-password]').clear();
    cy.get('[data-cy=login-submit]').click();

    // Check that we're still on the login page
    cy.url().should('include', '/login');
  });
});
