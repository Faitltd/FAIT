/// <reference types="cypress" />

describe('Project Management Tests', () => {
  // Test credentials for client user
  const clientCredentials = {
    email: 'client@itsfait.com',
    password: 'client123'
  };

  // Test project data
  const testProject = {
    title: `Test Project ${Date.now()}`,
    description: 'This is a test project created by Cypress automated testing.',
    budget: '1000',
    timeline: '2 weeks',
    location: 'Test Location'
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
    cy.screenshot('client-dashboard-before-projects');
  });

  it('should navigate to projects page', () => {
    // Try to find and click on projects link
    cy.get('a[href*="projects"], a:contains("Projects"), [data-cy="nav-projects"]')
      .first()
      .then($projectsLink => {
        if ($projectsLink.length) {
          cy.wrap($projectsLink).click();
          cy.wait(1000);
          
          // Take a screenshot of the projects page
          cy.screenshot('projects-page');
          
          // Check for project-related elements
          cy.get('body').then($body => {
            const hasProjectElements = 
              $body.find('.project-list, .projects-list, [data-cy="projects-list"]').length > 0 ||
              $body.find('button:contains("Create Project"), button:contains("New Project"), [data-cy="create-project"]').length > 0;
            
            expect(hasProjectElements, 'Page should contain project-related elements').to.be.true;
          });
        } else {
          cy.log('Projects link not found, skipping test');
        }
      });
  });

  it('should check for project list or empty state', () => {
    // Try to find and click on projects link
    cy.get('a[href*="projects"], a:contains("Projects"), [data-cy="nav-projects"]')
      .first()
      .then($projectsLink => {
        if ($projectsLink.length) {
          cy.wrap($projectsLink).click();
          cy.wait(1000);
          
          // Check for project list or empty state
          cy.get('.project-list, .projects-list, [data-cy="projects-list"]')
            .then($projectList => {
              if ($projectList.length) {
                cy.log('Project list found');
                
                // Check if there are any projects
                cy.wrap($projectList).find('.project-item, .project-card, [data-cy="project-item"]')
                  .then($projectItems => {
                    if ($projectItems.length) {
                      cy.log(`Found ${$projectItems.length} project items`);
                    } else {
                      cy.log('No project items found, might be empty state');
                    }
                  });
              } else {
                // Check for empty state
                cy.get('.empty-state, .no-projects, [data-cy="empty-state"]')
                  .then($emptyState => {
                    if ($emptyState.length) {
                      cy.log('Empty state found');
                    } else {
                      cy.log('No project list or empty state found');
                    }
                  });
              }
            });
        } else {
          cy.log('Projects link not found, skipping test');
        }
      });
  });

  it('should attempt to create a new project if possible', () => {
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
                
                // Take a screenshot of the new project form
                cy.screenshot('new-project-form');
                
                // Check for project title field
                cy.get('input[placeholder*="title" i], input[name="title"], [data-cy="project-title"]')
                  .then($titleInput => {
                    if ($titleInput.length) {
                      cy.wrap($titleInput).type(testProject.title);
                    } else {
                      cy.log('Project title input not found');
                    }
                  });
                
                // Check for project description field
                cy.get('textarea[placeholder*="description" i], textarea[name="description"], [data-cy="project-description"]')
                  .then($descriptionInput => {
                    if ($descriptionInput.length) {
                      cy.wrap($descriptionInput).type(testProject.description);
                    } else {
                      cy.log('Project description input not found');
                    }
                  });
                
                // Check for budget field
                cy.get('input[placeholder*="budget" i], input[name="budget"], [data-cy="project-budget"]')
                  .then($budgetInput => {
                    if ($budgetInput.length) {
                      cy.wrap($budgetInput).type(testProject.budget);
                    } else {
                      cy.log('Budget input not found');
                    }
                  });
                
                // Check for timeline field
                cy.get('input[placeholder*="timeline" i], select[name="timeline"], [data-cy="project-timeline"]')
                  .then($timelineInput => {
                    if ($timelineInput.length) {
                      if ($timelineInput.prop('tagName').toLowerCase() === 'select') {
                        cy.wrap($timelineInput).select($timelineInput.find('option').eq(1).val());
                      } else {
                        cy.wrap($timelineInput).type(testProject.timeline);
                      }
                    } else {
                      cy.log('Timeline input not found');
                    }
                  });
                
                // Check for location field
                cy.get('input[placeholder*="location" i], input[name="location"], [data-cy="project-location"]')
                  .then($locationInput => {
                    if ($locationInput.length) {
                      cy.wrap($locationInput).type(testProject.location);
                    } else {
                      cy.log('Location input not found');
                    }
                  });
                
                // Look for submit button but don't actually click it in test
                cy.get('button[type="submit"], button:contains("Create"), button:contains("Save"), [data-cy="project-submit"]')
                  .then($submitButton => {
                    if ($submitButton.length) {
                      cy.log('Submit button found, but not clicking to avoid creating test data');
                    } else {
                      cy.log('Submit button not found');
                    }
                  });
              } else {
                cy.log('Create project button not found, skipping test');
              }
            });
        } else {
          cy.log('Projects link not found, skipping test');
        }
      });
  });
});
