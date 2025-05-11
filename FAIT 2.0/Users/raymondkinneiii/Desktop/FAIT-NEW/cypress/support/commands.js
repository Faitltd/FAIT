
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Import Supabase client
import { createClient } from '@supabase/supabase-js';

// Custom command to login directly via Supabase
Cypress.Commands.add('loginViaSupabase', (email, password) => {
  cy.log(`Logging in as ${email}`);
  
  // Visit the login page
  cy.visit('/');
  
  // Fill in the login form
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  
  // Submit the form
  cy.get('[data-testid="login-button"]').click();
  
  // Wait for success message
  cy.get('[data-testid="message-container"]', { timeout: 10000 })
    .should('contain', 'Successfully logged in');
});

// Custom command to login as a specific demo user
Cypress.Commands.add('loginAsDemo', (userType) => {
  cy.log(`Logging in as ${userType} demo user`);
  
  // Visit the login page with auto-login parameter
  cy.visit(`/?autologin=${userType}`);
  
  // Wait for success message
  cy.get('[data-testid="message-container"]', { timeout: 10000 })
    .should('contain', 'Successfully logged in');
});

// Add custom command for direct Supabase login
Cypress.Commands.add('supabaseLogin', (email, password) => {
  const supabaseUrl = Cypress.env('SUPABASE_URL');
  const supabaseAnonKey = Cypress.env('SUPABASE_ANON_KEY');
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Return the promise so Cypress waits for it
  return supabase.auth.signInWithPassword({ email, password })
    .then(({ data, error }) => {
      if (error) {
        throw new Error(`Supabase login failed: ${error.message}`);
      }
      
      // Store the session in localStorage to persist auth state
      window.localStorage.setItem('supabase.auth.token', JSON.stringify(data.session));
      
      return data;
    });
});

// Custom command to check if user is logged in
Cypress.Commands.add('isLoggedIn', () => {
  // Check localStorage for session
  return cy.window().then(win => {
    const session = win.localStorage.getItem('supabase.auth.token');
    return !!session;
  });
});

// Custom command to logout
Cypress.Commands.add('logout', () => {
  cy.log('Logging out');
  
  // Clear localStorage to log out
  cy.clearLocalStorage();
  
  // Reload the page
  cy.reload();
});
