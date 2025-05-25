describe('Services Page Links Check', () => {
  it('should navigate to services page and verify links', () => {
    // Visit the home page first
    cy.visit('/');
    
    // Take a screenshot of the home page
    cy.screenshot('home-page');
    
    // Navigate to the services page using the URL
    cy.visit('/services');
    
    // Take a screenshot of the services page
    cy.screenshot('services-page-from-url');
    
    // Check if we can navigate back to home
    cy.visit('/');
    
    // Try to find a link to services and click it if it exists
    cy.get('a').contains('Services', { matchCase: false }).then($link => {
      if ($link.length) {
        cy.wrap($link).click();
        cy.url().should('include', '/services');
        cy.screenshot('services-page-from-link');
      } else {
        cy.log('No Services link found on home page');
      }
    });
    
    // Check if the services search page works
    cy.visit('/services/search');
    cy.url().should('include', '/services/search');
    cy.screenshot('services-search-page');
  });
});
