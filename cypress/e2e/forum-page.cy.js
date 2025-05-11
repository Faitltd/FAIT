/// <reference types="cypress" />

describe('Forum Page', () => {
  it('should load the forum page correctly', () => {
    // Visit the forum page
    cy.visit('/forum');
    
    // Check if the page has loaded correctly
    cy.contains('Community Forum').should('exist');
    
    // Check if the welcome message exists
    cy.contains('Welcome to the FAIT Community Forum').should('exist');
    
    // Check if the forum categories exist
    cy.contains('Forum Categories').should('exist');
    cy.contains('General Discussion').should('exist');
    cy.contains('Contractor Corner').should('exist');
    cy.contains('Project Showcase').should('exist');
    cy.contains('Announcements').should('exist');
    
    // Check if the forum statistics exist
    cy.contains('Forum Statistics').should('exist');
    cy.contains('Total Categories:').should('exist');
    cy.contains('Total Threads:').should('exist');
    cy.contains('Total Posts:').should('exist');
    cy.contains('Total Members:').should('exist');
    
    // Check if the quick links exist
    cy.contains('Quick Links').should('exist');
    cy.contains('Recent Discussions').should('exist');
    cy.contains('Popular Threads').should('exist');
    cy.contains('Unanswered Questions').should('exist');
  });
  
  it('should navigate to the forum page from the dropdown menu', () => {
    // Visit the home page
    cy.visit('/');
    
    // Click the More Options button to open the dropdown
    cy.contains('button', 'More Options').click();
    
    // Click the Community link
    cy.contains('Community').click();
    
    // Verify we're on the forum page
    cy.url().should('include', '/forum');
    
    // Check if the page has loaded correctly
    cy.contains('Community Forum').should('exist');
  });
});
