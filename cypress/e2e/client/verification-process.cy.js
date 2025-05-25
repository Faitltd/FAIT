/// <reference types="cypress" />

describe('Client Verification Process', () => {
  const testUser = {
    email: `test-verified-client-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Verified',
    lastName: 'Client',
    phone: '555-123-4567'
  };

  beforeEach(() => {
    // Use cy.session to preserve login state between tests
    if (Cypress.env('userLoggedIn')) {
      cy.session('loggedInUser', () => {
        // Session is already established, no need to log in again
      });
    }
  });

  it('should allow a client to sign up', () => {
    cy.visit('/signup');
    cy.get('[data-cy=user-type-client]').click();
    cy.get('[data-cy=signup-email]').type(testUser.email);
    cy.get('[data-cy=signup-password]').type(testUser.password);
    cy.get('[data-cy=signup-confirm-password]').type(testUser.password);
    cy.get('[data-cy=signup-submit]').click();

    // Complete basic onboarding
    cy.url().should('include', '/onboarding/client');
    cy.get('[data-cy=onboarding-first-name]').type(testUser.firstName);
    cy.get('[data-cy=onboarding-last-name]').type(testUser.lastName);
    cy.get('[data-cy=onboarding-phone]').type(testUser.phone);
    cy.get('[data-cy=onboarding-next]').click();

    // Location
    cy.get('[data-cy=onboarding-address]').type('123 Main St');
    cy.get('[data-cy=onboarding-city]').type('Denver');
    cy.get('[data-cy=onboarding-state]').select('Colorado');
    cy.get('[data-cy=onboarding-zip]').type('80202');
    cy.get('[data-cy=onboarding-next]').click();

    // Preferences
    cy.get('[data-cy=preference-renovation]').click();
    cy.get('[data-cy=onboarding-next]').click();

    // Notifications
    cy.get('[data-cy=notifications-email]').check();
    cy.get('[data-cy=onboarding-complete]').click();

    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
  });

  it('should navigate to the verification page', () => {
    cy.visit('/dashboard');
    cy.get('[data-cy=user-menu]').click();
    cy.get('[data-cy=verification-link]').click();

    // Should be on verification page
    cy.url().should('include', '/verification');
    cy.contains('Identity Verification').should('be.visible');
  });

  it('should start the identity verification process', () => {
    cy.visit('/verification');
    cy.get('[data-cy=start-verification]').click();

    // Should see verification steps
    cy.contains('Verification Steps').should('be.visible');
    cy.get('[data-cy=verification-steps]').should('be.visible');
    cy.get('[data-cy=continue-verification]').click();
  });

  it('should upload identity document', () => {
    // Upload ID document
    cy.get('[data-cy=upload-id]').should('be.visible');
    cy.get('[data-cy=id-type]').select('Driver License');
    cy.get('[data-cy=id-number]').type('DL12345678');
    cy.get('[data-cy=id-expiration]').type('2025-12-31');
    cy.get('[data-cy=id-file]').attachFile('test-id.jpg');
    cy.get('[data-cy=upload-id-submit]').click();

    // Confirmation
    cy.contains('ID document uploaded successfully').should('be.visible');
    cy.get('[data-cy=continue-verification]').click();
  });

  it('should complete address verification', () => {
    // Address verification
    cy.get('[data-cy=verify-address]').should('be.visible');

    // Upload proof of address
    cy.get('[data-cy=address-document-type]').select('Utility Bill');
    cy.get('[data-cy=address-file]').attachFile('test-utility-bill.pdf');
    cy.get('[data-cy=upload-address-submit]').click();

    // Confirmation
    cy.contains('Address document uploaded successfully').should('be.visible');
    cy.get('[data-cy=continue-verification]').click();
  });

  it('should complete phone verification', () => {
    // Phone verification
    cy.get('[data-cy=verify-phone]').should('be.visible');

    // Request verification code
    cy.get('[data-cy=request-code]').click();

    // Enter verification code (simulated)
    cy.window().then(win => {
      // Simulate receiving a verification code
      const verificationCode = '123456';
      cy.get('[data-cy=verification-code]').type(verificationCode);
    });

    cy.get('[data-cy=verify-code]').click();

    // Confirmation
    cy.contains('Phone verified successfully').should('be.visible');
    cy.get('[data-cy=continue-verification]').click();
  });

  it('should submit verification for review', () => {
    // Review and submit
    cy.get('[data-cy=verification-review]').should('be.visible');

    // Check that all steps are marked as complete
    cy.get('[data-cy=id-verification-status]').should('contain', 'Complete');
    cy.get('[data-cy=address-verification-status]').should('contain', 'Complete');
    cy.get('[data-cy=phone-verification-status]').should('contain', 'Complete');

    // Submit for review
    cy.get('[data-cy=submit-verification]').click();

    // Confirmation
    cy.contains('Verification submitted for review').should('be.visible');
    cy.url().should('include', '/verification/status');
  });

  it('should display verification status', () => {
    cy.visit('/verification/status');

    // Status should be pending
    cy.get('[data-cy=verification-status]').should('contain', 'Pending');
    cy.get('[data-cy=verification-message]').should('contain', 'Your verification is being reviewed');

    // Simulate verification approval (this would normally be done by an admin)
    cy.window().then(win => {
      win.dispatchEvent(new CustomEvent('test:approve-verification', {
        detail: { userId: '123' }
      }));
    });

    // Refresh to see changes
    cy.reload();

    // Status should now be approved
    cy.get('[data-cy=verification-status]').should('contain', 'Approved');
    cy.get('[data-cy=verification-badge]').should('be.visible');
    cy.get('[data-cy=verification-date]').should('be.visible');
    cy.get('[data-cy=verification-expiry]').should('be.visible');
  });

  it('should display verification badge on profile', () => {
    cy.visit('/profile');

    // Verification badge should be visible
    cy.get('[data-cy=profile-verification-badge]').should('be.visible');
    cy.get('[data-cy=verification-status]').should('contain', 'Verified');

    // Toggle verification badge visibility
    cy.get('[data-cy=toggle-badge-visibility]').click();
    cy.get('[data-cy=badge-visibility-off]').click();
    cy.get('[data-cy=save-badge-settings]').click();

    // Confirmation
    cy.contains('Badge visibility updated').should('be.visible');
  });

  it('should handle verification renewal', () => {
    // Simulate approaching expiration
    cy.window().then(win => {
      win.localStorage.setItem('verification-expiry', new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString());
    });

    cy.visit('/dashboard');

    // Should see renewal notification
    cy.get('[data-cy=verification-expiry-notice]').should('be.visible');
    cy.get('[data-cy=renew-verification]').click();

    // Should be on renewal page
    cy.url().should('include', '/verification/renew');

    // Confirm renewal
    cy.get('[data-cy=confirm-renewal]').click();

    // Should be redirected to upload documents
    cy.url().should('include', '/verification/documents');

    // Upload new ID (expired)
    cy.get('[data-cy=id-type]').select('Driver License');
    cy.get('[data-cy=id-number]').type('DL98765432');
    cy.get('[data-cy=id-expiration]').type('2027-12-31');
    cy.get('[data-cy=id-file]').attachFile('test-id-new.jpg');
    cy.get('[data-cy=upload-id-submit]').click();

    // Confirmation
    cy.contains('ID document uploaded successfully').should('be.visible');
    cy.get('[data-cy=submit-renewal]').click();

    // Confirmation
    cy.contains('Renewal submitted successfully').should('be.visible');
    cy.url().should('include', '/verification/status');
  });
});
