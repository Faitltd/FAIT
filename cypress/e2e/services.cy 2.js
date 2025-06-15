describe('Services Page', () => {
  beforeEach(() => {
    cy.visit('/services');
  });

  it('should load the services page successfully', () => {
    cy.get('h1').should('contain', 'Find Professional Services');
    cy.get('body').should('be.visible');
  });

  it('should have a working search form', () => {
    // Check search inputs are visible and functional
    cy.get('input[id="search-query"]').should('be.visible');
    cy.get('input[id="search-location"]').should('be.visible');
    cy.get('button').contains('Search').should('be.visible');

    // Test search functionality
    cy.get('input[id="search-query"]').type('plumbing');
    cy.get('input[id="search-location"]').type('New York');
    cy.get('button').contains('Search').click();
  });

  it('should display service categories', () => {
    // Check that service category buttons are visible
    cy.contains('All Services').should('be.visible');
    cy.contains('Home & Garden').should('be.visible');
    cy.contains('Cleaning').should('be.visible');
    cy.contains('Repair & Maintenance').should('be.visible');
    cy.contains('Design & Creative').should('be.visible');
  });

  it('should show service listings', () => {
    // Check that service listings are displayed
    cy.get('[data-testid="service-listings"]').should('be.visible');
  });

  it('should have working category filters', () => {
    // Test category filtering
    cy.contains('Home & Garden').click();
    cy.contains('Cleaning').click();
    cy.contains('All Services').click();
  });

  it('should be accessible', () => {
    // Basic accessibility checks
    cy.get('input[id="search-query"]').should('have.attr', 'placeholder');
    cy.get('input[id="search-location"]').should('have.attr', 'placeholder');
    cy.get('button').should('be.visible');
  });
});
