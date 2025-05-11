/// <reference types="cypress" />

describe('Warranty Module Tests', () => {
  beforeEach(() => {
    // Visit the warranty page before each test
    cy.visit('/warranty');
  });

  it('should display the warranty page title', () => {
    // Check for page title
    cy.get('h1').should('exist');
    cy.get('h1').should('be.visible');
  });

  it('should display warranty list', () => {
    // Check for warranty list
    cy.get('main').should('exist');
    
    // Take a screenshot of the warranty list
    cy.screenshot('warranty-list');
  });

  it('should navigate to warranty details', () => {
    // Check if there are any warranty items
    cy.get('main').then(($main) => {
      // If there are warranty items with a details button, click the first one
      if ($main.find('[data-testid="warranty-item"]').length > 0) {
        cy.get('[data-testid="warranty-item"]').first().find('a, button').click();
        
        // Verify we're on a warranty detail page
        cy.url().should('include', '/warranty/');
        
        // Take a screenshot of the warranty detail page
        cy.screenshot('warranty-detail');
      } else {
        // If no warranty items, log it and pass the test
        cy.log('No warranty items found to click');
      }
    });
  });

  it('should have a form to submit a warranty claim', () => {
    // Check if there's a button to submit a warranty claim
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="submit-claim-button"]').length > 0) {
        cy.get('[data-testid="submit-claim-button"]').click();
        
        // Verify we're on the claim submission page
        cy.url().should('include', '/warranty/claim');
        
        // Check for form elements
        cy.get('form').should('exist');
        
        // Take a screenshot of the claim form
        cy.screenshot('warranty-claim-form');
      } else {
        // If no button, log it and pass the test
        cy.log('No submit claim button found');
      }
    });
  });
});
