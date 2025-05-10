// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Import Cypress file upload plugin
import 'cypress-file-upload';

// -- This is a parent command --
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');

  // Enable local auth mode if available
  cy.window().then((win) => {
    win.localStorage.setItem('useLocalAuth', 'true');
  });

  // Find email input using multiple possible selectors
  cy.get('input[type="email"], input[name="email"], [data-cy="login-email"], [id="email"], [placeholder*="email" i]')
    .first()
    .clear()
    .type(email);

  // Find password input using multiple possible selectors
  cy.get('input[type="password"], input[name="password"], [data-cy="login-password"], [id="password"], [placeholder*="password" i]')
    .first()
    .clear()
    .type(password);

  // Find submit button using multiple possible selectors
  cy.get('button[type="submit"], [data-cy="login-submit"], button:contains("Log In"), button:contains("Sign In"), button:contains("Login"), input[type="submit"]')
    .first()
    .click();

  // Wait for any redirects to complete
  cy.wait(3000);

  // Check for successful login - should redirect to dashboard
  cy.url().should('include', '/dashboard');
});

// Command to create a new project
Cypress.Commands.add('createProject', (projectData) => {
  cy.visit('/projects');
  cy.get('[data-cy=create-project]').click();

  // Fill out project details
  cy.get('[data-cy=project-title]').type(projectData.title);
  cy.get('[data-cy=project-description]').type(projectData.description);
  cy.get('[data-cy=project-budget]').type(projectData.budget);
  cy.get('[data-cy=project-timeline]').select(projectData.timeline);
  cy.get('[data-cy=project-category]').select(projectData.category);

  // Add project location if provided
  if (projectData.location) {
    cy.get('[data-cy=project-address]').type(projectData.location.address);
    cy.get('[data-cy=project-city]').type(projectData.location.city);
    cy.get('[data-cy=project-state]').select(projectData.location.state);
    cy.get('[data-cy=project-zip]').type(projectData.location.zip);
  }

  // Submit project
  cy.get('[data-cy=project-submit]').click();

  // Should redirect to project details
  cy.url().should('include', '/projects/');
  cy.contains(projectData.title).should('be.visible');
});

// Command to upload a document
Cypress.Commands.add('uploadDocument', (documentData) => {
  cy.get('[data-cy=upload-document]').click();
  cy.get('[data-cy=document-title]').type(documentData.title);

  if (documentData.description) {
    cy.get('[data-cy=document-description]').type(documentData.description);
  }

  cy.get('[data-cy=document-file]').attachFile(documentData.file);
  cy.get('[data-cy=upload-submit]').click();

  // Document should be visible
  cy.contains(documentData.title).should('be.visible');
});

// Command to add a payment method
Cypress.Commands.add('addPaymentMethod', (paymentData) => {
  cy.visit('/billing');
  cy.get('[data-cy=add-payment-method]').click();

  // Add credit card
  cy.get('[data-cy=payment-method-type]').select('Credit Card');
  cy.get('[data-cy=card-holder-name]').type(paymentData.name);
  cy.get('[data-cy=card-number]').type(paymentData.cardNumber);
  cy.get('[data-cy=card-expiry]').type(paymentData.expiry);
  cy.get('[data-cy=card-cvc]').type(paymentData.cvc);

  // Add billing address if provided
  if (paymentData.billingAddress) {
    cy.get('[data-cy=billing-address-line1]').type(paymentData.billingAddress.line1);
    cy.get('[data-cy=billing-city]').type(paymentData.billingAddress.city);
    cy.get('[data-cy=billing-state]').select(paymentData.billingAddress.state);
    cy.get('[data-cy=billing-zip]').type(paymentData.billingAddress.zip);
    cy.get('[data-cy=billing-country]').select(paymentData.billingAddress.country);
  }

  // Save payment method
  cy.get('[data-cy=save-payment-method]').click();

  // Confirmation
  cy.contains('Payment method added successfully').should('be.visible');
});

// Command to make a payment
Cypress.Commands.add('makePayment', (paymentData) => {
  cy.get('[data-cy=make-payment]').click();

  // Select payment method if provided
  if (paymentData.paymentMethod) {
    cy.get('[data-cy=payment-method-select]').select(paymentData.paymentMethod);
  }

  // Confirm payment
  cy.get('[data-cy=confirm-payment]').click();

  // Enter CVC for verification if needed
  if (paymentData.cvc) {
    cy.get('[data-cy=verify-cvc]').type(paymentData.cvc);
  }

  cy.get('[data-cy=complete-payment]').click();

  // Confirmation
  cy.contains('Payment successful').should('be.visible');
});

// Command to send a message
Cypress.Commands.add('sendMessage', (messageData) => {
  // If recipient is provided, start a new conversation
  if (messageData.recipient) {
    cy.get('[data-cy=new-conversation]').click();
    cy.get('[data-cy=provider-search]').type(messageData.recipient);
    cy.get('[data-cy=search-providers]').click();
    cy.get('[data-cy=provider-list]').contains(messageData.recipient).click();

    // Add subject if provided
    if (messageData.subject) {
      cy.get('[data-cy=message-subject]').type(messageData.subject);
    }
  }

  // Type message
  cy.get('[data-cy=message-input]').type(messageData.content);

  // Attach file if provided
  if (messageData.attachment) {
    cy.get('[data-cy=attach-file]').click();
    cy.get('[data-cy=file-upload]').attachFile(messageData.attachment);
  }

  // Send message
  cy.get('[data-cy=send-message]').click();

  // Message should appear in the conversation
  cy.get('[data-cy=message-list]').contains(messageData.content).should('be.visible');
});

