/// <reference types="cypress" />

describe('Authentication with Provided Credentials', () => {
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
    
    // Visit the login page
    cy.visit('/login');
    
    // Verify we're on the login page
    cy.url().should('include', '/login');
    cy.get('form').should('exist');
  });

  testCredentials.forEach((cred) => {
    it(`should login successfully with ${cred.type} credentials`, () => {
      // Log the test being run
      cy.log(`Testing login with ${cred.type} credentials: ${cred.email}`);
      
      // Take screenshot before login
      cy.screenshot(`${cred.type.toLowerCase()}-before-login`);
      
      // Enter credentials
      cy.get('input[type="email"]').clear().type(cred.email);
      cy.get('input[type="password"]').clear().type(cred.password);
      
      // Submit form - try different selectors
      cy.get('form').then($form => {
        // Try to find the submit button
        const $button = $form.find('button[type="submit"]');
        if ($button.length) {
          cy.wrap($button).click();
        } else {
          // Try to find a button with text containing "sign in" or "login"
          cy.contains('button', /sign in|login/i).click();
        }
      });
      
      // Wait for any redirects to complete
      cy.wait(3000);
      
      // Take screenshot after login attempt
      cy.screenshot(`${cred.type.toLowerCase()}-after-login`);
      
      // Log the current URL
      cy.url().then(url => {
        cy.log(`Current URL after login: ${url}`);
      });
      
      // Check if we're redirected away from login page
      cy.url().should('not.include', '/login');
      
      // Check for dashboard or success indicators
      cy.url().should('include', '/dashboard');
      
      // Check localStorage for auth tokens
      cy.window().then(win => {
        const hasAuthToken = Object.keys(win.localStorage).some(key => 
          key.includes('auth') || key.includes('supabase')
        );
        expect(hasAuthToken).to.be.true;
      });
    });
  });
});
