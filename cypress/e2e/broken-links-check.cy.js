/// <reference types="cypress" />

// This test checks for broken links across the site
// It will log all links found and report any broken links (HTTP status >= 400)

describe('Broken Links Check', () => {
  // Store broken links for reporting
  const brokenLinks = [];
  it('should check all links on the homepage', () => {
    cy.visit('/');

    // Log all links on the page for debugging
    cy.get('a').each(($a) => {
      const text = $a.text().trim();
      const href = $a.prop('href');
      cy.log(`Link: "${text}" with href: ${href}`);
    });

    // Get all links on the page
    cy.get('a').each(($a) => {
      const href = $a.prop('href');
      const text = $a.text().trim();

      // Skip empty links, anchor links, or javascript links
      if (!href || href === '#' || href.includes('javascript:')) {
        cy.log(`Skipping link: ${text} with href: ${href}`);
        return;
      }

      // Skip external links
      if (href.startsWith('http') && !href.includes('localhost')) {
        cy.log(`Skipping external link: ${text} with href: ${href}`);
        return;
      }

      cy.log(`Checking link: ${text} with href: ${href}`);

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
          brokenLinks.push({ url: href, text: text, status: response.status });
        }
      });
    });
  });

  it('should check navigation links in the header', () => {
    cy.visit('/');

    // Get all links in the navigation and log them
    cy.get('nav a').each(($link) => {
      const href = $link.attr('href');
      const text = $link.text().trim();
      cy.log(`Navigation link: "${text}" with href: ${href}`);
    });

    // Check specific navigation links individually
    cy.contains('nav a', 'Home').then($link => {
      if ($link.length) {
        const href = $link.attr('href');
        cy.log(`Checking Home link with href: ${href}`);
        cy.request({
          url: href || '/',
          failOnStatusCode: false
        }).then((response) => {
          cy.log(`Status for Home link: ${response.status}`);
          if (response.status >= 400) {
            cy.log(`BROKEN LINK: Home (${response.status})`);
            brokenLinks.push({ url: href || '/', text: 'Home', status: response.status });
          }
        });
      }
    });

    cy.contains('nav a', 'Services').then($link => {
      if ($link.length) {
        const href = $link.attr('href');
        cy.log(`Checking Services link with href: ${href}`);
        cy.request({
          url: href,
          failOnStatusCode: false
        }).then((response) => {
          cy.log(`Status for Services link: ${response.status}`);
          if (response.status >= 400) {
            cy.log(`BROKEN LINK: Services (${response.status})`);
            brokenLinks.push({ url: href, text: 'Services', status: response.status });
          }
        });
      }
    });

    cy.contains('nav a', 'Projects').then($link => {
      if ($link.length) {
        const href = $link.attr('href');
        cy.log(`Checking Projects link with href: ${href}`);
        cy.request({
          url: href,
          failOnStatusCode: false
        }).then((response) => {
          cy.log(`Status for Projects link: ${response.status}`);
          if (response.status >= 400) {
            cy.log(`BROKEN LINK: Projects (${response.status})`);
            brokenLinks.push({ url: href, text: 'Projects', status: response.status });
          }
        });
      }
    });

    cy.contains('nav a', 'Login').then($link => {
      if ($link.length) {
        const href = $link.attr('href');
        cy.log(`Checking Login link with href: ${href}`);
        cy.request({
          url: href,
          failOnStatusCode: false
        }).then((response) => {
          cy.log(`Status for Login link: ${response.status}`);
          if (response.status >= 400) {
            cy.log(`BROKEN LINK: Login (${response.status})`);
            brokenLinks.push({ url: href, text: 'Login', status: response.status });
          }
        });
      }
    });
  });

  it('should check for calculator links', () => {
    cy.visit('/');

    // Log all links on the page to find calculator-related links
    cy.get('a').each(($a) => {
      const text = $a.text().trim();
      const href = $a.prop('href');

      if (text.includes('Estimate') || text.includes('Calculator') || text.includes('Estimator')) {
        cy.log(`Found calculator-related link: "${text}" with href: ${href}`);
      }
    });

    // Check for Free Instant Estimate link
    cy.get('a').contains('Free Instant Estimate', { matchCase: false }).then($link => {
      if ($link.length) {
        const href = $link.prop('href');
        cy.log(`Found Free Instant Estimate link: ${href}`);
        cy.request({
          url: href,
          failOnStatusCode: false
        }).then((response) => {
          cy.log(`Status for Free Instant Estimate: ${response.status}`);
          if (response.status >= 400) {
            cy.log(`BROKEN LINK: Free Instant Estimate (${response.status})`);
            brokenLinks.push({ url: href, text: 'Free Instant Estimate', status: response.status });
          }
        });
      } else {
        cy.log('Free Instant Estimate link not found');
      }
    });

    // Check for calculator links by URL pattern
    cy.get('a[href*="calculator"]').each(($link) => {
      const text = $link.text().trim();
      const href = $link.prop('href');
      cy.log(`Found calculator link by URL: "${text}" with href: ${href}`);

      cy.request({
        url: href,
        failOnStatusCode: false
      }).then((response) => {
        cy.log(`Status for ${text}: ${response.status}`);
        if (response.status >= 400) {
          cy.log(`BROKEN LINK: ${text} (${response.status})`);
          brokenLinks.push({ url: href, text: text, status: response.status });
        }
      });
    });
  });

  it('should check for Get Started button', () => {
    cy.visit('/');

    // Look for Get Started button
    cy.get('body').contains('Get Started', { matchCase: false }).then($link => {
      if ($link.length) {
        cy.log(`Found Get Started link: ${$link.prop('href')}`);
        cy.wrap($link).click();
        cy.url().then(url => {
          cy.log(`Navigated to: ${url}`);
        });
        cy.go('back');
      } else {
        cy.log('Get Started link not found');
      }
    });
  });

  it('should check for warranty page link', () => {
    cy.visit('/');

    // Look for warranty link in dropdown or footer
    cy.get('body').contains('Warranty', { matchCase: false }).then($link => {
      if ($link.length) {
        cy.log(`Found Warranty link: ${$link.prop('href')}`);
        cy.wrap($link).click();
        cy.url().then(url => {
          cy.log(`Navigated to: ${url}`);
        });
        cy.go('back');
      } else {
        cy.log('Warranty link not found in main content');

        // Try to find it in a dropdown menu
        cy.get('[data-testid="more-options-button"]').then($button => {
          if ($button.length) {
            cy.wrap($button).click();
            cy.get('[data-testid="dropdown-link-warranties"]').then($dropdownLink => {
              if ($dropdownLink.length) {
                cy.log(`Found Warranty link in dropdown: ${$dropdownLink.prop('href')}`);
                cy.wrap($dropdownLink).click();
                cy.url().then(url => {
                  cy.log(`Navigated to: ${url}`);
                });
              } else {
                cy.log('Warranty link not found in dropdown');
              }
            });
          } else {
            cy.log('More options button not found');
          }
        });
      }
    });
  });

  // Final test to report all broken links found
  it('should report all broken links', () => {
    cy.log('Broken Links Report:');
    cy.wrap(brokenLinks).then((links) => {
      if (links.length === 0) {
        cy.log('No broken links found!');
      } else {
        cy.log(`Found ${links.length} broken links:`);
        links.forEach((link, index) => {
          cy.log(`${index + 1}. "${link.text}" - ${link.url} (Status: ${link.status})`);
        });
      }
    });
  });
});
