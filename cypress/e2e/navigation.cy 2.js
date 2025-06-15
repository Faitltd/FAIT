describe('Navigation', () => {
  it('should navigate between main pages', () => {
    // Start at homepage
    cy.visit('/');
    cy.get('h1').should('be.visible');

    // Navigate to services
    cy.get('a[href="/services"]').click();
    cy.url().should('include', '/services');
    cy.get('h1').should('contain', 'Find Professional Services');

    // Navigate to about
    cy.get('a[href="/about"]').click();
    cy.url().should('include', '/about');
    cy.get('h1').should('be.visible');

    // Navigate to contact
    cy.get('a[href="/contact"]').click();
    cy.url().should('include', '/contact');
    cy.get('h1').should('be.visible');

    // Navigate back to home
    cy.get('a[href="/"]').first().click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('should have working logo link', () => {
    cy.visit('/services');
    cy.get('a[href="/"]').first().click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('should handle 404 pages gracefully', () => {
    cy.visit('/non-existent-page', { failOnStatusCode: false });
    cy.get('body').should('be.visible');
  });

  it('should have consistent navigation across pages', () => {
    const pages = ['/', '/services', '/about', '/contact'];
    
    pages.forEach(page => {
      cy.visit(page);
      cy.get('nav').should('be.visible');
      cy.get('a[href="/services"]').should('be.visible');
      cy.get('a[href="/about"]').should('be.visible');
      cy.get('a[href="/contact"]').should('be.visible');
    });
  });
});
