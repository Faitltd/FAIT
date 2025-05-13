/// <reference types="cypress" />

describe('Home Depot Scraper Test App', () => {
  beforeEach(() => {
    // Visit the main page before each test
    cy.visit('/');
  });

  it('should load the test app correctly', () => {
    // Check if the page title is correct
    cy.title().should('include', 'Home Depot Scraper Test');
    
    // Check if the main components are visible
    cy.contains('h1', 'Home Depot Product Data Extractor').should('be.visible');
    cy.contains('Create New Job').should('be.visible');
    cy.contains('Recent Jobs').should('be.visible');
  });

  it('should validate the output directory', () => {
    // Enter a directory and validate it
    cy.get('#output_dir').clear().type('data/test_output');
    cy.get('#validate_dir_btn').click();
    
    // Check if validation message appears (using cy.on to catch the alert)
    cy.on('window:alert', (text) => {
      expect(text).to.include('Files will be saved to:');
    });
  });

  it('should show search term form when search term option is selected', () => {
    // Select search term option
    cy.get('#search_type').select('search_term');
    
    // Check if search term input is visible
    cy.get('#search_terms_container').should('be.visible');
    
    // Add a search term
    cy.get('#search_term_input').type('building materials{enter}');
    
    // Check if the term was added to the list
    cy.contains('building materials').should('be.visible');
  });

  it('should show category form when category option is selected', () => {
    // Select category option
    cy.get('#search_type').select('category');
    
    // Check if category input is visible
    cy.get('#category_container').should('be.visible');
    
    // Select a category
    cy.get('#category_id').select('Building Materials');
  });

  it('should submit a new job', () => {
    // Set up a job
    cy.get('#search_type').select('search_term');
    cy.get('#search_term_input').type('building materials{enter}');
    cy.get('#max_pages').clear().type('1');
    cy.get('#max_products').clear().type('5');
    cy.get('#output_dir').clear().type('data/test_output');
    
    // Submit the job and check for alert
    cy.get('#submit_job').click();
    
    cy.on('window:alert', (text) => {
      expect(text).to.equal('Job submitted successfully!');
    });
    
    // Check if we're redirected to the job details page
    cy.url().should('include', '/job/');
  });
});
