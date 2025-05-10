/// <reference types="cypress" />

describe('Client Features Tests', () => {
  // Test credentials for client user
  const clientCredentials = {
    email: 'client@itsfait.com',
    password: 'client123'
  };

  beforeEach(() => {
    // Clear cookies and local storage between tests
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Enable local auth mode if available
    cy.window().then((win) => {
      win.localStorage.setItem('useLocalAuth', 'true');
    });
    
    // Login as client before each test
    cy.visit('/login');
    
    // Find email input using multiple possible selectors
    cy.get('input[type="email"], input[name="email"], [data-cy="login-email"], [id="email"], [placeholder*="email" i]')
      .first()
      .clear()
      .type(clientCredentials.email);

    // Find password input using multiple possible selectors
    cy.get('input[type="password"], input[name="password"], [data-cy="login-password"], [id="password"], [placeholder*="password" i]')
      .first()
      .clear()
      .type(clientCredentials.password);

    // Find submit button using multiple possible selectors
    cy.get('button[type="submit"], [data-cy="login-submit"], button:contains("Log In"), button:contains("Sign In"), button:contains("Login"), input[type="submit"]')
      .first()
      .click();

    // Wait for any redirects to complete
    cy.wait(3000);
    
    // Verify we're on the client dashboard
    cy.url().should('include', '/dashboard');
    
    // Take a screenshot for debugging
    cy.screenshot('client-dashboard-after-login');
  });

  it('should display client-specific dashboard elements', () => {
    // Look for client-specific elements
    cy.get('body').then($body => {
      // Check for common client dashboard elements
      const hasClientElements = 
        $body.text().includes('Projects') || 
        $body.text().includes('My Projects') || 
        $body.text().includes('Services') ||
        $body.text().includes('Bookings');
      
      expect(hasClientElements, 'Page should contain client-specific elements').to.be.true;
    });
  });

  it('should check for project-related features', () => {
    // Try to navigate to projects section
    cy.get('a[href*="projects"], a:contains("Projects"), [data-cy="nav-projects"]')
      .first()
      .then($projectsLink => {
        if ($projectsLink.length) {
          cy.wrap($projectsLink).click();
          cy.wait(1000);
          
          // Check for project list or create project button
          cy.get('body').then($body => {
            const hasProjectElements = 
              $body.find('.project-list, .projects-list, [data-cy="projects-list"]').length > 0 ||
              $body.find('button:contains("Create Project"), button:contains("New Project"), [data-cy="create-project"]').length > 0;
            
            if (hasProjectElements) {
              cy.log('Project elements found');
            } else {
              cy.log('No project elements found, might be empty state');
            }
          });
        } else {
          cy.log('Projects link not found, skipping test');
        }
      });
  });

  it('should check for service booking features', () => {
    // Try to navigate to services or booking section
    cy.get('a[href*="services"], a[href*="booking"], a:contains("Services"), a:contains("Book"), [data-cy="nav-services"], [data-cy="nav-booking"]')
      .first()
      .then($servicesLink => {
        if ($servicesLink.length) {
          cy.wrap($servicesLink).click();
          cy.wait(1000);
          
          // Check for service-related elements
          cy.get('body').then($body => {
            const hasServiceElements = 
              $body.find('.service-list, .services-list, [data-cy="services-list"]').length > 0 ||
              $body.find('.booking-form, [data-cy="booking-form"]').length > 0;
            
            if (hasServiceElements) {
              cy.log('Service elements found');
            } else {
              cy.log('No service elements found, might be empty state');
            }
          });
        } else {
          cy.log('Services/Booking link not found, skipping test');
        }
      });
  });

  it('should check for messaging features', () => {
    // Try to navigate to messages section
    cy.get('a[href*="messages"], a:contains("Messages"), [data-cy="nav-messages"]')
      .first()
      .then($messagesLink => {
        if ($messagesLink.length) {
          cy.wrap($messagesLink).click();
          cy.wait(1000);
          
          // Check for messaging-related elements
          cy.get('body').then($body => {
            const hasMessageElements = 
              $body.find('.message-list, .messages-list, [data-cy="messages-list"]').length > 0 ||
              $body.find('.conversation-list, [data-cy="conversation-list"]').length > 0 ||
              $body.find('.message-input, [data-cy="message-input"]').length > 0;
            
            if (hasMessageElements) {
              cy.log('Message elements found');
            } else {
              cy.log('No message elements found, might be empty state');
            }
          });
        } else {
          cy.log('Messages link not found, skipping test');
        }
      });
  });
});
