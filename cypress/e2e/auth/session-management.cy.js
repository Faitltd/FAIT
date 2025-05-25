/// <reference types="cypress" />

describe('Session Management', () => {
  beforeEach(() => {
    // Set local auth mode to false to enable session management testing
    cy.window().then((win) => {
      win.localStorage.setItem('useLocalAuth', 'false');
    });

    // Mock successful login
    cy.intercept('POST', '**/auth/v1/token*', {
      statusCode: 200,
      body: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        expires_at: Date.now() + 3600 * 1000, // 1 hour from now
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

    // Navigate to dashboard
    cy.url().should('include', '/dashboard');
  });

  it('should maintain session after page refresh', () => {
    // Mock profile fetch again for the refresh
    cy.intercept('GET', '**/rest/v1/profiles*', {
      statusCode: 200,
      body: {
        id: 'mock-user-id',
        user_type: 'client',
        full_name: 'Test User',
        email: 'test@example.com',
        created_at: new Date().toISOString()
      }
    }).as('profileFetchRefresh');

    // Refresh the page
    cy.reload();

    // Wait for profile fetch
    cy.wait('@profileFetchRefresh');

    // Verify we're still on the dashboard (still logged in)
    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard').should('be.visible');
  });

  it('should show session expiry warning when session is about to expire', () => {
    // Mock session with near expiry
    cy.window().then((win) => {
      // Get the current session
      const sessionStr = win.localStorage.getItem('supabase.auth.token');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);

        // Update expiry to 4 minutes from now (to trigger 5-minute warning)
        session.expires_at = Date.now() + 4 * 60 * 1000;

        // Save modified session
        win.localStorage.setItem('supabase.auth.token', JSON.stringify(session));
      }

      // Force session check
      win.dispatchEvent(new Event('storage'));
    });

    // Check for session expiry warning
    cy.contains('Session Expiring Soon', { timeout: 10000 }).should('be.visible');
    cy.contains('Your session will expire in').should('be.visible');
    cy.contains('button', 'Stay Logged In').should('be.visible');
    cy.contains('button', 'Log Out').should('be.visible');
  });

  it('should refresh session when clicking "Stay Logged In"', () => {
    // Mock session refresh response
    cy.intercept('POST', '**/auth/v1/token?grant_type=refresh_token*', {
      statusCode: 200,
      body: {
        access_token: 'mock-access-token-refreshed',
        refresh_token: 'mock-refresh-token-refreshed',
        expires_in: 3600,
        expires_at: Date.now() + 3600 * 1000, // 1 hour from now
        user: {
          id: 'mock-user-id',
          email: 'test@example.com',
          user_metadata: {
            full_name: 'Test User'
          }
        }
      }
    }).as('sessionRefresh');

    // Mock session with near expiry
    cy.window().then((win) => {
      // Get the current session
      const sessionStr = win.localStorage.getItem('supabase.auth.token');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);

        // Update expiry to 4 minutes from now (to trigger 5-minute warning)
        session.expires_at = Date.now() + 4 * 60 * 1000;

        // Save modified session
        win.localStorage.setItem('supabase.auth.token', JSON.stringify(session));
      }

      // Force session check
      win.dispatchEvent(new Event('storage'));
    });

    // Wait for session expiry warning
    cy.contains('Session Expiring Soon', { timeout: 10000 }).should('be.visible');

    // Click "Stay Logged In"
    cy.contains('button', 'Stay Logged In').click();

    // Wait for session refresh request
    cy.wait('@sessionRefresh');

    // Verify warning is dismissed
    cy.contains('Session Expiring Soon').should('not.exist');

    // Verify session was updated
    cy.window().then((win) => {
      const sessionStr = win.localStorage.getItem('supabase.auth.token');
      expect(sessionStr).to.include('mock-access-token-refreshed');
    });
  });

  it('should log out when clicking "Log Out" in session expiry warning', () => {
    // Mock logout response
    cy.intercept('POST', '**/auth/v1/logout*', {
      statusCode: 200,
      body: {}
    }).as('logoutRequest');

    // Mock session with near expiry
    cy.window().then((win) => {
      // Get the current session
      const sessionStr = win.localStorage.getItem('supabase.auth.token');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);

        // Update expiry to 4 minutes from now (to trigger 5-minute warning)
        session.expires_at = Date.now() + 4 * 60 * 1000;

        // Save modified session
        win.localStorage.setItem('supabase.auth.token', JSON.stringify(session));
      }

      // Force session check
      win.dispatchEvent(new Event('storage'));
    });

    // Wait for session expiry warning
    cy.contains('Session Expiring Soon', { timeout: 10000 }).should('be.visible');

    // Click "Log Out"
    cy.contains('button', 'Log Out').click();

    // Wait for logout request
    cy.wait('@logoutRequest');

    // Verify redirect to login page
    cy.url().should('include', '/login');
  });

  it('should automatically refresh session before expiry', () => {
    // Mock session refresh response
    cy.intercept('POST', '**/auth/v1/token?grant_type=refresh_token*', {
      statusCode: 200,
      body: {
        access_token: 'mock-access-token-auto-refreshed',
        refresh_token: 'mock-refresh-token-auto-refreshed',
        expires_in: 3600,
        expires_at: Date.now() + 3600 * 1000, // 1 hour from now
        user: {
          id: 'mock-user-id',
          email: 'test@example.com',
          user_metadata: {
            full_name: 'Test User'
          }
        }
      }
    }).as('sessionRefresh');

    // Mock session with expiry just within auto-refresh window
    cy.window().then((win) => {
      // Get the current session
      const sessionStr = win.localStorage.getItem('supabase.auth.token');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);

        // Update expiry to 9 minutes from now (to trigger 10-minute auto-refresh)
        session.expires_at = Date.now() + 9 * 60 * 1000;

        // Save modified session
        win.localStorage.setItem('supabase.auth.token', JSON.stringify(session));
      }

      // Force session check
      win.dispatchEvent(new Event('storage'));
    });

    // Wait for auto-refresh request
    cy.wait('@sessionRefresh', { timeout: 10000 });

    // Verify session was updated
    cy.window().then((win) => {
      const sessionStr = win.localStorage.getItem('supabase.auth.token');
      expect(sessionStr).to.include('mock-access-token-auto-refreshed');
    });
  });

  it('should redirect to login when session has expired', () => {
    // Mock logout response for expired session
    cy.intercept('POST', '**/auth/v1/logout*', {
      statusCode: 200,
      body: {}
    }).as('logoutRequest');

    // Mock session with expired token
    cy.window().then((win) => {
      // Get the current session
      const sessionStr = win.localStorage.getItem('supabase.auth.token');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);

        // Update expiry to 1 minute ago
        session.expires_at = Date.now() - 60 * 1000;

        // Save modified session
        win.localStorage.setItem('supabase.auth.token', JSON.stringify(session));
      }

      // Force session check
      win.dispatchEvent(new Event('storage'));
    });

    // Verify redirect to login page
    cy.url().should('include', '/login', { timeout: 10000 });
  });

  it('should respect the 24-hour maximum session duration', () => {
    // Mock session refresh response
    cy.intercept('POST', '**/auth/v1/token?grant_type=refresh_token*', {
      statusCode: 200,
      body: {
        access_token: 'mock-access-token-refreshed',
        refresh_token: 'mock-refresh-token-refreshed',
        expires_in: 3600,
        expires_at: Date.now() + 3600 * 1000, // 1 hour from now
        user: {
          id: 'mock-user-id',
          email: 'test@example.com',
          user_metadata: {
            full_name: 'Test User'
          }
        }
      }
    }).as('sessionRefresh');

    // Mock session with creation time more than 24 hours ago
    cy.window().then((win) => {
      // Get the current session
      const sessionStr = win.localStorage.getItem('supabase.auth.token');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);

        // Set created_at to 25 hours ago
        const createdAt = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
        session.created_at = createdAt;

        // Save modified session
        win.localStorage.setItem('supabase.auth.token', JSON.stringify(session));
      }

      // Force session check
      win.dispatchEvent(new Event('storage'));
    });

    // Verify redirect to login page due to maximum session duration
    cy.url().should('include', '/login', { timeout: 10000 });
  });
});
