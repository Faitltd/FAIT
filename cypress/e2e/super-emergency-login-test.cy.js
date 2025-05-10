/// <reference types="cypress" />

describe('Super Emergency Login Test', () => {
  // Test credentials from user requirements
  const testCredentials = [
    { 
      email: 'admin@itsfait.com', 
      password: 'admin123', 
      type: 'Admin',
      expectedUrl: '/dashboard'
    },
    { 
      email: 'client@itsfait.com', 
      password: 'client123', 
      type: 'Client',
      expectedUrl: '/dashboard'
    },
    { 
      email: 'service@itsfait.com', 
      password: 'service123', 
      type: 'Service Agent',
      expectedUrl: '/dashboard'
    }
  ];

  beforeEach(() => {
    // Clear cookies and local storage between tests
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Enable local authentication
    cy.window().then(win => {
      win.localStorage.setItem('useLocalAuth', 'true');
    });
    
    // Visit the super emergency login page
    cy.visit('/super-emergency-login');
    
    // Verify we're on the super emergency login page
    cy.url().should('include', '/super-emergency-login');
    cy.get('form').should('exist');
  });

  testCredentials.forEach((cred) => {
    it(`should login successfully with ${cred.type} credentials using super emergency login`, () => {
      // Log the test being run
      cy.log(`Testing super emergency login with ${cred.type} credentials: ${cred.email}`);
      
      // Take screenshot before login
      cy.screenshot(`${cred.type.toLowerCase()}-before-super-emergency-login`);
      
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
      cy.screenshot(`${cred.type.toLowerCase()}-after-super-emergency-login`);
      
      // Log the current URL
      cy.url().then(url => {
        cy.log(`Current URL after login: ${url}`);
      });
      
      // Check if we're redirected away from login page
      cy.url().should('not.include', '/super-emergency-login');
      
      // Check for dashboard URL
      cy.url().should('include', cred.expectedUrl);
      
      // Check localStorage for auth tokens
      cy.window().then(win => {
        const hasAuthToken = Object.keys(win.localStorage).some(key => 
          key.includes('auth') || key.includes('supabase') || key.includes('local_auth_session') || key.includes('userEmail')
        );
        expect(hasAuthToken).to.be.true;
      });
    });
  });
});
