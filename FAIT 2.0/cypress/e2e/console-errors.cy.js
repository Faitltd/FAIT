/// <reference types="cypress" />

describe('Console Error Check', () => {
  it('should check for JavaScript errors', () => {
    // Array to store console errors
    const consoleErrors = [];
    
    // Listen for console errors
    cy.on('window:console', (msg) => {
      if (msg.type === 'error') {
        consoleErrors.push(msg.message);
        cy.log(`Console Error: ${msg.message}`);
      }
    });
    
    // Visit the page
    cy.visit('/', {
      onBeforeLoad(win) {
        // Stub console.error
        cy.stub(win.console, 'error').callsFake((msg) => {
          consoleErrors.push(msg);
          cy.log(`Console Error: ${msg}`);
        });
      },
    });
    
    // Wait for page to load
    cy.wait(5000);
    
    // Check if there were any console errors
    cy.wrap(consoleErrors).then((errors) => {
      if (errors.length > 0) {
        cy.log(`Found ${errors.length} console errors`);
        errors.forEach((error, index) => {
          cy.log(`Error ${index + 1}: ${error}`);
        });
      } else {
        cy.log('No console errors detected');
      }
    });
    
    // Take a screenshot
    cy.screenshot('after-console-check');
  });
  
  it('should check for React-specific errors', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        // Add error event listener
        win.addEventListener('error', (e) => {
          cy.log(`Uncaught error: ${e.message}`);
        });
        
        // Add unhandled rejection listener
        win.addEventListener('unhandledrejection', (e) => {
          cy.log(`Unhandled promise rejection: ${e.reason}`);
        });
      },
    });
    
    // Wait for React to attempt to render
    cy.wait(5000);
    
    // Check for React error boundary elements
    cy.get('body').then(($body) => {
      // Look for common React error patterns in the DOM
      const hasReactError = $body.text().includes('Error:') || 
                           $body.text().includes('Something went wrong') ||
                           $body.text().includes('failed to compile') ||
                           $body.text().includes('Cannot find module');
      
      if (hasReactError) {
        cy.log('Detected possible React error message in the DOM');
      }
    });
    
    // Take a screenshot
    cy.screenshot('after-react-error-check');
  });
});
