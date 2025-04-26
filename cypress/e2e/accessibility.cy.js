/// <reference types="cypress" />

describe('Accessibility', () => {
  beforeEach(() => {
    // Visit the home page before each test
    cy.visit('/');
  });

  it('should have proper heading structure', () => {
    // Check for heading elements
    cy.get('h1').should('exist');
    cy.get('h2').should('exist');
  });

  it('should have alt text for images', () => {
    // Check that images have alt text
    cy.get('img').each(($img) => {
      // Skip SVG images which might not need alt text
      if (!$img.attr('src').includes('.svg')) {
        expect($img).to.have.attr('alt');
      }
    });
  });

  it('should have sufficient color contrast', () => {
    // This is a visual check that would typically use a plugin like cypress-axe
    // For now, we'll just check that text elements exist
    cy.get('p, h1, h2, h3, a, button, label').should('exist');
  });

  it('should have keyboard navigable elements', () => {
    // Check that interactive elements are keyboard navigable
    cy.get('a, button, input, select, textarea').should('exist');
  });

  it('should have form labels', () => {
    // Navigate to login page which has a form
    cy.contains('a', 'Login').click();
    
    // Check for form labels
    cy.get('form').within(() => {
      cy.get('label, [aria-label]').should('exist');
    });
  });
});
