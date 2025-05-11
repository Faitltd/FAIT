describe('Home Depot Scraper', () => {
  beforeEach(() => {
    // Visit the home page before each test
    cy.visit('/')
  })

  it('should load the home page', () => {
    // Check if the page title is correct
    cy.title().should('include', 'Home Depot Scraper')

    // Check if the main heading is present
    cy.get('.card-header h2').should('contain', 'Home Depot Scraper Configuration')
  })

  it('should have all search type options', () => {
    // Check if all search types are available
    cy.get('#search-type').should('exist')
    cy.get('#search-type option').should('have.length.at.least', 3)
    cy.get('#search-type option[value="category"]').should('exist')
    cy.get('#search-type option[value="search_term"]').should('exist')
    cy.get('#search-type option[value="url_list"]').should('exist')
  })

  it('should show category options when category search type is selected', () => {
    // Select category search type
    cy.get('#search-type').select('category')

    // Check if category options are visible
    cy.get('#category-options').should('be.visible')
    cy.get('#category-id').should('be.visible')

    // Check if other options are hidden
    cy.get('#search-term-options').should('not.be.visible')
    cy.get('#url-list-options').should('not.be.visible')
  })

  it('should show search term options when search term search type is selected', () => {
    // Select search term search type
    cy.get('#search-type').select('search_term')

    // Check if search term options are visible
    cy.get('#search-term-options').should('be.visible')
    cy.get('#search-terms').should('be.visible')
    cy.get('#sort-by').should('be.visible')

    // Check if other options are hidden
    cy.get('#category-options').should('not.be.visible')
    cy.get('#url-list-options').should('not.be.visible')
  })

  it('should show URL list options when URL list search type is selected', () => {
    // Select URL list search type
    cy.get('#search-type').select('url_list')

    // Check if URL list options are visible
    cy.get('#url-list-options').should('be.visible')
    cy.get('#urls').should('be.visible')

    // Check if other options are hidden
    cy.get('#category-options').should('not.be.visible')
    cy.get('#search-term-options').should('not.be.visible')

    // Check if max products is set to 1 by default for URL search
    cy.get('#max-products').should('have.value', '1')
  })

  it('should have max products dropdown with correct options', () => {
    // Check if max products dropdown exists
    cy.get('#max-products').should('exist')

    // Check if it has the correct options
    cy.get('#max-products option').should('have.length', 13)
    cy.get('#max-products option[value="0"]').should('have.text', 'ALL')
    cy.get('#max-products option[value="1"]').should('have.text', '1')
    cy.get('#max-products option[value="10"]').should('have.text', '10')
    cy.get('#max-products option[value="25"]').should('have.text', '25')
    cy.get('#max-products option[value="50"]').should('have.text', '50')
    cy.get('#max-products option[value="75"]').should('have.text', '75')
    cy.get('#max-products option[value="100"]').should('have.text', '100')
    cy.get('#max-products option[value="150"]').should('have.text', '150')
    cy.get('#max-products option[value="200"]').should('have.text', '200')
    cy.get('#max-products option[value="300"]').should('have.text', '300')
    cy.get('#max-products option[value="400"]').should('have.text', '400')
    cy.get('#max-products option[value="500"]').should('have.text', '500')
    cy.get('#max-products option[value="1000"]').should('have.text', '1000')
  })

  it('should have CSV header customization section', () => {
    // Check if CSV header customization section exists
    cy.get('#csvHeadersCollapse').should('exist')

    // Check if the CSV header inputs exist
    cy.get('#csv-headers').should('exist')
    cy.get('#csv-headers input').should('have.length.at.least', 1)
  })

  it('should validate directory input', () => {
    // Enter a valid directory
    cy.get('#output-dir').clear().type('data')

    // Trigger validation by clicking outside the input
    cy.get('label[for="output-dir"]').click()

    // Wait for the AJAX call to complete
    cy.wait(1000)

    // Check if the input is marked as valid
    cy.get('#output-dir').should('have.class', 'is-valid')
  })

  it('should have a submit button', () => {
    // Check if the submit button exists
    cy.get('button[type="submit"]').should('exist')
    cy.get('button[type="submit"]').should('contain', 'Start Scraping')
  })
})
