// Performance testing utilities for Cypress tests

// Define performance budgets
const performanceBudgets = {
  pageLoad: 3000, // 3 seconds
  firstContentfulPaint: 1500, // 1.5 seconds
  largestContentfulPaint: 2500, // 2.5 seconds
  timeToInteractive: 3500, // 3.5 seconds
  totalBlockingTime: 300, // 300 milliseconds
  cumulativeLayoutShift: 0.1, // 0.1 score
  resourceCount: 50, // Maximum number of resources
  resourceSize: 2000000, // 2MB total resource size
  scriptExecutionTime: 1000, // 1 second total script execution time
  renderTime: 1000 // 1 second render time
};

/**
 * Measures page load performance
 * @param {Object} options - Options for the performance check
 */
Cypress.Commands.add('measurePageLoad', (options = {}) => {
  const defaultOptions = {
    url: '/',
    name: 'Page Load',
    budgets: performanceBudgets,
    skipBudgetCheck: false
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  cy.log(`Measuring performance for: ${mergedOptions.name}`);
  
  // Record start time
  const startTime = Date.now();
  
  // Visit the page
  cy.visit(mergedOptions.url, {
    onBeforeLoad: (win) => {
      // Store the start time on the window object
      win.perfStartTime = startTime;
    },
    onLoad: (win) => {
      // Calculate load time
      const loadTime = Date.now() - win.perfStartTime;
      cy.log(`Page load time: ${loadTime}ms`);
      
      // Check against budget
      if (!mergedOptions.skipBudgetCheck) {
        expect(loadTime, `Page load time should be less than ${mergedOptions.budgets.pageLoad}ms`).to.be.lessThan(mergedOptions.budgets.pageLoad);
      }
    }
  });
  
  // Wait for the page to stabilize
  cy.wait(1000);
  
  // Collect performance metrics
  cy.window().then(win => {
    if (win.performance) {
      // Get navigation timing metrics
      const perfData = win.performance.timing;
      const navigationStart = perfData.navigationStart;
      
      // Calculate various timings
      const metrics = {
        dnsLookup: perfData.domainLookupEnd - perfData.domainLookupStart,
        tcpConnection: perfData.connectEnd - perfData.connectStart,
        serverResponse: perfData.responseStart - perfData.requestStart,
        domLoad: perfData.domComplete - perfData.domLoading,
        resourceLoad: perfData.loadEventEnd - perfData.responseEnd,
        totalPageLoad: perfData.loadEventEnd - navigationStart
      };
      
      // Log the metrics
      cy.log('Performance Metrics:');
      Object.entries(metrics).forEach(([name, value]) => {
        cy.log(`${name}: ${value}ms`);
      });
      
      // Check resource count
      const resources = win.performance.getEntriesByType('resource');
      cy.log(`Resource count: ${resources.length}`);
      
      if (!mergedOptions.skipBudgetCheck) {
        expect(resources.length, `Resource count should be less than ${mergedOptions.budgets.resourceCount}`).to.be.lessThan(mergedOptions.budgets.resourceCount);
      }
      
      // Calculate total resource size
      const totalResourceSize = resources.reduce((total, resource) => total + (resource.transferSize || 0), 0);
      cy.log(`Total resource size: ${Math.round(totalResourceSize / 1024)}KB`);
      
      if (!mergedOptions.skipBudgetCheck) {
        expect(totalResourceSize, `Total resource size should be less than ${Math.round(mergedOptions.budgets.resourceSize / 1024)}KB`).to.be.lessThan(mergedOptions.budgets.resourceSize);
      }
      
      // Check for slow resources
      const slowResources = resources.filter(resource => resource.duration > 500);
      if (slowResources.length > 0) {
        cy.log(`WARNING: Found ${slowResources.length} slow resources (>500ms)`);
        slowResources.slice(0, 5).forEach(resource => {
          cy.log(`Slow resource: ${resource.name} (${Math.round(resource.duration)}ms)`);
        });
      }
    } else {
      cy.log('Performance API not available');
    }
  });
});

/**
 * Measures component render performance
 * @param {string} selector - Selector for the component to measure
 * @param {Object} options - Options for the performance check
 */
Cypress.Commands.add('measureComponentRender', (selector, options = {}) => {
  const defaultOptions = {
    name: 'Component Render',
    action: () => {},
    budgets: performanceBudgets,
    skipBudgetCheck: false
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  cy.log(`Measuring component render performance for: ${mergedOptions.name}`);
  
  // Record start time
  const startTime = Date.now();
  
  // Perform the action that triggers the component render
  mergedOptions.action();
  
  // Wait for the component to appear
  cy.get(selector, { timeout: 10000 }).should('exist').then(() => {
    // Calculate render time
    const renderTime = Date.now() - startTime;
    cy.log(`Component render time: ${renderTime}ms`);
    
    // Check against budget
    if (!mergedOptions.skipBudgetCheck) {
      expect(renderTime, `Component render time should be less than ${mergedOptions.budgets.renderTime}ms`).to.be.lessThan(mergedOptions.budgets.renderTime);
    }
  });
});

/**
 * Measures interaction performance
 * @param {string} selector - Selector for the element to interact with
 * @param {string} interaction - Type of interaction ('click', 'type', etc.)
 * @param {Object} options - Options for the performance check
 */
Cypress.Commands.add('measureInteraction', (selector, interaction, options = {}) => {
  const defaultOptions = {
    name: 'Interaction',
    value: '', // For 'type' interaction
    budgets: performanceBudgets,
    skipBudgetCheck: false
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  cy.log(`Measuring interaction performance for: ${mergedOptions.name}`);
  
  // Get the element
  cy.get(selector).then($el => {
    // Record start time
    const startTime = Date.now();
    
    // Perform the interaction
    switch (interaction) {
      case 'click':
        cy.wrap($el).click();
        break;
      case 'type':
        cy.wrap($el).type(mergedOptions.value);
        break;
      case 'select':
        cy.wrap($el).select(mergedOptions.value);
        break;
      case 'check':
        cy.wrap($el).check();
        break;
      case 'uncheck':
        cy.wrap($el).uncheck();
        break;
      default:
        cy.wrap($el).click();
    }
    
    // Wait for any animations or state changes to complete
    cy.wait(500);
    
    // Calculate interaction time
    const interactionTime = Date.now() - startTime;
    cy.log(`Interaction time: ${interactionTime}ms`);
    
    // Check against budget (using a more lenient budget for interactions)
    const interactionBudget = 500; // 500ms
    if (!mergedOptions.skipBudgetCheck) {
      expect(interactionTime, `Interaction time should be less than ${interactionBudget}ms`).to.be.lessThan(interactionBudget);
    }
  });
});
