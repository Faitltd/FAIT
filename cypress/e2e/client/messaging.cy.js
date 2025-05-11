/// <reference types="cypress" />

describe('Client Messaging and Communication', () => {
  // Test user credentials
  const testUser = {
    email: 'test-messaging-client@example.com',
    password: 'TestPassword123!'
  };

  beforeEach(() => {
    // Log in before each test
    cy.session(testUser.email, () => {
      cy.visit('/login');
      cy.get('[data-cy=login-email]').type(testUser.email);
      cy.get('[data-cy=login-password]').type(testUser.password);
      cy.get('[data-cy=login-submit]').click();
      cy.url().should('include', '/dashboard');
    }, {
      validate: () => {
        // Set a flag to indicate the user is logged in
        Cypress.env('userLoggedIn', true);
      }
    });
  });

  it('should navigate to the messaging center', () => {
    cy.visit('/dashboard');
    cy.get('[data-cy=nav-messages]').click();
    cy.url().should('include', '/messages');

    // Messaging interface should be visible
    cy.get('[data-cy=messaging-interface]').should('be.visible');
    cy.get('[data-cy=conversation-list]').should('be.visible');
    cy.get('[data-cy=message-area]').should('be.visible');
  });

  it('should start a new conversation', () => {
    cy.visit('/messages');
    cy.get('[data-cy=new-conversation]').click();

    // Search for a service provider
    cy.get('[data-cy=provider-search]').type('plumber');
    cy.get('[data-cy=search-providers]').click();

    // Select a provider from search results
    cy.get('[data-cy=provider-list]').contains('Denver Plumbing Pros').click();

    // Compose initial message
    cy.get('[data-cy=message-subject]').type('Question about bathroom plumbing');
    cy.get('[data-cy=message-input]').type('Hi, I\'m planning a bathroom renovation and have some questions about the plumbing requirements. Do you offer consultations?');

    // Send message
    cy.get('[data-cy=send-message]').click();

    // Confirmation
    cy.contains('Message sent successfully').should('be.visible');

    // Conversation should be in the list
    cy.get('[data-cy=conversation-list]').contains('Denver Plumbing Pros').should('be.visible');
    cy.get('[data-cy=conversation-list]').contains('Question about bathroom plumbing').should('be.visible');
  });

  it('should view and reply to messages', () => {
    cy.visit('/messages');

    // Simulate receiving a reply
    cy.window().then(win => {
      win.dispatchEvent(new CustomEvent('test:new-message', {
        detail: {
          conversationId: '123',
          sender: 'Denver Plumbing Pros',
          content: 'Yes, we offer free consultations for bathroom renovations. When would you like to schedule one?',
          timestamp: new Date().toISOString()
        }
      }));
    });

    // Refresh to see new message
    cy.reload();

    // New message indicator should be visible
    cy.get('[data-cy=conversation-list]').contains('Denver Plumbing Pros').find('[data-cy=unread-indicator]').should('be.visible');

    // Open conversation
    cy.get('[data-cy=conversation-list]').contains('Denver Plumbing Pros').click();

    // Message should be visible
    cy.get('[data-cy=message-list]').contains('Yes, we offer free consultations').should('be.visible');

    // Reply to message
    cy.get('[data-cy=message-input]').type('That sounds great! Would next Tuesday at 10 AM work for you?');
    cy.get('[data-cy=send-message]').click();

    // Message should appear in the conversation
    cy.get('[data-cy=message-list]').contains('That sounds great!').should('be.visible');
  });

  it('should attach files to messages', () => {
    cy.visit('/messages');
    cy.get('[data-cy=conversation-list]').contains('Denver Plumbing Pros').click();

    // Attach file to message
    cy.get('[data-cy=attach-file]').click();
    cy.get('[data-cy=file-upload]').attachFile('bathroom-sketch.jpg');

    // File should be attached
    cy.get('[data-cy=attached-files]').contains('bathroom-sketch.jpg').should('be.visible');

    // Add message text
    cy.get('[data-cy=message-input]').type('Here\'s a sketch of my current bathroom layout.');

    // Send message with attachment
    cy.get('[data-cy=send-message]').click();

    // Message with attachment should be visible
    cy.get('[data-cy=message-list]').contains('Here\'s a sketch').should('be.visible');
    cy.get('[data-cy=message-list]').contains('bathroom-sketch.jpg').should('be.visible');
  });

  it('should schedule a consultation through messaging', () => {
    cy.visit('/messages');
    cy.get('[data-cy=conversation-list]').contains('Denver Plumbing Pros').click();

    // Simulate receiving a message with scheduling options
    cy.window().then(win => {
      win.dispatchEvent(new CustomEvent('test:new-message', {
        detail: {
          conversationId: '123',
          sender: 'Denver Plumbing Pros',
          content: 'Tuesday at 10 AM works for me. Would you like to schedule the consultation?',
          timestamp: new Date().toISOString(),
          hasSchedulingOption: true
        }
      }));
    });

    // Refresh to see new message
    cy.reload();

    // Open conversation
    cy.get('[data-cy=conversation-list]').contains('Denver Plumbing Pros').click();

    // Schedule consultation
    cy.get('[data-cy=schedule-consultation]').click();

    // Fill out scheduling form
    cy.get('[data-cy=consultation-date]').should('have.value', '2023-12-12'); // Tuesday
    cy.get('[data-cy=consultation-time]').should('have.value', '10:00');
    cy.get('[data-cy=consultation-address]').type('123 Main St, Denver, CO 80202');
    cy.get('[data-cy=consultation-notes]').type('Please bring information about fixtures and pricing.');

    // Confirm scheduling
    cy.get('[data-cy=confirm-scheduling]').click();

    // Confirmation
    cy.contains('Consultation scheduled successfully').should('be.visible');

    // Scheduled consultation should be visible in messages
    cy.get('[data-cy=message-list]').contains('Consultation scheduled').should('be.visible');
    cy.get('[data-cy=message-list]').contains('Tuesday, December 12, 2023 at 10:00 AM').should('be.visible');
  });

  it('should create a project from a conversation', () => {
    cy.visit('/messages');
    cy.get('[data-cy=conversation-list]').contains('Denver Plumbing Pros').click();

    // Create project from conversation
    cy.get('[data-cy=conversation-actions]').click();
    cy.get('[data-cy=create-project]').click();

    // Project form should be pre-filled with some information
    cy.get('[data-cy=project-title]').should('have.value', 'Bathroom Plumbing Project');
    cy.get('[data-cy=project-provider]').should('have.value', 'Denver Plumbing Pros');

    // Fill out remaining project details
    cy.get('[data-cy=project-description]').type('Bathroom plumbing renovation based on our consultation');
    cy.get('[data-cy=project-budget]').type('5000');
    cy.get('[data-cy=project-timeline]').select('2-4 weeks');

    // Create project
    cy.get('[data-cy=create-project-submit]').click();

    // Confirmation
    cy.contains('Project created successfully').should('be.visible');

    // Project reference should be added to the conversation
    cy.get('[data-cy=message-list]').contains('Project created').should('be.visible');
    cy.get('[data-cy=project-reference]').should('be.visible');
  });

  it('should search message history', () => {
    cy.visit('/messages');

    // Search for messages
    cy.get('[data-cy=message-search]').type('bathroom');
    cy.get('[data-cy=search-button]').click();

    // Search results should be visible
    cy.get('[data-cy=search-results]').should('be.visible');
    cy.get('[data-cy=search-results]').contains('bathroom renovation').should('be.visible');
    cy.get('[data-cy=search-results]').contains('bathroom plumbing').should('be.visible');

    // Click on a search result
    cy.get('[data-cy=search-results]').contains('bathroom renovation').click();

    // Should open the relevant conversation and highlight the message
    cy.get('[data-cy=highlighted-message]').contains('bathroom renovation').should('be.visible');
  });

  it('should filter conversations', () => {
    cy.visit('/messages');

    // Filter by unread
    cy.get('[data-cy=filter-messages]').click();
    cy.get('[data-cy=filter-unread]').click();

    // Only unread conversations should be visible
    cy.get('[data-cy=conversation-list]').find('[data-cy=conversation-item]').each(($el) => {
      cy.wrap($el).find('[data-cy=unread-indicator]').should('be.visible');
    });

    // Clear filter
    cy.get('[data-cy=clear-filters]').click();

    // Filter by date
    cy.get('[data-cy=filter-messages]').click();
    cy.get('[data-cy=filter-date-range]').click();
    cy.get('[data-cy=date-from]').type('2023-12-01');
    cy.get('[data-cy=date-to]').type('2023-12-31');
    cy.get('[data-cy=apply-date-filter]').click();

    // Conversations from December should be visible
    cy.get('[data-cy=conversation-list]').should('be.visible');
  });

  it('should manage notification preferences for messages', () => {
    cy.visit('/messages');
    cy.get('[data-cy=message-settings]').click();

    // Update notification preferences
    cy.get('[data-cy=notify-new-messages]').check();
    cy.get('[data-cy=notify-message-email]').check();
    cy.get('[data-cy=notify-message-sms]').uncheck();
    cy.get('[data-cy=notify-message-push]').check();

    // Save preferences
    cy.get('[data-cy=save-preferences]').click();

    // Confirmation
    cy.contains('Notification preferences updated').should('be.visible');
  });

  it('should archive and delete conversations', () => {
    cy.visit('/messages');

    // Archive a conversation
    cy.get('[data-cy=conversation-list]').contains('Denver Plumbing Pros').find('[data-cy=conversation-options]').click();
    cy.get('[data-cy=archive-conversation]').click();

    // Confirmation
    cy.contains('Conversation archived').should('be.visible');

    // Conversation should not be in the main list
    cy.get('[data-cy=conversation-list]').contains('Denver Plumbing Pros').should('not.exist');

    // View archived conversations
    cy.get('[data-cy=view-archived]').click();

    // Archived conversation should be visible
    cy.get('[data-cy=archived-conversations]').contains('Denver Plumbing Pros').should('be.visible');

    // Delete a conversation
    cy.get('[data-cy=archived-conversations]').contains('Denver Plumbing Pros').find('[data-cy=conversation-options]').click();
    cy.get('[data-cy=delete-conversation]').click();
    cy.get('[data-cy=confirm-delete]').click();

    // Confirmation
    cy.contains('Conversation deleted').should('be.visible');

    // Conversation should be removed from archived list
    cy.get('[data-cy=archived-conversations]').contains('Denver Plumbing Pros').should('not.exist');
  });
});
