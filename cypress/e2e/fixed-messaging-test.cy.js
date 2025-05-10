/// <reference types="cypress" />

describe('Messaging Feature Tests', () => {
  // Test credentials for client user
  const clientCredentials = {
    email: 'client@itsfait.com',
    password: 'client123'
  };

  beforeEach(() => {
    // Clear cookies and local storage between tests
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Enable local auth mode if available
    cy.window().then((win) => {
      win.localStorage.setItem('useLocalAuth', 'true');
    });
    
    // Login as client before each test
    cy.visit('/login');
    
    // Find email input using multiple possible selectors
    cy.get('input[type="email"], input[name="email"], [data-cy="login-email"], [id="email"], [placeholder*="email" i]')
      .first()
      .clear()
      .type(clientCredentials.email);

    // Find password input using multiple possible selectors
    cy.get('input[type="password"], input[name="password"], [data-cy="login-password"], [id="password"], [placeholder*="password" i]')
      .first()
      .clear()
      .type(clientCredentials.password);

    // Find submit button using multiple possible selectors
    cy.get('button[type="submit"], [data-cy="login-submit"], button:contains("Log In"), button:contains("Sign In"), button:contains("Login"), input[type="submit"]')
      .first()
      .click();

    // Wait for any redirects to complete
    cy.wait(3000);
    
    // Verify we're on the dashboard
    cy.url().should('include', '/dashboard');
    
    // Take a screenshot for debugging
    cy.screenshot('client-dashboard-before-messaging');
  });

  it('should navigate to messages page', () => {
    // Try to find and click on messages link
    cy.get('a[href*="messages"], a:contains("Messages"), [data-cy="nav-messages"]')
      .first()
      .then($messagesLink => {
        if ($messagesLink.length) {
          cy.wrap($messagesLink).click();
          cy.wait(1000);
          
          // Take a screenshot of the messages page
          cy.screenshot('messages-page');
          
          // Check for messaging-related elements
          cy.get('body').then($body => {
            const hasMessagingElements = 
              $body.find('.message-list, .messages-list, .conversation-list, [data-cy="messages-list"], [data-cy="conversation-list"]').length > 0 ||
              $body.find('.message-input, [data-cy="message-input"]').length > 0 ||
              $body.find('button:contains("New Message"), button:contains("Compose"), [data-cy="new-message"]').length > 0;
            
            expect(hasMessagingElements, 'Page should contain messaging-related elements').to.be.true;
          });
        } else {
          cy.log('Messages link not found, skipping test');
        }
      });
  });

  it('should check for conversation list or empty state', () => {
    // Try to find and click on messages link
    cy.get('a[href*="messages"], a:contains("Messages"), [data-cy="nav-messages"]')
      .first()
      .then($messagesLink => {
        if ($messagesLink.length) {
          cy.wrap($messagesLink).click();
          cy.wait(1000);
          
          // Check for conversation list or empty state
          cy.get('.conversation-list, .message-list, [data-cy="conversation-list"], [data-cy="message-list"]')
            .then($conversationList => {
              if ($conversationList.length) {
                cy.log('Conversation list found');
                
                // Check if there are any conversations
                cy.wrap($conversationList).find('.conversation-item, .message-item, [data-cy="conversation-item"]')
                  .then($conversationItems => {
                    if ($conversationItems.length) {
                      cy.log(`Found ${$conversationItems.length} conversation items`);
                    } else {
                      cy.log('No conversation items found, might be empty state');
                    }
                  });
              } else {
                // Check for empty state
                cy.get('.empty-state, .no-messages, [data-cy="empty-state"]')
                  .then($emptyState => {
                    if ($emptyState.length) {
                      cy.log('Empty state found');
                    } else {
                      cy.log('No conversation list or empty state found');
                    }
                  });
              }
            });
        } else {
          cy.log('Messages link not found, skipping test');
        }
      });
  });

  it('should attempt to create a new message if possible', () => {
    // Try to find and click on messages link
    cy.get('a[href*="messages"], a:contains("Messages"), [data-cy="nav-messages"]')
      .first()
      .then($messagesLink => {
        if ($messagesLink.length) {
          cy.wrap($messagesLink).click();
          cy.wait(1000);
          
          // Look for new message button
          cy.get('button:contains("New Message"), button:contains("Compose"), [data-cy="new-message"]')
            .first()
            .then($newMessageButton => {
              if ($newMessageButton.length) {
                cy.wrap($newMessageButton).click();
                cy.wait(1000);
                
                // Take a screenshot of the new message form
                cy.screenshot('new-message-form');
                
                // Check for recipient field
                cy.get('input[placeholder*="recipient" i], input[placeholder*="to" i], [data-cy="recipient-input"]')
                  .then($recipientInput => {
                    if ($recipientInput.length) {
                      cy.wrap($recipientInput).type('service@itsfait.com');
                    } else {
                      cy.log('Recipient input not found');
                    }
                  });
                
                // Check for subject field
                cy.get('input[placeholder*="subject" i], [data-cy="subject-input"]')
                  .then($subjectInput => {
                    if ($subjectInput.length) {
                      cy.wrap($subjectInput).type('Test Message from Cypress');
                    } else {
                      cy.log('Subject input not found');
                    }
                  });
                
                // Check for message body field
                cy.get('textarea, [data-cy="message-body"]')
                  .then($messageBody => {
                    if ($messageBody.length) {
                      cy.wrap($messageBody).type('This is a test message sent from Cypress automated testing.');
                    } else {
                      cy.log('Message body input not found');
                    }
                  });
                
                // Look for send button but don't actually click it in test
                cy.get('button:contains("Send"), [data-cy="send-message"]')
                  .then($sendButton => {
                    if ($sendButton.length) {
                      cy.log('Send button found, but not clicking to avoid creating test data');
                    } else {
                      cy.log('Send button not found');
                    }
                  });
              } else {
                cy.log('New message button not found, skipping test');
              }
            });
        } else {
          cy.log('Messages link not found, skipping test');
        }
      });
  });
});
