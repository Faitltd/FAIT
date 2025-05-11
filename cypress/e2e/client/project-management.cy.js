/// <reference types="cypress" />

describe('Client Project Management', () => {
  // Test user credentials
  const testUser = {
    email: 'test-project-client@example.com',
    password: 'TestPassword123!'
  };

  // Test project data
  const testProject = {
    title: 'Bathroom Remodel',
    description: 'Complete bathroom renovation with new fixtures, tile, and vanity',
    budget: '15000',
    timeline: '2-3 months',
    category: 'Renovation'
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

  it('should create a new project', () => {
    cy.visit('/projects');
    cy.get('[data-cy=create-project]').click();

    // Fill out project details
    cy.get('[data-cy=project-title]').type(testProject.title);
    cy.get('[data-cy=project-description]').type(testProject.description);
    cy.get('[data-cy=project-budget]').type(testProject.budget);
    cy.get('[data-cy=project-timeline]').select(testProject.timeline);
    cy.get('[data-cy=project-category]').select(testProject.category);

    // Add project location
    cy.get('[data-cy=project-address]').type('456 Oak St');
    cy.get('[data-cy=project-city]').type('Denver');
    cy.get('[data-cy=project-state]').select('Colorado');
    cy.get('[data-cy=project-zip]').type('80202');

    // Add project photos
    cy.get('[data-cy=add-project-photos]').click();
    cy.get('[data-cy=project-photo]').attachFile(['bathroom1.jpg', 'bathroom2.jpg']);
    cy.get('[data-cy=upload-photos]').click();

    // Submit project
    cy.get('[data-cy=project-submit]').click();

    // Should redirect to project details
    cy.url().should('include', '/projects/');
    cy.contains(testProject.title).should('be.visible');
    cy.contains('Project created successfully').should('be.visible');
  });

  it('should edit an existing project', () => {
    cy.visit('/projects');
    cy.contains(testProject.title).click();
    cy.get('[data-cy=edit-project]').click();

    // Update project details
    cy.get('[data-cy=project-title]').clear().type(`${testProject.title} - Updated`);
    cy.get('[data-cy=project-budget]').clear().type('18000');

    // Save changes
    cy.get('[data-cy=save-project]').click();

    // Confirmation
    cy.contains('Project updated successfully').should('be.visible');
    cy.contains(`${testProject.title} - Updated`).should('be.visible');
    cy.get('[data-cy=project-budget]').should('contain', '$18,000');
  });

  it('should add project milestones', () => {
    cy.visit('/projects');
    cy.contains(testProject.title).click();
    cy.get('[data-cy=project-milestones]').click();
    cy.get('[data-cy=add-milestone]').click();

    // Add milestone
    cy.get('[data-cy=milestone-title]').type('Demo and Removal');
    cy.get('[data-cy=milestone-description]').type('Remove existing fixtures, tile, and vanity');
    cy.get('[data-cy=milestone-due-date]').type('2023-12-20');
    cy.get('[data-cy=save-milestone]').click();

    // Milestone should be visible
    cy.contains('Demo and Removal').should('be.visible');

    // Add another milestone
    cy.get('[data-cy=add-milestone]').click();
    cy.get('[data-cy=milestone-title]').type('Plumbing and Electrical');
    cy.get('[data-cy=milestone-description]').type('Update plumbing and electrical for new fixtures');
    cy.get('[data-cy=milestone-due-date]').type('2023-12-30');
    cy.get('[data-cy=save-milestone]').click();

    // Both milestones should be visible
    cy.contains('Demo and Removal').should('be.visible');
    cy.contains('Plumbing and Electrical').should('be.visible');
  });

  it('should manage project documents', () => {
    cy.visit('/projects');
    cy.contains(testProject.title).click();
    cy.get('[data-cy=project-documents]').click();

    // Upload document
    cy.get('[data-cy=upload-document]').click();
    cy.get('[data-cy=document-title]').type('Bathroom Design Plans');
    cy.get('[data-cy=document-description]').type('Detailed plans for the bathroom renovation');
    cy.get('[data-cy=document-file]').attachFile('bathroom-plans.pdf');
    cy.get('[data-cy=upload-submit]').click();

    // Document should be visible
    cy.contains('Bathroom Design Plans').should('be.visible');

    // View document
    cy.contains('Bathroom Design Plans').click();
    cy.get('[data-cy=document-viewer]').should('be.visible');
    cy.get('[data-cy=close-viewer]').click();

    // Upload another document
    cy.get('[data-cy=upload-document]').click();
    cy.get('[data-cy=document-title]').type('Fixture Specifications');
    cy.get('[data-cy=document-description]').type('Specifications for bathroom fixtures');
    cy.get('[data-cy=document-file]').attachFile('fixture-specs.pdf');
    cy.get('[data-cy=upload-submit]').click();

    // Both documents should be visible
    cy.contains('Bathroom Design Plans').should('be.visible');
    cy.contains('Fixture Specifications').should('be.visible');
  });

  it('should invite service providers to the project', () => {
    cy.visit('/projects');
    cy.contains(testProject.title).click();
    cy.get('[data-cy=invite-providers]').click();

    // Search for providers
    cy.get('[data-cy=provider-search]').type('bathroom');
    cy.get('[data-cy=search-providers]').click();

    // Select providers
    cy.get('[data-cy=provider-list]').contains('Bathroom Experts').find('[data-cy=select-provider]').click();
    cy.get('[data-cy=provider-list]').contains('Tile Masters').find('[data-cy=select-provider]').click();

    // Add message
    cy.get('[data-cy=invitation-message]').type('I would like to get quotes for my bathroom renovation project.');

    // Send invitations
    cy.get('[data-cy=send-invitations]').click();

    // Confirmation
    cy.contains('Invitations sent successfully').should('be.visible');

    // Check invited providers
    cy.get('[data-cy=project-providers]').click();
    cy.contains('Bathroom Experts').should('be.visible');
    cy.contains('Tile Masters').should('be.visible');
  });

  it('should review and compare quotes', () => {
    // Simulate receiving quotes
    cy.visit('/dashboard');
    cy.window().then(win => {
      win.dispatchEvent(new CustomEvent('test:new-quotes', {
        detail: {
          projectId: '123',
          quotes: [
            {
              id: '1',
              providerName: 'Bathroom Experts',
              amount: 16500,
              timeline: '8 weeks',
              description: 'Complete bathroom renovation including all materials and labor'
            },
            {
              id: '2',
              providerName: 'Tile Masters',
              amount: 14800,
              timeline: '10 weeks',
              description: 'Full bathroom remodel with custom tile work'
            }
          ]
        }
      }));
    });

    // Navigate to quotes
    cy.get('[data-cy=notification-badge]').should('be.visible');
    cy.get('[data-cy=notifications]').click();
    cy.contains('New quotes received').click();

    // Should be on quotes page
    cy.url().should('include', '/projects/quotes');

    // Compare quotes
    cy.get('[data-cy=compare-quotes]').click();

    // Both quotes should be visible in comparison
    cy.get('[data-cy=quote-comparison]').should('be.visible');
    cy.get('[data-cy=quote-provider]').eq(0).should('contain', 'Bathroom Experts');
    cy.get('[data-cy=quote-provider]').eq(1).should('contain', 'Tile Masters');

    // Accept a quote
    cy.get('[data-cy=accept-quote]').eq(1).click(); // Accept Tile Masters quote
    cy.get('[data-cy=confirm-accept]').click();

    // Confirmation
    cy.contains('Quote accepted successfully').should('be.visible');
  });

  it('should track project progress', () => {
    cy.visit('/projects');
    cy.contains(testProject.title).click();

    // Project should now be in progress
    cy.get('[data-cy=project-status]').should('contain', 'In Progress');

    // Check progress updates
    cy.get('[data-cy=progress-updates]').click();

    // Simulate progress updates
    cy.window().then(win => {
      win.dispatchEvent(new CustomEvent('test:progress-update', {
        detail: {
          projectId: '123',
          updates: [
            {
              id: '1',
              date: '2023-12-21',
              title: 'Demo Complete',
              description: 'All old fixtures and tile have been removed',
              photos: ['demo1.jpg', 'demo2.jpg']
            }
          ]
        }
      }));
    });

    // Refresh to see updates
    cy.reload();

    // Update should be visible
    cy.contains('Demo Complete').should('be.visible');

    // View update details
    cy.contains('Demo Complete').click();
    cy.get('[data-cy=update-photos]').should('be.visible');
    cy.get('[data-cy=update-description]').should('contain', 'All old fixtures and tile have been removed');
  });

  it('should handle project payments', () => {
    cy.visit('/projects');
    cy.contains(testProject.title).click();
    cy.get('[data-cy=project-payments]').click();

    // Should see payment schedule
    cy.get('[data-cy=payment-schedule]').should('be.visible');

    // Simulate payment request
    cy.window().then(win => {
      win.dispatchEvent(new CustomEvent('test:payment-request', {
        detail: {
          projectId: '123',
          paymentId: '1',
          amount: 7400,
          description: 'Initial payment - 50% of project cost',
          dueDate: '2023-12-25'
        }
      }));
    });

    // Refresh to see payment request
    cy.reload();

    // Payment request should be visible
    cy.contains('Initial payment - 50% of project cost').should('be.visible');
    cy.get('[data-cy=payment-amount]').should('contain', '$7,400');

    // Make payment
    cy.get('[data-cy=make-payment]').click();

    // Payment form
    cy.get('[data-cy=payment-method]').select('Credit Card');
    cy.get('[data-cy=card-number]').type('4242424242424242');
    cy.get('[data-cy=card-expiry]').type('12/25');
    cy.get('[data-cy=card-cvc]').type('123');
    cy.get('[data-cy=billing-zip]').type('80202');
    cy.get('[data-cy=submit-payment]').click();

    // Confirmation
    cy.contains('Payment successful').should('be.visible');
    cy.get('[data-cy=payment-status]').should('contain', 'Paid');
  });

  it('should complete and finalize the project', () => {
    cy.visit('/projects');
    cy.contains(testProject.title).click();

    // Simulate project completion
    cy.window().then(win => {
      win.dispatchEvent(new CustomEvent('test:project-complete', {
        detail: { projectId: '123' }
      }));
    });

    // Refresh to see completion
    cy.reload();

    // Project should be marked as complete
    cy.get('[data-cy=project-status]').should('contain', 'Completed');

    // Final review
    cy.get('[data-cy=project-review]').click();

    // Review project
    cy.get('[data-cy=final-review]').should('be.visible');
    cy.get('[data-cy=review-rating]').eq(4).click(); // 5-star rating
    cy.get('[data-cy=review-title]').type('Excellent bathroom renovation');
    cy.get('[data-cy=review-content]').type('Tile Masters did an amazing job on my bathroom renovation. The quality of work was excellent and they finished on time.');
    cy.get('[data-cy=submit-review]').click();

    // Confirmation
    cy.contains('Review submitted successfully').should('be.visible');

    // Finalize project
    cy.get('[data-cy=finalize-project]').click();
    cy.get('[data-cy=confirm-finalize]').click();

    // Confirmation
    cy.contains('Project finalized successfully').should('be.visible');
  });

  it('should archive a completed project', () => {
    cy.visit('/projects');
    cy.contains(testProject.title).click();

    // Archive project
    cy.get('[data-cy=project-actions]').click();
    cy.get('[data-cy=archive-project]').click();
    cy.get('[data-cy=confirm-archive]').click();

    // Confirmation
    cy.contains('Project archived successfully').should('be.visible');

    // Project should be in archived list
    cy.visit('/projects/archived');
    cy.contains(testProject.title).should('be.visible');

    // Restore project
    cy.contains(testProject.title).click();
    cy.get('[data-cy=restore-project]').click();

    // Confirmation
    cy.contains('Project restored successfully').should('be.visible');

    // Project should be back in main list
    cy.visit('/projects');
    cy.contains(testProject.title).should('be.visible');
  });
});
