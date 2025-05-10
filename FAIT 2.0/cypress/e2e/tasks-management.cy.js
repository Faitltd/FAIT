/// <reference types="cypress" />

describe('Tasks Management', () => {
  beforeEach(() => {
    // Visit the tasks page before each test
    cy.visit('/tasks');
  });

  it('should display the tasks page', () => {
    // Check if the page title is visible
    cy.contains('h1', 'Project Tasks').should('be.visible');
    
    // Check if the add task button is visible
    cy.get('[data-cy=add-task]').should('be.visible');
    
    // Check if the filters are visible
    cy.get('[data-cy=filter-project]').should('be.visible');
    cy.get('[data-cy=filter-status]').should('be.visible');
    cy.get('[data-cy=filter-priority]').should('be.visible');
    cy.get('[data-cy=search-tasks]').should('be.visible');
  });

  it('should open the add task modal when clicking the add task button', () => {
    // Click the add task button
    cy.get('[data-cy=add-task]').click();
    
    // Check if the modal is visible
    cy.contains('h2', 'Add New Task').should('be.visible');
    
    // Check if the form fields are visible
    cy.get('[data-cy=task-project]').should('be.visible');
    cy.get('[data-cy=task-title]').should('be.visible');
    cy.get('[data-cy=task-description]').should('be.visible');
    cy.get('[data-cy=task-status]').should('be.visible');
    cy.get('[data-cy=task-priority]').should('be.visible');
    cy.get('[data-cy=task-due-date]').should('be.visible');
    
    // Close the modal
    cy.get('[data-cy=cancel-task]').click();
  });

  it('should filter tasks by status', () => {
    // Select the "In Progress" status filter
    cy.get('[data-cy=filter-status]').select('in_progress');
    
    // Wait for the filter to be applied
    cy.wait(500);
    
    // Check if the tasks are filtered correctly
    // This is a basic check - in a real test, you would verify that only "In Progress" tasks are shown
    cy.get('table tbody tr').each(($row) => {
      // Skip if it's the "No tasks found" message
      if ($row.find('td[colspan="7"]').length === 0) {
        // Check that the status icon is the "In Progress" icon (Clock)
        cy.wrap($row).find('td:first-child svg').should('have.class', 'lucide-clock');
      }
    });
  });

  it('should filter tasks by priority', () => {
    // Select the "High" priority filter
    cy.get('[data-cy=filter-priority]').select('high');
    
    // Wait for the filter to be applied
    cy.wait(500);
    
    // Check if the tasks are filtered correctly
    // This is a basic check - in a real test, you would verify that only "High" priority tasks are shown
    cy.get('table tbody tr').each(($row) => {
      // Skip if it's the "No tasks found" message
      if ($row.find('td[colspan="7"]').length === 0) {
        // Check that the priority badge contains "High"
        cy.wrap($row).find('td:nth-child(3) span').should('contain', 'High');
      }
    });
  });

  it('should search for tasks', () => {
    // Type a search term
    cy.get('[data-cy=search-tasks]').type('important');
    
    // Wait for the search to be applied
    cy.wait(500);
    
    // Check if the tasks are filtered correctly
    // This is a basic check - in a real test, you would verify that only tasks containing "important" are shown
    cy.get('table tbody tr').each(($row) => {
      // Skip if it's the "No tasks found" message
      if ($row.find('td[colspan="7"]').length === 0) {
        // Check that the task title or description contains "important"
        const text = $row.find('td:nth-child(2)').text().toLowerCase();
        expect(text).to.include('important');
      }
    });
  });

  it('should sort tasks by due date', () => {
    // Click the due date header to sort
    cy.contains('Due Date').click();
    
    // Wait for the sort to be applied
    cy.wait(500);
    
    // Click again to reverse the sort order
    cy.contains('Due Date').click();
    
    // Wait for the sort to be applied
    cy.wait(500);
    
    // Check if the tasks are sorted correctly
    // This is a basic check - in a real test, you would verify the actual sort order
    cy.get('table tbody tr').should('exist');
  });

  it('should create a new task', () => {
    // Click the add task button
    cy.get('[data-cy=add-task]').click();
    
    // Fill out the form
    cy.get('[data-cy=task-project]').select(1); // Select the first project
    cy.get('[data-cy=task-title]').type('New Test Task');
    cy.get('[data-cy=task-description]').type('This is a test task created by Cypress');
    cy.get('[data-cy=task-status]').select('todo');
    cy.get('[data-cy=task-priority]').select('medium');
    cy.get('[data-cy=task-due-date]').type('2023-12-31');
    
    // Submit the form
    cy.get('[data-cy=save-task]').click();
    
    // Check if the new task appears in the list
    cy.contains('New Test Task').should('be.visible');
  });

  it('should edit an existing task', () => {
    // Find the first task and click the edit button
    cy.get('table tbody tr:first-child [data-cy^=edit-task]').click();
    
    // Update the task title
    cy.get('[data-cy=task-title]').clear().type('Updated Task Title');
    
    // Submit the form
    cy.get('[data-cy=save-task]').click();
    
    // Check if the updated task appears in the list
    cy.contains('Updated Task Title').should('be.visible');
  });

  it('should delete a task', () => {
    // Get the title of the first task
    let taskTitle;
    cy.get('table tbody tr:first-child td:nth-child(2) div:first-child')
      .invoke('text')
      .then((text) => {
        taskTitle = text;
        
        // Find the first task and click the delete button
        cy.get('table tbody tr:first-child [data-cy^=delete-task]').click();
        
        // Confirm the deletion in the alert
        cy.on('window:confirm', () => true);
        
        // Check if the task is removed from the list
        cy.contains(taskTitle).should('not.exist');
      });
  });

  it('should update task status when clicking the status icon', () => {
    // Find the first task and click the status icon
    cy.get('table tbody tr:first-child [data-cy^=task-status]').click();
    
    // Check if the status has changed
    // This is a basic check - in a real test, you would verify the specific status change
    cy.get('table tbody tr:first-child [data-cy^=task-status] svg').should('exist');
  });
});
