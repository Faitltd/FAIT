describe('Forum Feature', () => {
  beforeEach(() => {
    // Mock user authentication
    cy.intercept('POST', '**/auth/v1/token?grant_type=password', {
      fixture: 'auth/login_success.json',
    }).as('loginUser');

    // Mock forum categories
    cy.intercept('GET', '**/rest/v1/forum_categories*', {
      fixture: 'forum/categories.json',
    }).as('getCategories');

    // Mock threads for a category
    cy.intercept('GET', '**/rest/v1/forum_threads*', {
      fixture: 'forum/threads.json',
    }).as('getThreads');

    // Mock posts for a thread
    cy.intercept('GET', '**/rest/v1/forum_posts*', {
      fixture: 'forum/posts.json',
    }).as('getPosts');

    // Mock creating a new thread
    cy.intercept('POST', '**/rest/v1/forum_threads', {
      statusCode: 201,
      fixture: 'forum/new_thread.json',
    }).as('createThread');

    // Mock creating a new post
    cy.intercept('POST', '**/rest/v1/forum_posts', {
      statusCode: 201,
      fixture: 'forum/new_post.json',
    }).as('createPost');

    // Login and navigate to forum page
    cy.visit('/login');
    cy.get('input[name="email"]').type('user@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginUser');
    
    cy.visit('/forum');
    cy.wait('@getCategories');
  });

  it('should display the list of forum categories', () => {
    cy.get('[data-testid="forum-category-list"]').should('be.visible');
    cy.get('[data-testid="forum-category-item"]').should('have.length.at.least', 1);
  });

  it('should display threads when a category is selected', () => {
    cy.get('[data-testid="forum-category-item"]').first().click();
    cy.wait('@getThreads');
    
    cy.get('[data-testid="thread-list"]').should('be.visible');
    cy.get('[data-testid="thread-item"]').should('have.length.at.least', 1);
  });

  it('should display posts when a thread is selected', () => {
    cy.get('[data-testid="forum-category-item"]').first().click();
    cy.wait('@getThreads');
    
    cy.get('[data-testid="thread-item"]').first().click();
    cy.wait('@getPosts');
    
    cy.get('[data-testid="post-list"]').should('be.visible');
    cy.get('[data-testid="post-item"]').should('have.length.at.least', 1);
  });

  it('should create a new thread in a category', () => {
    cy.get('[data-testid="forum-category-item"]').first().click();
    cy.wait('@getThreads');
    
    cy.get('[data-testid="new-thread-button"]').click();
    
    // Fill in thread details
    cy.get('[data-testid="thread-title"]').type('Test Thread Title');
    cy.get('[data-testid="thread-content"]').type('This is the content of my test thread.');
    
    // Create the thread
    cy.get('[data-testid="create-thread-button"]').click();
    cy.wait('@createThread');
    
    // Should redirect to the new thread
    cy.get('[data-testid="thread-title"]').should('contain', 'Test Thread Title');
    cy.get('[data-testid="post-list"]').should('be.visible');
  });

  it('should reply to a thread', () => {
    cy.get('[data-testid="forum-category-item"]').first().click();
    cy.wait('@getThreads');
    
    cy.get('[data-testid="thread-item"]').first().click();
    cy.wait('@getPosts');
    
    const replyText = 'This is a test reply to the thread.';
    cy.get('[data-testid="post-editor"]').type(replyText);
    cy.get('[data-testid="post-reply-button"]').click();
    
    cy.wait('@createPost');
    cy.get('[data-testid="post-item"]').last().should('contain', replyText);
  });

  it('should reply to a specific post', () => {
    cy.get('[data-testid="forum-category-item"]').first().click();
    cy.wait('@getThreads');
    
    cy.get('[data-testid="thread-item"]').first().click();
    cy.wait('@getPosts');
    
    // Click reply on a specific post
    cy.get('[data-testid="post-item"]').first().find('[data-testid="reply-button"]').click();
    
    const replyText = 'This is a reply to a specific post.';
    cy.get('[data-testid="post-editor"]').type(replyText);
    cy.get('[data-testid="post-reply-button"]').click();
    
    cy.wait('@createPost');
    cy.get('[data-testid="post-item"]').last().should('contain', replyText);
  });

  it('should show empty state when no threads exist in a category', () => {
    // Mock empty threads list
    cy.intercept('GET', '**/rest/v1/forum_threads*', {
      body: { threads: [], total: 0 }
    }).as('getEmptyThreads');
    
    cy.get('[data-testid="forum-category-item"]').first().click();
    cy.wait('@getEmptyThreads');
    
    cy.get('[data-testid="empty-threads"]').should('be.visible');
    cy.get('[data-testid="new-thread-button"]').should('be.visible');
  });
});
