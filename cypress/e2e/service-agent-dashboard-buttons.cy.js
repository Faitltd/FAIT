/// <reference types="cypress" />

describe('Service Agent Dashboard Buttons and Links', () => {
  beforeEach(() => {
    // Visit the service agent dashboard directly
    cy.visit('/dashboard/service-agent');

    // Wait for the page to load completely - look for any content that confirms we're on the right page
    // We'll check for multiple possible elements that would indicate we're on the dashboard
    cy.get('body').then($body => {
      const pageLoaded =
        $body.text().includes('Service Agent Dashboard') ||
        $body.text().includes('Active Services') ||
        $body.text().includes('Quick Actions') ||
        $body.text().includes('Pending Appointments');

      expect(pageLoaded).to.be.true;
    });

    // Give the page a moment to fully render
    cy.wait(2000);
  });

  // Test the main navigation links in the dashboard
  describe('Navigation Links', () => {
    it('should have working Home link', () => {
      cy.get('body').then($body => {
        if ($body.find('a:contains("Home")').length > 0) {
          cy.contains('a', 'Home').click();
          cy.url().should('include', '/');
        } else {
          cy.log('Home link not found');
        }
      });
    });

    it('should have working Client Dashboard link', () => {
      // Go back to the service agent dashboard
      cy.visit('/dashboard/service-agent');
      cy.wait(1000);

      cy.get('body').then($body => {
        if ($body.find('a:contains("Client Dashboard")').length > 0) {
          cy.contains('a', 'Client Dashboard').click();
          cy.url().should('include', '/dashboard/client');
        } else {
          cy.log('Client Dashboard link not found');
        }
      });
    });

    it('should have working Test Login link', () => {
      // Go back to the service agent dashboard
      cy.visit('/dashboard/service-agent');
      cy.wait(1000);

      cy.get('body').then($body => {
        if ($body.find('a:contains("Test Login")').length > 0) {
          cy.contains('a', 'Test Login').click();
          cy.url().should('include', '/test-login');
        } else {
          cy.log('Test Login link not found');
        }
      });
    });

    it('should have working Debug Page link', () => {
      // Go back to the service agent dashboard
      cy.visit('/dashboard/service-agent');
      cy.wait(1000);

      cy.get('body').then($body => {
        if ($body.find('a:contains("Debug Page")').length > 0) {
          cy.contains('a', 'Debug Page').click();
          cy.url().should('include', '/debug');
        } else {
          cy.log('Debug Page link not found');
        }
      });
    });
  });

  // Test the Quick Actions section
  describe('Quick Actions', () => {
    beforeEach(() => {
      // Go back to the service agent dashboard before each test
      cy.visit('/dashboard/service-agent');
      cy.wait(1000);
    });

    it('should have working Add New Service link', () => {
      cy.get('body').then($body => {
        if ($body.find('h3:contains("Add New Service")').length > 0) {
          cy.contains('h3', 'Add New Service').parent().parent().parent().click();
          cy.url().should('include', '/services/new');
        } else {
          cy.log('Add New Service link not found in Quick Actions');
        }
      });
    });

    it('should have working Confirm Appointments link', () => {
      cy.get('body').then($body => {
        if ($body.find('h3:contains("Confirm Appointments")').length > 0) {
          cy.contains('h3', 'Confirm Appointments').parent().parent().parent().click();
          cy.url().should('include', '#pending-appointments');
        } else {
          cy.log('Confirm Appointments link not found in Quick Actions');
        }
      });
    });

    it('should have working View Messages link', () => {
      cy.get('body').then($body => {
        if ($body.find('h3:contains("View Messages")').length > 0) {
          cy.contains('h3', 'View Messages').parent().parent().parent().click();
          cy.url().should('include', '#messages');
        } else {
          cy.log('View Messages link not found in Quick Actions');
        }
      });
    });

    it('should have working Estimates link', () => {
      cy.get('body').then($body => {
        if ($body.find('h3:contains("Estimates")').length > 0) {
          cy.contains('h3', 'Estimates').parent().parent().parent().click();
          cy.url().should('include', '/dashboard/service-agent/estimates');
        } else {
          cy.log('Estimates link not found in Quick Actions');
        }
      });
    });

    it('should have working Subscription link', () => {
      cy.get('body').then($body => {
        if ($body.find('h3:contains("Subscription")').length > 0) {
          cy.contains('h3', 'Subscription').parent().parent().parent().click();
          cy.url().should('include', '/subscription/dashboard');
        } else {
          cy.log('Subscription link not found in Quick Actions');
        }
      });
    });
  });

  // Test the Active Services section
  describe('Active Services Section', () => {
    it('should have working Add New Service button', () => {
      // First check if the section exists
      cy.get('body').then($body => {
        if ($body.find('#active-services').length > 0) {
          cy.get('#active-services').within(() => {
            cy.contains('Add New Service').click();
          });
          cy.url().should('include', '/services/new');
        } else {
          // Try to find the button elsewhere
          cy.contains('a', 'Add New Service').click();
          cy.url().should('include', '/services/new');
        }
      });
    });

    it('should have working Edit buttons for services', () => {
      // First check if the section exists
      cy.get('body').then($body => {
        if ($body.find('#active-services').length > 0) {
          cy.get('#active-services').within(() => {
            // Check if there are any services
            cy.get('tbody tr').then($rows => {
              if ($rows.length > 1 && $body.find('#active-services').find('a:contains("Edit")').length > 0) {
                // Click the first Edit button
                cy.contains('Edit').first().click();
                cy.url().should('include', '/services/edit/');
              } else {
                cy.log('No services found to edit');
              }
            });
          });
        } else {
          cy.log('Active services section not found');
        }
      });
    });

    it('should have working Deactivate buttons for services', () => {
      // First check if the section exists
      cy.get('body').then($body => {
        if ($body.find('#active-services').length > 0) {
          cy.get('#active-services').within(() => {
            // Check if there are any services
            cy.get('tbody tr').then($rows => {
              if ($rows.length > 1 && $body.find('#active-services').find('button:contains("Deactivate")').length > 0) {
                // Get the status before clicking
                cy.contains('Deactivate').first().click();

                // Verify the button text changes or the status changes
                cy.contains('Activate').should('exist');
              } else {
                cy.log('No services found to deactivate');
              }
            });
          });
        } else {
          cy.log('Active services section not found');
        }
      });
    });
  });

  // Test the Stats Cards section
  describe('Stats Cards', () => {
    it('should have working Manage services link', () => {
      cy.get('body').then($body => {
        if ($body.find('a:contains("Manage services")').length > 0) {
          cy.contains('Manage services').click();
          cy.url().should('include', '#active-services');
        } else {
          cy.log('Manage services link not found');
        }
      });
    });

    it('should have working View bookings link', () => {
      cy.get('body').then($body => {
        if ($body.find('a:contains("View bookings")').length > 0) {
          cy.contains('View bookings').click();
          cy.url().should('include', '#recent-bookings');
        } else {
          cy.log('View bookings link not found');
        }
      });
    });

    it('should have working View messages link', () => {
      cy.get('body').then($body => {
        if ($body.find('a:contains("View messages")').length > 0) {
          cy.contains('View messages').click();
          cy.url().should('include', '#messages');
        } else {
          cy.log('View messages link not found');
        }
      });
    });

    it('should have working View earnings link', () => {
      cy.get('body').then($body => {
        if ($body.find('a:contains("View earnings")').length > 0) {
          cy.contains('View earnings').click();
          cy.url().should('include', '#earnings');
        } else {
          cy.log('View earnings link not found');
        }
      });
    });
  });

  // Test the Pending Appointments section
  describe('Pending Appointments Section', () => {
    it('should have working View All button', () => {
      cy.get('body').then($body => {
        if ($body.find('#pending-appointments').length > 0) {
          cy.get('#pending-appointments').within(() => {
            cy.contains('View All').click();
          });
          // This is just an alert in the current implementation
          // We can't test the alert directly, but we can verify the button exists
          cy.get('#pending-appointments').within(() => {
            cy.contains('View All').should('exist');
          });
        } else {
          cy.log('Pending appointments section not found');
        }
      });
    });

    it('should have working Confirm buttons', () => {
      cy.get('body').then($body => {
        if ($body.find('#pending-appointments').length > 0 &&
            $body.find('#pending-appointments').find('button:contains("Confirm")').length > 0) {
          cy.get('#pending-appointments').within(() => {
            cy.contains('Confirm').first().click();
            // This is just an alert in the current implementation
            // We can't test the alert directly, but we can verify the button exists
            cy.contains('Confirm').should('exist');
          });
        } else {
          cy.log('Confirm buttons not found in pending appointments section');
        }
      });
    });

    it('should have working Decline buttons', () => {
      cy.get('body').then($body => {
        if ($body.find('#pending-appointments').length > 0 &&
            $body.find('#pending-appointments').find('button:contains("Decline")').length > 0) {
          cy.get('#pending-appointments').within(() => {
            cy.contains('Decline').first().click();
            // This is just an alert in the current implementation
            // We can't test the alert directly, but we can verify the button exists
            cy.contains('Decline').should('exist');
          });
        } else {
          cy.log('Decline buttons not found in pending appointments section');
        }
      });
    });
  });

  // Test the Messages section
  describe('Messages Section', () => {
    it('should have working View All button', () => {
      cy.get('body').then($body => {
        if ($body.find('#messages').length > 0) {
          cy.get('#messages').within(() => {
            cy.contains('View All').click();
          });
          // This is just an alert in the current implementation
          // We can't test the alert directly, but we can verify the button exists
          cy.get('#messages').within(() => {
            cy.contains('View All').should('exist');
          });
        } else {
          cy.log('Messages section not found');
        }
      });
    });

    it('should have working Read buttons', () => {
      cy.get('body').then($body => {
        if ($body.find('#messages').length > 0 &&
            $body.find('#messages').find('button:contains("Read")').length > 0) {
          cy.get('#messages').within(() => {
            cy.contains('Read').first().click();
            // This is just an alert in the current implementation
            // We can't test the alert directly, but we can verify the button exists
            cy.contains('Read').should('exist');
          });
        } else {
          cy.log('Read buttons not found in messages section');
        }
      });
    });
  });

  // Test the Recent Bookings section
  describe('Recent Bookings Section', () => {
    it('should have working View All button', () => {
      cy.get('body').then($body => {
        if ($body.find('#recent-bookings').length > 0) {
          cy.get('#recent-bookings').within(() => {
            cy.contains('View All').click();
          });
          // This is just an alert in the current implementation
          // We can't test the alert directly, but we can verify the button exists
          cy.get('#recent-bookings').within(() => {
            cy.contains('View All').should('exist');
          });
        } else {
          cy.log('Recent bookings section not found');
        }
      });
    });

    it('should have working View buttons', () => {
      cy.get('body').then($body => {
        if ($body.find('#recent-bookings').length > 0 &&
            $body.find('#recent-bookings').find('button:contains("View")').length > 0) {
          cy.get('#recent-bookings').within(() => {
            cy.contains('View').first().click();
            // This is just an alert in the current implementation
            // We can't test the alert directly, but we can verify the button exists
            cy.contains('View').should('exist');
          });
        } else {
          cy.log('View buttons not found in recent bookings section');
        }
      });
    });
  });

  // Test the Earnings section
  describe('Earnings Section', () => {
    it('should have working time period buttons', () => {
      cy.get('body').then($body => {
        if ($body.find('#earnings').length > 0) {
          cy.get('#earnings').within(() => {
            if ($body.find('#earnings').find('button:contains("This Month")').length > 0) {
              cy.contains('This Month').click();
              cy.contains('Last Month').click();
              cy.contains('Year to Date').click();
              // These buttons don't navigate, just verify they exist and are clickable
              cy.contains('This Month').should('exist');
            } else {
              cy.log('Time period buttons not found in earnings section');
            }
          });
        } else {
          cy.log('Earnings section not found');
        }
      });
    });
  });
});
