describe('Homepage', () => {
  beforeEach(() => {
    cy.visit('/', { failOnStatusCode: false });
  });

  it('should load the homepage successfully', () => {
    cy.get('h1').should('contain', 'Welcome to FAIT');
    cy.get('body').should('be.visible');
  });

  it('should have working navigation', () => {
    // Check main navigation links
    cy.get('nav').should('be.visible');
    cy.get('a[href="/services"]').should('be.visible');
    cy.get('a[href="/about"]').should('be.visible');
    cy.get('a[href="/contact"]').should('be.visible');
  });

  it('should have a working search form', () => {
    // Check search form exists and is functional
    cy.get('input[placeholder*="Search"]').should('be.visible');
    cy.get('input[placeholder*="location"]').should('be.visible');
    cy.get('button').contains('Search').should('be.visible');
  });

  it('should display service categories', () => {
    // Check that service categories are displayed
    cy.get('[data-testid="service-categories"]').should('be.visible');
    cy.contains('All Services').should('be.visible');
    cy.contains('Home & Garden').should('be.visible');
    cy.contains('Cleaning').should('be.visible');
  });

  it('should be responsive', () => {
    // Test mobile viewport
    cy.viewport(375, 667);
    cy.get('body').should('be.visible');

    // Test tablet viewport
    cy.viewport(768, 1024);
    cy.get('body').should('be.visible');

    // Test desktop viewport
    cy.viewport(1280, 720);
    cy.get('body').should('be.visible');
  });
});
