describe('Services Page Basic Test', () => {
  it('should load the services page', () => {
    // Visit the services page
    cy.visit('/services');
    
    // Take a screenshot to see what's actually on the page
    cy.screenshot('services-page-actual');
    
    // Check if the page has loaded by looking for common elements
    cy.get('h1').should('exist');
    cy.get('h2').should('exist');
    cy.get('button').should('exist');
    cy.get('form').should('exist');
  });
});
