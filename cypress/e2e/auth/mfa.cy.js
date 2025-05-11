/// <reference types="cypress" />

describe('Multi-Factor Authentication', () => {
  beforeEach(() => {
    // Set local auth mode to false to enable MFA testing
    cy.window().then((win) => {
      win.localStorage.setItem('useLocalAuth', 'false');
    });
  });

  describe('MFA Setup', () => {
    beforeEach(() => {
      // Mock successful login
      cy.intercept('POST', '**/auth/v1/token*', {
        statusCode: 200,
        body: {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
          expires_at: Date.now() + 3600 * 1000,
          user: {
            id: 'mock-user-id',
            email: 'test@example.com',
            user_metadata: {
              full_name: 'Test User'
            }
          }
        }
      }).as('loginRequest');

      // Mock profile fetch
      cy.intercept('GET', '**/rest/v1/profiles*', {
        statusCode: 200,
        body: {
          id: 'mock-user-id',
          user_type: 'client',
          full_name: 'Test User',
          email: 'test@example.com',
          created_at: new Date().toISOString()
        }
      }).as('profileFetch');

      // Login
      cy.visit('/login');
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[type="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      cy.wait('@loginRequest');
      cy.wait('@profileFetch');

      // Navigate to MFA setup page
      cy.visit('/settings/security/mfa');
    });

    it('should display MFA setup screen', () => {
      // Mock MFA enrollment response
      cy.intercept('POST', '**/auth/v1/mfa/enroll*', {
        statusCode: 200,
        body: {
          id: 'mock-factor-id',
          type: 'totp',
          status: 'unverified',
          secret: 'MOCKTOTP123456',
          qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
        }
      }).as('mfaEnrollment');

      // Check for MFA setup elements
      cy.contains('Set Up Two-Factor Authentication').should('be.visible');
      cy.contains('Enhance your account security').should('be.visible');
      cy.contains('Download an authenticator app').should('be.visible');

      // Wait for QR code to load
      cy.wait('@mfaEnrollment');
      cy.get('img[alt="QR Code for MFA setup"]').should('be.visible');

      // Check for secret code display
      cy.contains('enter this code manually').should('be.visible');
      cy.get('code').should('contain', 'MOCKTOTP123456');
    });

    it('should verify MFA setup with valid code', () => {
      // Mock MFA enrollment response
      cy.intercept('POST', '**/auth/v1/mfa/enroll*', {
        statusCode: 200,
        body: {
          id: 'mock-factor-id',
          type: 'totp',
          status: 'unverified',
          secret: 'MOCKTOTP123456',
          qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
        }
      }).as('mfaEnrollment');

      // Mock MFA challenge response
      cy.intercept('POST', '**/auth/v1/mfa/challenge*', {
        statusCode: 200,
        body: {
          id: 'mock-challenge-id',
          factor_id: 'mock-factor-id',
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 300000).toISOString()
        }
      }).as('mfaChallenge');

      // Mock MFA verification response
      cy.intercept('POST', '**/auth/v1/mfa/verify*', {
        statusCode: 200,
        body: {
          id: 'mock-factor-id',
          type: 'totp',
          status: 'verified'
        }
      }).as('mfaVerification');

      // Wait for QR code to load
      cy.wait('@mfaEnrollment');

      // Click continue
      cy.contains('button', 'Continue').click();

      // Enter verification code
      cy.get('input#verificationCode').type('123456');

      // Submit verification
      cy.contains('button', 'Verify and Enable').click();

      // Wait for challenge and verification requests
      cy.wait('@mfaChallenge');
      cy.wait('@mfaVerification');

      // Check for success message or redirection
      cy.contains('MFA setup complete').should('be.visible');
    });

    it('should show error for invalid verification code', () => {
      // Mock MFA enrollment response
      cy.intercept('POST', '**/auth/v1/mfa/enroll*', {
        statusCode: 200,
        body: {
          id: 'mock-factor-id',
          type: 'totp',
          status: 'unverified',
          secret: 'MOCKTOTP123456',
          qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
        }
      }).as('mfaEnrollment');

      // Mock MFA challenge response
      cy.intercept('POST', '**/auth/v1/mfa/challenge*', {
        statusCode: 200,
        body: {
          id: 'mock-challenge-id',
          factor_id: 'mock-factor-id',
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 300000).toISOString()
        }
      }).as('mfaChallenge');

      // Mock MFA verification error response
      cy.intercept('POST', '**/auth/v1/mfa/verify*', {
        statusCode: 400,
        body: {
          error: 'Invalid verification code',
          error_description: 'The verification code is invalid or has expired'
        }
      }).as('mfaVerificationError');

      // Wait for QR code to load
      cy.wait('@mfaEnrollment');

      // Click continue
      cy.contains('button', 'Continue').click();

      // Enter verification code
      cy.get('input#verificationCode').type('999999');

      // Submit verification
      cy.contains('button', 'Verify and Enable').click();

      // Wait for challenge and verification requests
      cy.wait('@mfaChallenge');
      cy.wait('@mfaVerificationError');

      // Check for error message
      cy.contains('Failed to verify code').should('be.visible');
    });
  });

  describe('MFA Login', () => {
    beforeEach(() => {
      // Mock login response with MFA required
      cy.intercept('POST', '**/auth/v1/token*', {
        statusCode: 200,
        body: {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
          expires_at: Date.now() + 3600 * 1000,
          user: {
            id: 'mock-user-id',
            email: 'test@example.com',
            user_metadata: {
              full_name: 'Test User'
            }
          },
          factors: [
            {
              id: 'mock-factor-id',
              type: 'totp',
              status: 'verified'
            }
          ]
        }
      }).as('loginRequest');

      // Login
      cy.visit('/login');
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[type="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      cy.wait('@loginRequest');
    });

    it('should prompt for MFA verification during login', () => {
      // Check for MFA verification screen
      cy.contains('Two-Factor Authentication').should('be.visible');
      cy.contains('verification code from your authenticator app').should('be.visible');
    });

    it('should complete login with valid MFA code', () => {
      // Mock MFA challenge response
      cy.intercept('POST', '**/auth/v1/mfa/challenge*', {
        statusCode: 200,
        body: {
          id: 'mock-challenge-id',
          factor_id: 'mock-factor-id',
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 300000).toISOString()
        }
      }).as('mfaChallenge');

      // Mock MFA verification response
      cy.intercept('POST', '**/auth/v1/mfa/verify*', {
        statusCode: 200,
        body: {
          access_token: 'mock-access-token-2',
          refresh_token: 'mock-refresh-token-2',
          expires_in: 3600,
          expires_at: Date.now() + 3600 * 1000,
          user: {
            id: 'mock-user-id',
            email: 'test@example.com',
            user_metadata: {
              full_name: 'Test User'
            }
          }
        }
      }).as('mfaVerification');

      // Mock profile fetch
      cy.intercept('GET', '**/rest/v1/profiles*', {
        statusCode: 200,
        body: {
          id: 'mock-user-id',
          user_type: 'client',
          full_name: 'Test User',
          email: 'test@example.com',
          created_at: new Date().toISOString()
        }
      }).as('profileFetch');

      // Enter verification code
      cy.get('input#verificationCode').type('123456');

      // Submit verification
      cy.contains('button', 'Verify').click();

      // Wait for challenge and verification requests
      cy.wait('@mfaChallenge');
      cy.wait('@mfaVerification');
      cy.wait('@profileFetch');

      // Check for redirection to dashboard
      cy.url().should('include', '/dashboard', { timeout: 10000 });
    });

    it('should show error for invalid MFA code', () => {
      // Mock MFA challenge response
      cy.intercept('POST', '**/auth/v1/mfa/challenge*', {
        statusCode: 200,
        body: {
          id: 'mock-challenge-id',
          factor_id: 'mock-factor-id',
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 300000).toISOString()
        }
      }).as('mfaChallenge');

      // Mock MFA verification error response
      cy.intercept('POST', '**/auth/v1/mfa/verify*', {
        statusCode: 400,
        body: {
          error: 'Invalid verification code',
          error_description: 'The verification code is invalid or has expired'
        }
      }).as('mfaVerificationError');

      // Enter verification code
      cy.get('input#verificationCode').type('999999');

      // Submit verification
      cy.contains('button', 'Verify').click();

      // Wait for challenge and verification requests
      cy.wait('@mfaChallenge');
      cy.wait('@mfaVerificationError');

      // Check for error message
      cy.contains('Failed to verify code').should('be.visible');

      // Verify we're still on the MFA verification page
      cy.contains('Two-Factor Authentication').should('be.visible');
    });
  });
});
