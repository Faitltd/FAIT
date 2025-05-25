describe('Services Page Links', () => {
  beforeEach(() => {
    // Visit the services page before each test
    cy.visit('/services');

    // Wait for the page to load completely
    cy.contains('Find Trusted Service Professionals').should('be.visible');
  });

  it('should load the services page correctly', () => {
    // Verify the page title is visible
    cy.contains('Find Trusted Service Professionals').should('be.visible');
    cy.contains('Find Services Near You').should('be.visible');

    // Take a screenshot for visual verification
    cy.screenshot('services-page-loaded');
  });

  it('should navigate to search page when using the search form', () => {
    // Fill in the zip code
    cy.get('input[placeholder="Enter your zip code"]').first().type('80202');

    // Click the search button
    cy.get('form').first().find('button[type="submit"]').click();

    // Verify we are redirected to the search page with correct parameters
    cy.url().should('include', '/services/search?zip=80202');
  });

  it('should navigate to search page when clicking on a category', () => {
    // Click on the first service category
    cy.contains('Popular Service Categories')
      .parent()
      .find('button')
      .first()
      .click();

    // Verify we are redirected to the search page with correct parameters
    cy.url().should('include', '/services/search?category=');
  });

  it('should validate zip code input', () => {
    // Clear any existing zip code
    cy.get('input[placeholder="Enter your zip code"]').first().clear();

    // Submit the form without entering a zip code
    cy.get('form').first().find('button[type="submit"]').click();

    // Check for error message
    cy.contains('Please enter a valid zip code').should('be.visible');
  });

  it('should have working links in the "How It Works" section', () => {
    // Verify the "How It Works" section is visible
    cy.contains('How It Works').should('be.visible');

    // Verify all three steps are visible
    cy.contains('Search').should('be.visible');
    cy.contains('Book').should('be.visible');
    cy.contains('Relax').should('be.visible');
  });

  it('should have a working map section', () => {
    // Verify the map section is visible
    cy.contains('Service Locations').should('be.visible');

    // The map might be loaded or show a fallback message
    // We'll check for either condition
    cy.get('iframe').then($iframe => {
      if ($iframe.length > 0) {
        // Map iframe exists
        cy.wrap($iframe).should('exist');
      } else {
        // Fallback message is shown
        cy.contains('Map View').should('be.visible');
      }
    });
  });

  it('should have working advanced search form', () => {
    // Fill in the zip code in the advanced search form
    cy.get('input[placeholder="Enter zip code"]').type('90210');

    // Select a radius
    cy.get('select').first().select('25');

    // Select a category
    cy.get('select').last().select(1);

    // Submit the form
    cy.contains('button', 'Search').click();

    // Verify we are redirected to the search page with correct parameters
    cy.url().should('include', '/services/search?zip=90210');
    cy.url().should('include', 'radius=25');
  });
});
