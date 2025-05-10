describe('Homepage Tests', () => {
  beforeEach(() => {
    cy.visit('/');
    // Wait for animations to complete
    cy.wait(2000);
  });

  it('should display the homepage with key elements', () => {
    // Hero section
    cy.contains('h1', /Welcome to/i).should('be.visible');
    cy.contains('h1', /FAIT Co-Op Platform/i).should('be.visible');
    cy.contains('p', /Connecting homeowners with trusted service agents/i).should('be.visible');

    // Buttons
    cy.contains('a', /Get Started/i).should('be.visible');
    cy.contains('a', /Find Services/i).should('be.visible');
    cy.contains('a', /Free Instant Estimate/i).should('be.visible');
  });

  it('should navigate to register page when clicking Get Started', () => {
    cy.contains('a', /Get Started/i).click();
    cy.url().should('include', '/register');
  });

  it('should navigate to services search page when clicking Find Services', () => {
    cy.contains('a', /Find Services/i).click();
    cy.url().should('include', '/services/search');
    cy.go('back');
  });

  it('should navigate to calculator page when clicking Free Instant Estimate', () => {
    cy.contains('a', /Free Instant Estimate/i).click();
    cy.url().should('include', '/calculator/estimate');
    cy.go('back');
  });

  it('should scroll down the page and check footer', () => {
    // Scroll down the page to check content
    cy.scrollTo('bottom', { duration: 1000 });

    // Check for footer
    cy.get('footer').should('exist');
    cy.get('footer').contains(/FAIT Co-Op/i).should('exist');
  });
});
