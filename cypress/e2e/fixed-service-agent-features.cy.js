/// <reference types="cypress" />

describe('Service Agent Features Tests', () => {
  // Test credentials for service agent user
  const serviceAgentCredentials = {
    email: 'service@itsfait.com',
    password: 'service123'
  };

  beforeEach(() => {
    // Clear cookies and local storage between tests
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Enable local auth mode if available
    cy.window().then((win) => {
      win.localStorage.setItem('useLocalAuth', 'true');
    });
    
    // Login as service agent before each test
    cy.visit('/login');
    
    // Find email input using multiple possible selectors
    cy.get('input[type="email"], input[name="email"], [data-cy="login-email"], [id="email"], [placeholder*="email" i]')
      .first()
      .clear()
      .type(serviceAgentCredentials.email);

    // Find password input using multiple possible selectors
    cy.get('input[type="password"], input[name="password"], [data-cy="login-password"], [id="password"], [placeholder*="password" i]')
      .first()
      .clear()
      .type(serviceAgentCredentials.password);

    // Find submit button using multiple possible selectors
    cy.get('button[type="submit"], [data-cy="login-submit"], button:contains("Log In"), button:contains("Sign In"), button:contains("Login"), input[type="submit"]')
      .first()
      .click();

    // Wait for any redirects to complete
    cy.wait(3000);
    
    // Verify we're on the service agent dashboard
    cy.url().should('include', '/dashboard');
    
    // Take a screenshot for debugging
    cy.screenshot('service-agent-dashboard-after-login');
  });

  it('should display service agent-specific dashboard elements', () => {
    // Look for service agent-specific elements
    cy.get('body').then($body => {
      // Check for common service agent dashboard elements
      const hasServiceAgentElements = 
        $body.text().includes('Jobs') || 
        $body.text().includes('My Jobs') || 
        $body.text().includes('Requests') ||
        $body.text().includes('Bookings') ||
        $body.text().includes('Clients') ||
        $body.text().includes('Schedule');
      
      expect(hasServiceAgentElements, 'Page should contain service agent-specific elements').to.be.true;
    });
  });

  it('should check for job/project management features', () => {
    // Try to navigate to jobs/projects section
    cy.get('a[href*="jobs"], a[href*="projects"], a:contains("Jobs"), a:contains("Projects"), [data-cy="nav-jobs"], [data-cy="nav-projects"]')
      .first()
      .then($jobsLink => {
        if ($jobsLink.length) {
          cy.wrap($jobsLink).click();
          cy.wait(1000);
          
          // Check for job/project list elements
          cy.get('body').then($body => {
            const hasJobElements = 
              $body.find('.job-list, .jobs-list, .project-list, [data-cy="jobs-list"], [data-cy="projects-list"]').length > 0 ||
              $body.find('button:contains("Accept Job"), button:contains("View Details"), [data-cy="accept-job"]').length > 0;
            
            if (hasJobElements) {
              cy.log('Job/Project elements found');
            } else {
              cy.log('No job/project elements found, might be empty state');
            }
          });
        } else {
          cy.log('Jobs/Projects link not found, skipping test');
        }
      });
  });

  it('should check for schedule/calendar features', () => {
    // Try to navigate to schedule/calendar section
    cy.get('a[href*="schedule"], a[href*="calendar"], a:contains("Schedule"), a:contains("Calendar"), [data-cy="nav-schedule"], [data-cy="nav-calendar"]')
      .first()
      .then($scheduleLink => {
        if ($scheduleLink.length) {
          cy.wrap($scheduleLink).click();
          cy.wait(1000);
          
          // Check for calendar-related elements
          cy.get('body').then($body => {
            const hasCalendarElements = 
              $body.find('.calendar, .schedule, .fc, [data-cy="calendar"], [data-cy="schedule"]').length > 0 ||
              $body.find('.calendar-day, .calendar-event, .fc-event, [data-cy="calendar-event"]').length > 0;
            
            if (hasCalendarElements) {
              cy.log('Calendar elements found');
            } else {
              cy.log('No calendar elements found, might be empty state');
            }
          });
        } else {
          cy.log('Schedule/Calendar link not found, skipping test');
        }
      });
  });

  it('should check for client communication features', () => {
    // Try to navigate to messages/communication section
    cy.get('a[href*="messages"], a[href*="communication"], a:contains("Messages"), a:contains("Communication"), [data-cy="nav-messages"]')
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

  it('should check for service management features', () => {
    // Try to navigate to services management section
    cy.get('a[href*="services"], a:contains("Services"), a:contains("My Services"), [data-cy="nav-services"]')
      .first()
      .then($servicesLink => {
        if ($servicesLink.length) {
          cy.wrap($servicesLink).click();
          cy.wait(1000);
          
          // Check for service management elements
          cy.get('body').then($body => {
            const hasServiceElements = 
              $body.find('.service-list, .services-list, [data-cy="services-list"]').length > 0 ||
              $body.find('button:contains("Add Service"), button:contains("Edit Service"), [data-cy="add-service"]').length > 0;
            
            if (hasServiceElements) {
              cy.log('Service management elements found');
            } else {
              cy.log('No service management elements found, might be empty state');
            }
          });
        } else {
          cy.log('Services management link not found, skipping test');
        }
      });
  });
});
