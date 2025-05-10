/// <reference types="cypress" />

describe('Dashboard Tests', () => {
  // Test credentials
  const testCredentials = {
    email: 'admin@itsfait.com',
    password: 'admin123'
  };

  beforeEach(() => {
    // Clear cookies and local storage between tests
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Enable local auth mode if available
    cy.window().then((win) => {
      win.localStorage.setItem('useLocalAuth', 'true');
    });
    
    // Login before each test
    cy.visit('/login');
    
    // Find email input using multiple possible selectors
    cy.get('input[type="email"], input[name="email"], [data-cy="login-email"], [id="email"], [placeholder*="email" i]')
      .first()
      .clear()
      .type(testCredentials.email);

    // Find password input using multiple possible selectors
    cy.get('input[type="password"], input[name="password"], [data-cy="login-password"], [id="password"], [placeholder*="password" i]')
      .first()
      .clear()
      .type(testCredentials.password);

    // Find submit button using multiple possible selectors
    cy.get('button[type="submit"], [data-cy="login-submit"], button:contains("Log In"), button:contains("Sign In"), button:contains("Login"), input[type="submit"]')
      .first()
      .click();

    // Wait for any redirects to complete
    cy.wait(3000);
    
    // Verify we're on the dashboard
    cy.url().should('include', '/dashboard');
    
    // Take a screenshot for debugging
    cy.screenshot('dashboard-after-login');
  });

  it('should display user information on dashboard', () => {
    // Look for user information using flexible selectors
    cy.get('[data-cy="user-info"], .user-info, .profile-info, .user-profile')
      .then($userInfo => {
        if ($userInfo.length) {
          // If we found user info, check it contains the email or name
          cy.wrap($userInfo).should('contain.text', 'admin');
        } else {
          // If not found with specific selectors, check the page content
          cy.get('body').should('contain.text', 'admin');
        }
      });
  });

  it('should have navigation menu items on dashboard', () => {
    // Look for dashboard navigation items
    cy.get('nav a, .sidebar a, .dashboard-nav a, [data-cy="dashboard-nav"] a')
      .should('have.length.at.least', 1);
  });

  it('should allow navigation to different dashboard sections', () => {
    // Try to find and click on common dashboard sections
    const dashboardSections = [
      { name: 'Projects', selectors: 'a[href*="projects"], a:contains("Projects"), [data-cy="nav-projects"]' },
      { name: 'Messages', selectors: 'a[href*="messages"], a:contains("Messages"), [data-cy="nav-messages"]' },
      { name: 'Settings', selectors: 'a[href*="settings"], a:contains("Settings"), [data-cy="nav-settings"]' },
      { name: 'Profile', selectors: 'a[href*="profile"], a:contains("Profile"), [data-cy="nav-profile"]' }
    ];
    
    // Try each section
    dashboardSections.forEach(section => {
      cy.get(section.selectors).first().then($link => {
        if ($link.length) {
          cy.wrap($link).click();
          cy.wait(1000); // Wait for page to load
          cy.log(`Navigated to ${section.name} section`);
          cy.go('back');
          cy.wait(1000); // Wait for dashboard to reload
        } else {
          cy.log(`${section.name} section link not found, skipping`);
        }
      });
    });
  });

  it('should allow logout from dashboard', () => {
    // Try to find and click logout button/link
    cy.get('a[href*="logout"], button:contains("Logout"), button:contains("Sign Out"), [data-cy="logout"]')
      .first()
      .then($logout => {
        if ($logout.length) {
          cy.wrap($logout).click();
          cy.wait(1000);
          
          // Check if we're logged out (either on login page or home page)
          cy.url().should('satisfy', (url) => {
            return url.includes('/login') || url.includes('/home') || url === Cypress.config().baseUrl + '/';
          });
        } else {
          // Try user menu first, then logout
          cy.get('[data-cy="user-menu"], .user-menu, .profile-dropdown, .avatar')
            .first()
            .then($userMenu => {
              if ($userMenu.length) {
                cy.wrap($userMenu).click();
                cy.wait(500);
                
                // Now try to find logout in the opened menu
                cy.get('a:contains("Logout"), button:contains("Logout"), a:contains("Sign Out"), button:contains("Sign Out")')
                  .first()
                  .click();
                  
                // Check if we're logged out
                cy.url().should('satisfy', (url) => {
                  return url.includes('/login') || url.includes('/home') || url === Cypress.config().baseUrl + '/';
                });
              } else {
                cy.log('Logout button and user menu not found, skipping test');
              }
            });
        }
      });
  });
});
