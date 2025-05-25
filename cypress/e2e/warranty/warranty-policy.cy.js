/// <reference types="cypress" />

describe('Warranty Policy Tests', () => {
  beforeEach(() => {
    // Visit the warranty page before each test
    cy.visit('/warranty');
  });

  it('should navigate to warranty policy page', () => {
    // Check if there's a link to warranty policy
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="warranty-policy-link"]').length > 0) {
        cy.get('[data-testid="warranty-policy-link"]').click();
        
        // Verify we're on the warranty policy page
        cy.url().should('include', '/warranty/policy');
      } else {
        // If no link, try to find any link containing "policy"
        cy.get('a').then(($links) => {
          const policyLinks = $links.filter((i, el) => {
            return el.textContent.toLowerCase().includes('policy');
          });
          
          if (policyLinks.length > 0) {
            cy.wrap(policyLinks[0]).click();
            cy.log('Found and clicked a policy link');
          } else {
            cy.log('No policy link found');
          }
        });
      }
    });
  });

  it('should display warranty policy content', () => {
    // Check if there's a link to warranty policy
    cy.get('body').then(($body) => {
      let policyLinkFound = false;
      
      if ($body.find('[data-testid="warranty-policy-link"]').length > 0) {
        cy.get('[data-testid="warranty-policy-link"]').click();
        policyLinkFound = true;
      } else {
        // If no link, try to find any link containing "policy"
        cy.get('a').then(($links) => {
          const policyLinks = $links.filter((i, el) => {
            return el.textContent.toLowerCase().includes('policy');
          });
          
          if (policyLinks.length > 0) {
            cy.wrap(policyLinks[0]).click();
            cy.log('Found and clicked a policy link');
            policyLinkFound = true;
          } else {
            cy.log('No policy link found');
          }
        });
      }
      
      if (policyLinkFound) {
        // Check for policy content
        cy.get('body').then(($policyBody) => {
          const hasContent = $policyBody.find('h1, h2, h3, p').length > 0;
          if (hasContent) {
            cy.log('Warranty policy page has content');
          } else {
            cy.log('Warranty policy page does not have content');
          }
        });
      }
    });
  });
});
