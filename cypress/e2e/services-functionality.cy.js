describe('Services Page Functionality', () => {
  beforeEach(() => {
    // Visit the services page directly
    cy.visit('/services');
    
    // Wait for the page to load
    cy.url().should('include', '/services');
  });

  it('should have a working search form', () => {
    // Find the zip code input in the hero section
    cy.get('input[placeholder="Enter your zip code"]').first().should('be.visible').type('80202');
    
    // Find and click the search button
    cy.get('button[type="submit"]').first().should('be.visible').click();
    
    // Verify we are redirected to the search page with the correct parameters
    cy.url().should('include', '/services/search?zip=80202');
  });

  it('should have working category buttons', () => {
    // Find the "Popular Service Categories" section
    cy.contains('Popular Service Categories').should('be.visible');
    
    // Find and click the first category button
    cy.contains('Popular Service Categories')
      .parent()
      .find('button')
      .first()
      .should('be.visible')
      .click();
    
    // Verify we are redirected to the search page with a category parameter
    cy.url().should('include', '/services/search?category=');
  });

  it('should have a working advanced search form', () => {
    // Find the zip code input in the advanced search form
    cy.get('input[placeholder="Enter zip code"]').should('be.visible').type('90210');
    
    // Find and select a radius
    cy.get('select').first().should('be.visible').select('25');
    
    // Find and select a category
    cy.get('select').last().should('be.visible').select(1);
    
    // Find and click the search button
    cy.contains('button', 'Search').should('be.visible').click();
    
    // Verify we are redirected to the search page with the correct parameters
    cy.url().should('include', '/services/search?zip=90210');
    cy.url().should('include', 'radius=25');
  });

  it('should display the "How It Works" section', () => {
    // Find the "How It Works" section
    cy.contains('How It Works').should('be.visible');
    
    // Verify the three steps are displayed
    cy.contains('Search').should('be.visible');
    cy.contains('Book').should('be.visible');
    cy.contains('Relax').should('be.visible');
  });
});
