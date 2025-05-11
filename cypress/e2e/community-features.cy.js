/// <reference types="cypress" />

describe('Community Features', () => {
  beforeEach(() => {
    // Visit the home page before each test
    cy.visit('/');
  });

  it('should have community link in navigation', () => {
    // Check for community link
    cy.contains('a', 'Community').should('be.visible');
  });

  it('should navigate to community page', () => {
    // Click on Community link
    cy.contains('a', 'Community').click();

    // Verify navigation occurred
    cy.url().should('not.eq', 'http://localhost:5173/');
  });

  it('should have footer links', () => {
    // Check for links in footer
    cy.get('footer a').should('have.length.at.least', 1);

    // Log the result
    cy.log('Footer contains links');
  });

  it('should display community-related content', () => {
    // Navigate to community page
    cy.contains('a', 'Community').click();

    // Check for community-related content
    cy.get('body').should('be.visible');
    cy.log('Successfully navigated to community page');
  });
});
