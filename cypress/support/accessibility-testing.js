// Accessibility testing utilities for Cypress tests

// Define common accessibility rules to check
const accessibilityRules = {
  // WCAG 2.0 Level A & AA Rules
  wcag2a: {
    name: 'WCAG 2.0 Level A',
    rules: [
      'area-alt',
      'aria-allowed-attr',
      'aria-required-attr',
      'aria-valid-attr',
      'button-name',
      'document-title',
      'frame-title',
      'image-alt',
      'input-image-alt',
      'link-name',
      'list',
      'listitem',
      'meta-refresh',
      'meta-viewport',
      'object-alt',
      'role-img-alt',
      'td-headers-attr',
      'th-has-data-cells',
      'valid-lang',
      'video-caption',
      'video-description'
    ]
  },
  wcag2aa: {
    name: 'WCAG 2.0 Level AA',
    rules: [
      'color-contrast',
      'definition-list',
      'dlitem',
      'frame-title-unique',
      'label',
      'layout-table',
      'link-in-text-block',
      'nested-interactive',
      'server-side-image-map'
    ]
  },
  // Best practices
  bestPractices: {
    name: 'Best Practices',
    rules: [
      'accesskeys',
      'aria-allowed-role',
      'aria-hidden-body',
      'aria-hidden-focus',
      'aria-input-field-name',
      'aria-toggle-field-name',
      'autocomplete-valid',
      'avoid-inline-spacing',
      'blink',
      'empty-heading',
      'heading-order',
      'landmark-banner-is-top-level',
      'landmark-complementary-is-top-level',
      'landmark-contentinfo-is-top-level',
      'landmark-main-is-top-level',
      'landmark-no-duplicate-banner',
      'landmark-no-duplicate-contentinfo',
      'landmark-one-main',
      'marquee',
      'page-has-heading-one',
      'region',
      'skip-link',
      'tabindex'
    ]
  }
};

/**
 * Checks a page for accessibility issues
 * @param {Object} options - Options for the accessibility check
 */
Cypress.Commands.add('checkA11y', (options = {}) => {
  const defaultOptions = {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa']
    },
    rules: {},
    includedImpacts: ['critical', 'serious', 'moderate'],
    context: 'html',
    skipFailures: false
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  cy.log('Running accessibility checks...');
  
  // Inject axe-core library if it's not already injected
  cy.window({ log: false }).then(win => {
    if (!win.axe) {
      cy.log('Injecting axe-core library...');
      // This is a simplified version - in a real implementation, you would use cy.injectAxe()
      // from cypress-axe or load the axe-core script
      cy.log('WARNING: axe-core library not available. In a real implementation, you would use cypress-axe.');
    }
  });
  
  // Simulate running accessibility checks
  cy.get(mergedOptions.context).then($context => {
    // In a real implementation, this would call axe.run()
    // For now, we'll simulate some basic checks
    
    // Check for alt text on images
    const imagesWithoutAlt = $context.find('img:not([alt])').length;
    if (imagesWithoutAlt > 0) {
      cy.log(`WARNING: Found ${imagesWithoutAlt} images without alt text`);
    }
    
    // Check for form inputs without labels
    const inputsWithoutLabels = $context.find('input:not([type="hidden"]):not([aria-label]):not([aria-labelledby])').filter(function() {
      const id = this.id;
      return id === '' || $context.find(`label[for="${id}"]`).length === 0;
    }).length;
    
    if (inputsWithoutLabels > 0) {
      cy.log(`WARNING: Found ${inputsWithoutLabels} inputs without associated labels`);
    }
    
    // Check for buttons without text
    const buttonsWithoutText = $context.find('button').filter(function() {
      return $(this).text().trim() === '' && !$(this).find('img, svg, [aria-label]').length;
    }).length;
    
    if (buttonsWithoutText > 0) {
      cy.log(`WARNING: Found ${buttonsWithoutText} buttons without text or aria-label`);
    }
    
    // Check for color contrast (simplified)
    cy.log('Note: Full color contrast checking requires the axe-core library');
    
    // Check for heading order
    const headings = [];
    $context.find('h1, h2, h3, h4, h5, h6').each(function() {
      const level = parseInt(this.tagName.substring(1));
      headings.push(level);
    });
    
    let headingOrderViolation = false;
    for (let i = 1; i < headings.length; i++) {
      if (headings[i] > headings[i-1] + 1) {
        headingOrderViolation = true;
        break;
      }
    }
    
    if (headingOrderViolation) {
      cy.log('WARNING: Heading levels should not skip levels');
    }
    
    // Log summary
    const totalIssues = imagesWithoutAlt + inputsWithoutLabels + buttonsWithoutText + (headingOrderViolation ? 1 : 0);
    if (totalIssues > 0) {
      cy.log(`Found ${totalIssues} potential accessibility issues`);
      if (!mergedOptions.skipFailures) {
        expect(totalIssues, 'Page should not have accessibility issues').to.equal(0);
      }
    } else {
      cy.log('No accessibility issues found in basic checks');
    }
  });
});

