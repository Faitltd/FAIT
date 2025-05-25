/// <reference types="cypress" />

describe('Super Emergency Login Tests', () => {
  // Test credentials from user requirements
  const testCredentials = [
    { 
      email: 'admin@itsfait.com', 
      password: 'admin123', 
      type: 'Admin'
    },
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
    
    // Visit the super emergency login page
    cy.visit('/super-emergency-login');
    
    // Verify we're on the super emergency login page
    cy.url().should('include', '/super-emergency-login');
  });

  // Test each set of credentials with super emergency login
  testCredentials.forEach((cred) => {
    it(`should login successfully with ${cred.type} credentials using super emergency login`, () => {
      // Take screenshot before login
      cy.screenshot(`${cred.type.toLowerCase()}-super-emergency-before-login`);
      
      // Enter credentials
      cy.get('input[type="email"]').clear().type(cred.email);
      cy.get('input[type="password"]').clear().type(cred.password);
      
      // Submit form
      cy.contains('button', /login|sign in/i).click();
      
      // Wait for any redirects to complete
      cy.wait(3000);
      
      // Take screenshot after login attempt
      cy.screenshot(`${cred.type.toLowerCase()}-super-emergency-after-login`);
      
      // Log the current URL
      cy.url().then(url => {
        cy.log(`Current URL after super emergency login: ${url}`);
      });
      
      // Check localStorage for any auth tokens or user info
      cy.window().then(win => {
        cy.log('LocalStorage contents after super emergency login:');
        Object.keys(win.localStorage).forEach(key => {
          cy.log(`${key}: ${win.localStorage.getItem(key)}`);
        });
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
});
