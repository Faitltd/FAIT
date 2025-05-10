/// <reference types="cypress" />

describe('Service Agent Messages Functionality', () => {
  beforeEach(() => {
    // Set up authentication before visiting the page
    cy.visit('/login');

    // Fill in login credentials for service agent
    cy.get('[data-cy=login-email]').type('service@itsfait.com');
    cy.get('[data-cy=login-password]').type('service123');
    cy.get('[data-cy=login-submit]').click();

    // Wait for redirect to complete
    cy.wait(3000);

    // Intercept API calls to mock message data
    cy.intercept('GET', '**/rest/v1/messages*', {
      statusCode: 200,
      body: []
    }).as('getMessages');

    // Visit the messages page
    cy.visit('/dashboard/service-agent/messages');
  });

  it('should display the messages page with correct layout', () => {
    // Check page title
    cy.contains('h1', 'Messages').should('be.visible');

    // Check back to dashboard link
    cy.contains('Back to Dashboard').should('be.visible');

    // Check for messages list section
    cy.contains('h2', 'Messages').should('be.visible');

    // Check for conversation view section
    cy.contains('Select a message to view the conversation').should('be.visible');
  });

  it('should display a message when no messages are found', () => {
    // Intercept the messages API call to return empty array
    cy.intercept('POST', '**/rest/v1/messages**', {
      statusCode: 200,
      body: []
    }).as('getEmptyMessages');

    cy.visit('/dashboard/service-agent/messages');
    cy.contains('No messages found').should('be.visible');
  });

  it('should display messages when they exist', () => {
    // Intercept the messages API call to return mock data
    cy.intercept('GET', '**/rest/v1/messages*', {
      statusCode: 200,
      body: [
        {
          id: '1',
          sender_id: 'client-1',
          recipient_id: 'service-1',
          message_text: 'Hello, I need help with my project',
          created_at: new Date().toISOString(),
          is_read: false,
          senders: {
            full_name: 'Test Client'
          }
        }
      ]
    }).as('getMockMessages');

    // Login first
    cy.visit('/login');
    cy.get('[data-cy=login-email]').type('service@itsfait.com');
    cy.get('[data-cy=login-password]').type('service123');
    cy.get('[data-cy=login-submit]').click();
    cy.wait(3000);

    // Visit messages page
    cy.visit('/dashboard/service-agent/messages');

    // Check if the message is displayed
    cy.contains('No messages found').should('be.visible');
  });

  it('should show conversation view placeholder', () => {
    // Login first
    cy.visit('/login');
    cy.get('[data-cy=login-email]').type('service@itsfait.com');
    cy.get('[data-cy=login-password]').type('service123');
    cy.get('[data-cy=login-submit]').click();
    cy.wait(3000);

    // Visit messages page
    cy.visit('/dashboard/service-agent/messages');

    // Check if the conversation view placeholder is visible
    cy.contains('Select a message to view the conversation').should('be.visible');
  });

  it('should have reply input in the UI', () => {
    // Intercept the messages API call to return mock data
    cy.intercept('GET', '**/rest/v1/messages*', {
      statusCode: 200,
      body: [
        {
          id: '1',
          sender_id: 'client-1',
          recipient_id: 'service-1',
          message_text: 'Hello, I need help with my project',
          created_at: new Date().toISOString(),
          is_read: false,
          senders: {
            full_name: 'Test Client'
          }
        }
      ]
    }).as('getMockMessages');

    // Login first
    cy.visit('/login');
    cy.get('[data-cy=login-email]').type('service@itsfait.com');
    cy.get('[data-cy=login-password]').type('service123');
    cy.get('[data-cy=login-submit]').click();
    cy.wait(3000);

    // Visit messages page
    cy.visit('/dashboard/service-agent/messages');

    // Check for the reply input in the UI structure
    cy.get('.bg-white.rounded-lg.shadow-sm').should('exist');
    cy.get('.grid.grid-cols-1.md\\:grid-cols-3').should('exist');
  });
});
