describe('Service Detail Page', () => {
  beforeEach(() => {
    cy.visit('/services/1');
  });

  it('should display the service details', () => {
    cy.get('h1').should('contain', 'Home Cleaning');
    cy.get('img').should('be.visible');
    cy.get('p').should('contain', 'Professional cleaning services');
  });

  it('should display service features', () => {
    cy.get('h2').contains('Features').should('be.visible');
    cy.get('ul').should('be.visible');
    cy.get('ul li').should('have.length.at.least', 3);
  });

  it('should display provider information', () => {
    cy.get('h2').contains('Provider').should('be.visible');
    cy.get('h3').contains('Clean Home Co-op').should('be.visible');
  });

  it('should display booking form', () => {
    cy.get('h2').contains('Book This Service').should('be.visible');
    cy.get('#date').should('exist');
    cy.get('#time').should('exist');
    cy.get('#notes').should('exist');
    cy.get('button').contains('Book Now').should('exist');
  });

  it('should show confirmation after booking', () => {
    cy.get('#date').type('2023-12-31');
    cy.get('#time').select('morning');
    cy.get('#notes').type('Please bring eco-friendly cleaning products');
    cy.get('button').contains('Book Now').click();
    
    cy.get('.bg-green-100').should('be.visible');
    cy.get('.bg-green-100').should('contain', 'Thank you for your booking request');
  });

  it('should display related services', () => {
    cy.get('h2').contains('Related Services').should('be.visible');
    cy.get('h2').contains('Related Services').parent().find('.grid > div').should('have.length.at.least', 2);
  });
});
