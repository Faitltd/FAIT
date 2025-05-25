/// <reference types="cypress" />

describe('Document Test', () => {
  it('should check document structure on login page', () => {
    cy.visit('/login');
    cy.screenshot('login-document');
    
    // Check if document has loaded
    cy.document().should('exist');
    
    // Log document title
    cy.title().then(title => {
      cy.log(`Page title: ${title}`);
    });
    
    // Check if body exists and log its content
    cy.get('body').should('exist').then($body => {
      cy.log(`Body content length: ${$body.html().length}`);
      cy.log(`Body text: ${$body.text().substring(0, 200)}...`);
      
      // Save body HTML to a file
      cy.writeFile('cypress/fixtures/login-body.html', $body.html());
    });
    
    // Check if there's a root element for React
    cy.get('#root, #app, [data-reactroot]').then($root => {
      if ($root.length) {
        cy.log(`Found root element: ${$root.attr('id') || 'no id'}`);
      } else {
        cy.log('No root element found');
      }
    });
  });
});
