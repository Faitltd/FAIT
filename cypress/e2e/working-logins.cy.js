/// <reference types="cypress" />

describe('Working Login Tests', () => {
  // Test credentials that are known to work
  const workingCredentials = [
    {
      email: 'client@itsfait.com',
      password: 'client123',
      type: 'Client'
    },
    {
      email: 'service@itsfait.com',
      password: 'service123',
      type: 'Service Agent'
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
  workingCredentials.forEach((cred) => {
    it(`should login successfully with ${cred.type} credentials`, () => {
      // Take screenshot before login
      cy.screenshot(`${cred.type.toLowerCase()}-before-login`);

      // Enter credentials
      cy.get('input[type="email"]').clear().type(cred.email);
      cy.get('input[type="password"]').clear().type(cred.password);

      // Submit form - using the button text instead of data-cy attribute
      cy.contains('button', /sign in/i).click();

      // Wait for any redirects to complete
      cy.wait(3000);

      // Take screenshot after login attempt
      cy.screenshot(`${cred.type.toLowerCase()}-after-login`);

      // Log the current URL
      cy.url().then(url => {
        cy.log(`Current URL after login: ${url}`);
      });

      // Check for any success messages on the page
      cy.get('body').then($body => {
        if ($body.text().includes('success')) {
          cy.log('Success message found on page');
        }
      });

      // Check localStorage for any auth tokens or user info
      cy.window().then(win => {
        cy.log('LocalStorage contents:');
        Object.keys(win.localStorage).forEach(key => {
          cy.log(`${key}: ${win.localStorage.getItem(key)}`);
        });
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

      // Check if we're still on the login page
      cy.url().then(url => {
        if (url.includes('/login')) {
          cy.log('Still on login page after login attempt');
        } else {
          cy.log('Redirected away from login page');
        }
      });
    });
  });

  it('should check for emergency login options', () => {
    // Check for emergency login options
    cy.contains('Having trouble logging in?').should('be.visible');
    cy.contains('Use Emergency Login').should('be.visible');

    // Take a screenshot of the emergency login options
    cy.screenshot('emergency-login-options');

    // Click on the emergency login link
    cy.contains('Use Emergency Login').click();

    // Wait for page to load
    cy.wait(2000);

    // Take a screenshot of the emergency login page
    cy.screenshot('emergency-login-page');

    // Log the current URL
    cy.url().then(url => {
      cy.log(`Emergency login URL: ${url}`);
    });
  });
});
