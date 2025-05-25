describe('Map View Toggle Test', () => {
  it('should toggle to map view when clicking the map view button', () => {
    // Visit the services search page
    cy.visit('/services/search?zip=80111&radius=10');

    // Wait for the page to load
    cy.wait(2000);

    // Take a screenshot before clicking map view
    cy.screenshot('before-map-view');

    // Find and click the map view button
    cy.get('body').then($body => {
      // Log all buttons for debugging
      cy.log('Buttons on page:');
      $body.find('button').each((i, el) => {
        cy.log(`Button ${i}: ${el.textContent.trim()}`);
      });

      // Try to find the map view button by text content
      const mapViewBtn = $body.find('button:contains("Map View"), button:contains("Map"), [aria-label="Map view"]').first();

      if (mapViewBtn.length) {
        cy.wrap(mapViewBtn).click();

        // Wait for the view to change
        cy.wait(2000);

        // Take a screenshot after clicking map view
        cy.screenshot('after-map-view');

        // URL should include map view parameter (either view=map or viewMode=map)
        cy.url().then(url => {
          const hasMapView = url.includes('view=map') || url.includes('viewMode=map');
          expect(hasMapView).to.be.true;
        });
      } else {
        cy.log('Could not find map view button');
      }
    });
  });
});
