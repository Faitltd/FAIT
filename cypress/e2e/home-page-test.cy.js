describe('Home Page Test', () => {
  beforeEach(() => {
    // Visit the home page
    cy.visit('/');
    
    // Wait for the page to load
    cy.wait(2000);
  });

  it('should load the home page with correct title and subtitle', () => {
    // Check for the main title
    cy.get('h1').contains('Welcome to').should('be.visible');
    cy.get('h1').contains('FAIT Co-Op Platform').should('be.visible');
    
    // Check for the subtitle
    cy.get('p').contains('Connecting homeowners with trusted service agents').should('be.visible');
  });

  it('should display the main call-to-action buttons', () => {
    // Check for the "Get Started" button
    cy.get('a').contains('Get Started').should('be.visible');
    cy.get('a').contains('Get Started').should('have.attr', 'href', '/test-login');
    
    // Check for the "Find Services" button
    cy.get('a').contains('Find Services').should('be.visible');
    cy.get('a').contains('Find Services').should('have.attr', 'href', '/services/search');
  });

  it('should display the "How It Works" section', () => {
    // Check for the section title
    cy.get('h2').contains('How It Works').should('be.visible');
    
    // Check for the three steps
    cy.get('h3').contains('Find Services').should('be.visible');
    cy.get('h3').contains('Book Appointments').should('be.visible');
    cy.get('h3').contains('Warranty Protection').should('be.visible');
  });

  it('should display the "Try Our Demo" section', () => {
    // Check for the section title
    cy.get('h2').contains('Try Our Demo').should('be.visible');
    
    // Check for the demo options
    cy.get('h3').contains('Test Login').should('be.visible');
    cy.get('h3').contains('Client Dashboard').should('be.visible');
    cy.get('h3').contains('Service Agent Dashboard').should('be.visible');
  });

  it('should have working navigation links', () => {
    // Check the "Get Started" button
    cy.get('a').contains('Get Started').click();
    
    // URL should change to test-login
    cy.url().should('include', '/test-login');
    
    // Go back to home page
    cy.go('back');
    
    // Check the "Find Services" button
    cy.get('a').contains('Find Services').click();
    
    // URL should change to services/search
    cy.url().should('include', '/services/search');
  });

  it('should display the footer with copyright information', () => {
    // Check for the footer
    cy.get('footer').should('be.visible');
    
    // Check for copyright text
    cy.get('footer').contains('© 2024 FAIT Co-Op').should('be.visible');
    
    // Check for footer links
    cy.get('footer a').contains('Debug Page').should('be.visible');
    cy.get('footer a').contains('Subscription Dashboard').should('be.visible');
  });

  it('should have a responsive layout', () => {
    // Test on mobile viewport
    cy.viewport('iphone-x');
    
    // Check that elements are still visible
    cy.get('h1').contains('Welcome to').should('be.visible');
    cy.get('a').contains('Get Started').should('be.visible');
    cy.get('a').contains('Find Services').should('be.visible');
    
    // Test on tablet viewport
    cy.viewport('ipad-2');
    
    // Check that elements are still visible
    cy.get('h1').contains('Welcome to').should('be.visible');
    cy.get('a').contains('Get Started').should('be.visible');
    cy.get('a').contains('Find Services').should('be.visible');
    
    // Test on desktop viewport
    cy.viewport(1920, 1080);
    
    // Check that elements are still visible
    cy.get('h1').contains('Welcome to').should('be.visible');
    cy.get('a').contains('Get Started').should('be.visible');
    cy.get('a').contains('Find Services').should('be.visible');
  });
});
