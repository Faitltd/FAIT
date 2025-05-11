/// <reference types="cypress" />

describe('Performance', () => {
  it('should load home page quickly', () => {
    // Start performance measurement
    const start = performance.now();
    
    // Visit the home page
    cy.visit('/');
    
    // Wait for page to load
    cy.get('body').should('be.visible').then(() => {
      // End performance measurement
      const end = performance.now();
      const loadTime = end - start;
      
      // Log load time
      cy.log(`Home page load time: ${loadTime}ms`);
      
      // Assert that load time is reasonable (adjust threshold as needed)
      expect(loadTime).to.be.lessThan(10000); // 10 seconds
    });
  });

  it('should load login page quickly', () => {
    // Start performance measurement
    const start = performance.now();
    
    // Visit the login page
    cy.visit('/login');
    
    // Wait for page to load
    cy.get('form').should('be.visible').then(() => {
      // End performance measurement
      const end = performance.now();
      const loadTime = end - start;
      
      // Log load time
      cy.log(`Login page load time: ${loadTime}ms`);
      
      // Assert that load time is reasonable (adjust threshold as needed)
      expect(loadTime).to.be.lessThan(5000); // 5 seconds
    });
  });

  it('should load services page quickly', () => {
    // Start performance measurement
    const start = performance.now();
    
    // Visit the services page
    cy.visit('/services');
    
    // Wait for page to load
    cy.get('body').should('be.visible').then(() => {
      // End performance measurement
      const end = performance.now();
      const loadTime = end - start;
      
      // Log load time
      cy.log(`Services page load time: ${loadTime}ms`);
      
      // Assert that load time is reasonable (adjust threshold as needed)
      expect(loadTime).to.be.lessThan(5000); // 5 seconds
    });
  });

  it('should navigate between pages quickly', () => {
    // Visit the home page
    cy.visit('/');
    
    // Start performance measurement
    const start = performance.now();
    
    // Navigate to login page
    cy.contains('a', 'Login').click();
    
    // Wait for page to load
    cy.get('form').should('be.visible').then(() => {
      // End performance measurement
      const end = performance.now();
      const navigationTime = end - start;
      
      // Log navigation time
      cy.log(`Navigation time: ${navigationTime}ms`);
      
      // Assert that navigation time is reasonable (adjust threshold as needed)
      expect(navigationTime).to.be.lessThan(3000); // 3 seconds
    });
  });
});
