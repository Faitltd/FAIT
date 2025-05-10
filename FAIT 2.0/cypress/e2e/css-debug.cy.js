/// <reference types="cypress" />

describe('CSS and Styling Debug', () => {
  it('should check for CSS issues that might cause black screen', () => {
    cy.visit('/');
    
    // Check the root element
    cy.get('#root').then(($root) => {
      const computedStyle = window.getComputedStyle($root[0]);
      cy.log(`Root display: ${computedStyle.display}`);
      cy.log(`Root visibility: ${computedStyle.visibility}`);
      cy.log(`Root opacity: ${computedStyle.opacity}`);
      cy.log(`Root background-color: ${computedStyle.backgroundColor}`);
      cy.log(`Root color: ${computedStyle.color}`);
      cy.log(`Root width: ${computedStyle.width}`);
      cy.log(`Root height: ${computedStyle.height}`);
      
      // Check if the root element has any children
      cy.log(`Root has ${$root[0].childNodes.length} child nodes`);
      
      // Take a screenshot
      cy.screenshot('root-element');
    });
    
    // Check for any elements with display: none, visibility: hidden, or opacity: 0
    cy.document().then((doc) => {
      const allElements = doc.querySelectorAll('*');
      let hiddenElements = [];
      
      for (let i = 0; i < allElements.length; i++) {
        const element = allElements[i];
        const style = window.getComputedStyle(element);
        
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
          hiddenElements.push({
            tag: element.tagName,
            id: element.id,
            class: element.className,
            display: style.display,
            visibility: style.visibility,
            opacity: style.opacity
          });
        }
      }
      
      cy.log(`Found ${hiddenElements.length} hidden elements`);
      if (hiddenElements.length > 0) {
        cy.log(`First 10 hidden elements: ${JSON.stringify(hiddenElements.slice(0, 10))}`);
      }
    });
  });

  it('should check for z-index issues', () => {
    cy.visit('/');
    
    // Check for elements with high z-index that might be covering content
    cy.document().then((doc) => {
      const allElements = doc.querySelectorAll('*');
      let highZIndexElements = [];
      
      for (let i = 0; i < allElements.length; i++) {
        const element = allElements[i];
        const style = window.getComputedStyle(element);
        const zIndex = parseInt(style.zIndex);
        
        if (!isNaN(zIndex) && zIndex > 10) {
          highZIndexElements.push({
            tag: element.tagName,
            id: element.id,
            class: element.className,
            zIndex: zIndex,
            position: style.position
          });
        }
      }
      
      cy.log(`Found ${highZIndexElements.length} elements with high z-index`);
      if (highZIndexElements.length > 0) {
        cy.log(`Elements with high z-index: ${JSON.stringify(highZIndexElements)}`);
      }
    });
  });

  it('should check for elements covering the entire viewport', () => {
    cy.visit('/');
    
    // Check for elements that might be covering the entire viewport
    cy.document().then((doc) => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const allElements = doc.querySelectorAll('*');
      let largeElements = [];
      
      for (let i = 0; i < allElements.length; i++) {
        const element = allElements[i];
        const rect = element.getBoundingClientRect();
        
        // Check if element covers most of the viewport
        if (rect.width > viewportWidth * 0.9 && rect.height > viewportHeight * 0.9) {
          largeElements.push({
            tag: element.tagName,
            id: element.id,
            class: element.className,
            width: rect.width,
            height: rect.height,
            backgroundColor: window.getComputedStyle(element).backgroundColor
          });
        }
      }
      
      cy.log(`Found ${largeElements.length} elements covering most of the viewport`);
      if (largeElements.length > 0) {
        cy.log(`Large elements: ${JSON.stringify(largeElements)}`);
      }
    });
  });
});
