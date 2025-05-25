describe('Services Page Load Test', () => {
  it('should load the services search page', () => {
    // Visit the services search page
    cy.visit('/services/search?zip=80111&radius=10');
    
    // Wait for the page to load
    cy.wait(2000);
    
    // Take a screenshot for debugging
    cy.screenshot('services-page-loaded');
    
    // Check if the page has loaded by looking for common elements
    cy.get('body').then($body => {
      // Log what we find for debugging
      cy.log(`Page title: ${$body.find('title').text()}`);
      cy.log(`H1 elements: ${$body.find('h1').length}`);
      cy.log(`H2 elements: ${$body.find('h2').length}`);
      cy.log(`Button elements: ${$body.find('button').length}`);
      cy.log(`Input elements: ${$body.find('input').length}`);
      
      // Log all text content for debugging
      cy.log('Text content:');
      $body.find('h1, h2, h3, button').each((i, el) => {
        cy.log(`${el.tagName}: ${el.textContent.trim()}`);
      });
    });
    
    // Check if there are any buttons on the page
    cy.get('button').should('exist');
    
    // Check if there are any inputs on the page
    cy.get('input').should('exist');
  });
});
