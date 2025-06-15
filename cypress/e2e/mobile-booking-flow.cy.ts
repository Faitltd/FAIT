describe('Mobile Booking Flow', () => {
  beforeEach(() => {
    // Set mobile viewport (iPhone SE dimensions)
    cy.viewport(375, 667);

    // Mock geolocation
    cy.window().then((win) => {
      cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake((success) => {
        success({
          coords: {
            latitude: 39.7392,
            longitude: -104.9903,
            accuracy: 10
          },
          timestamp: Date.now()
        });
      });
    });

    // Mock successful API responses
    cy.intercept('GET', '/api/search/services*', {
      fixture: 'mobile-services.json'
    }).as('searchServices');

    cy.intercept('POST', '/api/bookings/quick', {
      statusCode: 200,
      body: {
        id: 'booking-123',
        status: 'confirmed',
        total_amount: 150,
        scheduled_date: '2024-01-15',
        scheduled_time: '10:00'
      }
    }).as('createBooking');

    // Visit the mobile services page
    cy.visit('/services/mobile');
  });

  it('should complete mobile booking flow', () => {
    // Visit services page
    cy.visit('/services/mobile');

    // Check mobile header is visible
    cy.get('[data-cy="mobile-header"]').should('be.visible');
    cy.get('h1').should('contain', 'Find Services');

    // Test search functionality
    cy.get('[data-cy="search-input"]').type('handyman');
    cy.get('[data-cy="search-suggestions"]').should('be.visible');

    // Select a service from suggestions
    cy.get('[data-cy="suggestion-item"]').first().click();

    // Verify search results appear
    cy.get('[data-cy="service-card"]').should('have.length.greaterThan', 0);

    // Click on first service card
    cy.get('[data-cy="service-card"]').first().click();

    // Should navigate to service detail page
    cy.url().should('include', '/services/');

    // Test booking button
    cy.get('[data-cy="book-now-button"]').should('be.visible').click();

    // Should open booking modal or navigate to booking page
    cy.get('[data-cy="booking-modal"]').should('be.visible');

    // Fill out booking form
    cy.get('[data-cy="date-input"]').click();
    cy.get('[data-cy="date-option"]').first().click();

    cy.get('[data-cy="time-slot"]').first().click();

    // Use current location
    cy.get('[data-cy="use-location-button"]').click();

    // Add phone number
    cy.get('[data-cy="phone-input"]').type('555-123-4567');

    // Continue to next step
    cy.get('[data-cy="continue-button"]').click();

    // Verify booking summary
    cy.get('[data-cy="booking-summary"]').should('be.visible');

    // Mock successful booking creation
    cy.intercept('POST', '/api/bookings/quick', {
      statusCode: 200,
      body: { id: 'booking-123', status: 'confirmed' }
    });

    // Confirm booking
    cy.get('[data-cy="confirm-booking-button"]').click();

    // Should redirect to confirmation page
    cy.url().should('include', '/bookings/booking-123');
  });

  it('should handle location-based search', () => {
    cy.visit('/services/mobile');

    // Enable location
    cy.get('[data-cy="location-toggle"]').click();

    // Search for nearby services
    cy.get('[data-cy="search-input"]').type('plumber');

    // Verify location-aware results
    cy.get('[data-cy="service-card"]').should('contain', 'km away');

    // Check map is displayed
    cy.get('[data-cy="services-map"]').should('be.visible');
  });

  it('should work with quick service categories', () => {
    cy.visit('/services/mobile');

    // Click on quick service category
    cy.get('[data-cy="quick-service-handyman"]').click();

    // Should filter results by category
    cy.get('[data-cy="service-card"]').should('have.length.greaterThan', 0);
    cy.get('[data-cy="category-filter"]').should('contain', 'Handyman');
  });

  it('should handle emergency services', () => {
    cy.visit('/services/mobile');

    // Click emergency banner
    cy.get('[data-cy="emergency-banner"]').should('be.visible');
    cy.get('[data-cy="emergency-call-button"]').click();

    // Should navigate to emergency page
    cy.url().should('include', '/emergency');
  });

  it('should be responsive and touch-friendly', () => {
    cy.visit('/services/mobile');

    // Test touch targets are large enough (minimum 44px)
    cy.get('[data-cy="quick-service-button"]').each(($el) => {
      cy.wrap($el).should('have.css', 'min-height').and('match', /^([4-9]\d|\d{3,})px$/);
    });

    // Test horizontal scrolling
    cy.get('[data-cy="quick-services-container"]').scrollTo('right');
    cy.get('[data-cy="quick-service-hvac"]').should('be.visible');
  });

  it('should handle offline scenarios gracefully', () => {
    // Simulate offline
    cy.window().then((win) => {
      cy.stub(win.navigator, 'onLine').value(false);
    });

    cy.visit('/services/mobile');

    // Should show offline message
    cy.get('[data-cy="offline-message"]').should('be.visible');

    // Should cache previous search results
    cy.get('[data-cy="cached-results"]').should('be.visible');
  });
});

