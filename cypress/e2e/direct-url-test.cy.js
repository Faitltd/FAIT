describe('Direct URL Navigation Test', () => {
  it('should navigate directly to various pages', () => {
    // Visit the home page
    cy.visit('/');
    cy.screenshot('home-page-direct');
    
    // Visit the services page
    cy.visit('/services');
    cy.url().should('include', '/services');
    cy.screenshot('services-page-direct');
    
    // Visit the services search page
    cy.visit('/services/search');
    cy.url().should('include', '/services/search');
    cy.screenshot('services-search-direct');
    
    // Visit the login page
    cy.visit('/login');
    cy.url().should('include', '/login');
    cy.screenshot('login-page-direct');
  });
});
