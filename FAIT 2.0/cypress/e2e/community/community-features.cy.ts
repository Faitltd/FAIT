describe('Community Features', () => {
  beforeEach(() => {
    // Login before each test
    cy.visit('/login');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    
    // Intercept the login request and mock a successful response
    cy.intercept('POST', '**/auth/v1/token*', {
      statusCode: 200,
      body: {
        access_token: 'fake-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'fake-refresh-token',
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          user_metadata: {
            first_name: 'Test',
            last_name: 'User',
            user_role: 'client'
          }
        }
      }
    }).as('loginRequest');
    
    cy.get('button[type="submit"]').click();
    cy.wait('@loginRequest');
    cy.url().should('include', '/dashboard');
    
    // Mock the community posts API response
    cy.intercept('GET', '**/rest/v1/community_posts*', {
      statusCode: 200,
      body: [
        {
          id: 'post-1',
          user_id: 'user-1',
          title: 'Welcome to the Community',
          content: 'This is the first post in our community forum. Feel free to introduce yourself!',
          created_at: '2023-05-01T00:00:00Z',
          likes: 5,
          comments: 3,
          user: {
            first_name: 'Admin',
            last_name: 'User',
            avatar_url: null
          }
        },
        {
          id: 'post-2',
          user_id: 'user-2',
          title: 'Tips for Contractors',
          content: 'Here are some tips for contractors using the FAIT platform...',
          created_at: '2023-05-05T00:00:00Z',
          likes: 3,
          comments: 1,
          user: {
            first_name: 'John',
            last_name: 'Contractor',
            avatar_url: null
          }
        },
        {
          id: 'post-3',
          user_id: 'test-user-id',
          title: 'My First Project',
          content: 'I just completed my first project using FAIT. Here\'s my experience...',
          created_at: '2023-05-10T00:00:00Z',
          likes: 2,
          comments: 0,
          user: {
            first_name: 'Test',
            last_name: 'User',
            avatar_url: null
          }
        }
      ]
    }).as('getCommunityPosts');
    
    cy.visit('/dashboard/community');
    cy.wait('@getCommunityPosts');
  });

  it('should display the community page with discussions tab active by default', () => {
    cy.get('h1').should('contain', 'Community');
    cy.get('[data-cy="discussions-tab"]').should('have.class', 'active');
    cy.get('[data-cy="post-list"]').should('exist');
    cy.get('[data-cy="post-item"]').should('have.length', 3);
  });

  it('should display post details correctly', () => {
    cy.get('[data-cy="post-item"]').first().within(() => {
      cy.get('[data-cy="post-title"]').should('contain', 'Welcome to the Community');
      cy.get('[data-cy="post-content"]').should('contain', 'This is the first post in our community forum');
      cy.get('[data-cy="post-author"]').should('contain', 'Admin User');
      cy.get('[data-cy="post-date"]').should('exist');
      cy.get('[data-cy="post-likes"]').should('contain', '5');
      cy.get('[data-cy="post-comments"]').should('contain', '3');
    });
  });

  it('should filter posts based on search query', () => {
    cy.get('[data-cy="search-input"]').type('Tips');
    cy.get('[data-cy="post-item"]').should('have.length', 1);
    cy.get('[data-cy="post-item"]').first().should('contain', 'Tips for Contractors');
    
    cy.get('[data-cy="search-input"]').clear().type('Project');
    cy.get('[data-cy="post-item"]').should('have.length', 1);
    cy.get('[data-cy="post-item"]').first().should('contain', 'My First Project');
    
    cy.get('[data-cy="search-input"]').clear();
    cy.get('[data-cy="post-item"]').should('have.length', 3);
  });

  it('should like a post successfully', () => {
    // Intercept the check for existing like request
    cy.intercept('GET', '**/rest/v1/post_likes?post_id=eq.post-1&user_id=eq.test-user-id*', {
      statusCode: 200,
      body: []
    }).as('checkLike');
    
    // Intercept the create like request
    cy.intercept('POST', '**/rest/v1/post_likes*', {
      statusCode: 201,
      body: {
        id: 'like-1',
        post_id: 'post-1',
        user_id: 'test-user-id',
        created_at: new Date().toISOString()
      }
    }).as('createLike');
    
    // Intercept the update post likes count request
    cy.intercept('PATCH', '**/rest/v1/community_posts?id=eq.post-1*', {
      statusCode: 200,
      body: [
        {
          id: 'post-1',
          likes: 6
        }
      ]
    }).as('updatePostLikes');
    
    // Click the like button on the first post
    cy.get('[data-cy="post-item"]').first().find('[data-cy="like-button"]').click();
    
    cy.wait('@checkLike');
    cy.wait('@createLike');
    cy.wait('@updatePostLikes');
    
    // Mock the updated posts list
    cy.intercept('GET', '**/rest/v1/community_posts*', {
      statusCode: 200,
      body: [
        {
          id: 'post-1',
          user_id: 'user-1',
          title: 'Welcome to the Community',
          content: 'This is the first post in our community forum. Feel free to introduce yourself!',
          created_at: '2023-05-01T00:00:00Z',
          likes: 6,
          comments: 3,
          user: {
            first_name: 'Admin',
            last_name: 'User',
            avatar_url: null
          }
        },
        {
          id: 'post-2',
          user_id: 'user-2',
          title: 'Tips for Contractors',
          content: 'Here are some tips for contractors using the FAIT platform...',
          created_at: '2023-05-05T00:00:00Z',
          likes: 3,
          comments: 1,
          user: {
            first_name: 'John',
            last_name: 'Contractor',
            avatar_url: null
          }
        },
        {
          id: 'post-3',
          user_id: 'test-user-id',
          title: 'My First Project',
          content: 'I just completed my first project using FAIT. Here\'s my experience...',
          created_at: '2023-05-10T00:00:00Z',
          likes: 2,
          comments: 0,
          user: {
            first_name: 'Test',
            last_name: 'User',
            avatar_url: null
          }
        }
      ]
    }).as('getUpdatedPosts');
    
    cy.wait('@getUpdatedPosts');
    
    // Verify the likes count has increased
    cy.get('[data-cy="post-item"]').first().find('[data-cy="post-likes"]').should('contain', '6');
  });

  it('should unlike a post successfully', () => {
    // Intercept the check for existing like request
    cy.intercept('GET', '**/rest/v1/post_likes?post_id=eq.post-1&user_id=eq.test-user-id*', {
      statusCode: 200,
      body: [
        {
          id: 'like-1',
          post_id: 'post-1',
          user_id: 'test-user-id',
          created_at: '2023-05-15T00:00:00Z'
        }
      ]
    }).as('checkLike');
    
    // Intercept the delete like request
    cy.intercept('DELETE', '**/rest/v1/post_likes?post_id=eq.post-1&user_id=eq.test-user-id*', {
      statusCode: 204,
      body: null
    }).as('deleteLike');
    
    // Intercept the update post likes count request
    cy.intercept('PATCH', '**/rest/v1/community_posts?id=eq.post-1*', {
      statusCode: 200,
      body: [
        {
          id: 'post-1',
          likes: 4
        }
      ]
    }).as('updatePostLikes');
    
    // Click the like button on the first post
    cy.get('[data-cy="post-item"]').first().find('[data-cy="like-button"]').click();
    
    cy.wait('@checkLike');
    cy.wait('@deleteLike');
    cy.wait('@updatePostLikes');
    
    // Mock the updated posts list
    cy.intercept('GET', '**/rest/v1/community_posts*', {
      statusCode: 200,
      body: [
        {
          id: 'post-1',
          user_id: 'user-1',
          title: 'Welcome to the Community',
          content: 'This is the first post in our community forum. Feel free to introduce yourself!',
          created_at: '2023-05-01T00:00:00Z',
          likes: 4,
          comments: 3,
          user: {
            first_name: 'Admin',
            last_name: 'User',
            avatar_url: null
          }
        },
        {
          id: 'post-2',
          user_id: 'user-2',
          title: 'Tips for Contractors',
          content: 'Here are some tips for contractors using the FAIT platform...',
          created_at: '2023-05-05T00:00:00Z',
          likes: 3,
          comments: 1,
          user: {
            first_name: 'John',
            last_name: 'Contractor',
            avatar_url: null
          }
        },
        {
          id: 'post-3',
          user_id: 'test-user-id',
          title: 'My First Project',
          content: 'I just completed my first project using FAIT. Here\'s my experience...',
          created_at: '2023-05-10T00:00:00Z',
          likes: 2,
          comments: 0,
          user: {
            first_name: 'Test',
            last_name: 'User',
            avatar_url: null
          }
        }
      ]
    }).as('getUpdatedPosts');
    
    cy.wait('@getUpdatedPosts');
    
    // Verify the likes count has decreased
    cy.get('[data-cy="post-item"]').first().find('[data-cy="post-likes"]').should('contain', '4');
  });

  it('should switch between tabs correctly', () => {
    // Click on the Members tab
    cy.get('[data-cy="members-tab"]').click();
    cy.get('[data-cy="members-content"]').should('be.visible');
    cy.get('[data-cy="discussions-content"]').should('not.exist');
    
    // Click on the Badges tab
    cy.get('[data-cy="badges-tab"]').click();
    cy.get('[data-cy="badges-content"]').should('be.visible');
    cy.get('[data-cy="members-content"]').should('not.exist');
    
    // Click on the Notifications tab
    cy.get('[data-cy="notifications-tab"]').click();
    cy.get('[data-cy="notifications-content"]').should('be.visible');
    cy.get('[data-cy="badges-content"]').should('not.exist');
    
    // Click back on the Discussions tab
    cy.get('[data-cy="discussions-tab"]').click();
    cy.get('[data-cy="discussions-content"]').should('be.visible');
    cy.get('[data-cy="notifications-content"]').should('not.exist');
  });

  it('should show empty state when no posts match search criteria', () => {
    cy.get('[data-cy="search-input"]').type('NonexistentPost');
    cy.get('[data-cy="post-item"]').should('not.exist');
    cy.get('[data-cy="empty-state"]').should('be.visible');
    cy.get('[data-cy="empty-state"]').should('contain', 'No discussions match your search criteria');
  });
});
