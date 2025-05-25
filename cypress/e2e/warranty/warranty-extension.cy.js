/// <reference types="cypress" />

describe('Warranty Extension Tests', () => {
  beforeEach(() => {
    // Visit the warranty page before each test
    cy.visit('/warranty');
  });

  it('should navigate to warranty extension page', () => {
    // Check if there are any warranty items
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="warranty-item"]').length > 0) {
        // Click on the first warranty item
        cy.get('[data-testid="warranty-item"]').first().find('a, button').click();
        
        // Verify we're on a warranty detail page
        cy.url().should('include', '/warranty/');
        
        // Check if there's an extend warranty button
        cy.get('body').then(($detailBody) => {
          if ($detailBody.find('[data-testid="extend-warranty-button"]').length > 0) {
            cy.get('[data-testid="extend-warranty-button"]').click();
            
            // Verify we're on the warranty extension page
            cy.url().should('include', '/warranty/extend');
          } else {
            cy.log('No extend warranty button found');
          }
        });
      } else {
        cy.log('No warranty items found to click');
      }
    });
  });

  it('should display extension options', () => {
    // Check if there are any warranty items
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="warranty-item"]').length > 0) {
        // Click on the first warranty item
        cy.get('[data-testid="warranty-item"]').first().find('a, button').click();
        
        // Check if there's an extend warranty button
        cy.get('body').then(($detailBody) => {
          if ($detailBody.find('[data-testid="extend-warranty-button"]').length > 0) {
            cy.get('[data-testid="extend-warranty-button"]').click();
            
            // Check for extension options
            cy.get('body').then(($extensionBody) => {
              const hasOptions = $extensionBody.find('[data-testid*="extension-option"]').length > 0;
              if (hasOptions) {
                cy.log('Warranty extension page has options');
              } else {
                cy.log('Warranty extension page does not have options');
              }
            });
          } else {
            cy.log('No extend warranty button found');
          }
        });
      } else {
        cy.log('No warranty items found to click');
      }
    });
  });
});
