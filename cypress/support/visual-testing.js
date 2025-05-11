// Visual testing utilities for Cypress tests

/**
 * Takes a screenshot with a standardized naming convention and logs the action
 * @param {string} name - Base name for the screenshot
 * @param {Object} options - Options for the screenshot
 */
Cypress.Commands.add('visualSnapshot', (name, options = {}) => {
  const defaultOptions = {
    capture: 'viewport', // or 'fullPage'
    padding: [0, 0, 0, 0], // top, right, bottom, left
    blackout: [],
    threshold: 0.1, // Threshold for visual comparison (if using visual testing plugin)
    prefix: ''
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotName = `${mergedOptions.prefix ? mergedOptions.prefix + '-' : ''}${name}-${timestamp}`;
  
  cy.log(`Taking visual snapshot: ${screenshotName}`);
  cy.screenshot(screenshotName, {
    capture: mergedOptions.capture,
    padding: mergedOptions.padding,
    blackout: mergedOptions.blackout
  });
});

/**
 * Checks if an element is visually rendered correctly
 * @param {string} selector - Element selector
 * @param {string} name - Name for the screenshot
 * @param {Object} options - Options for the visual check
 */
Cypress.Commands.add('visualCheckElement', (selector, name, options = {}) => {
  cy.get(selector).then($el => {
    if ($el.length) {
      // Check if element is visible
      const isVisible = $el.is(':visible');
      cy.log(`Element ${selector} visibility: ${isVisible}`);
      
      if (isVisible) {
        // Check dimensions
        const width = $el.outerWidth();
        const height = $el.outerHeight();
        cy.log(`Element ${selector} dimensions: ${width}x${height}px`);
        
        // Check position
        const position = $el.position();
        cy.log(`Element ${selector} position: x=${position.left}, y=${position.top}`);
        
        // Check if element has content
        const hasContent = $el.text().trim().length > 0 || $el.find('img').length > 0;
        cy.log(`Element ${selector} has content: ${hasContent}`);
        
        // Take screenshot of the element
        cy.wrap($el).scrollIntoView();
        cy.visualSnapshot(`element-${name}`, {
          padding: [10, 10, 10, 10],
          ...options
        });
      } else {
        cy.log(`WARNING: Element ${selector} is not visible`);
      }
    } else {
      cy.log(`WARNING: Element ${selector} not found`);
    }
  });
});

/**
 * Checks the visual state of a page
 * @param {string} pageName - Name of the page
 * @param {Array} elementSelectors - Array of element selectors to check individually
 * @param {Object} options - Options for the visual check
 */
Cypress.Commands.add('visualCheckPage', (pageName, elementSelectors = [], options = {}) => {
  // Take full page screenshot
  cy.visualSnapshot(`page-${pageName}`, {
    capture: 'fullPage',
    prefix: 'full',
    ...options
  });
  
  // Check individual elements
  elementSelectors.forEach(selector => {
    const selectorName = selector.replace(/[^a-zA-Z0-9]/g, '-');
    cy.visualCheckElement(selector, `${pageName}-${selectorName}`, options);
  });
  
  // Check for visual issues
  cy.get('body').then($body => {
    // Check for overlapping elements
    const overlappingElements = findOverlappingElements($body);
    if (overlappingElements.length > 0) {
      cy.log(`WARNING: Found ${overlappingElements.length} potentially overlapping elements`);
      overlappingElements.forEach(pair => {
        cy.log(`Overlap: ${pair[0].tagName} and ${pair[1].tagName}`);
      });
    }
    
    // Check for elements that might be cut off
    const cutOffElements = findPotentiallyCutOffElements($body);
    if (cutOffElements.length > 0) {
      cy.log(`WARNING: Found ${cutOffElements.length} potentially cut-off elements`);
      cutOffElements.forEach(el => {
        cy.log(`Cut-off: ${el.tagName} at position ${el.getBoundingClientRect().top}px`);
      });
    }
  });
});

// Helper function to find potentially overlapping elements
function findOverlappingElements($body) {
  const overlappingPairs = [];
  const interactiveElements = $body.find('button, a, input, select, textarea, [role="button"]').toArray();
  
  for (let i = 0; i < interactiveElements.length; i++) {
    const el1 = interactiveElements[i];
    const rect1 = el1.getBoundingClientRect();
    
    for (let j = i + 1; j < interactiveElements.length; j++) {
      const el2 = interactiveElements[j];
      const rect2 = el2.getBoundingClientRect();
      
      // Check if elements overlap
      if (!(rect1.right < rect2.left || 
            rect1.left > rect2.right || 
            rect1.bottom < rect2.top || 
            rect1.top > rect2.bottom)) {
        overlappingPairs.push([el1, el2]);
      }
    }
  }
  
  return overlappingPairs;
}

// Helper function to find elements that might be cut off
function findPotentiallyCutOffElements($body) {
  const cutOffElements = [];
  const elements = $body.find('*').toArray();
  const viewportHeight = Cypress.config('viewportHeight');
  const viewportWidth = Cypress.config('viewportWidth');
  
  elements.forEach(el => {
    const rect = el.getBoundingClientRect();
    
    // Element is partially outside viewport
    if ((rect.bottom > 0 && rect.bottom < 20) || 
        (rect.right > 0 && rect.right < 20) ||
        (rect.top < viewportHeight && rect.top > viewportHeight - 20) ||
        (rect.left < viewportWidth && rect.left > viewportWidth - 20)) {
      cutOffElements.push(el);
    }
  });
  
  return cutOffElements;
}
