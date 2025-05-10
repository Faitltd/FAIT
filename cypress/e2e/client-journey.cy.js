/// <reference types="cypress" />

describe('Client User Journey', () => {
  // Client credentials
  const clientEmail = Cypress.env('clientEmail') || 'client@itsfait.com';
  const clientPassword = Cypress.env('clientPassword') || 'client123';

  beforeEach(() => {
    // Clear cookies and local storage before each test
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Login as client
    cy.visit('/login');
    cy.get('input[type="email"]').clear().type(clientEmail);
    cy.get('input[type="password"]').clear().type(clientPassword);
    cy.contains('button', /sign in/i).click();
    
    // Verify login was successful
    cy.url().should('include', '/dashboard/client');
  });

  it('should navigate the client dashboard', () => {
    // Check dashboard elements
    cy.contains('Client Dashboard').should('be.visible');
    
    // Check for projects section
    cy.contains('Projects').should('be.visible');
    
    // Check for bookings section
    cy.contains('Bookings').should('be.visible');
    
    // Check for messages section
    cy.contains('Messages').should('be.visible');
  });

  it('should create a new project', () => {
    // Navigate to projects page
    cy.contains('Projects').click();
    cy.url().should('include', '/projects');
    
    // Click on create new project button
    cy.contains('button', /new project|create project/i).click();
    
    // Fill in project details
    cy.get('input[name="projectName"]').type('Test Project');
    cy.get('textarea[name="projectDescription"]').type('This is a test project created by Cypress');
    cy.get('select[name="projectType"]').select('Remodeling');
    
    // Submit form
    cy.contains('button', /create|submit/i).click();
    
    // Verify project was created
    cy.contains('Project created successfully').should('be.visible');
    cy.contains('Test Project').should('be.visible');
  });

  it('should manage a project in progress', () => {
    // Navigate to projects page
    cy.contains('Projects').click();
    cy.url().should('include', '/projects');
    
    // Click on an existing project
    cy.contains('Test Project').click();
    
    // Verify project details page
    cy.contains('Project Details').should('be.visible');
    
    // Add a comment
    cy.get('textarea[name="comment"]').type('This is a test comment');
    cy.contains('button', /add comment|post/i).click();
    
    // Verify comment was added
    cy.contains('This is a test comment').should('be.visible');
  });

  it('should book a service appointment', () => {
    // Navigate to bookings page
    cy.contains('Bookings').click();
    cy.url().should('include', '/bookings');
    
    // Click on create new booking button
    cy.contains('button', /new booking|schedule/i).click();
    
    // Fill in booking details
    cy.get('select[name="serviceType"]').select('Handyman');
    cy.get('input[name="date"]').type('2023-12-31');
    cy.get('select[name="time"]').select('10:00 AM');
    cy.get('textarea[name="notes"]').type('This is a test booking created by Cypress');
    
    // Submit form
    cy.contains('button', /book|schedule|submit/i).click();
    
    // Verify booking was created
    cy.contains('Booking confirmed').should('be.visible');
  });

  it('should view and respond to an estimate', () => {
    // Navigate to estimates page
    cy.contains('Estimates').click();
    cy.url().should('include', '/estimates');
    
    // Click on an existing estimate
    cy.contains('Estimate #').first().click();
    
    // Verify estimate details page
    cy.contains('Estimate Details').should('be.visible');
    
    // Accept the estimate
    cy.contains('button', /accept|approve/i).click();
    
    // Verify estimate was accepted
    cy.contains('Estimate accepted').should('be.visible');
  });

  it('should leave a review for completed work', () => {
    // Navigate to projects page
    cy.contains('Projects').click();
    cy.url().should('include', '/projects');
    
    // Filter for completed projects
    cy.contains('button', /completed|finished/i).click();
    
    // Click on a completed project
    cy.contains('Completed Project').first().click();
    
    // Click on leave review button
    cy.contains('button', /leave review|rate/i).click();
    
    // Fill in review details
    cy.get('input[name="rating"]').type('5');
    cy.get('textarea[name="review"]').type('Excellent work! Very satisfied with the results.');
    
    // Submit review
    cy.contains('button', /submit|post/i).click();
    
    // Verify review was submitted
    cy.contains('Review submitted').should('be.visible');
  });
});
