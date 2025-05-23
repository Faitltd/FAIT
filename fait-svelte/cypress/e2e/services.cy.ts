describe('Services Page', () => {
  beforeEach(() => {
    // Visit the services page before each test
    cy.visit('/services');
  });

  it('displays the services page title', () => {
    cy.get('h1').should('contain', 'Services');
    cy.get('p').should('contain', 'Find the perfect service provider for your needs');
  });

  it('displays the search form', () => {
    cy.get('form').should('exist');
    cy.get('input[placeholder="Search for services..."]').should('exist');
    cy.get('input[placeholder="City, neighborhood, or zip code"]').should('exist');
    cy.get('button').contains('Search').should('exist');
  });

  it('displays service categories', () => {
    // Check that categories are displayed
    cy.get('button').contains('🏠 Home').should('exist');
    cy.get('button').contains('🧹 Cleaning').should('exist');
    cy.get('button').contains('🌱 Garden & Outdoors').should('exist');
    
    // Click on a category to filter
    cy.get('button').contains('🧹 Cleaning').click();
    
    // The button should now have a blue background
    cy.get('button').contains('🧹 Cleaning')
      .should('have.class', 'bg-fait-blue');
  });

  it('displays service cards', () => {
    // Wait for services to load
    cy.get('.spinner').should('not.exist', { timeout: 10000 });
    
    // Check that service cards are displayed
    cy.get('.grid').children().should('have.length.at.least', 1);
    
    // Check the content of a service card
    cy.contains('h3', 'Home Cleaning').should('exist');
    cy.contains('button', 'Book Now').should('exist');
  });

  it('filters services by search query', () => {
    // Wait for services to load
    cy.get('.spinner').should('not.exist', { timeout: 10000 });
    
    // Enter a search query
    cy.get('input[placeholder="Search for services..."]').type('cleaning');
    cy.get('button').contains('Search').click();
    
    // Check that filtered services are displayed
    cy.contains('h3', 'Home Cleaning').should('exist');
    cy.contains('h3', 'Furniture Assembly').should('not.exist');
  });

  it('filters services by category', () => {
    // Wait for services to load
    cy.get('.spinner').should('not.exist', { timeout: 10000 });
    
    // Click on a category to filter
    cy.get('button').contains('🏠 Home').click();
    
    // Check that filtered services are displayed
    cy.contains('h3', 'Furniture Assembly').should('exist');
    cy.contains('h3', 'Lawn Mowing').should('not.exist');
  });

  it('shows no results message when no services match filters', () => {
    // Wait for services to load
    cy.get('.spinner').should('not.exist', { timeout: 10000 });
    
    // Enter a search query that won't match any services
    cy.get('input[placeholder="Search for services..."]').type('nonexistent service');
    cy.get('button').contains('Search').click();
    
    // Check that no results message is displayed
    cy.contains('No services found').should('exist');
    cy.contains('Try adjusting your search or category filters').should('exist');
    
    // Click the clear filters button
    cy.get('button').contains('Clear Filters').click();
    
    // Services should be displayed again
    cy.get('.grid').children().should('have.length.at.least', 1);
  });

  it('shows loading spinner while services are loading', () => {
    // Reload the page to see the loading state
    cy.reload();
    
    // Check that spinner is displayed
    cy.get('.spinner').should('exist');
    
    // Wait for services to load
    cy.get('.spinner').should('not.exist', { timeout: 10000 });
  });
});
