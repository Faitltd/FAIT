/// <reference types="cypress" />

describe('Login Diagnostics', () => {
  const testCredentials = [
    { 
      email: 'admin@itsfait.com', 
      password: 'admin123', 
      type: 'Admin',
      expectedRedirect: true
    },
    { 
      email: 'client@itsfait.com', 
      password: 'client123', 
      type: 'Client',
      expectedRedirect: true
    },
    { 
      email: 'service@itsfait.com', 
      password: 'service123', 
      type: 'Service Agent',
      expectedRedirect: true
    }
  ];

  beforeEach(() => {
    // Clear cookies and local storage
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Enable local auth
    cy.window().then(win => {
      win.localStorage.setItem('useLocalAuth', 'true');
      cy.log('Local auth enabled via localStorage');
    });
    
    // Visit login page
    cy.visit('/login');
    cy.log('Visited login page');
  });

  // Test each credential set
  testCredentials.forEach((cred) => {
    it(`should diagnose login with ${cred.type} credentials`, () => {
      // Log test start
      cy.log(`Testing ${cred.type} login with ${cred.email} / ${cred.password}`);
      
      // Check if form elements exist with proper data-cy attributes
      cy.get('input[type="email"]').then($input => {
        cy.log(`Email input found with data-cy: ${$input.attr('data-cy')}`);
      });
      
      cy.get('input[type="password"]').then($input => {
        cy.log(`Password input found with data-cy: ${$input.attr('data-cy')}`);
      });
      
      // Enter credentials
      cy.get('input[type="email"]').clear().type(cred.email);
      cy.get('input[type="password"]').clear().type(cred.password);
      cy.log('Credentials entered');
      
      // Find and log submit button details
      cy.get('form').find('button[type="submit"]').then($btn => {
        cy.log(`Submit button found with text: "${$btn.text()}" and data-cy: ${$btn.attr('data-cy')}`);
      });
      
      // Submit form
      cy.get('form').submit();
      cy.log('Form submitted');
      
      // Wait for any redirects or state changes
      cy.wait(2000);
      
      // Log current URL
      cy.url().then(url => {
        cy.log(`Current URL after login attempt: ${url}`);
      });
      
      // Check localStorage for auth data
      cy.window().then(win => {
        cy.log('LocalStorage contents after login:');
        Object.keys(win.localStorage).forEach(key => {
          if (key === 'local_auth_session') {
            const session = JSON.parse(win.localStorage.getItem(key));
            cy.log(`${key}: User email: ${session.user.email}, User type: ${session.user.user_type}`);
          } else {
            cy.log(`${key}: ${win.localStorage.getItem(key)}`);
          }
        });
      });
      
      // Check if we're still on login page
      cy.url().then(url => {
        const isLoginPage = url.includes('/login');
        cy.log(`Still on login page: ${isLoginPage}`);
        
        if (cred.expectedRedirect && isLoginPage) {
          cy.log('ERROR: Expected redirect after login but still on login page');
        }
      });
      
      // Check for any visible error messages
      cy.get('body').then($body => {
        if ($body.find('.error, .alert, [role="alert"]').length > 0) {
          cy.log('Error message found on page:');
          cy.get('.error, .alert, [role="alert"]').then($error => {
            cy.log($error.text());
          });
        } else {
          cy.log('No error messages found on page');
        }
      });
      
      // Check console logs for errors
      cy.window().then(win => {
        const originalConsoleError = win.console.error;
        win.console.error = (...args) => {
          cy.log('Console error:', ...args);
          originalConsoleError(...args);
        };
      });
    });
  });

  it('should check form submission behavior', () => {
    // Test direct form submission
    cy.get('input[type="email"]').clear().type('admin@itsfait.com');
    cy.get('input[type="password"]').clear().type('admin123');
    
    // Intercept form submission
    cy.intercept('POST', '**/auth/v1/token*').as('authRequest');
    cy.intercept('POST', '**/auth/v1/signup*').as('signupRequest');
    cy.intercept('POST', '**/rest/v1/*').as('apiRequest');
    
    // Submit form and log details
    cy.get('form').then($form => {
      cy.log(`Form action: ${$form.attr('action')}`);
      cy.log(`Form method: ${$form.attr('method')}`);
      cy.log(`Form has onSubmit handler: ${$form.attr('onsubmit') !== undefined}`);
      
      // Submit the form
      cy.wrap($form).submit();
      cy.log('Form submitted directly');
    });
    
    // Check for network requests
    cy.wait(3000).then(() => {
      cy.log('Checking for network requests after form submission');
    });
    
    // Log current URL after submission
    cy.url().then(url => {
      cy.log(`URL after direct form submission: ${url}`);
    });
  });

  it('should test click on submit button', () => {
    // Enter credentials
    cy.get('input[type="email"]').clear().type('admin@itsfait.com');
    cy.get('input[type="password"]').clear().type('admin123');
    
    // Find and click the submit button
    cy.get('form').find('button[type="submit"]').then($btn => {
      cy.log(`Clicking submit button with text: "${$btn.text()}"`);
      cy.wrap($btn).click();
    });
    
    cy.wait(2000);
    
    // Log current URL after clicking submit
    cy.url().then(url => {
      cy.log(`URL after clicking submit button: ${url}`);
    });
  });

  it('should test login with data-cy attributes', () => {
    // Try using data-cy attributes if they exist
    cy.get('[data-cy="login-email"]').then($el => {
      if ($el.length) {
        cy.wrap($el).clear().type('admin@itsfait.com');
        cy.log('Used data-cy="login-email" to enter email');
      } else {
        cy.log('data-cy="login-email" not found');
      }
    });
    
    cy.get('[data-cy="login-password"]').then($el => {
      if ($el.length) {
        cy.wrap($el).clear().type('admin123');
        cy.log('Used data-cy="login-password" to enter password');
      } else {
        cy.log('data-cy="login-password" not found');
      }
    });
    
    cy.get('[data-cy="login-submit"]').then($el => {
      if ($el.length) {
        cy.wrap($el).click();
        cy.log('Used data-cy="login-submit" to click submit');
      } else {
        cy.log('data-cy="login-submit" not found');
      }
    });
    
    cy.wait(2000);
    
    // Log current URL after submission
    cy.url().then(url => {
      cy.log(`URL after data-cy submission: ${url}`);
    });
  });
});