/**
 * Checks keyboard navigation on a page
 * @param {Array} selectors - Array of selectors to check for keyboard accessibility
 */
Cypress.Commands.add('checkKeyboardNavigation', (selectors = []) => {
  cy.log('Checking keyboard navigation...');
  
  // If no selectors provided, use common interactive elements
  const elementsToCheck = selectors.length > 0 ? selectors : [
    'a[href]',
    'button',
    'input',
    'select',
    'textarea',
    '[tabindex]:not([tabindex="-1"])',
    '[role="button"]',
    '[role="link"]',
    '[role="checkbox"]',
    '[role="radio"]',
    '[role="tab"]'
  ];
  
  // Join selectors for a single query
  const combinedSelector = elementsToCheck.join(', ');
  
  // Get all focusable elements
  cy.get(combinedSelector).then($elements => {
    cy.log(`Found ${$elements.length} potentially focusable elements`);
    
    // Check if elements are actually focusable
    const nonFocusableElements = $elements.filter(function() {
      const $el = Cypress.$(this);
      return $el.css('display') === 'none' || 
             $el.css('visibility') === 'hidden' || 
             $el.attr('disabled') === 'disabled' ||
             $el.attr('aria-hidden') === 'true';
    });
    
    if (nonFocusableElements.length > 0) {
      cy.log(`WARNING: Found ${nonFocusableElements.length} elements that should be focusable but might not be`);
    }
    
    // Test tab navigation (simplified)
    cy.log('Note: Full keyboard navigation testing would press Tab key and check focus order');
    
    // Check for positive tabindex values (anti-pattern)
    const positiveTabindexElements = $elements.filter(function() {
      const tabindex = Cypress.$(this).attr('tabindex');
      return tabindex !== undefined && parseInt(tabindex) > 0;
    });
    
    if (positiveTabindexElements.length > 0) {
      cy.log(`WARNING: Found ${positiveTabindexElements.length} elements with positive tabindex values, which is an accessibility anti-pattern`);
    }
  });
});

/**
 * Checks ARIA attributes on a page
 */
Cypress.Commands.add('checkAriaAttributes', () => {
  cy.log('Checking ARIA attributes...');
  
  // Check for elements with ARIA attributes
  cy.get('[aria-*]').then($elements => {
    cy.log(`Found ${$elements.length} elements with ARIA attributes`);
    
    // Check for common ARIA issues
    const invalidRoles = $elements.filter('[role]').filter(function() {
      const role = Cypress.$(this).attr('role');
      const validRoles = [
        'alert', 'alertdialog', 'application', 'article', 'banner', 'button', 'cell', 'checkbox',
        'columnheader', 'combobox', 'complementary', 'contentinfo', 'definition', 'dialog',
        'directory', 'document', 'feed', 'figure', 'form', 'grid', 'gridcell', 'group', 'heading',
        'img', 'link', 'list', 'listbox', 'listitem', 'log', 'main', 'marquee', 'math', 'menu',
        'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'navigation', 'none',
        'note', 'option', 'presentation', 'progressbar', 'radio', 'radiogroup', 'region',
        'row', 'rowgroup', 'rowheader', 'scrollbar', 'search', 'searchbox', 'separator',
        'slider', 'spinbutton', 'status', 'switch', 'tab', 'table', 'tablist', 'tabpanel',
        'term', 'textbox', 'timer', 'toolbar', 'tooltip', 'tree', 'treegrid', 'treeitem'
      ];
      return !validRoles.includes(role);
    });
    
    if (invalidRoles.length > 0) {
      cy.log(`WARNING: Found ${invalidRoles.length} elements with invalid ARIA roles`);
    }
    
    // Check for required ARIA attributes
    const checkboxesWithoutChecked = $elements.filter('[role="checkbox"]').filter(function() {
      return Cypress.$(this).attr('aria-checked') === undefined;
    });
    
    if (checkboxesWithoutChecked.length > 0) {
      cy.log(`WARNING: Found ${checkboxesWithoutChecked.length} checkbox roles without aria-checked attribute`);
    }
  });
});
