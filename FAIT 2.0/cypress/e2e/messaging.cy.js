describe('Messaging Feature', () => {
  beforeEach(() => {
    // Mock user authentication
    cy.intercept('POST', '**/auth/v1/token?grant_type=password', {
      fixture: 'auth/login_success.json',
    }).as('loginUser');

    // Mock conversations list
    cy.intercept('GET', '**/rest/v1/conversations*', {
      fixture: 'communication/conversations.json',
    }).as('getConversations');

    // Mock messages for a conversation
    cy.intercept('GET', '**/rest/v1/messages*', {
      fixture: 'communication/messages.json',
    }).as('getMessages');

    // Mock sending a message
    cy.intercept('POST', '**/rest/v1/messages', {
      statusCode: 201,
      fixture: 'communication/new_message.json',
    }).as('sendMessage');

    // Mock creating a new conversation
    cy.intercept('POST', '**/rest/v1/conversations', {
      statusCode: 201,
      fixture: 'communication/new_conversation.json',
    }).as('createConversation');

    // Login and navigate to messaging page
    cy.visit('/login');
    cy.get('input[name="email"]').type('user@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginUser');
    
    cy.visit('/messaging');
    cy.wait('@getConversations');
  });

  it('should display the list of conversations', () => {
    cy.get('[data-testid="conversation-list"]').should('be.visible');
    cy.get('[data-testid="conversation-item"]').should('have.length.at.least', 1);
  });

  it('should display messages when a conversation is selected', () => {
    cy.get('[data-testid="conversation-item"]').first().click();
    cy.wait('@getMessages');
    
    cy.get('[data-testid="message-view"]').should('be.visible');
    cy.get('[data-testid="message-item"]').should('have.length.at.least', 1);
  });

  it('should send a new message in a conversation', () => {
    cy.get('[data-testid="conversation-item"]').first().click();
    cy.wait('@getMessages');
    
    const messageText = 'This is a test message';
    cy.get('[data-testid="message-input"]').type(messageText);
    cy.get('[data-testid="send-message-button"]').click();
    
    cy.wait('@sendMessage');
    cy.get('[data-testid="message-item"]').last().should('contain', messageText);
  });

  it('should create a new conversation', () => {
    // Mock user search for new conversation
    cy.intercept('GET', '**/rest/v1/profiles*', {
      fixture: 'users/user_search.json',
    }).as('searchUsers');
    
    cy.get('[data-testid="new-conversation-button"]').click();
    cy.get('[data-testid="new-conversation-modal"]').should('be.visible');
    
    // Search for a user
    cy.get('[data-testid="recipient-search"]').type('john');
    cy.wait('@searchUsers');
    
    // Select a user from search results
    cy.get('[data-testid="user-search-result"]').first().click();
    
    // Add subject and message
    cy.get('[data-testid="conversation-subject"]').type('Test Subject');
    cy.get('[data-testid="initial-message"]').type('Hello, this is a test message.');
    
    // Create the conversation
    cy.get('[data-testid="create-conversation-button"]').click();
    cy.wait('@createConversation');
    
    // Should redirect to the new conversation
    cy.get('[data-testid="message-view"]').should('be.visible');
    cy.get('[data-testid="conversation-title"]').should('contain', 'Test Subject');
  });

  it('should show empty state when no conversations exist', () => {
    // Mock empty conversations list
    cy.intercept('GET', '**/rest/v1/conversations*', {
      body: []
    }).as('getEmptyConversations');
    
    cy.visit('/messaging');
    cy.wait('@getEmptyConversations');
    
    cy.get('[data-testid="empty-conversations"]').should('be.visible');
    cy.get('[data-testid="new-conversation-button"]').should('be.visible');
  });
});
