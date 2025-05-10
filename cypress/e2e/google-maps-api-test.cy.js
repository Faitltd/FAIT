describe('Google Maps API Test', () => {
  it('should load the Google Maps API', () => {
    // Visit the direct map test page
    cy.visit('/direct-map-test');
    
    // Wait for the page to load
    cy.wait(5000);
    
    // Take a screenshot for debugging
    cy.screenshot('direct-map-test-loaded');
    
    // Check if Google Maps API is loaded
    cy.window().then((win) => {
      // Log if Google Maps is available
      cy.log(`Google Maps available: ${!!win.google && !!win.google.maps}`);
      
      // Check if Google Maps is available
      expect(win.google).to.exist;
      expect(win.google.maps).to.exist;
      
      // If Google Maps is available, check if there's a map instance
      if (win.google && win.google.maps) {
        // Look for any Google Maps elements
        const mapElements = win.document.querySelectorAll('.gm-style');
        cy.log(`Found ${mapElements.length} Google Maps elements`);
      }
    });
    
    // Try to find any Google Maps elements
    cy.get('.gm-style', { timeout: 10000 }).should('exist');
  });
});
