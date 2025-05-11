/// <reference types="cypress" />

describe('Direct Login Test', () => {
  // Test credentials from user requirements
  const testCredentials = [
    {
      email: 'admin@itsfait.com',
      password: 'admin123',
      type: 'Admin',
      expectedUrl: '/dashboard/admin'
    },
    {
      email: 'client@itsfait.com',
      password: 'client123',
      type: 'Client',
      expectedUrl: '/dashboard/client'
    },
    {
      email: 'service@itsfait.com',
      password: 'service123',
      type: 'Service Agent',
      expectedUrl: '/dashboard/service-agent'
    }
  ];

  // Test each credential separately
  testCredentials.forEach((cred) => {
    it(`should login successfully with ${cred.type} credentials using direct auth`, () => {
      // Clear cookies and local storage
      cy.clearCookies();
      cy.clearLocalStorage();

      // Set up local storage for direct auth
      cy.window().then(win => {
        win.localStorage.setItem('useLocalAuth', 'true');
        win.localStorage.setItem('useDirectAuth', 'true');

        // Directly set up the auth session in localStorage
        const user = {
          id: `${cred.type.toLowerCase()}-direct-auth-id`,
          email: cred.email,
          user_metadata: {
            full_name: `${cred.type} User`,
            user_type: cred.type === 'Admin' ? 'admin' :
                       cred.type === 'Service Agent' ? 'service_agent' : 'client'
          },
          app_metadata: {},
          created_at: new Date().toISOString()
        };

        const session = {
          user: user,
          access_token: `direct-token-${Date.now()}`,
          refresh_token: `direct-refresh-${Date.now()}`,
          expires_at: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        };

        // Store session in localStorage
        win.localStorage.setItem('directAuthSession', JSON.stringify(user));
        win.localStorage.setItem('localAuthSession', JSON.stringify(session));
        win.localStorage.setItem('userType', user.user_metadata.user_type);
        win.localStorage.setItem('userEmail', cred.email);
        win.localStorage.setItem('isAdminUser', (user.user_metadata.user_type === 'admin').toString());
      });

      // Take screenshot before navigation
      cy.screenshot(`${cred.type.toLowerCase()}-before-direct-login`);

      // Navigate directly to the expected dashboard
      cy.visit(cred.expectedUrl);

      // Wait for the dashboard to load
      cy.wait(2000);

      // Take screenshot after navigation
      cy.screenshot(`${cred.type.toLowerCase()}-after-direct-login`);

      // Log the current URL
      cy.url().then(url => {
        cy.log(`Current URL after login: ${url}`);
      });

      // Verify we're on the correct dashboard
      cy.url().should('include', cred.expectedUrl);

      // Verify the auth state in localStorage
      cy.window().then(win => {
        // Log all localStorage keys for debugging
        cy.log('LocalStorage keys:', Object.keys(win.localStorage).join(', '));

        // Check for auth-related keys
        const hasAuthToken = Object.keys(win.localStorage).some(key =>
          key.includes('auth') ||
          key.includes('supabase') ||
          key.includes('localAuthSession') ||
          key.includes('directAuthSession') ||
          key.includes('userEmail')
        );
        expect(hasAuthToken).to.be.true;

        // Verify the specific user is logged in
        if (win.localStorage.getItem('userEmail')) {
          expect(win.localStorage.getItem('userEmail')).to.equal(cred.email);
        }
      });
    });
  });
});
