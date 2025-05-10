/// <reference types="cypress" />

describe('Client User Journey', () => {
  // Test variables
  const testUser = {
    email: `test-client-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'Client',
    phone: '555-123-4567'
  };

  beforeEach(() => {
    // Use cy.session to preserve login state between tests
    // This will only be used after the user has logged in
    if (Cypress.env('userLoggedIn')) {
      cy.session('loggedInUser', () => {
        // Session is already established, no need to log in again
      });
    }
  });

  it('should allow a new client to sign up', () => {
    cy.visit('/signup');
    cy.get('[data-cy=user-type-client]').click();
    cy.get('[data-cy=signup-email]').type(testUser.email);
    cy.get('[data-cy=signup-password]').type(testUser.password);
    cy.get('[data-cy=signup-confirm-password]').type(testUser.password);
    cy.get('[data-cy=signup-submit]').click();

    // Should redirect to onboarding
    cy.url().should('include', '/onboarding/client');
    cy.contains('Welcome to FAIT Co-op').should('be.visible');
  });

  it('should complete the client onboarding process', () => {
    // Assuming we're on the onboarding page from previous test
    cy.url().should('include', '/onboarding/client');

    // Step 1: Personal Information
    cy.get('[data-cy=onboarding-first-name]').type(testUser.firstName);
    cy.get('[data-cy=onboarding-last-name]').type(testUser.lastName);
    cy.get('[data-cy=onboarding-phone]').type(testUser.phone);
    cy.get('[data-cy=onboarding-next]').click();

    // Step 2: Location
    cy.get('[data-cy=onboarding-address]').type('123 Main St');
    cy.get('[data-cy=onboarding-city]').type('Denver');
    cy.get('[data-cy=onboarding-state]').select('Colorado');
    cy.get('[data-cy=onboarding-zip]').type('80202');
    cy.get('[data-cy=onboarding-next]').click();

    // Step 3: Preferences
    cy.get('[data-cy=preference-renovation]').click();
    cy.get('[data-cy=preference-plumbing]').click();
    cy.get('[data-cy=preference-electrical]').click();
    cy.get('[data-cy=onboarding-next]').click();

    // Step 4: Notification preferences
    cy.get('[data-cy=notifications-email]').check();
    cy.get('[data-cy=notifications-sms]').check();
    cy.get('[data-cy=onboarding-complete]').click();

    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome, Test').should('be.visible');
  });

  it('should navigate the client dashboard', () => {
    cy.visit('/dashboard');

    // Check dashboard elements
    cy.get('[data-cy=dashboard-projects]').should('be.visible');
    cy.get('[data-cy=dashboard-messages]').should('be.visible');
    cy.get('[data-cy=dashboard-bookings]').should('be.visible');

    // Check navigation
    cy.get('[data-cy=nav-projects]').click();
    cy.url().should('include', '/projects');

    cy.get('[data-cy=nav-service-providers]').click();
    cy.url().should('include', '/service-providers');

    cy.get('[data-cy=nav-messages]').click();
    cy.url().should('include', '/messages');

    cy.get('[data-cy=nav-profile]').click();
    cy.url().should('include', '/profile');
  });

  it('should create a new project', () => {
    cy.visit('/projects');
    cy.get('[data-cy=create-project]').click();

    // Fill out project details
    cy.get('[data-cy=project-title]').type('Kitchen Renovation');
    cy.get('[data-cy=project-description]').type('Complete kitchen renovation including new cabinets, countertops, and appliances.');
    cy.get('[data-cy=project-budget]').type('25000');
    cy.get('[data-cy=project-timeline]').select('3-6 months');
    cy.get('[data-cy=project-category]').select('Renovation');

    // Add project location
    cy.get('[data-cy=project-address]').type('123 Main St');
    cy.get('[data-cy=project-city]').type('Denver');
    cy.get('[data-cy=project-state]').select('Colorado');
    cy.get('[data-cy=project-zip]').type('80202');

    // Submit project
    cy.get('[data-cy=project-submit]').click();

    // Should redirect to project details
    cy.url().should('include', '/projects/');
    cy.contains('Kitchen Renovation').should('be.visible');
    cy.contains('Project created successfully').should('be.visible');
  });

  it('should search for service providers', () => {
    cy.visit('/service-providers');

    // Search for providers
    cy.get('[data-cy=search-input]').type('plumber');
    cy.get('[data-cy=search-button]').click();

    // Filter results
    cy.get('[data-cy=filter-verified]').check();
    cy.get('[data-cy=filter-rating]').select('4+');
    cy.get('[data-cy=filter-distance]').select('Within 10 miles');
    cy.get('[data-cy=apply-filters]').click();

    // Results should update
    cy.get('[data-cy=service-provider-card]').should('have.length.at.least', 1);

    // View a service provider profile
    cy.get('[data-cy=service-provider-card]').first().click();
    cy.url().should('include', '/service-providers/');

    // Provider details should be visible
    cy.get('[data-cy=provider-name]').should('be.visible');
    cy.get('[data-cy=provider-services]').should('be.visible');
    cy.get('[data-cy=provider-rating]').should('be.visible');
    cy.get('[data-cy=provider-verification-badge]').should('be.visible');
  });

  it('should request a quote from a service provider', () => {
    // Assuming we're on a service provider profile page
    cy.url().should('include', '/service-providers/');

    // Request a quote
    cy.get('[data-cy=request-quote]').click();

    // Select project
    cy.get('[data-cy=select-project]').select('Kitchen Renovation');

    // Add details
    cy.get('[data-cy=quote-details]').type('I need help with installing new cabinets and countertops.');
    cy.get('[data-cy=quote-timeline]').select('Within 2 months');
    cy.get('[data-cy=quote-budget]').select('$10,000 - $20,000');

    // Submit request
    cy.get('[data-cy=submit-quote-request]').click();

    // Confirmation message
    cy.contains('Quote request sent successfully').should('be.visible');
  });

  it('should book a service appointment', () => {
    cy.visit('/dashboard');
    cy.get('[data-cy=dashboard-bookings]').click();
    cy.get('[data-cy=create-booking]').click();

    // Select service provider
    cy.get('[data-cy=select-provider]').click();
    cy.get('[data-cy=provider-list]').contains('Plumbing Pro').click();

    // Select service
    cy.get('[data-cy=select-service]').select('Plumbing Inspection');

    // Select date and time
    cy.get('[data-cy=booking-date]').type('2023-12-15');
    cy.get('[data-cy=booking-time]').select('10:00 AM');

    // Add booking details
    cy.get('[data-cy=booking-details]').type('Need a comprehensive plumbing inspection for my kitchen renovation project.');
    cy.get('[data-cy=booking-address]').should('have.value', '123 Main St'); // Should be pre-filled

    // Submit booking
    cy.get('[data-cy=submit-booking]').click();

    // Confirmation
    cy.contains('Booking confirmed').should('be.visible');
    cy.url().should('include', '/bookings/');
  });

  it('should view and respond to an estimate', () => {
    cy.visit('/dashboard');
    cy.get('[data-cy=notification-badge]').should('be.visible');
    cy.get('[data-cy=notifications]').click();

    // Find and click on estimate notification
    cy.contains('New estimate received').click();

    // View estimate details
    cy.url().should('include', '/estimates/');
    cy.get('[data-cy=estimate-details]').should('be.visible');
    cy.get('[data-cy=estimate-amount]').should('be.visible');
    cy.get('[data-cy=estimate-timeline]').should('be.visible');
    cy.get('[data-cy=estimate-scope]').should('be.visible');

    // Accept estimate
    cy.get('[data-cy=accept-estimate]').click();
    cy.get('[data-cy=confirm-accept]').click();

    // Confirmation
    cy.contains('Estimate accepted').should('be.visible');
  });

  it('should manage a project in progress', () => {
    cy.visit('/projects');
    cy.contains('Kitchen Renovation').click();

    // Project should be in progress
    cy.get('[data-cy=project-status]').should('contain', 'In Progress');

    // Check project timeline
    cy.get('[data-cy=project-timeline]').should('be.visible');

    // Add a project note
    cy.get('[data-cy=add-note]').click();
    cy.get('[data-cy=note-content]').type('Discussed cabinet options with contractor today.');
    cy.get('[data-cy=save-note]').click();

    // Note should be visible
    cy.contains('Discussed cabinet options').should('be.visible');

    // Upload a document
    cy.get('[data-cy=upload-document]').click();
    cy.get('[data-cy=document-title]').type('Cabinet Design');
    cy.get('[data-cy=document-file]').attachFile('test-document.pdf');
    cy.get('[data-cy=upload-submit]').click();

    // Document should be in the list
    cy.contains('Cabinet Design').should('be.visible');
  });

  it('should communicate with service provider', () => {
    cy.visit('/messages');

    // Open conversation with service provider
    cy.get('[data-cy=conversation-list]').contains('Plumbing Pro').click();

    // Send a message
    cy.get('[data-cy=message-input]').type('Hi, when will you be starting the cabinet installation?');
    cy.get('[data-cy=send-message]').click();

    // Message should appear in the chat
    cy.get('[data-cy=message-list]').contains('Hi, when will you be starting the cabinet installation?').should('be.visible');

    // Simulate receiving a response (this would normally come from the backend)
    cy.window().then(win => {
      win.dispatchEvent(new CustomEvent('test:new-message', {
        detail: {
          sender: 'Plumbing Pro',
          content: 'I plan to start next Monday. Does that work for you?',
          timestamp: new Date().toISOString()
        }
      }));
    });

    // Response should appear
    cy.get('[data-cy=message-list]').contains('I plan to start next Monday').should('be.visible');

    // Reply to the message
    cy.get('[data-cy=message-input]').type('Yes, Monday works great. Thank you!');
    cy.get('[data-cy=send-message]').click();

    // Reply should appear
    cy.get('[data-cy=message-list]').contains('Yes, Monday works great').should('be.visible');
  });

  it('should leave a review for completed work', () => {
    // Simulate a completed project
    cy.visit('/projects');
    cy.contains('Kitchen Renovation').click();

    // Mark project as complete (this would normally be done by the service provider)
    cy.window().then(win => {
      win.dispatchEvent(new CustomEvent('test:complete-project', {
        detail: { projectId: '123' }
      }));
    });

    // Refresh to see changes
    cy.reload();

    // Project should be marked as complete
    cy.get('[data-cy=project-status]').should('contain', 'Completed');

    // Leave a review
    cy.get('[data-cy=leave-review]').click();

    // Fill out review
    cy.get('[data-cy=review-rating]').eq(4).click(); // 5-star rating
    cy.get('[data-cy=review-title]').type('Excellent work on my kitchen');
    cy.get('[data-cy=review-content]').type('The team did an amazing job on my kitchen renovation. They were professional, on time, and the quality of work exceeded my expectations.');
    cy.get('[data-cy=review-submit]').click();

    // Confirmation
    cy.contains('Review submitted successfully').should('be.visible');

    // Review should be visible on the project
    cy.get('[data-cy=project-reviews]').contains('Excellent work on my kitchen').should('be.visible');
  });

  it('should update profile settings', () => {
    cy.visit('/profile');

    // Before trying to click edit profile
    cy.screenshot('before-edit-profile');

    // Update personal information
    cy.contains('button, a', /edit profile|edit|profile/i, { timeout: 15000 }).click({ force: true });
    cy.get('[data-cy=profile-phone]').clear().type('555-987-6543');
    cy.get('[data-cy=profile-bio]').type('Homeowner interested in sustainable home improvements.');
    cy.get('[data-cy=save-profile]').click();

    // Confirmation
    cy.contains('Profile updated successfully').should('be.visible');

    // Update notification preferences
    cy.get('[data-cy=notification-settings]').click();
    cy.get('[data-cy=notify-messages]').check();
    cy.get('[data-cy=notify-estimates]').check();
    cy.get('[data-cy=notify-project-updates]').check();
    cy.get('[data-cy=notify-promotions]').uncheck();
    cy.get('[data-cy=save-notifications]').click();

    // Confirmation
    cy.contains('Notification preferences updated').should('be.visible');

    // Update password
    cy.get('[data-cy=security-settings]').click();
    cy.get('[data-cy=current-password]').type(testUser.password);
    cy.get('[data-cy=new-password]').type('NewPassword456!');
    cy.get('[data-cy=confirm-password]').type('NewPassword456!');
    cy.get('[data-cy=update-password]').click();

    // Confirmation
    cy.contains('Password updated successfully').should('be.visible');

    // Update testUser password for future tests
    testUser.password = 'NewPassword456!';
  });

  it('should log out and log back in', () => {
    // Before trying to click user menu
    cy.screenshot('before-user-menu');

    // Log out
    cy.get('header').find('button').last().click({ force: true });
    cy.get('[data-cy=logout]').click();

    // Should redirect to login page
    cy.url().should('include', '/login');

    // Log back in with updated credentials
    cy.get('[data-cy=login-email]').type(testUser.email);
    cy.get('[data-cy=login-password]').type(testUser.password);
    cy.get('[data-cy=login-submit]').click();

    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
    cy.contains(`Welcome, ${testUser.firstName}`).should('be.visible');
  });

  // Add a proper test for opening the user menu if needed
  it('should open user menu', () => {
    cy.get('[data-cy=user-menu]').click();
    // Add assertions here
  });
});
