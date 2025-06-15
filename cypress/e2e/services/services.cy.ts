describe('Services Page', () => {
  beforeEach(() => {
    cy.visit('/services');
  });

  it('should display the services page with title and search', () => {
    cy.get('h1').should('contain', 'Services');
    cy.get('input[placeholder="Search for services..."]').should('exist');
  });

  it('should display service categories', () => {
    cy.get('button').contains('Home').should('exist');
    cy.get('button').contains('Garden & Outdoors').should('exist');
    cy.get('button').contains('Cleaning').should('exist');
  });

  it('should display service cards', () => {
    cy.get('.grid > div').should('have.length.at.least', 3);
    cy.get('.grid > div').first().should('contain', 'Home Cleaning');
  });

  it('should filter services when searching', () => {
    cy.get('input[placeholder="Search for services..."]').type('cleaning');
    cy.get('.grid > div').should('contain', 'Home Cleaning');
    cy.get('.grid > div').should('not.contain', 'Furniture Assembly');
  });

  it('should filter services when clicking on a category', () => {
    cy.get('button').contains('Garden & Outdoors').click();
    cy.get('.grid > div').should('contain', 'Lawn Mowing');
    cy.get('.grid > div').should('not.contain', 'Home Cleaning');
  });

  it('should navigate to service detail page when clicking on a service', () => {
    cy.contains('Home Cleaning').click();
    cy.url().should('include', '/services/1');
    cy.get('h1').should('contain', 'Home Cleaning');
  });
});
