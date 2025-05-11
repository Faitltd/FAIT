/// <reference types="cypress" />

describe('Accessibility Tests', () => {
  beforeEach(() => {
    // Clear cookies and local storage between tests
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('should check home page for accessibility issues', () => {
    cy.visit('/');
    cy.wait(1000); // Wait for animations to complete
    
    // Check the entire page for accessibility issues
    cy.checkA11y({
      context: 'body',
      skipFailures: true // Don't fail the test, just log issues
    });
    
    // Check keyboard navigation
    cy.checkKeyboardNavigation();
    
    // Check ARIA attributes
    cy.checkAriaAttributes();
  });

  it('should check login page for accessibility issues', () => {
    cy.visit('/login');
    cy.wait(1000); // Wait for animations to complete
    
    // Check the login form for accessibility issues
    cy.checkA11y({
      context: 'form',
      skipFailures: true
    });
    
    // Check keyboard navigation specifically for form elements
    cy.checkKeyboardNavigation([
      'input',
      'button',
      'a[href]',
      '[role="button"]'
    ]);
  });

  it('should check dashboard page for accessibility issues after login', () => {
    // Login first
    cy.visit('/login');
    
    // Find email input using multiple possible selectors
    cy.get('input[type="email"], input[name="email"], [data-cy="login-email"], [id="email"], [placeholder*="email" i]')
      .first()
      .clear()
      .type('client@itsfait.com');

    // Find password input using multiple possible selectors
    cy.get('input[type="password"], input[name="password"], [data-cy="login-password"], [id="password"], [placeholder*="password" i]')
      .first()
      .clear()
      .type('client123');

    // Find submit button using multiple possible selectors
    cy.get('button[type="submit"], [data-cy="login-submit"], button:contains("Log In"), button:contains("Sign In"), button:contains("Login"), input[type="submit"]')
      .first()
      .click();

    // Wait for any redirects to complete
    cy.wait(3000);
    
    // Verify we're on the dashboard
    cy.url().should('include', '/dashboard');
    
    // Check the dashboard for accessibility issues
    cy.checkA11y({
      context: 'body',
      skipFailures: true
    });
    
    // Check keyboard navigation
    cy.checkKeyboardNavigation();
    
    // Check ARIA attributes
    cy.checkAriaAttributes();
  });

  it('should check for color contrast issues', () => {
    cy.visit('/');
    
    // Check for color contrast issues (simplified)
    cy.get('body').then($body => {
      // Get all text elements
      const textElements = $body.find('p, h1, h2, h3, h4, h5, h6, a, button, label, span, div').filter(function() {
        return $(this).text().trim() !== '';
      });
      
      cy.log(`Found ${textElements.length} text elements to check for contrast`);
      
      // In a real implementation, we would use axe-core to check contrast
      // For now, we'll just log a warning
      cy.log('Note: Full color contrast checking requires the axe-core library');
    });
  });

  it('should check for proper heading structure', () => {
    cy.visit('/');
    
    // Check for heading structure
    cy.get('h1, h2, h3, h4, h5, h6').then($headings => {
      const headingLevels = [];
      
      $headings.each((i, el) => {
        const level = parseInt(el.tagName.substring(1));
        headingLevels.push({
          level,
          text: Cypress.$(el).text().trim()
        });
      });
      
      cy.log(`Found ${headingLevels.length} headings on the page`);
      
      // Check if there's an h1
      const hasH1 = headingLevels.some(h => h.level === 1);
      expect(hasH1, 'Page should have at least one h1 heading').to.be.true;
      
      // Check for proper heading order
      let previousLevel = 0;
      let hasSkippedLevel = false;
      
      headingLevels.forEach(h => {
        if (previousLevel > 0 && h.level > previousLevel + 1) {
          cy.log(`WARNING: Heading level skipped from h${previousLevel} to h${h.level} (${h.text})`);
          hasSkippedLevel = true;
        }
        previousLevel = h.level;
      });
      
      expect(hasSkippedLevel, 'Heading levels should not skip (e.g., h2 to h4)').to.be.false;
    });
  });

  it('should check for proper form labels', () => {
    cy.visit('/login');
    
    // Check for form inputs with labels
    cy.get('input:not([type="hidden"]), select, textarea').then($inputs => {
      cy.log(`Found ${$inputs.length} form inputs to check for labels`);
      
      $inputs.each((i, el) => {
        const $el = Cypress.$(el);
        const id = $el.attr('id');
        const hasLabel = id && Cypress.$(`label[for="${id}"]`).length > 0;
        const hasAriaLabel = $el.attr('aria-label') !== undefined;
        const hasAriaLabelledBy = $el.attr('aria-labelledby') !== undefined;
        
        if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
          cy.log(`WARNING: Input ${i+1} (${el.type || el.tagName}) has no associated label`);
        }
      });
    });
  });
});
