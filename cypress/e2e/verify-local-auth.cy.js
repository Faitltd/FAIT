/// <reference types="cypress" />

describe('Verify Local Authentication', () => {
  beforeEach(() => {
    // Clear cookies and local storage
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Enable local auth
    cy.window().then(win => {
      win.localStorage.setItem('useLocalAuth', 'true');
    });
    
    // Visit login page
    cy.visit('/login');
  });
  
  it('should verify admin credentials work with local auth', () => {
    // Enter admin credentials
    cy.get('input[type="email"]').clear().type('admin@itsfait.com');
    cy.get('input[type="password"]').clear().type('admin123');
    
    // Submit form
    cy.get('form').submit();
    
    // Check localStorage for local_auth_session
    cy.window().then(win => {
      const session = win.localStorage.getItem('local_auth_session');
      expect(session).to.not.be.null;
      
      if (session) {
        const sessionData = JSON.parse(session);
        expect(sessionData.user.email).to.equal('admin@itsfait.com');
        expect(sessionData.user.user_type).to.equal('admin');
      }
    });
  });
  
  it('should verify client credentials work with local auth', () => {
    // Enter client credentials
    cy.get('input[type="email"]').clear().type('client@itsfait.com');
    cy.get('input[type="password"]').clear().type('client123');
    
    // Submit form
    cy.get('form').submit();
    
    // Check localStorage for local_auth_session
    cy.window().then(win => {
      const session = win.localStorage.getItem('local_auth_session');
      expect(session).to.not.be.null;
      
      if (session) {
        const sessionData = JSON.parse(session);
        expect(sessionData.user.email).to.equal('client@itsfait.com');
        expect(sessionData.user.user_type).to.equal('client');
      }
    });
  });
  
  it('should verify service agent credentials work with local auth', () => {
    // Enter service agent credentials
    cy.get('input[type="email"]').clear().type('service@itsfait.com');
    cy.get('input[type="password"]').clear().type('service123');
    
    // Submit form
    cy.get('form').submit();
    
    // Check localStorage for local_auth_session
    cy.window().then(win => {
      const session = win.localStorage.getItem('local_auth_session');
      expect(session).to.not.be.null;
      
      if (session) {
        const sessionData = JSON.parse(session);
        expect(sessionData.user.email).to.equal('service@itsfait.com');
        expect(sessionData.user.user_type).to.equal('service_agent');
      }
    });
  });
});
