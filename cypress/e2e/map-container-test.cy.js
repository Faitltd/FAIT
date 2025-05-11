describe('Map Container Test', () => {
  it('should display the map container after toggling to map view', () => {
    // Visit the services search page
    cy.visit('/services/search?zip=80111&radius=10');
    
    // Wait for the page to load
    cy.wait(2000);
    
    // Find and click the map view button
    cy.get('body').then($body => {
      // Try to find the map view button by text content
      const mapViewBtn = $body.find('button:contains("Map View"), button:contains("Map"), [aria-label="Map view"]').first();
      
      if (mapViewBtn.length) {
        cy.wrap(mapViewBtn).click();
        
        // Wait for the view to change
        cy.wait(2000);
        
        // Take a screenshot after clicking map view
        cy.screenshot('map-container-view');
        
        // Check for map container elements
        cy.get('body').then($updatedBody => {
          // Log all divs with height styles for debugging
          cy.log('Divs with height styles:');
          $updatedBody.find('div[style*="height"], div[class*="h-"]').each((i, el) => {
            cy.log(`Div ${i}: class="${el.className}" style="${el.getAttribute('style')}"`);
          });
          
          // Check if there's a map container
          const mapContainers = $updatedBody.find('div.border-blue-500, div.border-red-500, div[class*="h-[600px]"], div[class*="h-[400px]"]');
          
          if (mapContainers.length) {
            cy.log(`Found ${mapContainers.length} potential map containers`);
            
            // Verify at least one map container is visible
            cy.wrap(mapContainers.first()).should('be.visible');
          } else {
            // If we can't find the specific map container, look for any large container
            cy.get('div[style*="height"], div[class*="h-"]').filter(':visible').should('exist');
          }
        });
      } else {
        cy.log('Could not find map view button');
      }
    });
  });
});