describe('Mobile Authentication Flow', () => {
  beforeEach(() => {
    cy.viewport(375, 667);
  });

  it('should handle login/signup for booking', () => {
    cy.visit('/services/mobile');

    // Try to book without being logged in
    cy.get('[data-cy="service-card"]').first().click();
    cy.get('[data-cy="book-now-button"]').click();

    // Should show login modal
    cy.get('[data-cy="login-modal"]').should('be.visible');

    // Test signup flow
    cy.get('[data-cy="signup-tab"]').click();
    cy.get('[data-cy="signup-name"]').type('John Doe');
    cy.get('[data-cy="signup-email"]').type('john@example.com');
    cy.get('[data-cy="signup-password"]').type('password123');

    // Mock successful signup
    cy.intercept('POST', '/auth/signup', {
      statusCode: 200,
      body: { user: { id: 'user-123', name: 'John Doe' } }
    });

    cy.get('[data-cy="signup-submit"]').click();

    // Should close modal and continue booking
    cy.get('[data-cy="login-modal"]').should('not.exist');
    cy.get('[data-cy="booking-modal"]').should('be.visible');
  });
});

describe('Mobile Performance', () => {
  beforeEach(() => {
    cy.viewport(375, 667);
  });

  it('should load quickly on mobile', () => {
    const start = Date.now();

    cy.visit('/services/mobile');

    // Page should load within 3 seconds
    cy.get('[data-cy="mobile-header"]').should('be.visible').then(() => {
      const loadTime = Date.now() - start;
      expect(loadTime).to.be.lessThan(3000);
    });
  });

  it('should lazy load images', () => {
    cy.visit('/services/mobile');

    // Images should have loading="lazy" attribute
    cy.get('[data-cy="service-image"]').should('have.attr', 'loading', 'lazy');
  });

  it('should minimize network requests', () => {
    // Track network requests
    let requestCount = 0;
    cy.intercept('**', () => {
      requestCount++;
    });

    cy.visit('/services/mobile');

    cy.then(() => {
      // Should make reasonable number of requests
      expect(requestCount).to.be.lessThan(20);
    });
  });
});

describe('Mobile Accessibility', () => {
  beforeEach(() => {
    cy.viewport(375, 667);
  });

  it('should be accessible', () => {
    cy.visit('/services/mobile');

    // Check for proper heading structure
    cy.get('h1').should('exist');
    cy.get('[role="button"]').should('have.attr', 'tabindex');

    // Check for alt text on images
    cy.get('img').each(($img) => {
      cy.wrap($img).should('have.attr', 'alt');
    });

    // Check for proper form labels
    cy.get('input').each(($input) => {
      const id = $input.attr('id');
      if (id) {
        cy.get(`label[for="${id}"]`).should('exist');
      }
    });
  });

  it('should support keyboard navigation', () => {
    cy.visit('/services/mobile');

    // Tab through interactive elements
    cy.get('body').tab();
    cy.focused().should('be.visible');

    // Should be able to activate with Enter/Space
    cy.focused().type('{enter}');
  });
});

// Custom commands for mobile testing
Cypress.Commands.add('swipeLeft', (selector) => {
  cy.get(selector)
    .trigger('touchstart', { touches: [{ clientX: 300, clientY: 100 }] })
    .trigger('touchmove', { touches: [{ clientX: 100, clientY: 100 }] })
    .trigger('touchend');
});

Cypress.Commands.add('swipeRight', (selector) => {
  cy.get(selector)
    .trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
    .trigger('touchmove', { touches: [{ clientX: 300, clientY: 100 }] })
    .trigger('touchend');
});

declare global {
  namespace Cypress {
    interface Chainable {
      swipeLeft(selector: string): Chainable<Element>;
      swipeRight(selector: string): Chainable<Element>;
    }
  }
}
