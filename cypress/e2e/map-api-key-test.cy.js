describe('Map API Key Test', () => {
  it('should have the Google Maps API key available', () => {
    // Visit the direct map test page
    cy.visit('/direct-map-test');
    
    // Wait for the page to load
    cy.wait(2000);
    
    // Take a screenshot for debugging
    cy.screenshot('api-key-test-loaded');
    
    // Check if the API key is displayed on the page
    cy.contains('API Key:').should('be.visible');
    
    // Check if the API key is not "Not found"
    cy.contains('API Key: Not found').should('not.exist');
    
    // Check if the environment variable is available
    cy.window().then((win) => {
      const apiKey = win.Cypress.env('VITE_GOOGLE_MAPS_API_KEY') || 
                    win.import?.meta?.env?.VITE_GOOGLE_MAPS_API_KEY;
      
      cy.log(`API Key from environment: ${apiKey ? 'Found' : 'Not found'}`);
      
      // Log all environment variables for debugging
      cy.log('Environment variables:');
      if (win.import && win.import.meta && win.import.meta.env) {
        Object.keys(win.import.meta.env).forEach(key => {
          if (key.includes('GOOGLE') || key.includes('MAP')) {
            cy.log(`${key}: ${win.import.meta.env[key] ? 'Value exists' : 'No value'}`);
          }
        });
      }
    });
  });
});
