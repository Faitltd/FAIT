describe('Week 2 Enhancements', () => {
  beforeEach(() => {
    // Visit the services page
    cy.visit('/services');
  });

  it('should remember location when enabled', () => {
    // Enter a zip code
    cy.get('input[name="zipCode"]').clear().type('80202');
    
    // Open advanced filters
    cy.contains('button', 'Filters').click();
    
    // Enable "Remember my location"
    cy.get('#remember-location').check();
    
    // Reload the page
    cy.reload();
    
    // Verify the zip code is still there
    cy.get('input[name="zipCode"]').should('have.value', '80202');
  });

  it('should show directions button on service cards', () => {
    // Wait for services to load
    cy.get('.grid-cols-1.gap-6').should('be.visible');
    
    // Check if directions button exists on service cards
    cy.contains('button', 'Directions').should('exist');
  });

  it('should switch to map view when clicking directions button', () => {
    // Wait for services to load
    cy.get('.grid-cols-1.gap-6').should('be.visible');
    
    // Click on directions button
    cy.contains('button', 'Directions').first().click();
    
    // Verify map view is shown
    cy.get('.h-\\[600px\\]').should('be.visible');
  });
});
