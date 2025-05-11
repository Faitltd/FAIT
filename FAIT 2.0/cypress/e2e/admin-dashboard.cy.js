describe('Admin Dashboard', () => {
  beforeEach(() => {
    // Mock admin user authentication
    cy.intercept('POST', '**/auth/v1/token?grant_type=password', {
      fixture: 'auth/admin_login_success.json',
    }).as('loginAdmin');

    // Mock platform stats
    cy.intercept('GET', '**/rest/v1/admin/stats', {
      fixture: 'admin/platform_stats.json',
    }).as('getPlatformStats');

    // Mock recent activity
    cy.intercept('GET', '**/rest/v1/admin/activity', {
      fixture: 'admin/recent_activity.json',
    }).as('getRecentActivity');

    // Login as admin and navigate to admin dashboard
    cy.visit('/login');
    cy.get('input[name="email"]').type('admin@example.com');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginAdmin');
    
    cy.visit('/admin');
    cy.wait('@getPlatformStats');
    cy.wait('@getRecentActivity');
  });

  it('should display the admin dashboard with platform stats', () => {
    cy.get('[data-testid="admin-dashboard"]').should('be.visible');
    cy.get('[data-testid="platform-stats"]').should('be.visible');
    cy.get('[data-testid="stat-card"]').should('have.length', 4);
  });

  it('should display recent activity', () => {
    cy.get('[data-testid="recent-activity"]').should('be.visible');
    cy.get('[data-testid="activity-item"]').should('have.length.at.least', 1);
  });

  it('should navigate to user management page', () => {
    cy.get('[data-testid="manage-users-link"]').click();
    cy.url().should('include', '/admin/users');
  });

  it('should navigate to verification management page', () => {
    cy.get('[data-testid="review-verifications-link"]').click();
    cy.url().should('include', '/admin/verifications');
  });

  it('should navigate to dispute management page', () => {
    cy.get('[data-testid="handle-disputes-link"]').click();
    cy.url().should('include', '/admin/disputes');
  });

  it('should navigate to system settings page', () => {
    cy.get('[data-testid="system-settings-link"]').click();
    cy.url().should('include', '/admin/settings');
  });

  it('should display user growth chart', () => {
    cy.get('[data-testid="user-growth-chart"]').should('be.visible');
  });

  it('should display user distribution chart', () => {
    cy.get('[data-testid="user-distribution-chart"]').should('be.visible');
  });

  it('should toggle between time periods for charts', () => {
    // Weekly view
    cy.get('[data-testid="chart-period-weekly"]').click();
    cy.get('[data-testid="chart-period-weekly"]').should('have.class', 'bg-blue-100');
    
    // Monthly view
    cy.get('[data-testid="chart-period-monthly"]').click();
    cy.get('[data-testid="chart-period-monthly"]').should('have.class', 'bg-blue-100');
    cy.get('[data-testid="chart-period-weekly"]').should('not.have.class', 'bg-blue-100');
    
    // Yearly view
    cy.get('[data-testid="chart-period-yearly"]').click();
    cy.get('[data-testid="chart-period-yearly"]').should('have.class', 'bg-blue-100');
    cy.get('[data-testid="chart-period-monthly"]').should('not.have.class', 'bg-blue-100');
  });

  it('should redirect non-admin users away from admin dashboard', () => {
    // Mock regular user authentication
    cy.intercept('POST', '**/auth/v1/token?grant_type=password', {
      fixture: 'auth/login_success.json', // Non-admin user
    }).as('loginUser');

    // Login as regular user
    cy.visit('/login');
    cy.get('input[name="email"]').type('user@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginUser');
    
    // Try to access admin dashboard
    cy.visit('/admin');
    
    // Should be redirected or shown access denied
    cy.get('[data-testid="access-denied"]').should('be.visible');
  });
});
