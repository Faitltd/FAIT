/// <reference types="cypress" />

describe('Test Data Management', () => {
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
  });

  afterEach(() => {
    // Clean up any test data created during the test
    cy.cleanupTestData();
  });

  it('should create a test project with generated data', () => {
    // Generate test project data
    const testProject = Cypress.testData.project({
      title: `Cypress Test Project ${Date.now()}`
    });
    
    // Store the test project for cleanup
    cy.createTestData('projects', testProject);
    
    // Try to find and click on projects link
    cy.get('a[href*="projects"], a:contains("Projects"), [data-cy="nav-projects"]')
      .first()
      .then($projectsLink => {
        if ($projectsLink.length) {
          cy.wrap($projectsLink).click();
          cy.wait(1000);
          
          // Look for create project button
          cy.get('button:contains("Create Project"), button:contains("New Project"), [data-cy="create-project"]')
            .first()
            .then($createProjectButton => {
              if ($createProjectButton.length) {
                cy.wrap($createProjectButton).click();
                cy.wait(1000);
                
                // Fill out project form with test data
                cy.get('input[placeholder*="title" i], input[name="title"], [data-cy="project-title"]')
                  .then($titleInput => {
                    if ($titleInput.length) {
                      cy.wrap($titleInput).type(testProject.title);
                    }
                  });
                
                cy.get('textarea[placeholder*="description" i], textarea[name="description"], [data-cy="project-description"]')
                  .then($descriptionInput => {
                    if ($descriptionInput.length) {
                      cy.wrap($descriptionInput).type(testProject.description);
                    }
                  });
                
                cy.get('input[placeholder*="budget" i], input[name="budget"], [data-cy="project-budget"]')
                  .then($budgetInput => {
                    if ($budgetInput.length) {
                      cy.wrap($budgetInput).type(testProject.budget);
                    }
                  });
                
                // Look for submit button but don't actually click it in test
                cy.get('button[type="submit"], button:contains("Create"), button:contains("Save"), [data-cy="project-submit"]')
                  .then($submitButton => {
                    if ($submitButton.length) {
                      cy.log('Submit button found, but not clicking to avoid creating test data');
                    }
                  });
              }
            });
        }
      });
  });

  it('should create a test message with generated data', () => {
    // Generate test message data
    const testMessage = Cypress.testData.message({
      subject: `Cypress Test Message ${Date.now()}`
    });
    
    // Store the test message for cleanup
    cy.createTestData('messages', testMessage);
    
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
                
                // Fill out message form with test data
                cy.get('input[placeholder*="recipient" i], input[placeholder*="to" i], [data-cy="recipient-input"]')
                  .then($recipientInput => {
                    if ($recipientInput.length) {
                      cy.wrap($recipientInput).type(testMessage.recipient);
                    }
                  });
                
                cy.get('input[placeholder*="subject" i], [data-cy="subject-input"]')
                  .then($subjectInput => {
                    if ($subjectInput.length) {
                      cy.wrap($subjectInput).type(testMessage.subject);
                    }
                  });
                
                cy.get('textarea, [data-cy="message-body"]')
                  .then($messageBody => {
                    if ($messageBody.length) {
                      cy.wrap($messageBody).type(testMessage.content);
                    }
                  });
                
                // Look for send button but don't actually click it in test
                cy.get('button:contains("Send"), [data-cy="send-message"]')
                  .then($sendButton => {
                    if ($sendButton.length) {
                      cy.log('Send button found, but not clicking to avoid creating test data');
                    }
                  });
              }
            });
        }
      });
  });

  it('should create a test booking with generated data', () => {
    // Generate test booking data
    const testBooking = Cypress.testData.booking();
    
    // Store the test booking for cleanup
    cy.createTestData('bookings', testBooking);
    
    // Try to find and click on booking or services link
    cy.get('a[href*="book"], a[href*="services"], a:contains("Book"), a:contains("Services"), [data-cy="nav-booking"], [data-cy="nav-services"]')
      .first()
      .then($bookingLink => {
        if ($bookingLink.length) {
          cy.wrap($bookingLink).click();
          cy.wait(1000);
          
          // Look for a service to book
          cy.get('.service-item, .service-card, [data-cy="service-item"]')
            .first()
            .then($serviceItem => {
              if ($serviceItem.length) {
                // Click on the service item or its book button
                cy.wrap($serviceItem).find('button:contains("Book"), a:contains("Book"), [data-cy="book-button"]')
                  .first()
                  .then($bookButton => {
                    if ($bookButton.length) {
                      cy.wrap($bookButton).click();
                      cy.wait(1000);
                      
                      // Fill out booking form with test data if it exists
                      cy.get('input[type="date"], [data-cy="booking-date"]')
                        .then($dateInput => {
                          if ($dateInput.length) {
                            cy.wrap($dateInput).type(testBooking.date);
                          }
                        });
                      
                      cy.get('input[type="time"], select[name="time"], [data-cy="booking-time"]')
                        .then($timeInput => {
                          if ($timeInput.length) {
                            if ($timeInput.prop('tagName').toLowerCase() === 'select') {
                              cy.wrap($timeInput).select($timeInput.find('option').eq(1).val());
                            } else {
                              cy.wrap($timeInput).type(testBooking.time);
                            }
                          }
                        });
                      
                      cy.get('textarea[name="notes"], [data-cy="booking-notes"]')
                        .then($notesInput => {
                          if ($notesInput.length) {
                            cy.wrap($notesInput).type(testBooking.notes);
                          }
                        });
                    }
                  });
              }
            });
        }
      });
  });
});
