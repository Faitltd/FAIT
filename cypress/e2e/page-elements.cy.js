/// <reference types="cypress" />

describe('Page Elements Test', () => {
  it('should check elements on the login page', () => {
    cy.visit('/login');
    cy.screenshot('login-page-elements');
    
    // Log the entire HTML structure
    cy.document().then((doc) => {
      const html = doc.documentElement.outerHTML;
      cy.log('HTML Structure (first 1000 chars):');
      cy.log(html.substring(0, 1000));
      
      // Save HTML to a file for inspection
      cy.writeFile('cypress/fixtures/login-page.html', html);
    });
    
    // Log all input elements
    cy.get('input').each(($el, index) => {
      cy.log(`Input ${index}: type=${$el.attr('type')}, id=${$el.attr('id')}, name=${$el.attr('name')}, class=${$el.attr('class')}`);
    });
    
    // Log all button elements
    cy.get('button').each(($el, index) => {
      cy.log(`Button ${index}: type=${$el.attr('type')}, id=${$el.attr('id')}, text=${$el.text()}, class=${$el.attr('class')}`);
    });
    
    // Log all form elements
    cy.get('form').each(($el, index) => {
      cy.log(`Form ${index}: id=${$el.attr('id')}, class=${$el.attr('class')}`);
    });
  });
  
  it('should check elements on the home page', () => {
    cy.visit('/');
    cy.screenshot('home-page-elements');
    
    // Log the entire HTML structure
    cy.document().then((doc) => {
      const html = doc.documentElement.outerHTML;
      cy.log('HTML Structure (first 1000 chars):');
      cy.log(html.substring(0, 1000));
      
      // Save HTML to a file for inspection
      cy.writeFile('cypress/fixtures/home-page.html', html);
    });
    
    // Log all heading elements
    cy.get('h1, h2, h3').each(($el, index) => {
      cy.log(`Heading ${index}: tag=${$el.prop('tagName')}, text=${$el.text()}, class=${$el.attr('class')}`);
    });
    
    // Log all link elements
    cy.get('a').each(($el, index) => {
      cy.log(`Link ${index}: href=${$el.attr('href')}, text=${$el.text()}, class=${$el.attr('class')}`);
    });
  });
});
