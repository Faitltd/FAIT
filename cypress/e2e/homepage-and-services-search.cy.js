// Test for the homepage and services search functionality
describe('Homepage and Services Search Tests', () => {
  beforeEach(() => {
    // Visit the homepage with the full version
    cy.visit('/?version=full');
    // Wait for the page to load
    cy.wait(2000);
  });

  it('should load the homepage', () => {
    // Check if the app is loaded
    cy.get('#root').should('exist');

    // Check if the Find Services button is visible
    cy.contains('Find Services').should('be.visible');
  });

  it('should navigate to the services search page when clicking Find Services', () => {
    // Click on the Find Services button
    cy.contains('Find Services').click();

    // Wait for the page to load
    cy.wait(2000);

    // Check if we're on the services search page
    cy.url().should('include', '/services/search');

    // Check if the services search page is loaded
    cy.get('#root').should('exist');
  });

  it('should test the minimal version of the app', () => {
    // Visit the homepage with the minimal version
    cy.visit('/?version=minimal');
    cy.wait(2000);

    // Check if the homepage title is visible
    cy.contains('Welcome to').should('be.visible');
    cy.contains('FAIT Co-Op Platform').should('be.visible');

    // Click on the Find Services button
    cy.contains('Find Services').click();
    cy.wait(2000);

    // Check if we're on the services search page
    cy.url().should('include', '/services/search');
  });
});
