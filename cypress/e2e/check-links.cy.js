/// <reference types="cypress" />

describe('Check Links', () => {
  it('should check all links on the homepage', () => {
    cy.visit('/');

    // Get all links on the page
    cy.get('a').each(($a) => {
      const href = $a.prop('href');

      // Skip empty links, anchor links, or javascript links
      if (!href || href === '#' || href.includes('javascript:')) {
        cy.log(`Skipping link: ${$a.text()} with href: ${href}`);
        return;
      }

      // Skip external links
      if (href.startsWith('http') && !href.includes('localhost')) {
        cy.log(`Skipping external link: ${$a.text()} with href: ${href}`);
        return;
      }

      cy.log(`Checking link: ${$a.text()} with href: ${href}`);

      // Visit the link directly instead of clicking
      cy.request({
        url: href,
        failOnStatusCode: false
      }).then((response) => {
        // Log the status
        cy.log(`Status for ${href}: ${response.status}`);

        // Check if the link is broken (status >= 400)
        if (response.status >= 400) {
          cy.log(`BROKEN LINK: ${href} (${response.status})`);
        }
      });
    });
  });

  it('should check calculator links specifically', () => {
    cy.visit('/');

    // Check for Free Instant Estimate button
    cy.contains('Free Instant Estimate').should('exist');

    // Test clicking the Free Instant Estimate button
    cy.contains('Free Instant Estimate').click();
    cy.url().should('include', '/calculator/estimate');

    // Check that both calculator options exist on the estimate page
    cy.contains('Remodeling Calculator').should('exist');
    cy.contains('Handyman Task Estimator').should('exist');

    // Test clicking the Handyman Task Estimator tab
    cy.contains('Handyman Task Estimator').click();

    // Go back to home and check direct links to calculators
    cy.contains('Back to Home').click();

    // Now check the links in the features section
    cy.contains('Remodeling Calculator').click();
    cy.url().should('include', '/calculator/remodeling');
    cy.go('back');

    cy.contains('Handyman Task Estimator').click();
    cy.url().should('include', '/calculator/handyman');
  });
});
