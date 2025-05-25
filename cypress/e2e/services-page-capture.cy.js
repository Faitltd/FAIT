describe('Services Page Content Capture', () => {
  it('should capture the content of the services page', () => {
    // Visit the services page
    cy.visit('/services');
    
    // Take a screenshot
    cy.screenshot('services-page-content');
    
    // Log the page title
    cy.title().then((title) => {
      cy.log(`Page title: ${title}`);
    });
    
    // Log all headings on the page
    cy.get('h1, h2, h3, h4, h5, h6').each(($el) => {
      cy.log(`Heading: ${$el.text()}`);
    });
    
    // Log all buttons on the page
    cy.get('button').each(($el) => {
      cy.log(`Button: ${$el.text()}`);
    });
    
    // Log all links on the page
    cy.get('a').each(($el) => {
      cy.log(`Link: ${$el.text()} - ${$el.attr('href')}`);
    });
    
    // Log all form elements
    cy.get('form').each(($el, index) => {
      cy.log(`Form ${index + 1} found`);
    });
    
    // Verify the page loaded successfully
    cy.url().should('include', '/services');
  });
});
