describe('Services Search Map Test', () => {
  beforeEach(() => {
    // Visit the services search page with map view
    cy.visit('/services/search?zip=80111&radius=10&view=map');

    // Wait for the page to load - check for either the classic or enhanced UI
    cy.get('body').then($body => {
      // Give the page time to load
      cy.wait(2000);

      // Log what we're seeing for debugging
      cy.log('Checking page content');

      // Check if we can find any map-related elements
      const hasMapContainer = $body.find('.h-\\[600px\\]').length > 0;
      const hasMapPin = $body.find('[aria-label="Map view"]').length > 0;

      cy.log(`Map container found: ${hasMapContainer}`);
      cy.log(`Map pin icon found: ${hasMapPin}`);

      // If neither is found, we'll take a screenshot for debugging
      if (!hasMapContainer && !hasMapPin) {
        cy.screenshot('debug-page-content');
      }
    });
  });

  it('should load the services search page with map view', () => {
    // Check for either the classic or enhanced UI map toggle
    cy.get('body').then($body => {
      if ($body.find('button:contains("Map View")').length > 0) {
        // Classic UI
        cy.get('button').contains('Map View').should('exist');
        cy.get('button').contains('Map View').should('have.class', 'bg-blue-600');
      } else {
        // Enhanced UI
        cy.get('[aria-label="Map view"]').should('exist');
        cy.get('[aria-label="Map view"]').parent().should('have.class', 'bg-blue-50');
      }
    });
  });

  it('should display the map container', () => {
    // Check if the map container is visible - we added a border to make it easier to identify
    cy.get('div.border-blue-500').should('be.visible');

    // The map container should have a child div (the actual map)
    cy.get('div.border-blue-500 > div').should('exist');
  });

  it('should load Google Maps API and initialize the map', () => {
    // Wait for Google Maps to be available
    cy.window().then((win) => {
      // Use a timeout to wait for Google Maps to load
      cy.wait(5000).then(() => {
        // Check if Google Maps is available
        expect(win.google).to.exist;
        expect(win.google.maps).to.exist;
      });
    });

    // Wait for the map to initialize (debug overlay should be visible)
    cy.get('.absolute.bottom-4.right-4', { timeout: 10000 }).should('be.visible');

    // Check if the map status shows information
    cy.get('.absolute.bottom-4.right-4').contains('Map Status:').should('exist');
  });

  it('should handle zip code input and search', () => {
    // Find any input field that might be for zip code
    cy.get('input').then($inputs => {
      // Try to find the zip code input by various attributes
      const zipInput = $inputs.filter('[name="zipCode"], [placeholder*="ZIP"], [placeholder*="zip"], [aria-label*="ZIP"], [aria-label*="zip"]').first();

      if (zipInput.length) {
        cy.wrap(zipInput).clear().type('90210');

        // Find the closest form and submit it, or find a search button
        const form = zipInput.closest('form');
        if (form.length) {
          cy.wrap(form).submit();
        } else {
          cy.get('button').contains(/search|Search|SEARCH|find|Find|FIND/).click();
        }

        // URL should update with the new zip code
        cy.url().should('include', '90210');
      } else {
        cy.log('Could not find zip code input field');
      }
    });
  });

  it('should toggle between list and map views', () => {
    // Check which UI we're dealing with
    cy.get('body').then($body => {
      if ($body.find('button:contains("List View")').length > 0) {
        // Classic UI
        // Click on List View button
        cy.get('button').contains('List View').click();

        // URL should update to list view
        cy.url().should('include', 'view=list');

        // Map should not be visible
        cy.get('div.border-blue-500').should('not.exist');

        // Click on Map View button again
        cy.get('button').contains('Map View').click();

        // URL should update back to map view
        cy.url().should('include', 'view=map');

        // Map should be visible again
        cy.get('div.border-blue-500').should('be.visible');
      } else {
        // Enhanced UI
        // Click on List View button
        cy.get('[aria-label="List view"]').click();

        // URL should update to list view
        cy.url().should('include', 'viewMode=list');

        // Map should not be visible
        cy.get('div.border-blue-500').should('not.exist');

        // Click on Map View button again
        cy.get('[aria-label="Map view"]').click();

        // URL should update back to map view
        cy.url().should('include', 'viewMode=map');

        // Map should be visible again
        cy.get('div.border-blue-500').should('be.visible');
      }
    });
  });

  it('should display the debug overlay with map information', () => {
    // Check if the debug overlay exists
    cy.get('.absolute.bottom-4.right-4', { timeout: 10000 }).should('be.visible');

    // Verify it contains expected information
    cy.get('.absolute.bottom-4.right-4').contains('Map Status:').should('exist');
    cy.get('.absolute.bottom-4.right-4').contains('User Zip:').should('exist');
    cy.get('.absolute.bottom-4.right-4').contains('Services:').should('exist');
    cy.get('.absolute.bottom-4.right-4').contains('Locations:').should('exist');
    cy.get('.absolute.bottom-4.right-4').contains('Google Maps:').should('exist');
  });
});
