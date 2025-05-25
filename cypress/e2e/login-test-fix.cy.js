/// <reference types="cypress" />

describe('Login Test', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.screenshot('login-page-before');
  });

  it('should show login form elements', () => {
    // Log the entire HTML to see what's actually there
    cy.document().then((doc) => {
      cy.log('Document HTML:');
      cy.log(doc.documentElement.outerHTML.substring(0, 500) + '...');
    });

    // Try to find form elements with various selectors
    cy.get('form, [data-cy=login-form], .login-form').then($form => {
      if ($form.length) {
        cy.log(`Found form element: ${$form.attr('class') || 'no class'}`);
      } else {
        cy.log('No form element found');
      }
    });

    cy.get('input[type="email"], input[name="email"], [data-cy=email], [placeholder*="email"], input[id*="email"]').then($email => {
      if ($email.length) {
        cy.log(`Found email input: ${$email.attr('id') || 'no id'} / ${$email.attr('class') || 'no class'}`);
      } else {
        cy.log('No email input found');
      }
    });

    cy.get('input[type="password"], input[name="password"], [data-cy=password], [placeholder*="password"], input[id*="password"]').then($password => {
      if ($password.length) {
        cy.log(`Found password input: ${$password.attr('id') || 'no id'} / ${$password.attr('class') || 'no class'}`);
      } else {
        cy.log('No password input found');
      }
    });

    cy.get('button[type="submit"], button:contains("Sign In"), button:contains("Login"), [data-cy=submit]').then($button => {
      if ($button.length) {
        cy.log(`Found submit button: ${$button.attr('id') || 'no id'} / ${$button.attr('class') || 'no class'}`);
      } else {
        cy.log('No submit button found');
      }
    });
  });

  it('should attempt login with admin credentials', () => {
    // Try to find and fill the login form
    cy.get('body').then($body => {
      // Try to find email input with various selectors
      const $email = $body.find('input[type="email"], input[name="email"], [data-cy=email], [placeholder*="email"], input[id*="email"]');
      if ($email.length) {
        cy.wrap($email).type('admin@itsfait.com');
      } else {
        cy.log('Could not find email input');
      }

      // Try to find password input with various selectors
      const $password = $body.find('input[type="password"], input[name="password"], [data-cy=password], [placeholder*="password"], input[id*="password"]');
      if ($password.length) {
        cy.wrap($password).type('admin123');
      } else {
        cy.log('Could not find password input');
      }

      // Try to find submit button with various selectors
      const $submit = $body.find('button[type="submit"], button:contains("Sign In"), button:contains("Login"), [data-cy=submit]');
      if ($submit.length) {
        cy.wrap($submit).click();
      } else {
        cy.log('Could not find submit button');
      }
    });

    // Take a screenshot after login attempt
    cy.screenshot('after-login-attempt');
  });
});
