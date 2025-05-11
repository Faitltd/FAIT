describe('Notifications Feature', () => {
  beforeEach(() => {
    // Mock user authentication
    cy.intercept('POST', '**/auth/v1/token?grant_type=password', {
      fixture: 'auth/login_success.json',
    }).as('loginUser');

    // Mock notifications list
    cy.intercept('GET', '**/rest/v1/notifications*', {
      fixture: 'communication/notifications.json',
    }).as('getNotifications');

    // Mock marking a notification as read
    cy.intercept('PATCH', '**/rest/v1/notifications/*', {
      statusCode: 200,
      body: { success: true }
    }).as('markAsRead');

    // Mock marking all notifications as read
    cy.intercept('POST', '**/rest/v1/notifications/mark_all_read', {
      statusCode: 200,
      body: { success: true }
    }).as('markAllAsRead');

    // Login and navigate to notifications page
    cy.visit('/login');
    cy.get('input[name="email"]').type('user@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginUser');
    
    cy.visit('/notifications');
    cy.wait('@getNotifications');
  });

  it('should display the list of notifications', () => {
    cy.get('[data-testid="notification-list"]').should('be.visible');
    cy.get('[data-testid="notification-item"]').should('have.length.at.least', 1);
  });

  it('should mark a notification as read', () => {
    // Find an unread notification
    cy.get('[data-testid="notification-item"]').not('[data-read="true"]').first().as('unreadNotification');
    
    // Click the mark as read button
    cy.get('@unreadNotification').find('[data-testid="mark-read-button"]').click();
    cy.wait('@markAsRead');
    
    // Verify it's now marked as read
    cy.get('@unreadNotification').should('have.attr', 'data-read', 'true');
  });

  it('should mark all notifications as read', () => {
    // Ensure there are unread notifications
    cy.get('[data-testid="notification-item"]').not('[data-read="true"]').should('have.length.at.least', 1);
    
    // Click mark all as read button
    cy.get('[data-testid="mark-all-read-button"]').click();
    cy.wait('@markAllAsRead');
    
    // Verify all are marked as read
    cy.get('[data-testid="notification-item"]').each(($el) => {
      cy.wrap($el).should('have.attr', 'data-read', 'true');
    });
  });

  it('should filter notifications by type', () => {
    // Get the first notification type
    cy.get('[data-testid="notification-item"]').first().invoke('attr', 'data-type').then((type) => {
      // Select that type in the filter
      cy.get('[data-testid="notification-type-filter"]').select(type);
      
      // All visible notifications should be of that type
      cy.get('[data-testid="notification-item"]').each(($el) => {
        cy.wrap($el).should('have.attr', 'data-type', type);
      });
    });
  });

  it('should filter notifications by read status', () => {
    // Filter by read notifications
    cy.get('[data-testid="notification-read-filter"]').select('read');
    
    // All visible notifications should be read
    cy.get('[data-testid="notification-item"]').each(($el) => {
      cy.wrap($el).should('have.attr', 'data-read', 'true');
    });
    
    // Filter by unread notifications
    cy.get('[data-testid="notification-read-filter"]').select('unread');
    
    // All visible notifications should be unread
    cy.get('[data-testid="notification-item"]').each(($el) => {
      cy.wrap($el).should('have.attr', 'data-read', 'false');
    });
  });

  it('should navigate to the notification target when clicking on it', () => {
    // Mock the first notification to have a link to a project
    cy.intercept('GET', '**/rest/v1/notifications*', (req) => {
      req.reply((res) => {
        res.body[0].action_url = '/projects/123';
        return res;
      });
    }).as('getNotificationsWithLink');
    
    cy.visit('/notifications');
    cy.wait('@getNotificationsWithLink');
    
    // Click on the notification content (not the mark as read button)
    cy.get('[data-testid="notification-item"]').first().find('[data-testid="notification-content"]').click();
    
    // Should navigate to the target URL
    cy.url().should('include', '/projects/123');
  });

  it('should show empty state when no notifications exist', () => {
    // Mock empty notifications list
    cy.intercept('GET', '**/rest/v1/notifications*', {
      body: []
    }).as('getEmptyNotifications');
    
    cy.visit('/notifications');
    cy.wait('@getEmptyNotifications');
    
    cy.get('[data-testid="empty-notifications"]').should('be.visible');
  });
});