// Command to complete client onboarding
Cypress.Commands.add('completeClientOnboarding', (userData) => {
  // Step 1: Personal Information
  cy.get('[data-cy=onboarding-first-name]').type(userData.firstName);
  cy.get('[data-cy=onboarding-last-name]').type(userData.lastName);
  cy.get('[data-cy=onboarding-phone]').type(userData.phone);
  cy.get('[data-cy=onboarding-next]').click();

  // Step 2: Location
  cy.get('[data-cy=onboarding-address]').type(userData.address);
  cy.get('[data-cy=onboarding-city]').type(userData.city);
  cy.get('[data-cy=onboarding-state]').select(userData.state);
  cy.get('[data-cy=onboarding-zip]').type(userData.zip);
  cy.get('[data-cy=onboarding-next]').click();

  // Step 3: Preferences
  userData.preferences.forEach(preference => {
    cy.get(`[data-cy=preference-${preference}]`).click();
  });
  cy.get('[data-cy=onboarding-next]').click();

  // Step 4: Notification preferences
  cy.get('[data-cy=notifications-email]').check();
  if (userData.smsNotifications) {
    cy.get('[data-cy=notifications-sms]').check();
  }
  cy.get('[data-cy=onboarding-complete]').click();

  // Should redirect to dashboard
  cy.url().should('include', '/dashboard');
});

// Command to navigate to a specific page
Cypress.Commands.add('navigateTo', (page) => {
  const pages = {
    home: '/',
    login: '/login',
    register: '/register',
    dashboard: '/dashboard',
    projects: '/projects',
    services: '/services',
    community: '/community',
    messages: '/messages',
    profile: '/profile',
    billing: '/billing',
    forgotPassword: '/forgot-password'
  };

  if (!pages[page]) {
    throw new Error(`Unknown page: ${page}. Available pages: ${Object.keys(pages).join(', ')}`);
  }

  cy.visit(pages[page]);
});

// Command to check accessibility
Cypress.Commands.add('checkA11y', (context = null, options = {}) => {
  // This is a placeholder for a real accessibility check
  // In a real implementation, you would use a plugin like cypress-axe
  cy.log('Checking accessibility...');

  // Check for basic accessibility features
  if (context) {
    cy.get(context).within(() => {
      cy.get('img').each(($img) => {
        if (!$img.attr('src').includes('.svg')) {
          expect($img).to.have.attr('alt');
        }
      });
    });
  } else {
    cy.get('img').each(($img) => {
      if (!$img.attr('src').includes('.svg')) {
        expect($img).to.have.attr('alt');
      }
    });
  }

  cy.log('Basic accessibility check completed');
});

// Command to check performance
Cypress.Commands.add('measurePageLoad', (url) => {
  const start = performance.now();

  cy.visit(url);

  cy.get('body').should('be.visible').then(() => {
    const end = performance.now();
    const loadTime = end - start;

    cy.log(`Page load time for ${url}: ${loadTime}ms`);
    return loadTime;
  });
});

// Command to test responsive behavior
Cypress.Commands.add('testResponsive', (url, viewports = ['desktop', 'tablet', 'mobile']) => {
  const viewportSizes = {
    desktop: [1280, 800],
    tablet: [768, 1024],
    mobile: [375, 667]
  };

  cy.visit(url);

  viewports.forEach(viewport => {
    const [width, height] = viewportSizes[viewport];
    cy.viewport(width, height);
    cy.log(`Testing on ${viewport} (${width}x${height})`);

    // Check that navigation is visible or has a toggle
    if (viewport === 'desktop') {
      cy.get('nav').should('be.visible');
    } else {
      cy.get('nav, button[aria-label="menu"], [aria-label="navigation"]').should('exist');
    }

    // Check that content is visible
    cy.get('body > div').should('be.visible');
  });
});

// Command to check if user is logged in
Cypress.Commands.add('isLoggedIn', () => {
  return cy.window().then(win => {
    // Check various localStorage keys that might indicate a logged-in user
    const authKeys = [
      'supabase.auth.token',
      'local_auth_session',
      'userType',
      'userEmail',
      'devUser',
      'sb-sjrehyseqqptdcnadvod-auth-token'
    ];

    for (const key of authKeys) {
      const value = win.localStorage.getItem(key);
      if (value) {
        cy.log(`Found auth key: ${key}`);
        return true;
      }
    }

    cy.log('No auth keys found in localStorage');
    return false;
  });
});

// Command to logout
Cypress.Commands.add('logout', () => {
  cy.log('Logging out');

  // Clear localStorage to log out
  cy.clearLocalStorage();

  // Reload the page
  cy.reload();

  // Verify we're logged out by checking the URL or localStorage
  cy.window().then(win => {
    const hasAuthKeys = Object.keys(win.localStorage).some(key =>
      key.includes('auth') || key.includes('user') || key.includes('session')
    );
    expect(hasAuthKeys).to.be.false;
  });
});
