describe('Booking Wizard Tests', () => {
  beforeEach(() => {
    // Login as client
    cy.visit('/login');
    cy.get('input[type="email"]').type(Cypress.env('clientEmail'));
    cy.get('input[type="password"]').type(Cypress.env('clientPassword'));
    cy.get('button[type="submit"]').click();
    
    // Navigate to services page
    cy.visit('/services');
  });

  it('should display available services', () => {
    cy.get('[data-testid="service-card"]').should('have.length.at.least', 1);
    cy.get('[data-testid="service-card"]').first().find('h3').should('be.visible');
    cy.get('[data-testid="service-card"]').first().find('button').contains('Book Now').should('be.visible');
  });

  it('should start booking process when clicking Book Now', () => {
    cy.get('[data-testid="service-card"]').first().find('button').contains('Book Now').click();
    cy.url().should('include', '/booking');
    cy.contains('Book').should('be.visible');
  });

  it('should complete the entire booking process', () => {
    // Start booking
    cy.get('[data-testid="service-card"]').first().find('button').contains('Book Now').click();
    
    // Step 1: Verify service selection
    cy.contains('Schedule').should('be.visible');
    cy.get('button').contains('Next').click();
    
    // Step 2: Select date and time
    cy.get('.fc-daygrid-day:not(.fc-day-disabled)').first().click();
    cy.get('.fc-timegrid-slot:not(.fc-timegrid-slot-lane)').first().click();
    cy.contains('Selected:').should('be.visible');
    cy.get('button').contains('Next').click();
    
    // Step 3: Enter location
    cy.get('input#address').type('123 Test Street');
    cy.get('input#city').type('Test City');
    cy.get('input#state').type('TS');
    cy.get('input#zip_code').type('12345');
    cy.get('button').contains('Next').click();
    
    // Step 4: Special instructions
    cy.get('textarea').type('This is a test booking from Cypress');
    cy.get('button').contains('Next').click();
    
    // Step 5: Payment (mock)
    cy.get('input[name="cardNumber"]').type('4242424242424242');
    cy.get('input[name="cardExpiry"]').type('1230');
    cy.get('input[name="cardCvc"]').type('123');
    cy.get('input[name="cardName"]').type('Test User');
    cy.get('button').contains('Pay').click();
    
    // Step 6: Confirmation
    cy.contains('Booking Summary').should('be.visible');
    cy.get('button').contains('Confirm Booking').click();
    
    // Verify success
    cy.contains('Booking Confirmed', { timeout: 10000 }).should('be.visible');
  });

  it('should validate each step of the booking process', () => {
    // Start booking
    cy.get('[data-testid="service-card"]').first().find('button').contains('Book Now').click();
    
    // Try to proceed without selecting date/time
    cy.get('button').contains('Next').click();
    cy.get('button').contains('Next').click();
    cy.contains('Please select a date and time').should('be.visible');
    
    // Select date and time
    cy.get('.fc-daygrid-day:not(.fc-day-disabled)').first().click();
    cy.get('.fc-timegrid-slot:not(.fc-timegrid-slot-lane)').first().click();
    cy.get('button').contains('Next').click();
    
    // Try to proceed without location
    cy.get('button').contains('Next').click();
    cy.contains('Please fill in all location fields').should('be.visible');
    
    // Fill location partially
    cy.get('input#address').type('123 Test Street');
    cy.get('button').contains('Next').click();
    cy.contains('Please fill in all location fields').should('be.visible');
    
    // Complete location
    cy.get('input#city').type('Test City');
    cy.get('input#state').type('TS');
    cy.get('input#zip_code').type('12345');
    cy.get('button').contains('Next').click();
    
    // Special instructions are optional
    cy.get('button').contains('Next').click();
    
    // Try to proceed without payment
    cy.get('button').contains('Confirm Booking').click();
    cy.contains('Please complete the payment process').should('be.visible');
  });

  it('should allow navigation between booking steps', () => {
    // Start booking
    cy.get('[data-testid="service-card"]').first().find('button').contains('Book Now').click();
    
    // Go to step 2
    cy.get('button').contains('Next').click();
    
    // Go back to step 1
    cy.get('button').contains('Back').click();
    cy.contains('Schedule').should('be.visible');
    
    // Go forward again
    cy.get('button').contains('Next').click();
    
    // Select date and time
    cy.get('.fc-daygrid-day:not(.fc-day-disabled)').first().click();
    cy.get('.fc-timegrid-slot:not(.fc-timegrid-slot-lane)').first().click();
    cy.get('button').contains('Next').click();
    
    // Fill location
    cy.get('input#address').type('123 Test Street');
    cy.get('input#city').type('Test City');
    cy.get('input#state').type('TS');
    cy.get('input#zip_code').type('12345');
    cy.get('button').contains('Next').click();
    
    // Go back two steps
    cy.get('button').contains('Back').click();
    cy.get('button').contains('Back').click();
    
    // Should be at date/time selection with data preserved
    cy.contains('Selected:').should('be.visible');
  });

  it('should show special instructions suggestions', () => {
    // Start booking and navigate to special instructions
    cy.get('[data-testid="service-card"]').first().find('button').contains('Book Now').click();
    cy.get('button').contains('Next').click();
    cy.get('.fc-daygrid-day:not(.fc-day-disabled)').first().click();
    cy.get('.fc-timegrid-slot:not(.fc-timegrid-slot-lane)').first().click();
    cy.get('button').contains('Next').click();
    cy.get('input#address').type('123 Test Street');
    cy.get('input#city').type('Test City');
    cy.get('input#state').type('TS');
    cy.get('input#zip_code').type('12345');
    cy.get('button').contains('Next').click();
    
    // Check for suggestions
    cy.contains('Suggested instructions').should('be.visible');
    cy.get('button').contains('Please call me 10 minutes before arrival').click();
    
    // Verify suggestion is selected
    cy.get('textarea').should('have.value', 'Please call me 10 minutes before arrival');
  });
});
