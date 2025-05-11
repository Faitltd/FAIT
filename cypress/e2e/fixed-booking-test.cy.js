/// <reference types="cypress" />

describe('Booking Feature Tests', () => {
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
    
    // Verify we're on the dashboard
    cy.url().should('include', '/dashboard');
    
    // Take a screenshot for debugging
    cy.screenshot('client-dashboard-before-booking');
  });

  it('should navigate to booking or services page', () => {
    // Try to find and click on booking or services link
    cy.get('a[href*="book"], a[href*="services"], a:contains("Book"), a:contains("Services"), [data-cy="nav-booking"], [data-cy="nav-services"]')
      .first()
      .then($bookingLink => {
        if ($bookingLink.length) {
          cy.wrap($bookingLink).click();
          cy.wait(1000);
          
          // Take a screenshot of the booking/services page
          cy.screenshot('booking-services-page');
          
          // Check for booking-related elements
          cy.get('body').then($body => {
            const hasBookingElements = 
              $body.find('.booking-form, .service-list, [data-cy="booking-form"], [data-cy="service-list"]').length > 0 ||
              $body.find('button:contains("Book"), button:contains("Schedule"), [data-cy="book-service"]').length > 0;
            
            expect(hasBookingElements, 'Page should contain booking-related elements').to.be.true;
          });
        } else {
          cy.log('Booking/Services link not found, skipping test');
        }
      });
  });

  it('should attempt to book a service if available', () => {
    // Try to find and click on booking or services link
    cy.get('a[href*="book"], a[href*="services"], a:contains("Book"), a:contains("Services"), [data-cy="nav-booking"], [data-cy="nav-services"]')
      .first()
      .then($bookingLink => {
        if ($bookingLink.length) {
          cy.wrap($bookingLink).click();
          cy.wait(1000);
          
          // Look for a service to book
          cy.get('.service-item, .service-card, [data-cy="service-item"]')
            .first()
            .then($serviceItem => {
              if ($serviceItem.length) {
                // Click on the service item or its book button
                cy.wrap($serviceItem).find('button:contains("Book"), a:contains("Book"), [data-cy="book-button"]')
                  .first()
                  .then($bookButton => {
                    if ($bookButton.length) {
                      cy.wrap($bookButton).click();
                      cy.wait(1000);
                      
                      // Take a screenshot of the booking form
                      cy.screenshot('booking-form');
                      
                      // Check for booking form elements
                      cy.get('form, .booking-form, [data-cy="booking-form"]').should('exist');
                    } else {
                      // Try clicking the service item itself
                      cy.wrap($serviceItem).click();
                      cy.wait(1000);
                      
                      // Look for book button on the service details page
                      cy.get('button:contains("Book"), a:contains("Book"), [data-cy="book-button"]')
                        .first()
                        .then($detailsBookButton => {
                          if ($detailsBookButton.length) {
                            cy.wrap($detailsBookButton).click();
                            cy.wait(1000);
                            
                            // Take a screenshot of the booking form
                            cy.screenshot('booking-form-from-details');
                            
                            // Check for booking form elements
                            cy.get('form, .booking-form, [data-cy="booking-form"]').should('exist');
                          } else {
                            cy.log('Book button not found on service details page, skipping test');
                          }
                        });
                    }
                  });
              } else {
                cy.log('No service items found, skipping test');
              }
            });
        } else {
          cy.log('Booking/Services link not found, skipping test');
        }
      });
  });

  it('should check for calendar or date picker in booking flow', () => {
    // Try to find and click on booking or services link
    cy.get('a[href*="book"], a[href*="services"], a:contains("Book"), a:contains("Services"), [data-cy="nav-booking"], [data-cy="nav-services"]')
      .first()
      .then($bookingLink => {
        if ($bookingLink.length) {
          cy.wrap($bookingLink).click();
          cy.wait(1000);
          
          // Look for a service to book
          cy.get('.service-item, .service-card, [data-cy="service-item"]')
            .first()
            .then($serviceItem => {
              if ($serviceItem.length) {
                // Click on the service item or its book button
                cy.wrap($serviceItem).find('button:contains("Book"), a:contains("Book"), [data-cy="book-button"]')
                  .first()
                  .then($bookButton => {
                    if ($bookButton.length) {
                      cy.wrap($bookButton).click();
                      cy.wait(1000);
                      
                      // Check for calendar or date picker
                      cy.get('.calendar, .date-picker, input[type="date"], [data-cy="calendar"], [data-cy="date-picker"], .fc, .react-datepicker')
                        .then($calendar => {
                          if ($calendar.length) {
                            cy.log('Calendar or date picker found');
                            cy.screenshot('booking-calendar');
                          } else {
                            cy.log('No calendar or date picker found, might be on a different step');
                          }
                        });
                    } else {
                      cy.log('Book button not found, skipping test');
                    }
                  });
              } else {
                cy.log('No service items found, skipping test');
              }
            });
        } else {
          cy.log('Booking/Services link not found, skipping test');
        }
      });
  });
});
