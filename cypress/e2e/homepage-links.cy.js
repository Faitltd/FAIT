/// <reference types="cypress" />

describe('Homepage Links Test', () => {
  beforeEach(() => {
    // Visit the home page before each test
    cy.visit('/');
    
    // Wait for the page to load
    cy.wait(2000);
  });

  it('should have working navigation links in the header', () => {
    // Get all links in the navigation
    cy.get('nav a').each(($link) => {
      // Skip links with no href or # href
      const href = $link.attr('href');
      if (!href || href === '#' || href.startsWith('javascript:')) {
        cy.log(`Skipping link with href: ${href}`);
        return;
      }
      
      // Log the link we're checking
      cy.log(`Checking link: ${$link.text()} with href: ${href}`);
      
      // Click the link
      cy.wrap($link).click();
      
      // Check that the page loaded successfully
      cy.get('body').should('be.visible');
      
      // Go back to the home page
      cy.go('back');
    });
  });

  it('should have working links in the main content area', () => {
    // Get all links in the main content area (excluding nav and footer)
    cy.get('main a, .content a, #root > div > div:not(nav):not(footer) a').each(($link) => {
      // Skip links with no href or # href
      const href = $link.attr('href');
      if (!href || href === '#' || href.startsWith('javascript:')) {
        cy.log(`Skipping link with href: ${href}`);
        return;
      }
      
      // Skip external links
      if (href.startsWith('http') && !href.includes('localhost')) {
        cy.log(`Skipping external link: ${href}`);
        return;
      }
      
      // Log the link we're checking
      cy.log(`Checking link: ${$link.text()} with href: ${href}`);
      
      // Click the link
      cy.wrap($link).click();
      
      // Check that the page loaded successfully
      cy.get('body').should('be.visible');
      
      // Go back to the home page
      cy.go('back');
    });
  });

  it('should have working links in the footer', () => {
    // Get all links in the footer
    cy.get('footer a').each(($link) => {
      // Skip links with no href or # href
      const href = $link.attr('href');
      if (!href || href === '#' || href.startsWith('javascript:')) {
        cy.log(`Skipping link with href: ${href}`);
        return;
      }
      
      // Skip external links
      if (href.startsWith('http') && !href.includes('localhost')) {
        cy.log(`Skipping external link: ${href}`);
        return;
      }
      
      // Log the link we're checking
      cy.log(`Checking link: ${$link.text()} with href: ${href}`);
      
      // Click the link
      cy.wrap($link).click();
      
      // Check that the page loaded successfully
      cy.get('body').should('be.visible');
      
      // Go back to the home page
      cy.go('back');
    });
  });

  it('should have working calculator links', () => {
    // Specifically check the calculator links
    cy.contains('a', 'Remodeling Calculator').should('be.visible').click();
    cy.url().should('include', '/calculator/remodeling');
    cy.go('back');
    
    cy.contains('a', 'Handyman Task Estimator').should('be.visible').click();
    cy.url().should('include', '/calculator/handyman');
    cy.go('back');
    
    cy.contains('a', 'Free Instant Estimate').should('be.visible').click();
    cy.url().should('include', '/calculator/estimate');
    cy.go('back');
  });
});
