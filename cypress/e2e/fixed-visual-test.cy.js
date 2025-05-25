/// <reference types="cypress" />

describe('Visual Testing', () => {
  beforeEach(() => {
    // Clear cookies and local storage between tests
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('should visually check the home page', () => {
    cy.visit('/');
    cy.wait(1000); // Wait for animations to complete
    
    // Check the entire page
    cy.visualCheckPage('home', [
      'header',
      'nav',
      'main',
      'footer',
      'a.cta, button.cta, .cta-button', // Call to action buttons
      '.hero, .hero-section' // Hero section
    ]);
  });

  it('should visually check the login page', () => {
    cy.visit('/login');
    cy.wait(1000); // Wait for animations to complete
    
    // Check the entire page
    cy.visualCheckPage('login', [
      'form',
      'input[type="email"]',
      'input[type="password"]',
      'button[type="submit"]',
      '.login-options, .auth-options' // Additional login options
    ]);
  });

  it('should visually check responsive layouts', () => {
    // Test on mobile viewport
    cy.viewport('iphone-x');
    cy.visit('/');
    cy.wait(1000); // Wait for responsive adjustments
    cy.visualSnapshot('home-mobile');
    
    // Check mobile menu
    cy.get('button[aria-label="menu"], .hamburger, .menu-toggle, [data-cy="mobile-menu-toggle"]').then($menuToggle => {
      if ($menuToggle.length) {
        cy.wrap($menuToggle).click();
        cy.wait(500); // Wait for menu animation
        cy.visualSnapshot('mobile-menu-open');
      }
    });
    
    // Test on tablet viewport
    cy.viewport('ipad-2');
    cy.visit('/');
    cy.wait(1000); // Wait for responsive adjustments
    cy.visualSnapshot('home-tablet');
    
    // Test on desktop viewport
    cy.viewport('macbook-15');
    cy.visit('/');
    cy.wait(1000); // Wait for responsive adjustments
    cy.visualSnapshot('home-desktop');
  });

  it('should visually check dashboard after login', () => {
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
    
    // Check the dashboard visually
    cy.visualCheckPage('dashboard', [
      'header',
      'nav',
      '.dashboard-content, main',
      '.sidebar, .side-nav',
      '.user-info, .profile-info',
      '.dashboard-card, .card',
      '.stats, .dashboard-stats'
    ]);
  });

  it('should check for visual consistency in colors and typography', () => {
    cy.visit('/');
    
    // Check for consistent colors
    cy.get('body').then($body => {
      // Extract all background colors
      const backgroundColors = new Set();
      const textColors = new Set();
      const borderColors = new Set();
      
      $body.find('*').each((_, el) => {
        const $el = Cypress.$(el);
        const bgColor = $el.css('background-color');
        const textColor = $el.css('color');
        const borderColor = $el.css('border-color');
        
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
          backgroundColors.add(bgColor);
        }
        
        if (textColor) {
          textColors.add(textColor);
        }
        
        if (borderColor && borderColor !== 'rgb(0, 0, 0)') {
          borderColors.add(borderColor);
        }
      });
      
      cy.log(`Found ${backgroundColors.size} unique background colors`);
      cy.log(`Found ${textColors.size} unique text colors`);
      cy.log(`Found ${borderColors.size} unique border colors`);
      
      // Check if there are too many colors (might indicate inconsistency)
      expect(backgroundColors.size, 'Number of background colors should be reasonable').to.be.lessThan(20);
      expect(textColors.size, 'Number of text colors should be reasonable').to.be.lessThan(10);
    });
    
    // Check for consistent typography
    cy.get('body').then($body => {
      const fontFamilies = new Set();
      const fontSizes = new Set();
      
      $body.find('h1, h2, h3, h4, h5, h6, p, span, a, button').each((_, el) => {
        const $el = Cypress.$(el);
        const fontFamily = $el.css('font-family');
        const fontSize = $el.css('font-size');
        
        if (fontFamily) {
          fontFamilies.add(fontFamily);
        }
        
        if (fontSize) {
          fontSizes.add(fontSize);
        }
      });
      
      cy.log(`Found ${fontFamilies.size} unique font families`);
      cy.log(`Found ${fontSizes.size} unique font sizes`);
      
      // Check if there are too many font families or sizes (might indicate inconsistency)
      expect(fontFamilies.size, 'Number of font families should be reasonable').to.be.lessThan(5);
      expect(fontSizes.size, 'Number of font sizes should be reasonable').to.be.lessThan(15);
    });
  });
});
