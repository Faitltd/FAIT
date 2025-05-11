/// <reference types="cypress" />

describe('OAuth Authentication', () => {
  beforeEach(() => {
    // Set local auth mode to false to enable OAuth testing
    cy.window().then((win) => {
      win.localStorage.setItem('useLocalAuth', 'false');
    });

    // Visit login page
    cy.visit('/login');
  });

  it('should display OAuth login buttons', () => {
    // Check that the login form is visible
    cy.get('form').should('be.visible');

    // Check for the "Or continue with" text
    cy.contains('Or continue with').should('be.visible');

    // Check that OAuth buttons are visible
    cy.get('button').contains('Google').should('be.visible');
    cy.get('button').contains('Facebook').should('be.visible');
  });

  it('should initiate Google OAuth flow when clicking Google button', () => {
    // Intercept the OAuth redirect
    cy.intercept('POST', '**/auth/v1/authorize*', (req) => {
      // Mock a successful response
      req.reply({
        statusCode: 200,
        body: {
          url: 'https://accounts.google.com/o/oauth2/auth?client_id=mock-client-id&redirect_uri=http://localhost:5173/oauth-callback&response_type=code&scope=email+profile&state=mock-state'
        }
      });
    }).as('googleOAuth');

    // Click the Google sign-in button
    cy.get('button').contains('Google').click();

    // Wait for the OAuth request
    cy.wait('@googleOAuth');
  });

  it('should initiate Facebook OAuth flow when clicking Facebook button', () => {
    // Intercept the OAuth redirect
    cy.intercept('POST', '**/auth/v1/authorize*', (req) => {
      // Mock a successful response
      req.reply({
        statusCode: 200,
        body: {
          url: 'https://www.facebook.com/v9.0/dialog/oauth?client_id=mock-client-id&redirect_uri=http://localhost:5173/oauth-callback&response_type=code&scope=email,public_profile&state=mock-state'
        }
      });
    }).as('facebookOAuth');

    // Click the Facebook sign-in button
    cy.get('button').contains('Facebook').click();

    // Wait for the OAuth request
    cy.wait('@facebookOAuth');
  });

  it('should handle OAuth callback and set session', () => {
    // Mock the profile fetch
    cy.intercept('GET', '**/rest/v1/profiles*', {
      statusCode: 200,
      body: {
        id: 'mock-user-id',
        user_type: 'client',
        full_name: 'OAuth Test User',
        email: 'oauth-user@example.com',
        created_at: new Date().toISOString()
      }
    }).as('profileFetch');

    // Mock the OAuth callback
    cy.intercept('POST', '**/auth/v1/token*', {
      statusCode: 200,
      body: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        user: {
          id: 'mock-user-id',
          email: 'oauth-user@example.com',
          user_metadata: {
            full_name: 'OAuth Test User',
            avatar_url: 'https://example.com/avatar.jpg',
            provider: 'google'
          }
        }
      }
    }).as('tokenExchange');

    // Visit the OAuth callback URL with mock parameters
    cy.visit('/oauth-callback#access_token=mock-access-token&refresh_token=mock-refresh-token&expires_in=3600&provider=google&type=oauth');

    // Wait for loading to complete
    cy.contains('Completing sign in').should('be.visible');

    // Wait for profile fetch
    cy.wait('@profileFetch');

    // Check that we're redirected to dashboard after successful OAuth login
    cy.url().should('include', '/dashboard', { timeout: 10000 });

    // Verify that the session is stored
    cy.window().then((win) => {
      const session = win.localStorage.getItem('supabase.auth.token');
      expect(session).to.not.be.null;
    });
  });

  it('should handle new OAuth user and create profile', () => {
    // Mock profile not found error
    cy.intercept('GET', '**/rest/v1/profiles*', {
      statusCode: 406,
      body: {
        code: 'PGRST116',
        message: 'No results found'
      }
    }).as('profileNotFound');

    // Mock profile creation
    cy.intercept('POST', '**/rest/v1/profiles*', {
      statusCode: 201,
      body: {
        id: 'mock-user-id',
        user_type: 'client',
        full_name: 'New OAuth User',
        email: 'new-oauth-user@example.com',
        created_at: new Date().toISOString()
      }
    }).as('profileCreate');

    // Mock the OAuth callback
    cy.intercept('POST', '**/auth/v1/token*', {
      statusCode: 200,
      body: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        user: {
          id: 'mock-user-id',
          email: 'new-oauth-user@example.com',
          user_metadata: {
            full_name: 'New OAuth User',
            avatar_url: 'https://example.com/avatar.jpg',
            provider: 'google'
          }
        }
      }
    }).as('tokenExchange');

    // Visit the OAuth callback URL with mock parameters
    cy.visit('/oauth-callback#access_token=mock-access-token&refresh_token=mock-refresh-token&expires_in=3600&provider=google&type=oauth');

    // Wait for loading to complete
    cy.contains('Completing sign in').should('be.visible');

    // Wait for profile not found
    cy.wait('@profileNotFound');

    // Wait for profile creation
    cy.wait('@profileCreate');

    // Check that we're redirected to complete profile page
    cy.url().should('include', '/complete-profile', { timeout: 10000 });
  });

  it('should handle OAuth errors gracefully', () => {
    // Visit the OAuth callback URL with error parameters
    cy.visit('/oauth-callback#error=access_denied&error_description=The+user+denied+the+request');

    // Check for error message
    cy.contains('Authentication Error').should('be.visible');
    cy.contains('Return to Login').should('be.visible');

    // Click return to login
    cy.contains('Return to Login').click();

    // Check that we're redirected to login page
    cy.url().should('include', '/login');
  });
});
