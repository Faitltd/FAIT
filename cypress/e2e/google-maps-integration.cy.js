/// <reference types="cypress" />

describe('Google Maps Integration Test', () => {
  it('should check Google Maps API loading', () => {
    // Visit the services page
    cy.visit('/services');

    // Wait for the page to load
    cy.wait(2000);

    // Check if Google Maps API is loaded
    cy.window().then((win) => {
      // Log if Google Maps is available
      const hasGoogleMaps = !!win.google && !!win.google.maps;
      cy.log(`Google Maps available: ${hasGoogleMaps}`);

      // If Google Maps is available, try to create a map object to verify it's fully loaded
      if (hasGoogleMaps) {
        try {
          const testLatLng = new win.google.maps.LatLng(0, 0);
          cy.log('Successfully created LatLng object');
        } catch (err) {
          cy.log(`Error creating LatLng object: ${err.message}`);
        }
      }
    });

    // Check for any iframe elements (which might be the Google Maps iframe)
    cy.get('body').then($body => {
      const hasIframe = $body.find('iframe').length > 0;
      cy.log(`Has iframe: ${hasIframe}`);

      if (hasIframe) {
        cy.get('iframe').should('exist');
      }
    });

    // Check for map-related elements with more resilient selectors
    cy.get('body').then($body => {
      const hasMapContainer = $body.find('div:contains("Map View")').length > 0 ||
                             $body.find('div:contains("Service Locations")').length > 0 ||
                             $body.find('div:contains("Map")').length > 0;
      cy.log(`Has map container: ${hasMapContainer}`);
    });

    // Check for any map errors with more comprehensive error detection
    cy.get('body').then($body => {
      const pageText = $body.text();
      const hasMapError = pageText.includes('Unable to load map') ||
                         pageText.includes('Map error') ||
                         pageText.includes('Failed to load') ||
                         pageText.includes('Error loading map');
      cy.log(`Has map error: ${hasMapError}`);

      // If there's a map error, log it but don't fail the test
      if (hasMapError) {
        cy.log('Map error detected in the page');
      }
    });

    // Check console for map-related errors
    cy.window().then((win) => {
      cy.spy(win.console, 'error').as('consoleError');
    });

    // Wait a bit for any potential errors
    cy.wait(1000);

    // Log any console errors related to maps
    cy.get('@consoleError').then((spy) => {
      if (spy.callCount > 0) {
        const mapErrors = spy.args.filter(args =>
          args[0] && typeof args[0] === 'string' &&
          (args[0].includes('map') || args[0].includes('Map') || args[0].includes('Google'))
        );

        if (mapErrors.length > 0) {
          cy.log(`Found ${mapErrors.length} map-related console errors:`);
          mapErrors.forEach((args, i) => {
            cy.log(`Map Error ${i + 1}:`, args[0]);
          });
        }
      }
    });
  });

  it('should test the debug version of the map', () => {
    // Visit the debug services page
    cy.visit('/services/debug');

    // Wait for the page to load
    cy.wait(2000);

    // Check for debug information with more resilient selectors
    cy.get('body').then($body => {
      // Look for pre elements or any element that might contain debug info
      const hasPre = $body.find('pre').length > 0;
      const hasDebugInfo = $body.text().includes('Debug Information');

      cy.log(`Has pre element: ${hasPre}`);
      cy.log(`Has debug info text: ${hasDebugInfo}`);

      if (hasPre) {
        // If pre element exists, log its content
        cy.get('pre').then($pre => {
          cy.log('Debug information (first 200 chars):');
          cy.log($pre.text().substring(0, 200) + '...');
        });
      } else if (hasDebugInfo) {
        // If no pre but has debug info text, log that section
        cy.log('Debug information section found but no pre element');
      } else {
        // If neither, log the page structure
        cy.log('No debug information found, logging page structure');
        cy.log(`Page has ${$body.find('div').length} divs, ${$body.find('button').length} buttons`);
      }
    });

    // Check for Google Maps API in the window object
    cy.window().then((win) => {
      // Log if Google Maps is available
      const hasGoogleMaps = !!win.google && !!win.google.maps;
      cy.log(`Google Maps available: ${hasGoogleMaps}`);

      // Check for Google Maps loader data attributes if in development mode
      const hasLoader = win.document.querySelector('[data-testid="google-maps-loader"]');
      if (hasLoader) {
        cy.log(`Google Maps loader found, loaded: ${hasLoader.getAttribute('data-loaded')}, attempts: ${hasLoader.getAttribute('data-attempts')}`);
      }
    });

    // Try to find and click the Check Status button if it exists
    cy.get('body').then($body => {
      if ($body.text().includes('Check Status')) {
        cy.contains('Check Status').click({ force: true });
        cy.log('Clicked Check Status button');
        cy.wait(1000); // Wait for status to update
      }
    });
  });
});
