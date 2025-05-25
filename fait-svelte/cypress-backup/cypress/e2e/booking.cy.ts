describe('Booking Flow', () => {
  beforeEach(() => {
    // Mock API responses
    cy.intercept('GET', '**/services/*', {
      statusCode: 200,
      body: {
        id: 'service-1',
        title: 'Home Cleaning',
        description: 'Professional cleaning services for your home.',
        category: 'cleaning',
        price: 25,
        price_type: 'hourly',
        duration: 120,
        active: true,
        image_url: '/images/home-cleaning.jpg',
        provider_id: 'provider-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }).as('getService');
    
    cy.intercept('POST', '**/bookings', {
      statusCode: 200,
      body: {
        id: 'booking-1',
        service_id: 'service-1',
        provider_id: 'provider-1',
        client_id: 'user-1',
        date: '2023-07-15',
        time: '14:00',
        status: 'pending',
        price: 25,
        address: '123 Main St',
        notes: 'Please bring cleaning supplies',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }).as('createBooking');
    
    // Mock authentication
    cy.intercept('POST', '**/auth/v1/token?grant_type=password', {
      statusCode: 200,
      body: {
        access_token: 'fake-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'fake-refresh-token',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          app_metadata: {
            provider: 'email'
          },
          user_metadata: {
            name: 'Test User'
          },
          aud: 'authenticated',
          role: 'authenticated'
        }
      }
    }).as('login');
    
    cy.intercept('GET', '**/auth/v1/user', {
      statusCode: 200,
      body: {
        id: 'user-1',
        email: 'test@example.com',
        app_metadata: {
          provider: 'email'
        },
        user_metadata: {
          name: 'Test User'
        },
        aud: 'authenticated',
        role: 'authenticated'
      }
    }).as('getUser');
    
    cy.intercept('GET', '**/rest/v1/profiles*', {
      statusCode: 200,
      body: {
        id: 'profile-1',
        user_id: 'user-1',
        name: 'Test User',
        role: 'client',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }).as('getProfile');
    
    // Login before each test
    cy.visit('/login');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Wait for login to complete
    cy.wait('@login');
    cy.wait('@getUser');
    cy.wait('@getProfile');
    
    // Navigate to service page
    cy.visit('/services/service-1');
    cy.wait('@getService');
  });

  it('should allow a user to book a service', () => {
    // Check that the service details are displayed
    cy.contains('h1', 'Home Cleaning').should('exist');
    cy.contains('$25/hr').should('exist');
    
    // Click the Book Now button
    cy.contains('button', 'Book Now').click();
    
    // Check that the booking modal is displayed
    cy.contains('h3', 'Book Home Cleaning').should('exist');
    
    // Fill out the booking form
    cy.get('input[type="date"]').type('2023-07-15');
    cy.get('select').select('14:00');
    cy.get('input[placeholder="Enter the service location"]').type('123 Main St');
    cy.get('textarea').type('Please bring cleaning supplies');
    
    // Submit the form
    cy.contains('button', 'Book Now').click();
    
    // Wait for the booking to be created
    cy.wait('@createBooking');
    
    // Check that the success message is displayed
    cy.contains('Booking successful!').should('exist');
    
    // Wait for the modal to close
    cy.wait(2000);
    cy.contains('h3', 'Book Home Cleaning').should('not.exist');
  });

  it('should validate the booking form', () => {
    // Click the Book Now button
    cy.contains('button', 'Book Now').click();
    
    // Check that the booking modal is displayed
    cy.contains('h3', 'Book Home Cleaning').should('exist');
    
    // Submit the form without filling it out
    cy.contains('button', 'Book Now').click();
    
    // Check that validation errors are displayed
    cy.contains('Date is required').should('exist');
    cy.contains('Time is required').should('exist');
    cy.contains('Address is required').should('exist');
    
    // Fill out the form partially
    cy.get('input[type="date"]').type('2023-07-15');
    cy.contains('button', 'Book Now').click();
    
    // Check that remaining validation errors are displayed
    cy.contains('Time is required').should('exist');
    cy.contains('Address is required').should('exist');
    
    // Fill out the form completely
    cy.get('select').select('14:00');
    cy.get('input[placeholder="Enter the service location"]').type('123 Main St');
    
    // Submit the form
    cy.contains('button', 'Book Now').click();
    
    // Wait for the booking to be created
    cy.wait('@createBooking');
    
    // Check that the success message is displayed
    cy.contains('Booking successful!').should('exist');
  });

  it('should navigate to the bookings page after booking', () => {
    // Mock bookings API response
    cy.intercept('GET', '**/rest/v1/bookings*', {
      statusCode: 200,
      body: [
        {
          id: 'booking-1',
          service_id: 'service-1',
          provider_id: 'provider-1',
          client_id: 'user-1',
          date: '2023-07-15',
          time: '14:00',
          status: 'pending',
          price: 25,
          address: '123 Main St',
          notes: 'Please bring cleaning supplies',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    }).as('getBookings');
    
    // Click the Book Now button
    cy.contains('button', 'Book Now').click();
    
    // Fill out the booking form
    cy.get('input[type="date"]').type('2023-07-15');
    cy.get('select').select('14:00');
    cy.get('input[placeholder="Enter the service location"]').type('123 Main St');
    cy.get('textarea').type('Please bring cleaning supplies');
    
    // Submit the form
    cy.contains('button', 'Book Now').click();
    
    // Wait for the booking to be created
    cy.wait('@createBooking');
    
    // Wait for the modal to close
    cy.wait(2000);
    
    // Navigate to the bookings page
    cy.contains('a', 'My Bookings').click();
    
    // Wait for bookings to load
    cy.wait('@getBookings');
    
    // Check that the booking is displayed
    cy.contains('2023-07-15').should('exist');
    cy.contains('14:00').should('exist');
    cy.contains('123 Main St').should('exist');
    cy.contains('Pending').should('exist');
  });
});
