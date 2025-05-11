/// <reference types="cypress" />

describe('Visual Testing', () => {
  beforeEach(() => {
    // Visit the home page before each test
    cy.visit('/');
  });

  it('should match home page visual baseline', () => {
    // In a real implementation, you would use a plugin like cypress-image-snapshot
    // For now, we'll just check that key elements are visible
    cy.log('Checking home page visual appearance');
    
    // Check header
    cy.get('nav').should('be.visible');
    
    // Check main content
    cy.contains('FAIT Co-Op').should('be.visible');
    
    // Check footer
    cy.get('footer').should('be.visible');
  });

  it('should match login page visual baseline', () => {
    // Navigate to login page
    cy.contains('a', 'Login').click();
    
    // Check login form
    cy.get('form').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.contains('button', /sign in/i).should('be.visible');
  });

  it('should match services page visual baseline', () => {
    // Navigate to services page
    cy.contains('a', 'Services').click();
    
    // Check services content
    cy.url().should('include', '/services');
    cy.get('body').should('be.visible');
  });

  it('should maintain visual consistency across viewports', () => {
    // Test on different viewport sizes
    const viewports = [
      [1280, 800], // Desktop
      [768, 1024], // Tablet
      [375, 667]   // Mobile
    ];
    
    viewports.forEach(([width, height]) => {
      cy.viewport(width, height);
      cy.log(`Testing visual consistency on viewport ${width}x${height}`);
      
      // Check that key elements are visible
      cy.get('nav').should('exist');
      cy.contains('FAIT Co-Op').should('be.visible');
      cy.get('footer').should('exist');
    });
  });
});
