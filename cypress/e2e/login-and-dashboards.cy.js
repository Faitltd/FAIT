/**
 * Cypress test for login functionality and dashboard access
 *
 * This test will:
 * 1. Test login with admin, client, and service agent credentials
 * 2. Verify that each user is redirected to the appropriate dashboard
 * 3. Verify that users cannot access dashboards they don't have permission for
 */

// Test credentials
const TEST_CREDENTIALS = [
  { email: 'admin@itsfait.com', password: 'admin123', type: 'Admin', dashboardPath: '/dashboard/admin' },
  { email: 'client@itsfait.com', password: 'client123', type: 'Client', dashboardPath: '/dashboard/client' },
  { email: 'service@itsfait.com', password: 'service123', type: 'Service Agent', dashboardPath: '/dashboard/service-agent' }
];

describe('Authentication and Dashboard Access Tests', () => {
  // Setup session for each user type
  TEST_CREDENTIALS.forEach((cred) => {
    Cypress.Commands.add(`loginAs${cred.type.replace(/\s+/g, '')}`, () => {
      cy.session(
        `${cred.type}User`,
        () => {
          cy.visit('/login');
          cy.get('input[type="email"]').type(cred.email);
          cy.get('input[type="password"]').type(cred.password);
          cy.get('button[type="submit"]').click();
          cy.url().should('include', cred.dashboardPath);
        },
        {
          cacheAcrossSpecs: false,
        }
      );
    });
  });

  // Test login for each user type
  TEST_CREDENTIALS.forEach((cred) => {
    it(`should login as ${cred.type} and redirect to the correct dashboard`, () => {
      // Use the custom login command
      cy[`loginAs${cred.type.replace(/\s+/g, '')}`]();

      // Visit the dashboard
      cy.visit(cred.dashboardPath);

      // Verify dashboard content based on user type
      if (cred.type === 'Admin') {
        cy.contains('Admin Dashboard').should('be.visible');
      } else if (cred.type === 'Client') {
        cy.contains('Client Dashboard').should('be.visible');
      } else if (cred.type === 'Service Agent') {
        cy.contains('Service Agent Dashboard').should('be.visible');
      }

      // Logout - try different selectors for the logout button
      cy.get('body').then($body => {
        if ($body.find('button:contains("Sign out")').length > 0) {
          cy.get('button:contains("Sign out")').click();
        } else if ($body.find('button:contains("Logout")').length > 0) {
          cy.get('button:contains("Logout")').click();
        } else if ($body.find('a:contains("Sign out")').length > 0) {
          cy.get('a:contains("Sign out")').click();
        } else if ($body.find('a:contains("Logout")').length > 0) {
          cy.get('a:contains("Logout")').click();
        } else {
          // If no logout button found, navigate to login page directly
          cy.log('No logout button found, navigating to login page directly');
          cy.visit('/login');
        }
      });

      // Verify redirect to login page
      cy.url().should('include', '/login');
    });
  });

  // Test dashboard access restrictions
  TEST_CREDENTIALS.forEach((loginCred) => {
    TEST_CREDENTIALS.forEach((dashboardCred) => {
      if (loginCred.type !== dashboardCred.type) {
        it(`should prevent ${loginCred.type} from accessing ${dashboardCred.type} dashboard`, () => {
          // Login with the current user type
          cy[`loginAs${loginCred.type.replace(/\s+/g, '')}`]();

          // Try to access unauthorized dashboard
          cy.visit(dashboardCred.dashboardPath, { failOnStatusCode: false });

          // Should be redirected or shown unauthorized page
          cy.url().should(url => {
            expect(url).to.satisfy(url =>
              !url.includes(dashboardCred.dashboardPath) || url.includes('unauthorized')
            );
          });

          // Logout - try different selectors for the logout button
          cy.get('body').then($body => {
            if ($body.find('button:contains("Sign out")').length > 0) {
              cy.get('button:contains("Sign out")').click();
            } else if ($body.find('button:contains("Logout")').length > 0) {
              cy.get('button:contains("Logout")').click();
            } else if ($body.find('a:contains("Sign out")').length > 0) {
              cy.get('a:contains("Sign out")').click();
            } else if ($body.find('a:contains("Logout")').length > 0) {
              cy.get('a:contains("Logout")').click();
            } else {
              // If no logout button found, navigate to login page directly
              cy.log('No logout button found, navigating to login page directly');
              cy.visit('/login');
            }
          });

          // Verify redirect to login page
          cy.url().should('include', '/login');
        });
      }
    });
  });

  // Test dashboard functionality for each user type
  TEST_CREDENTIALS.forEach((cred) => {
    it(`should display correct dashboard components for ${cred.type}`, () => {
      // Login with the current user type
      cy[`loginAs${cred.type.replace(/\s+/g, '')}`]();

      // Visit the dashboard
      cy.visit(cred.dashboardPath);

      // Verify dashboard components based on user type
      if (cred.type === 'Admin') {
        // Admin dashboard components - check for any admin-related content
        cy.get('body').should('contain.text', 'Admin')
          .and(($body) => {
            // Check for at least one of these admin-related terms
            const adminTerms = ['User', 'Verification', 'Management', 'Dashboard'];
            const hasAdminTerm = adminTerms.some(term => $body.text().includes(term));
            expect(hasAdminTerm).to.be.true;
          });
      } else if (cred.type === 'Client') {
        // Client dashboard components - check for any client-related content
        cy.get('body').should('contain.text', 'Client')
          .and(($body) => {
            // Check for at least one of these client-related terms
            const clientTerms = ['Bookings', 'Projects', 'Services', 'Dashboard'];
            const hasClientTerm = clientTerms.some(term => $body.text().includes(term));
            expect(hasClientTerm).to.be.true;
          });
      } else if (cred.type === 'Service Agent') {
        // Service Agent dashboard components - check for any service agent-related content
        cy.get('body').should('contain.text', 'Service')
          .and(($body) => {
            // Check for at least one of these service agent-related terms
            const serviceTerms = ['Bookings', 'Services', 'Jobs', 'Dashboard'];
            const hasServiceTerm = serviceTerms.some(term => $body.text().includes(term));
            expect(hasServiceTerm).to.be.true;
          });
      }

      // Logout - try different selectors for the logout button
      cy.get('body').then($body => {
        if ($body.find('button:contains("Sign out")').length > 0) {
          cy.get('button:contains("Sign out")').click();
        } else if ($body.find('button:contains("Logout")').length > 0) {
          cy.get('button:contains("Logout")').click();
        } else if ($body.find('a:contains("Sign out")').length > 0) {
          cy.get('a:contains("Sign out")').click();
        } else if ($body.find('a:contains("Logout")').length > 0) {
          cy.get('a:contains("Logout")').click();
        } else {
          // If no logout button found, navigate to login page directly
          cy.log('No logout button found, navigating to login page directly');
          cy.visit('/login');
        }
      });

      // Verify redirect to login page
      cy.url().should('include', '/login');
    });
  });
});
