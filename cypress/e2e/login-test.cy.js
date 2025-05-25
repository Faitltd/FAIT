/// <reference types="cypress" />

describe('Login Functionality Testing', () => {
  // Test credentials from user requirements
  const testCredentials = [
    {
      email: 'admin@itsfait.com',
      password: 'admin123',
      type: 'Admin',
      expectedUrls: ['/dashboard', '/dashboard/admin', '/subscription/dashboard']
    },
    {
      email: 'client@itsfait.com',
      password: 'client123',
      type: 'Client',
      expectedUrls: ['/dashboard', '/dashboard/client', '/subscription/dashboard']
    },
    {
      email: 'service@itsfait.com',
      password: 'service123',
      type: 'Service Agent',
      expectedUrls: ['/dashboard', '/dashboard/service-agent', '/subscription/dashboard']
    }
  ];

  beforeEach(() => {
    // Clear cookies and local storage between tests
    cy.clearCookies();
    cy.clearLocalStorage();

    // Capture console logs
    cy.window().then((win) => {
      cy.spy(win.console, 'log').as('consoleLog');
      cy.spy(win.console, 'error').as('consoleError');
    });

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
      // Enter credentials
      cy.get('[data-cy=login-email]').clear().type(cred.email);
      cy.get('[data-cy=login-password]').clear().type(cred.password);

      // Submit form using data-cy attribute
      cy.get('[data-cy=login-submit]').click();

      // Wait for any redirects to complete
      cy.wait(3000);

      // Check for successful login - should redirect to one of the expected URLs
      cy.url().then(url => {
        const redirected = cred.expectedUrls.some(expectedUrl => url.includes(expectedUrl));
        expect(redirected, `URL should include one of: ${cred.expectedUrls.join(', ')}`).to.be.true;
      });

      // Check console logs for any errors
      cy.get('@consoleError').then(errorSpy => {
        if (errorSpy.callCount > 0) {
          cy.log('Console errors detected:');
          errorSpy.args.forEach(args => {
            cy.log(JSON.stringify(args));
          });
        }
      });

      // Check console logs for login success messages
      cy.get('@consoleLog').then(logSpy => {
        const loginSuccessLogs = logSpy.args.filter(args =>
          args[0] && typeof args[0] === 'string' &&
          (args[0].includes('successful') || args[0].includes('success'))
        );

        if (loginSuccessLogs.length > 0) {
          cy.log('Login success messages found in console:');
          loginSuccessLogs.forEach(args => {
            cy.log(JSON.stringify(args));
          });
        }
      });
    });
  });

  it('should show error for invalid credentials', () => {
    // Enter invalid credentials
    cy.get('[data-cy=login-email]').clear().type('wrong@example.com');
    cy.get('[data-cy=login-password]').clear().type('wrongpassword');

    // Submit form
    cy.get('[data-cy=login-submit]').click();

    // Check for error message
    cy.contains(/invalid|error|failed/i, { timeout: 10000 }).should('be.visible');
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

  it('should display test credentials info box', () => {
    // Check that the test credentials info box is displayed
    cy.contains('Available Login Credentials').should('be.visible');
    cy.contains('Admin: admin@itsfait.com / admin123').should('be.visible');
    cy.contains('Client: client@itsfait.com / client123').should('be.visible');
    cy.contains('Service Agent: service@itsfait.com / service123').should('be.visible');
  });

  it('should have emergency login options', () => {
    // Check for emergency login options
    cy.contains('Having trouble logging in?').should('be.visible');
    cy.contains('Use Emergency Login').should('be.visible');
  });
});
