describe('Simple Map Test', () => {
  it('should load the map on the services search page', () => {
    // Visit the services search page with map view
    cy.visit('/services/search?zip=80111&radius=10&view=map');
    
    // Wait for the page to load
    cy.wait(5000);
    
    // Take a screenshot for debugging
    cy.screenshot('map-page-loaded');
    
    // Check if Google Maps API is loaded
    cy.window().then((win) => {
      // Log if Google Maps is available
      cy.log(`Google Maps available: ${!!win.google && !!win.google.maps}`);
      
      // If Google Maps is available, check if there's a map instance
      if (win.google && win.google.maps) {
        // Look for any Google Maps elements
        const mapElements = win.document.querySelectorAll('.gm-style');
        cy.log(`Found ${mapElements.length} Google Maps elements`);
      }
    });
    
    // Check for any map-related elements
    cy.get('body').then($body => {
      // Log what we find for debugging
      cy.log(`Map container with border-blue-500: ${$body.find('div.border-blue-500').length}`);
      cy.log(`Map container with border-red-500: ${$body.find('div.border-red-500').length}`);
      cy.log(`Google Maps elements: ${$body.find('.gm-style').length}`);
      cy.log(`Debug overlay: ${$body.find('.absolute.bottom-4.right-4').length}`);
    });
    
    // Try to find any Google Maps elements
    cy.get('.gm-style', { timeout: 10000 }).should('exist');
  });
});
