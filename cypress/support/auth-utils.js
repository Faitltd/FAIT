// Authentication utilities and custom commands
const AUTH_TIMEOUT = 15000;
const DASHBOARD_LOAD_TIMEOUT = 20000;

const userTypes = {
  admin: {
    email: 'admin@itsfait.com',
    password: 'admin123',
    dashboardUrl: '/dashboard/admin',
    selectors: {
      menu: '[data-cy=admin-menu]',
      dashboard: '[data-cy=admin-dashboard]'
    }
  },
  client: {
    email: 'client@itsfait.com',
    password: 'client123',
    dashboardUrl: '/dashboard/client',
    selectors: {
      menu: '[data-cy=client-menu]',
      dashboard: '[data-cy=dashboard-projects]'
    }
  },
  serviceAgent: {
    email: 'service@itsfait.com',
    password: 'service123',
    dashboardUrl: '/dashboard/service-agent',
    selectors: {
      menu: '[data-cy=agent-menu]',
      dashboard: '[data-cy=service-dashboard]'
    }
  }
};

// Verify authentication state
const verifyAuthState = () => {
  return cy.window().then(win => {
    const hasAuthToken = Object.keys(win.localStorage).some(key => 
      key.includes('auth') || key.includes('token') || key.includes('session')
    );
    expect(hasAuthToken, 'Auth token should exist').to.be.true;
    
    // Verify Supabase session
    const supabaseSession = win.localStorage.getItem('sb-session');
    expect(supabaseSession, 'Supabase session should exist').to.exist;
  });
};

// Verify dashboard state
const verifyDashboardState = (userType) => {
  const user = userTypes[userType];
  
  // Wait for URL change
  cy.url().should('not.include', '/login', { timeout: AUTH_TIMEOUT });
  
  // Verify dashboard-specific elements
  cy.get(user.selectors.menu, { timeout: DASHBOARD_LOAD_TIMEOUT })
    .should('exist')
    .should('be.visible');
    
  cy.get(user.selectors.dashboard, { timeout: DASHBOARD_LOAD_TIMEOUT })
    .should('exist')
    .should('be.visible');
};

// Export utilities
export { userTypes, verifyAuthState, verifyDashboardState };