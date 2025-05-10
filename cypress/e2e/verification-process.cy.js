/// <reference types="cypress" />

describe('Client Verification Process', () => {
  // Client credentials
  const clientEmail = Cypress.env('clientEmail') || 'client@itsfait.com';
  const clientPassword = Cypress.env('clientPassword') || 'client123';

  beforeEach(() => {
    // Clear cookies and local storage before each test
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Login as client
    cy.visit('/login');
    cy.get('input[type="email"]').clear().type(clientEmail);
    cy.get('input[type="password"]').clear().type(clientPassword);
    cy.contains('button', /sign in/i).click();
    
    // Verify login was successful
    cy.url().should('include', '/dashboard/client');
  });

  it('should navigate to the verification page', () => {
    // Navigate to profile or settings page
    cy.contains('Profile').click();
    cy.url().should('include', '/profile');
    
    // Click on verification link
    cy.contains('Verification').click();
    
    // Verify we're on the verification page
    cy.url().should('include', '/verification');
    cy.contains('Verification Status').should('be.visible');
  });

  it('should complete the verification process', () => {
    // Navigate to verification page
    cy.visit('/verification');
    
    // Check current verification status
    cy.get('[data-cy="verification-status"]').then(($status) => {
      // If already verified, skip the test
      if ($status.text().includes('Verified')) {
        cy.log('Account already verified, skipping test');
        return;
      }
      
      // Start verification process
      cy.contains('button', /start verification|verify now/i).click();
      
      // Fill in personal information
      cy.get('input[name="fullName"]').clear().type('Test Client');
      cy.get('input[name="address"]').clear().type('123 Test St');
      cy.get('input[name="city"]').clear().type('Test City');
      cy.get('input[name="state"]').clear().type('TS');
      cy.get('input[name="zipCode"]').clear().type('12345');
      cy.get('input[name="phone"]').clear().type('555-123-4567');
      
      // Continue to next step
      cy.contains('button', /next|continue/i).click();
      
      // Upload identification document (mock)
      cy.get('input[type="file"]').attachFile('test-document.jpg');
      
      // Continue to next step
      cy.contains('button', /next|continue/i).click();
      
      // Agree to terms
      cy.get('input[type="checkbox"]').check();
      
      // Submit verification
      cy.contains('button', /submit|complete/i).click();
      
      // Verify submission was successful
      cy.contains('Verification submitted').should('be.visible');
    });
  });

  it('should handle verification renewal', () => {
    // Navigate to verification page
    cy.visit('/verification');
    
    // Check current verification status
    cy.get('[data-cy="verification-status"]').then(($status) => {
      // If verification is expired or about to expire
      if ($status.text().includes('Expired') || $status.text().includes('Expiring soon')) {
        // Click on renew button
        cy.contains('button', /renew|update/i).click();
        
        // Confirm renewal
        cy.contains('button', /confirm|yes/i).click();
        
        // Verify renewal was initiated
        cy.contains('Renewal initiated').should('be.visible');
      } else {
        cy.log('Verification is not expired or about to expire, skipping test');
      }
    });
  });

  it('should display verification history', () => {
    // Navigate to verification page
    cy.visit('/verification');
    
    // Click on history tab
    cy.contains('History').click();
    
    // Verify history section is visible
    cy.contains('Verification History').should('be.visible');
    
    // Check for history entries
    cy.get('[data-cy="verification-history-entry"]').should('have.length.at.least', 1);
  });
});
