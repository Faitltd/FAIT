/// <reference types="cypress" />

describe('Responsive Design', () => {
  beforeEach(() => {
    // Visit the home page before each test
    cy.visit('/');
  });

  it('should display correctly on desktop', () => {
    // Set viewport to desktop size
    cy.viewport(1280, 800);

    // Check that navigation is visible
    cy.get('nav').should('be.visible');

    // Check that content is visible (using a more general selector)
    cy.get('body > div').should('be.visible');
  });

  it('should display correctly on tablet', () => {
    // Set viewport to tablet size
    cy.viewport(768, 1024);

    // Check that navigation is visible or hamburger menu is present
    cy.get('nav').then($nav => {
      if ($nav.is(':visible')) {
        cy.wrap($nav).should('be.visible');
      } else {
        // Look for hamburger menu button
        cy.get('button').should('be.visible');
      }
    });

    // Check that content is visible (using a more general selector)
    cy.get('body > div').should('be.visible');
  });

  it('should display correctly on mobile', () => {
    // Set viewport to mobile size
    cy.viewport(375, 667);

    // Check for navigation elements
    cy.get('nav').should('exist');

    // Check that content is visible (using a more general selector)
    cy.get('body > div').should('be.visible');
  });

  it('should have a responsive footer', () => {
    // Test on different viewport sizes
    const viewports = [
      [1280, 800], // Desktop
      [768, 1024], // Tablet
      [375, 667]   // Mobile
    ];

    viewports.forEach(([width, height]) => {
      cy.viewport(width, height);
      cy.get('footer').should('be.visible');
    });
  });

  it('should have readable text on all devices', () => {
    // Test on different viewport sizes
    const viewports = [
      [1280, 800], // Desktop
      [768, 1024], // Tablet
      [375, 667]   // Mobile
    ];

    viewports.forEach(([width, height]) => {
      cy.viewport(width, height);

      // Check that text elements are visible
      cy.get('h1, h2, h3, p').should('be.visible');
    });
  });
});
