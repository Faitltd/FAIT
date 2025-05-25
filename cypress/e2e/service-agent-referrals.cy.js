/// <reference types="cypress" />

describe('Service Agent Referrals Page', () => {
  it('should load the service agent referrals page correctly', () => {
    // Visit the service agent referrals page
    cy.visit('/dashboard/service-agent/referrals');
    
    // Check if the page has loaded correctly
    cy.contains('Grow Your Network').should('exist');
    
    // Check if the "Back to Dashboard" link exists
    cy.contains('Back to Dashboard').should('exist');
    
    // Check if the referral link section exists
    cy.contains('Your Referral Link').should('exist');
    
    // Check if the copy and share buttons exist
    cy.contains('button', 'Copy').should('exist');
    cy.contains('button', 'Share').should('exist');
    
    // Check if the stats cards exist
    cy.contains('Total Referrals').should('exist');
    cy.contains('Successful Referrals').should('exist');
    cy.contains('Points Earned').should('exist');
    
    // Check if the referrals list exists
    cy.contains('Your Referrals').should('exist');
  });
  
  it('should navigate back to dashboard from referrals page', () => {
    // Visit the service agent referrals page
    cy.visit('/dashboard/service-agent/referrals');
    
    // Click the "Back to Dashboard" link
    cy.contains('Back to Dashboard').click();
    
    // Verify we're on the dashboard page
    cy.url().should('include', '/dashboard/service-agent');
    cy.url().should('not.include', '/referrals');
  });
});
