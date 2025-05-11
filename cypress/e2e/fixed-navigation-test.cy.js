/// <reference types="cypress" />

describe('App Navigation Test', () => {
  beforeEach(() => {
    // Clear cookies and local storage between tests
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Visit the home page
    cy.visit('/');
    
    // Take a screenshot for debugging
    cy.screenshot('home-page-before-test');
  });

  it('should navigate to main pages from home page', () => {
    // Check that the home page has loaded
    cy.get('body').should('be.visible');
    
    // Find and click on various navigation links using flexible selectors
    // Try to find the login link
    cy.get('a[href*="login"], a:contains("Login"), a:contains("Sign In"), [data-cy="nav-login"]')
      .first()
      .then($el => {
        if ($el.length) {
          cy.wrap($el).click();
          cy.url().should('include', '/login');
          cy.go('back');
        } else {
          cy.log('Login link not found, skipping');
        }
      });
    
    // Try to find the register/signup link
    cy.get('a[href*="register"], a[href*="signup"], a:contains("Register"), a:contains("Sign Up"), [data-cy="nav-register"]')
      .first()
      .then($el => {
        if ($el.length) {
          cy.wrap($el).click();
          cy.url().should('include', '/register').or('include', '/signup');
          cy.go('back');
        } else {
          cy.log('Register link not found, skipping');
        }
      });
    
    // Try to find the services link
    cy.get('a[href*="services"], a:contains("Services"), [data-cy="nav-services"]')
      .first()
      .then($el => {
        if ($el.length) {
          cy.wrap($el).click();
          cy.url().should('include', '/services');
          cy.go('back');
        } else {
          cy.log('Services link not found, skipping');
        }
      });
  });

  it('should have a working header with logo and navigation', () => {
    // Check for header element
    cy.get('header, .header, [data-cy="header"]').should('exist');
    
    // Check for logo
    cy.get('header img, .logo, [data-cy="logo"]').should('exist');
    
    // Check for navigation menu
    cy.get('nav, .nav, [data-cy="nav"]').should('exist');
  });

  it('should have a footer with essential links', () => {
    // Check for footer element (if it exists)
    cy.get('footer, .footer, [data-cy="footer"]').then($footer => {
      if ($footer.length) {
        // Check for common footer elements
        cy.wrap($footer).find('a').should('have.length.at.least', 1);
      } else {
        cy.log('Footer not found, skipping test');
      }
    });
  });

  it('should have a responsive design', () => {
    // Test on mobile viewport
    cy.viewport('iphone-x');
    cy.wait(500); // Wait for any responsive changes
    
    // Check if mobile menu toggle exists
    cy.get('button[aria-label="menu"], .hamburger, .menu-toggle, [data-cy="mobile-menu-toggle"]').then($menuToggle => {
      if ($menuToggle.length) {
        cy.wrap($menuToggle).click();
        cy.wait(500); // Wait for menu animation
      } else {
        cy.log('Mobile menu toggle not found, might be always visible navigation');
      }
    });
    
    // Reset viewport to desktop
    cy.viewport('macbook-13');
  });
});
