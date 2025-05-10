// Test data management utilities for Cypress tests

// Generate a unique identifier for test data
const generateUniqueId = () => {
  return `test-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

// Store for test data created during test runs
const testDataStore = {
  users: [],
  projects: [],
  messages: [],
  bookings: [],
  services: [],
  payments: []
};

/**
 * Creates test data and stores it for cleanup
 * @param {string} type - Type of data (users, projects, etc.)
 * @param {Object} data - The data object
 * @returns {Object} The created data with ID
 */
Cypress.Commands.add('createTestData', (type, data) => {
  const dataWithId = {
    ...data,
    id: data.id || generateUniqueId(),
    _testData: true
  };
  
  // Store the data for cleanup
  if (testDataStore[type]) {
    testDataStore[type].push(dataWithId);
  } else {
    testDataStore[type] = [dataWithId];
  }
  
  cy.log(`Created test ${type}: ${dataWithId.id}`);
  return cy.wrap(dataWithId);
});

/**
 * Cleans up test data created during the test
 * @param {string} type - Type of data to clean up (or 'all' for everything)
 */
Cypress.Commands.add('cleanupTestData', (type = 'all') => {
  if (type === 'all') {
    // Clean up all test data
    Object.keys(testDataStore).forEach(dataType => {
      if (testDataStore[dataType].length > 0) {
        cy.log(`Cleaning up ${testDataStore[dataType].length} ${dataType}`);
        cleanupDataByType(dataType);
      }
    });
  } else if (testDataStore[type] && testDataStore[type].length > 0) {
    // Clean up specific type of test data
    cy.log(`Cleaning up ${testDataStore[type].length} ${type}`);
    cleanupDataByType(type);
  }
});

// Helper function to clean up data by type
function cleanupDataByType(type) {
  switch (type) {
    case 'users':
      cleanupUsers();
      break;
    case 'projects':
      cleanupProjects();
      break;
    case 'messages':
      cleanupMessages();
      break;
    case 'bookings':
      cleanupBookings();
      break;
    case 'services':
      cleanupServices();
      break;
    case 'payments':
      cleanupPayments();
      break;
    default:
      cy.log(`No cleanup handler for type: ${type}`);
  }
  
  // Clear the store for this type
  testDataStore[type] = [];
}

// Cleanup handlers for different data types
function cleanupUsers() {
  // This would typically call an API to delete test users
  // For now, we'll just log it
  cy.log('Cleaning up test users (API call would go here)');
}

function cleanupProjects() {
  // This would typically call an API to delete test projects
  testDataStore.projects.forEach(project => {
    cy.log(`Would delete project: ${project.id}`);
    // In a real implementation, you would make an API call here
  });
}

function cleanupMessages() {
  // This would typically call an API to delete test messages
  testDataStore.messages.forEach(message => {
    cy.log(`Would delete message: ${message.id}`);
    // In a real implementation, you would make an API call here
  });
}

function cleanupBookings() {
  // This would typically call an API to delete test bookings
  testDataStore.bookings.forEach(booking => {
    cy.log(`Would delete booking: ${booking.id}`);
    // In a real implementation, you would make an API call here
  });
}

function cleanupServices() {
  // This would typically call an API to delete test services
  testDataStore.services.forEach(service => {
    cy.log(`Would delete service: ${service.id}`);
    // In a real implementation, you would make an API call here
  });
}

function cleanupPayments() {
  // This would typically call an API to delete test payments
  testDataStore.payments.forEach(payment => {
    cy.log(`Would delete payment: ${payment.id}`);
    // In a real implementation, you would make an API call here
  });
}

// Test data generators
const testData = {
  // Generate user data
  user: (overrides = {}) => ({
    email: `test-user-${generateUniqueId()}@example.com`,
    password: 'Test123!',
    firstName: 'Test',
    lastName: 'User',
    phone: '555-123-4567',
    ...overrides
  }),
  
  // Generate project data
  project: (overrides = {}) => ({
    title: `Test Project ${generateUniqueId()}`,
    description: 'This is a test project created by Cypress automated testing.',
    budget: '1000',
    timeline: '2 weeks',
    location: 'Test Location',
    ...overrides
  }),
  
  // Generate message data
  message: (overrides = {}) => ({
    recipient: 'service@itsfait.com',
    subject: `Test Message ${generateUniqueId()}`,
    content: 'This is a test message created by Cypress automated testing.',
    ...overrides
  }),
  
  // Generate booking data
  booking: (overrides = {}) => ({
    serviceId: 'test-service-id',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    time: '10:00',
    notes: 'This is a test booking created by Cypress automated testing.',
    ...overrides
  }),
  
  // Generate service data
  service: (overrides = {}) => ({
    name: `Test Service ${generateUniqueId()}`,
    description: 'This is a test service created by Cypress automated testing.',
    price: '100',
    duration: '1 hour',
    ...overrides
  }),
  
  // Generate payment data
  payment: (overrides = {}) => ({
    amount: '100',
    method: 'credit_card',
    cardNumber: '4242424242424242',
    cardExpiry: '12/25',
    cardCvc: '123',
    ...overrides
  })
};

// Export the test data generators
Cypress.testData = testData;
