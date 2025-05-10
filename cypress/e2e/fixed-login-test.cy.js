/// <reference types="cypress" />

describe('Fixed Login Test', () => {
  // Test credentials from user requirements
  const testCredentials = [
    {
      email: 'admin@itsfait.com',
      password: 'admin123',
      type: 'Admin',
      expectedUrls: ['/dashboard', '/dashboard/admin', '/admin/dashboard', '/subscription/dashboard']
    },
    {
      email: 'client@itsfait.com',
      password: 'client123',
      type: 'Client',
      expectedUrls: ['/dashboard', '/dashboard/client', '/client/dashboard', '/subscription/dashboard']
    },
    {
      email: 'service@itsfait.com',
      password: 'service123',
      type: 'Service Agent',
      expectedUrls: ['/dashboard', '/dashboard/service-agent', '/service/dashboard', '/subscription/dashboard']
    }
  ];

  beforeEach(() => {
    // Clear cookies and local storage between tests
    cy.clearCookies();
    cy.clearLocalStorage();

    // Enable local auth mode if available
    cy.window().then((win) => {
      win.localStorage.setItem('useLocalAuth', 'true');
    });

    // Visit the login page before each test
    cy.visit('/login');
    
    // Take a screenshot for debugging
    cy.screenshot('login-page-before-test');
  });

  // Test each set of credentials
  testCredentials.forEach((cred) => {
    it(`should login successfully with ${cred.type} credentials`, () => {
      // Find email input using multiple possible selectors
      cy.get('input[type="email"], input[name="email"], [data-cy="login-email"], [id="email"], [placeholder*="email" i]')
        .first()
        .clear()
        .type(cred.email);

      // Find password input using multiple possible selectors
      cy.get('input[type="password"], input[name="password"], [data-cy="login-password"], [id="password"], [placeholder*="password" i]')
        .first()
        .clear()
        .type(cred.password);

      // Find submit button using multiple possible selectors
      cy.get('button[type="submit"], [data-cy="login-submit"], button:contains("Log In"), button:contains("Sign In"), button:contains("Login"), input[type="submit"]')
        .first()
        .click();

      // Wait for any redirects to complete
      cy.wait(3000);

      // Check for successful login - should redirect to one of the expected URLs
      cy.url().then(url => {
        const redirected = cred.expectedUrls.some(expectedUrl => url.includes(expectedUrl));
        if (!redirected) {
          cy.log(`Current URL: ${url}`);
          cy.log(`Expected one of: ${cred.expectedUrls.join(', ')}`);
        }
        expect(redirected, `URL should include one of: ${cred.expectedUrls.join(', ')}`).to.be.true;
      });

      // Check localStorage for auth data
      cy.window().then(win => {
        cy.log('LocalStorage contents after login:');
        Object.keys(win.localStorage).forEach(key => {
          if (key.includes('auth') || key.includes('user') || key.includes('session')) {
            cy.log(`${key}: ${win.localStorage.getItem(key)}`);
          }
        });
      });
    });
  });

  it('should show error for invalid credentials', () => {
    // Find email input using multiple possible selectors
    cy.get('input[type="email"], input[name="email"], [data-cy="login-email"], [id="email"], [placeholder*="email" i]')
      .first()
      .clear()
      .type('wrong@example.com');

    // Find password input using multiple possible selectors
    cy.get('input[type="password"], input[name="password"], [data-cy="login-password"], [id="password"], [placeholder*="password" i]')
      .first()
      .clear()
      .type('wrongpassword');

    // Find submit button using multiple possible selectors
    cy.get('button[type="submit"], [data-cy="login-submit"], button:contains("Log In"), button:contains("Sign In"), button:contains("Login"), input[type="submit"]')
      .first()
      .click();

    // Wait for error message to appear
    cy.wait(2000);

    // Check for error message with flexible matching
    cy.get('body').then($body => {
      const hasErrorMessage = 
        $body.text().toLowerCase().includes('invalid') || 
        $body.text().toLowerCase().includes('error') || 
        $body.text().toLowerCase().includes('incorrect') ||
        $body.text().toLowerCase().includes('failed');
      
      expect(hasErrorMessage, 'Page should show an error message').to.be.true;
    });
  });
});
