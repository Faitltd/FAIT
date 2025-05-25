// ***********************************************
// Custom commands for FAIT Co-op testing
// ***********************************************

// Login command
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

// Register command
Cypress.Commands.add('register', (email, password, name = 'Test User') => {
  cy.visit('/register');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

// Navigation helper
Cypress.Commands.add('navigateTo', (page) => {
  const pages = {
    home: '/',
    services: '/services',
    about: '/about',
    contact: '/contact',
    login: '/login',
    register: '/register'
  };

  cy.visit(pages[page] || page);
});
