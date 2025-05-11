describe('Login/Logout Button Tests', () => {
  it('should show login button when logged out', () => {
    cy.visit('/');
    cy.get('[data-testid="login-button"]').should('be.visible');
    cy.get('[data-testid="logout-button"]').should('not.exist');
  });

  it('should show logout button when logged in', () => {
    // Set local auth mode
    cy.window().then((win) => {
      win.localStorage.setItem('useLocalAuth', 'true');
    });

    // Visit login page
    cy.visit('/login');

    // Enter credentials and submit
    cy.get('#email').type('admin@itsfait.com');
    cy.get('#password').type('admin123');
    cy.get('form').submit();

    // Wait for login to complete and redirect
    cy.url().should('include', '/dashboard');

    // Check that logout button is visible and login button is not
    cy.get('[data-testid="logout-button"]').should('be.visible');
    cy.get('[data-testid="login-button"]').should('not.exist');

    // Logout
    cy.get('[data-testid="logout-button"]').click();

    // Check that login button is visible and logout button is not
    cy.get('[data-testid="login-button"]').should('be.visible');
    cy.get('[data-testid="logout-button"]').should('not.exist');
  });

  it('should show login button in mobile view when logged out', () => {
    // Set viewport to mobile size
    cy.viewport('iphone-6');
    
    cy.visit('/');
    
    // Open mobile menu
    cy.get('button[aria-label="Open menu"]').click();
    
    // Check that mobile login button is visible
    cy.get('[data-testid="mobile-login-button"]').should('be.visible');
    cy.get('[data-testid="mobile-logout-button"]').should('not.exist');
  });

  it('should show logout button in mobile view when logged in', () => {
    // Set viewport to mobile size
    cy.viewport('iphone-6');
    
    // Set local auth mode
    cy.window().then((win) => {
      win.localStorage.setItem('useLocalAuth', 'true');
    });

    // Visit login page
    cy.visit('/login');

    // Enter credentials and submit
    cy.get('#email').type('admin@itsfait.com');
    cy.get('#password').type('admin123');
    cy.get('form').submit();

    // Wait for login to complete and redirect
    cy.url().should('include', '/dashboard');

    // Open mobile menu
    cy.get('button[aria-label="Open menu"]').click();
    
    // Check that mobile logout button is visible
    cy.get('[data-testid="mobile-logout-button"]').should('be.visible');
    cy.get('[data-testid="mobile-login-button"]').should('not.exist');

    // Logout
    cy.get('[data-testid="mobile-logout-button"]').click();

    // Open mobile menu again (it closes after clicking logout)
    cy.get('button[aria-label="Open menu"]').click();
    
    // Check that mobile login button is visible
    cy.get('[data-testid="mobile-login-button"]').should('be.visible');
    cy.get('[data-testid="mobile-logout-button"]').should('not.exist');
  });
});
